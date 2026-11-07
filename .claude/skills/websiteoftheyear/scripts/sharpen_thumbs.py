#!/usr/bin/env python3
"""Rebuild low-res thumbnails at high resolution from the full-size screenshots they were cut from.

Usage:
  python3 sharpen_thumbs.py --thumbs <dir> --sources <dir> [--sources <dir2> ...] --out <dir>
        [--scale 2] [--candidates map.json] [--max-err 3.5] [--top 3] [--quality 84]

For every image in --thumbs: (1) coarse match - a 32x20 greyscale fingerprint of the
thumb is compared with every source image to shortlist the --top most similar sources
(--candidates map.json, {"thumb.jpg": ["source-a.jpg", ...]}, overrides the shortlist for
those thumbs; names are relative to a --sources dir); (2) multi-scale template search
finds the crop box of each shortlisted source that best matches the thumb (coarse grid,
then a refinement at higher resolution); (3) the best box is cut from the FULL-RES source
and resized to min(scale x thumb width, crop width), keeping the thumb's aspect ratio,
and saved as JPEG (--quality). If the best error (mean abs grey difference, 0-255; true
matches scored 0.1-1.4, recompressed/animated frames up to ~3.2, wrong crops 7+) is
above --max-err the thumb is copied unchanged and FLAGGED instead of writing a wrong
crop (e.g. the source no longer exists). Prints a table: thumb, source, error, size, flag.

Exit 0 = every thumb matched, 1 = at least one flagged (originals copied) or nothing to do.
Needs numpy + Pillow; if missing it prints the venv commands. Cannot do: thumbs that were
re-composited, rotated, colour-graded or text-overlaid after cutting (they will flag), and
sources that are smaller than the thumb (output is capped at the crop size, never upscaled).
"""
import argparse, json, os, shutil, sys

try:
    import numpy as np
    from PIL import Image
    from numpy.lib.stride_tricks import sliding_window_view
except ImportError:
    print("numpy + Pillow are required. Create a throwaway venv and rerun with it:\n"
          "  python3 -m venv /tmp/x && /tmp/x/bin/pip install numpy pillow\n"
          "  /tmp/x/bin/python " + os.path.abspath(sys.argv[0]) + " " + " ".join(sys.argv[1:]))
    sys.exit(1)

EXT = (".jpg", ".jpeg", ".png", ".webp")


def grey(im, w, h=None):
    h = h or max(1, round(im.height * w / im.width))
    return np.asarray(im.convert("L").resize((w, h), Image.BILINEAR), dtype=np.float32)


def search(t, src, src_grey_cache, tw, step):
    """Best (err, x, y, cw) over crop widths for template t (greyscale, width tw)."""
    th = t.shape[0]
    tr = t.shape[1] / th
    maxcw = min(src.width, src.height * tr)
    best = (1e9, 0.0, 0.0, maxcw)
    for f in np.linspace(0.25, 1.0, 40):
        cw = maxcw * f
        scale = tw / cw
        sw = max(tw, round(src.width * scale))
        if sw not in src_grey_cache:
            src_grey_cache[sw] = grey(src, sw)
        s = src_grey_cache[sw]
        if s.shape[0] < th or s.shape[1] < tw:
            continue
        win = sliding_window_view(s, (th, tw))[::step, ::step]
        err = np.abs(win - t).mean(axis=(2, 3))
        iy, ix = np.unravel_index(np.argmin(err), err.shape)
        if err[iy, ix] < best[0]:
            best = (float(err[iy, ix]), ix * step / scale, iy * step / scale, cw)
    return best


def refine(thumb, src, best):
    e0, x0, y0, cw0 = best
    tw = 96
    t = grey(thumb, tw)
    th = t.shape[0]
    maxcw = min(src.width, src.height * thumb.width / thumb.height)
    out = best
    for f in np.linspace(0.96, 1.04, 9):
        cw = min(maxcw, cw0 * f)
        scale = tw / cw
        s = grey(src, max(tw, round(src.width * scale)))
        H, W = s.shape
        cx, cy = round(x0 * scale), round(y0 * scale)
        ya, yb = max(0, cy - 4), min(H - th, cy + 4)
        xa, xb = max(0, cx - 4), min(W - tw, cx + 4)
        if yb < ya or xb < xa:
            continue
        win = sliding_window_view(s[ya:yb + th, xa:xb + tw], (th, tw))
        err = np.abs(win - t).mean(axis=(2, 3))
        iy, ix = np.unravel_index(np.argmin(err), err.shape)
        e = float(err[iy, ix])
        if e < out[0]:
            out = (e, (xa + ix) / scale, (ya + iy) / scale, cw)
    return out


