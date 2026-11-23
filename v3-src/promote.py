#!/usr/bin/env python3
"""Promote the v3 preview build to the site root of another checkout.

  python3 -I v3-src/promote.py <target-dir>

<target-dir> is a checkout of main (the repo root is what Cloudflare Pages publishes). This copies
v3/ over the five root pages and adds /assets/, and makes the three changes that separate the
preview from the live site:
  - /v3/ paths become root paths
  - the preview's noindex tag is removed
  - HubSpot's tracker goes back on the homepage, copied from the frozen live page
Nothing else in the target is touched (demos under /work/, /img/, /map/, /dash/, functions).
Standard library only. Run the renderers first (check_v3.sh does).
"""
import os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'v3')
PAGES = ['index.html', 'how-it-works/index.html', 'workflows/index.html', 'referrals/index.html', 'privacy/index.html']
TEXT = ('.html', '.css', '.js')
NOINDEX = '<meta name="robots" content="noindex">\n'


def tracker():
    live = open(os.path.join(ROOT, 'v2-src', 'source', 'index.html'), encoding='utf-8').read()
    m = re.search(r'<!-- HubSpot:[^\n]*-->\n<script[^\n]*id="hs-script-loader"[^\n]*</script>\n', live)
    assert m, 'tracker not found in the frozen live homepage'
    return m.group(0)


def main(target):
    target = os.path.abspath(target)
    assert os.path.isfile(os.path.join(target, 'index.html')) and os.path.isdir(os.path.join(target, 'work')), 'target is not a checkout of the site'
    assert not os.path.samefile(target, ROOT), 'target must be a different checkout'
    hs = tracker()
    wrote = []
    for dirpath, _, files in os.walk(SRC):
        for f in files:
            src = os.path.join(dirpath, f)
            rel = os.path.relpath(src, SRC)
            dst = os.path.join(target, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            if not f.endswith(TEXT) or rel.startswith(os.path.join('assets', 'vendor')):
                shutil.copyfile(src, dst)
                wrote.append(rel)
                continue
            s = open(src, encoding='utf-8').read().replace('/v3/', '/')
            if rel in PAGES:
                assert s.count(NOINDEX) == 1, rel
                s = s.replace(NOINDEX, '')
            if rel == 'index.html':
                assert s.count('</body>') == 1
                s = s.replace('</body>', '\n' + hs + '</body>')
            assert '/v3' not in s and 'noindex' not in s, rel
            open(dst, 'w', encoding='utf-8').write(s)
            wrote.append(rel)
    missing = [p for p in PAGES if p not in wrote]
    assert not missing, missing
    home = open(os.path.join(target, 'index.html'), encoding='utf-8').read()
    assert home.count('hs-script-loader') == 1
    print('promoted %d files to %s' % (len(wrote), target))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
