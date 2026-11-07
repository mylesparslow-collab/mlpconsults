#!/usr/bin/env python3
"""Turn a multi-page static site folder into a Claude Artifact bundle.

Usage:
  python3 publish_bundle.py <site-dir> <out-dir> [--title "Name"] [--assets-root <repo-root>]
(re-running over its own output dir is fine; a non-empty dir it did not create is refused)

Produces in <out-dir>:
  index.html          the homepage with its document shell stripped (no doctype/html/head/body/
                      charset/viewport tags - the Artifact host wraps the page) and <title> set
  other *.html        copied as full documents (served as-is)
  shared css/js       copied alongside
  media               ONLY files actually referenced by the html / css / js (src, srcset, poster,
                      href, data-*, css url(), quoted paths in scripts), copied to the same relative
                      layout. Refs that leave <site-dir> (e.g. ../assets/x.jpg) are resolved against
                      --assets-root (default: <site-dir>) and the file is placed at its path
                      relative to that root; every reference is rewritten to match.
and writes <out-dir>-files.json: [{"path": ...}] for every file except the root index.html,
ready for the Artifact tool's `files` parameter (publish index.html as file_path).

Why folder links are rewritten: the Artifact host serves files, not folder indexes, so href/src/
data-h/data-href values like `legal/`, `legal/#x`, `../legal/#x` become `legal/index.html...`.
JS hash-redirects of the shape  map[id] + '/' + location.hash  are patched to
map[id] + '/index.html' + location.hash; other string-built folder links in JS (`+ '/'`,
'dir/' + x) cannot be fixed safely - they are listed as warnings for you to patch by hand.

Prints: file count, total MB, largest file, missing media, leftover folder links / unresolved
refs, redirects patched. Warns above 60MB total or 15MB per file (Artifact limits).
Exit 0 = clean, 1 = missing media, leftover folder links, unresolved refs or a limit exceeded.
Cannot do: references built at runtime from variables, <base href>, media inside the CSS of
files outside the site, or giving the Artifact host a clean-URL router. Standard library only.
"""
import argparse, json, os, re, shutil, sys
from urllib.parse import quote, unquote

MEDIA = r"jpe?g|png|gif|webp|avif|svg|ico|mp4|webm|mov|m4v|ogv|mp3|ogg|wav|m4a|woff2?|ttf|otf|pdf|json|glb|gltf|wasm"
# a quoted / url() / srcset path ending in a media extension
TOKEN = re.compile(r"""(?<=["'(\s,=])((?:\.{1,2}/|/)?(?:[\w@%~.+\-]+/)*[\w@%~.+\-]+\.(?:MEDIA_EXT))(?=[?#"')\s,;]|$)""".replace("MEDIA_EXT", MEDIA), re.I)
ATTR = re.compile(r"""((?:href|data-h|data-href|src|action|poster)\s*=\s*)(["'])([^"']*)\2""", re.I)
SKIP_DIRS = {"node_modules", ".git", "__MACOSX"}
MARK = ".publish_bundle"


def read(p):
    with open(p, encoding="utf-8", errors="surrogateescape") as f:
        return f.read()


def write(p, t):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8", errors="surrogateescape") as f:
        f.write(t)


def walk(root):
    for d, dirs, files in os.walk(root):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS)
        for fn in sorted(files):
            yield os.path.join(d, fn)


