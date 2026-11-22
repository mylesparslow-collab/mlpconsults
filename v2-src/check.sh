#!/bin/sh
# Checks for the Shop Row redesign. Needs the repo root served (launch entry "mlpconsults-v2", port 8872).
#   sh v2-src/check.sh [base-url]
# 1. parity: every text block of the live pages is in the new ones, apart from the documented changes below
# 2. the 17 sites, their trades and captions, and the privacy sentences, checked by name
# 3. every internal link, anchor and media file on the five pages resolves
set -e
cd "$(dirname "$0")/.."
BASE="${1:-http://127.0.0.1:8872}"
SK="$HOME/.claude/skills/websiteoftheyear/scripts"
python3 -I v2-src/extract.py >/dev/null
python3 -I v2-src/render.py >/dev/null
python3 -I "$SK/parity.py" --old v2-src/source --new v2 --show 40 \
  --ignore-regex '^0\d (?=[A-Z])' \
  --ignore-regex '^Skip to services$' \
  --ignore-regex '^\d\d[A-Z][^.]*$' \
  --ignore-regex '^Show all 17 sites$' \
  --ignore-regex '^Halden · Jewelry store$' \
  --ignore-regex '^Open site ↗Open the ring designer ↗$' \
  --ignore-regex '^This site loads HubSpot’s tracking script.*$' \
  --ignore-regex '^MLP Consulting · Irvine, California · myles@mlpconsults\.comHome · Referrals · Privacy$'
python3 -I - <<'PY'
import json, re, html
d = json.load(open('v2-src/content.json'))
def text(p):
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'<(script|style)\b.*?</\1>', '', s, flags=re.S)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s)))
t = text('v2/index.html'); miss = []
for s in d['home']['work']['sites']:
    for k in ('name', 'trade', 'cap'):
        if s[k] not in t: miss.append((s['key'], k))
    if s['href'] not in open('v2/index.html').read(): miss.append((s['key'], 'href'))
    if s['extra'] and s['extra'][0] not in t: miss.append((s['key'], 'extra'))
p = text('v2/privacy/index.html')
for sent in ('This site loads HubSpot’s tracking script, which sets a cookie so form submissions can be matched to visits.', 'The site is hosted on Cloudflare, which keeps standard server logs.'):
    if sent not in p: miss.append(('privacy', sent[:30]))
f = open('v2/index.html').read()
for need in ('id="f-name"', 'id="f-biz"', 'id="f-contact"', 'id="f-site"', 'id="f-when"', 'id="f-budget"', 'id="f-pain"', 'id="f-ref"', 'id="f-interest"',
             'api.web3forms.com/submit', 'api.hsforms.com/submissions/v3/integration/submit/247871007/41028eeb-eade-4ad2-af4f-d77729628ba6', 'supabase.co/rest/v1/leads'):
    if need not in f: miss.append(('form', need))
old = d['home']['contact']['form_js']
if old not in f: miss.append(('form', 'handler differs from the live one'))
print('named checks:', 'PASS (17 sites, privacy sentences, form fields and destinations)' if not miss else 'FAIL %r' % miss)
raise SystemExit(1 if miss else 0)
PY
# The demo apps route #staff and #shop in their own scripts (no element carries those ids), so the link
# checker reports those four; they are the same links the live site has. Anything else fails the run.
OUT=$(node "$SK/check_links.mjs" "$BASE/v2/" --pages how-it-works/,workflows/,referrals/,privacy/ --no-external || true)
echo "$OUT" | grep -v -E 'anchor #(staff|shop) missing on /work/' | grep -v '^FAIL: '
OTHER=$(echo "$OUT" | grep -E '^ +FAIL ' | grep -v -c -E 'anchor #(staff|shop) missing on /work/' || true)
KNOWN=$(echo "$OUT" | grep -c -E 'anchor #(staff|shop) missing on /work/' || true)
echo "links: $OTHER unexpected problem(s); $KNOWN known demo hash routes (#staff, #shop) skipped"
[ "$OTHER" = "0" ]