def main():
    ap = argparse.ArgumentParser(description="Rebuild thumbnails at high resolution from their full-size sources")
    ap.add_argument("--thumbs", required=True)
    ap.add_argument("--sources", required=True, action="append")
    ap.add_argument("--out", required=True)
    ap.add_argument("--scale", type=float, default=2.0)
    ap.add_argument("--candidates")
    ap.add_argument("--max-err", type=float, default=3.5)
    ap.add_argument("--top", type=int, default=3, help="sources shortlisted per thumb by fingerprint")
    ap.add_argument("--quality", type=int, default=84)
    a = ap.parse_args()

    # source index: path -> PIL image (lazy opened) ; fingerprints
    srcs = {}
    for d in a.sources:
        if not os.path.isdir(d):
            sys.exit(f"error: not a directory: {d}")
        for fn in sorted(os.listdir(d)):
            if fn.lower().endswith(EXT):
                srcs.setdefault(fn, os.path.join(d, fn))
    thumbs = sorted(f for f in os.listdir(a.thumbs) if f.lower().endswith(EXT))
    if not thumbs or not srcs:
        sys.exit(f"error: found {len(thumbs)} thumbs and {len(srcs)} sources")
    cands = json.load(open(a.candidates)) if a.candidates else {}
    os.makedirs(a.out, exist_ok=True)

    print(f"fingerprinting {len(srcs)} sources ...", file=sys.stderr)
    fp = {}
    for name, path in srcs.items():
        with Image.open(path) as im:
            fp[name] = grey(im, 32, 20)

    rows, flagged = [], 0
    print(f"{'thumb':28} {'source':30} {'err':>5}  {'output':>11}  note")
    for name in thumbs:
        tpath = os.path.join(a.thumbs, name)
        thumb = Image.open(tpath).convert("RGB")
        if name in cands:
            short = [c for c in cands[name] if c in srcs]
        else:
            tf = grey(thumb, 32, 20)
            short = sorted(fp, key=lambda k: float(np.abs(fp[k] - tf).mean()))[: a.top]
        best, bsrc, bimg = (1e9, 0, 0, 1), None, None
        t48 = grey(thumb, 48)
        for c in short:
            src = Image.open(srcs[c]).convert("RGB")
            if src.width < 8 or src.height < 8:
                continue
            res = search(t48, src, {}, 48, 2)
            res = refine(thumb, src, res)
            if res[0] < best[0]:
                best, bsrc, bimg = res, c, src
            if best[0] < 1.0:
                break
        dst = os.path.join(a.out, os.path.splitext(name)[0] + ".jpg")
        err, x, y, cw = best
        if bsrc is None or err > a.max_err:
            shutil.copy(tpath, os.path.join(a.out, name))
            flagged += 1
            rows.append((name, bsrc, err, thumb.size, True))
            print(f"{name:28} {str(bsrc)[:30]:30} {err:5.1f}  {'%dx%d' % thumb.size:>11}  FLAGGED: original copied (best match above --max-err)")
            continue
        ch = cw * thumb.height / thumb.width
        crop = bimg.crop((round(x), round(y), round(x + cw), round(y + ch)))
        tw_out = int(min(a.scale * thumb.width, crop.width))
        th_out = round(tw_out * thumb.height / thumb.width)
        im = crop.resize((tw_out, th_out), Image.LANCZOS)
        im.save(dst, quality=a.quality, optimize=True, progressive=True)
        rows.append((name, bsrc, err, im.size, False))
        note = "" if tw_out >= thumb.width else "smaller than thumb"
        print(f"{name:28} {bsrc[:30]:30} {err:5.1f}  {'%dx%d' % im.size:>11}  {note}")

    ok = len(rows) - flagged
    widths = [r[3][0] for r in rows if not r[4]]
    print(f"\n{'PASS' if not flagged else 'FAIL'}: {ok} matched and rebuilt"
          + (f" (median width {sorted(widths)[len(widths)//2]}px)" if widths else "")
          + f", {flagged} flagged (originals copied to {a.out}); worst accepted error "
          + (f"{max(r[2] for r in rows if not r[4]):.1f}" if ok else "n/a"))
    for r in rows:
        if r[4]:
            print(f"  flagged: {r[0]} (best err {r[2]:.1f} vs {r[1]}) - source missing or recomposed? pass --candidates")
    sys.exit(1 if flagged else 0)


if __name__ == "__main__":
    main()
