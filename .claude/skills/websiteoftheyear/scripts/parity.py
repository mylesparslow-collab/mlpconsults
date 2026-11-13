#!/usr/bin/env python3
"""Content parity between an old site and its redesign: nothing the old pages said
may silently disappear.

Usage:
  python3 parity.py --old <dir-or-files...> --new <dir-or-files...>
        [--map old.html=new/index.html ...] [--ignore-regex '^Case study \\d+']
        [--min-words 3] [--strict-counts] [--show 12]

How it works: pairs pages by relative path (or by explicit --map old=new; map
keys/values may be relative paths inside the --old/--new dirs or filesystem
paths). Extracts visible text from each page (script/style/noscript/template/
svg/head/nav/header/footer dropped; inline tags like <b>/<span>/<a> are joined
into their paragraph; whitespace and HTML entities normalised), then reports
every OLD text block of >= --min-words words that does not appear in the
paired NEW page (substring match, with a whitespace-insensitive fallback so
text split across spans still matches). --ignore-regex is removed from old
blocks before checking (use it for eyebrows like "Case study 03" that the
redesign legitimately rewrites; repeatable). It also compares counts of
img/video/figure/table/a[href] per page: differences print as warnings and
only fail the run with --strict-counts.

Exit 0 = PASS (no missing text, no unpaired page), 1 = FAIL.
Cannot do: judge reordered/reworded copy (a paraphrase counts as missing), text
rendered by JS or baked into images, or text inside nav/header/footer.
Standard library only (html.parser).
"""
import argparse, html, os, re, sys
from html.parser import HTMLParser

SKIP = {"script", "style", "noscript", "template", "svg", "head"}
# Site chrome expected to change in a redesign. Skipped on OLD pages only (default nav,header; see --skip-old).
# New pages are searched in full, so content that moved into a new footer or menu still counts as present.
CHROME_DEFAULT = "nav,header"
INLINE = {"a", "b", "i", "em", "strong", "span", "code", "small", "sup", "sub", "mark",
          "abbr", "u", "s", "cite", "q", "time", "bdi", "kbd", "var", "samp", "del", "ins", "wbr", "font"}
VOID = {"img", "br", "hr", "input", "meta", "link", "wbr", "source", "area", "base", "col", "embed", "track", "param"}
COUNTED = ("img", "video", "figure", "table", "a[href]")


def norm(s):
    return re.sub(r"\s+", " ", html.unescape(s).replace(" ", " ")).strip()


class Extract(HTMLParser):
    def __init__(self, extra_skip=()):
        super().__init__(convert_charrefs=True)
        self.SKIP = SKIP | set(extra_skip)
        self.blocks, self.buf, self.skip = [], [], 0
        self.counts = {k: 0 for k in COUNTED}

    def flush(self):
        t = norm("".join(self.buf))
        self.buf = []
        if t:
            self.blocks.append(t)

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP and tag not in VOID:
            self.skip += 1
            return
        if self.skip:
            return
        if tag == "br":
            self.buf.append(" ")
        elif tag not in INLINE:
            self.flush()
        if tag in ("img", "video", "figure", "table"):
            self.counts[tag] += 1
        elif tag == "a" and dict(attrs).get("href") is not None:
            self.counts["a[href]"] += 1

    def handle_startendtag(self, tag, attrs):
        if tag in self.SKIP and tag not in VOID:
            return  # self-closed svg etc.: nothing inside
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag):
        if tag in self.SKIP and tag not in VOID:
            self.skip = max(0, self.skip - 1)
            return
        if not self.skip and tag not in INLINE:
            self.flush()

    def handle_data(self, data):
        if not self.skip:
            self.buf.append(data)

    def close(self):
        super().close()
        self.flush()


def extract(path, extra_skip=()):
    p = Extract(extra_skip)
    with open(path, encoding="utf-8", errors="replace") as f:
        p.feed(f.read())
    p.close()
    return p.blocks, p.counts