def main():
    ap = argparse.ArgumentParser(description="Turn a static site folder into a Claude Artifact bundle")
    ap.add_argument("site_dir")
    ap.add_argument("out_dir")
    ap.add_argument("--title")
    ap.add_argument("--assets-root", help="root that refs leaving <site-dir> resolve against (e.g. the repo root)")
    a = ap.parse_args()

    site = os.path.realpath(a.site_dir)
    out = os.path.realpath(a.out_dir)
    root = os.path.realpath(a.assets_root) if a.assets_root else site
    if not os.path.isfile(os.path.join(site, "index.html")):
        sys.exit(f"error: {site}/index.html not found")
    if out == site or out.startswith(site + os.sep) or site.startswith(out + os.sep) or out == root:
        sys.exit("error: out-dir must be separate from site-dir / assets-root")
    if os.path.isdir(out):
        if os.listdir(out) and not os.path.exists(os.path.join(out, MARK)):
            sys.exit(f"error: {out} exists, is not empty and was not made by this script - remove it first")
        shutil.rmtree(out)
    os.makedirs(out)
    open(os.path.join(out, MARK), "w").close()

    def under(p, base):
        return p == base or p.startswith(base + os.sep)

    def dest_of(src):
        if under(src, site):
            return os.path.relpath(src, site)
        if under(src, root):
            return os.path.relpath(src, root)
        return None

    docs = [p for p in walk(site) if p.lower().endswith((".html", ".htm", ".css", ".js", ".mjs"))]
    warnings, missing, copied, patched = [], [], {}, 0
    conflicts = set()

    def resolve(tok, doc_src):
        t = unquote(tok)
        cands = [os.path.join(site, t.lstrip("/"))] if t.startswith("/") else [os.path.join(os.path.dirname(doc_src), t)]
        if t.startswith("/"):
            cands.append(os.path.join(root, t.lstrip("/")))
        for c in cands:
            c = os.path.normpath(c)
            if os.path.isfile(c):
                return c
        return None

    def rewrite_media(text, doc_src):
        ddir = os.path.dirname(dest_of(doc_src) or "")

        def sub(m):
            tok = m.group(1)
            if tok.startswith("//"):
                return tok
            src = resolve(tok, doc_src)
            if not src:
                if "/" in tok or tok.lower().endswith(tuple("." + e for e in MEDIA.replace("?", "").split("|") if e != "json")):
                    missing.append(f"{os.path.relpath(doc_src, site)}: {tok}")
                return tok
            d = dest_of(src)
            if d is None:
                missing.append(f"{os.path.relpath(doc_src, site)}: {tok} (outside site-dir; pass --assets-root)")
                return tok
            if d in copied and copied[d] != src:
                conflicts.add(d)
            copied[d] = src
            rel = os.path.relpath(d, ddir or ".").replace(os.sep, "/")
            return quote(rel, safe="/@~+.-_%") if "%" in tok else rel

        return TOKEN.sub(sub, text)

    def fix_folder_links(text, doc_src):
        def sub(m):
            pre, q, val = m.groups()
            if not val or val.startswith(("#", "?")) or re.match(r"^[a-zA-Z][\w+.-]*:|^//", val):
                return m.group(0)
            path = re.split(r"[?#]", val, maxsplit=1)[0]
            suffix = val[len(path):]
            res = os.path.normpath(os.path.join(site if path.startswith("/") else os.path.dirname(doc_src), unquote(path).lstrip("/") if path.startswith("/") else unquote(path)))
            if (path.endswith("/") or path in (".", "..")) and os.path.isfile(os.path.join(res, "index.html")) or \
               (os.path.isdir(res) and os.path.isfile(os.path.join(res, "index.html")) and not os.path.splitext(path)[1]):
                base = path if path.endswith("/") else path + "/"
                return f"{pre}{q}{base}index.html{suffix}{q}"
            return m.group(0)

        return ATTR.sub(sub, text)

    hash_re = re.compile(r"""(\w+\[\w+\]\s*\+\s*)(['"])/\2(\s*\+\s*(?:window\.)?location\.hash)""")
    other_js = [re.compile(r"""\+\s*(['"])/\1"""), re.compile(r"""(['"])[\w.-]+/\1\s*\+""")]

    def patch_js_links(text, label):
        nonlocal patched
        text, n = hash_re.subn(lambda m: f"{m.group(1)}{m.group(2)}/index.html{m.group(2)}{m.group(3)}", text)
        patched += n
        for i, line in enumerate(text.splitlines(), 1):
            if "index.html" in line:
                continue
            for rx in other_js:
                if rx.search(line):
                    warnings.append(f"{label}:{i}: string-built folder link in JS (needs index.html by hand): {line.strip()[:110]}")
                    break
        return text

    # ---- process every html/css/js ----
    home_src = os.path.join(site, "index.html")
    for src in docs:
        d = dest_of(src)
        ext = os.path.splitext(src)[1].lower()
        t = rewrite_media(read(src), src)
        if ext in (".html", ".htm"):
            t = fix_folder_links(t, src)
            scripts = re.findall(r"<script\b[^>]*>(.*?)</script>", t, re.S | re.I)
            for s in scripts:
                t = t.replace(s, patch_js_links(s, d)) if s.strip() else t
            if src == home_src:
                lost = re.findall(r"<(html|body)\b([^>]*[^\s>/][^>]*)>", t, re.I)
                for tag, attrs in lost:
                    warnings.append(f"index.html: <{tag}{attrs}> attributes are dropped with the shell - move them onto a wrapper element if needed")
                t = re.sub(r"<!doctype[^>]*>\s*", "", t, flags=re.I)
                t = re.sub(r"</?(?:html|head|body)\b[^>]*>\s*", "", t, flags=re.I)
                t = re.sub(r"<meta\s+charset=[^>]*>\s*|<meta\s+name=[\"']viewport[\"'][^>]*>\s*", "", t, flags=re.I)
                title = a.title or (re.search(r"<title>(.*?)</title>", t, re.S | re.I) or [None, os.path.basename(site)])[1].strip()
                if re.search(r"<title>.*?</title>", t, re.S | re.I):
                    t = re.sub(r"<title>.*?</title>", lambda _: f"<title>{title}</title>", t, count=1, flags=re.S | re.I)
                else:
                    t = f"<title>{title}</title>\n" + t
                t = t.lstrip()
        elif ext in (".js", ".mjs"):
            t = patch_js_links(t, d)
        write(os.path.join(out, d), t)

    for d, src in sorted(copied.items()):
        dst = os.path.join(out, d)
        if not os.path.exists(dst):
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
    for d in sorted(conflicts):
        warnings.append(f"two different source files map to {d}; kept the last")

    # ---- verify the output ----
    allfiles = [os.path.relpath(p, out) for p in walk(out) if os.path.basename(p) != MARK]
    leftovers, unresolved = [], []
    for rel in allfiles:
        if not rel.lower().endswith((".html", ".htm")):
            continue
        base = os.path.dirname(os.path.join(out, rel))
        for m in ATTR.finditer(read(os.path.join(out, rel))):
            val = m.group(3)
            if not val or val.startswith(("#", "?")) or re.match(r"^[a-zA-Z][\w+.-]*:|^//", val):
                continue
            path = unquote(re.split(r"[?#]", val, maxsplit=1)[0])
            tgt = os.path.normpath(os.path.join(out if path.startswith("/") else base, path.lstrip("/") if path.startswith("/") else path))
            if os.path.isdir(tgt):
                leftovers.append(f"{rel}: {val}")
            elif path and not os.path.exists(tgt) and os.path.splitext(path)[1] and not path.startswith("/"):
                unresolved.append(f"{rel}: {val}")
    files = sorted(f.replace(os.sep, "/") for f in allfiles if f != "index.html")
    write(out.rstrip(os.sep) + "-files.json", json.dumps([{"path": f} for f in files]))
    sizes = {f: os.path.getsize(os.path.join(out, f)) for f in allfiles}
    total = sum(sizes.values())
    big = max(sizes, key=sizes.get)

    print(f"{len(files)} files (+ index.html), {total/1e6:.1f} MB total, largest {big} {sizes[big]/1e6:.1f} MB")
    print(f"missing media: {len(missing)}" + ("".join(f"\n    {m}" for m in missing[:10])))
    print(f"leftover folder links: {len(leftovers)}" + ("".join(f"\n    {m}" for m in leftovers[:10])))
    print(f"unresolved relative refs: {len(unresolved)}" + ("".join(f"\n    {m}" for m in unresolved[:10])))
    print(f"JS hash redirects patched: {patched}")
    bad = bool(missing or leftovers or unresolved)
    if total > 60e6:
        warnings.append(f"total {total/1e6:.0f} MB exceeds the 60MB per-publish limit - publish in several calls")
        bad = True
    for f, s in sizes.items():
        if s > 15e6:
            warnings.append(f"{f} is {s/1e6:.1f} MB (> 15MB Artifact file limit)")
            bad = True
    for w in warnings:
        print("  warn:", w)
    print(f"files list: {out}-files.json")
    print("FAIL" if bad else "PASS")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