def collect(items):
    """-> {key: path}. Dir: key = path relative to dir. File: key = path as given."""
    out = {}
    for it in items:
        if os.path.isdir(it):
            for root, _, files in os.walk(it):
                for fn in sorted(files):
                    if fn.lower().endswith((".html", ".htm")):
                        full = os.path.join(root, fn)
                        out[os.path.relpath(full, it)] = full
        elif os.path.isfile(it):
            out[it] = it
        else:
            sys.exit(f"error: not found: {it}")
    return out


def resolve(spec, index, allow_fs=False):
    if spec in index:
        return index[spec]
    for k, v in index.items():
        if v == spec or os.path.normpath(v) == os.path.normpath(spec) or k.endswith("/" + spec):
            return v
    return spec if allow_fs and os.path.isfile(spec) else None


def main():
    ap = argparse.ArgumentParser(description="Content parity between old and redesigned pages")
    ap.add_argument("--old", nargs="+", required=True)
    ap.add_argument("--new", nargs="+", required=True)
    ap.add_argument("--map", nargs="+", action="extend", default=[], help="old=new page pairs (repeatable)")
    ap.add_argument("--skip-old", default=CHROME_DEFAULT, help="comma list of chrome tags ignored on OLD pages (default nav,header; footer is checked)")
    ap.add_argument("--ignore-regex", action="append", default=[], help="removed from old text blocks before checking")
    ap.add_argument("--min-words", type=int, default=3)
    ap.add_argument("--strict-counts", action="store_true", help="count differences fail the run")
    ap.add_argument("--show", type=int, default=12, help="max missing blocks printed per page")
    a = ap.parse_args()

    old, new = collect(a.old), collect(a.new)
    mapping = {}
    for m in a.map:
        if "=" not in m:
            sys.exit(f"error: --map needs old=new, got {m!r}")
        o, n = m.split("=", 1)
        mapping[o] = n
    ignores = [re.compile(r) for r in a.ignore_regex]

    fail = False
    tot_blocks = tot_missing = 0
    print(f"{'page':40} {'old blocks':>10} {'missing':>8}  count diffs")
    for okey, opath in sorted(old.items()):
        explicit = mapping.get(okey) or mapping.get(os.path.basename(opath))
        nspec = explicit or okey
        npath = resolve(nspec, new, allow_fs=bool(explicit))
        if not npath:
            print(f"{os.path.basename(opath):40} UNPAIRED: no new page for {nspec!r} (use --map)")
            fail = True
            continue
        oblocks, ocnt = extract(opath, [t for t in a.skip_old.split(",") if t])
        nblocks, ncnt = extract(npath)
        hay = " ".join(nblocks)
        hay_sq = re.sub(r"\s+", "", hay)
        missing, checked = [], 0
        for b in oblocks:
            t = b
            for rx in ignores:
                t = rx.sub("", t)
            t = norm(re.sub(r"^[^\w]+", "", t))
            if len(t.split()) < a.min_words:
                continue
            checked += 1
            if t in hay or re.sub(r"\s+", "", t) in hay_sq:
                continue
            missing.append(t)
        diffs = [f"{k} {ocnt[k]}->{ncnt[k]}" for k in COUNTED if ocnt[k] != ncnt[k]]
        label = f"{os.path.basename(opath)} -> " + "/".join(npath.split(os.sep)[-2:])
        print(f"{label[:40]:40} {checked:>10} {len(missing):>8}  {', '.join(diffs) or 'same'}")
        for t in missing[: a.show]:
            print(f"    MISSING: {t[:300]}")
        if len(missing) > a.show:
            print(f"    ... {len(missing) - a.show} more")
        tot_blocks += checked
        tot_missing += len(missing)
        if missing or (diffs and a.strict_counts):
            fail = True
    print(f"\n{'FAIL' if fail else 'PASS'}: {tot_missing} of {tot_blocks} old text blocks missing from the new pages")
    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    main()
