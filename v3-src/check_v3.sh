#!/bin/sh
# Checks for the v3 "Loose Ends" redesign. Needs the preview server (launch entry "mlpconsults-v2", port 8872).
#   sh v3-src/check_v3.sh [base-url]
set -e
cd "$(dirname "$0")/.."
BASE="${1:-http://127.0.0.1:8872}"
SK="$HOME/.claude/skills/websiteoftheyear/scripts"
python3 -I v3-src/render_v3.py >/dev/null
[ -f v3-src/render_inner.py ] && python3 -I v3-src/render_inner.py >/dev/null
# 1. parity with the live pages (same documented exceptions as v2: numerals, removed controls, the privacy font line, old mini footers)
python3 -I "$SK/parity.py" --old v2-src/source --new v3 --show 40 \
  --ignore-regex '^0\d (?=[A-Z])' \
  --ignore-regex '^Skip to services$' \
  --ignore-regex '^\d\d[A-Z][^.]*$' \
  --ignore-regex '^Show all 17 sites$' \
  --ignore-regex '^Halden · Jewelry store$' \
  --ignore-regex '^Open site ↗Open the ring designer ↗$' \
  --ignore-regex '^This site loads HubSpot’s tracking script.*$' \
  --ignore-regex '^MLP Consulting · Irvine, California · myles@mlpconsults\.comHome · Referrals · Privacy$'
# 2. named checks: the 17 sites, the form, the handler
python3 -I - <<'PY'
import json, re, html
d = json.load(open('v2-src/content.json'))
raw = open('v3/index.html', encoding='utf-8').read()
t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', re.sub(r'<(script|style)\b.*?</\1>', '', raw, flags=re.S))))
miss = []
for s in d['home']['work']['sites']:
    for k in ('name', 'trade', 'cap'):
        if s[k] not in t: miss.append((s['key'], k))
    if s['href'] not in raw: miss.append((s['key'], 'href'))
    if s['extra'] and s['extra'][0] not in t: miss.append((s['key'], 'extra'))
for need in ('id="f-name"', 'id="f-biz"', 'id="f-contact"', 'id="f-site"', 'id="f-when"', 'id="f-budget"', 'id="f-pain"', 'id="f-ref"', 'id="f-interest"',
             'api.web3forms.com/submit', 'api.hsforms.com/submissions/v3/integration/submit/247871007/41028eeb-eade-4ad2-af4f-d77729628ba6', 'supabase.co/rest/v1/leads'):
    if need not in raw: miss.append(('form', need))
if d['home']['contact']['form_js'] not in raw: miss.append(('form', 'handler differs from the live one'))
for i in ('top', 'services', 'work', 'about', 'contact', 'quick-win', 'website', 'workflows-ai', 'automations', 'case-sites', 'case-automations', 'case-remodeler', 'case-brokerage', 'case-permits'):
    if ('id="%s"' % i) not in raw: miss.append(('anchor', i))
print('named checks:', 'PASS (17 sites, form fields and destinations, handler, anchors)' if not miss else 'FAIL %r' % miss)
raise SystemExit(1 if miss else 0)
PY
# 3. links (the demos' own #staff / #shop routes are script-handled, as on the live site)
PAGES=""; [ -f v3/how-it-works/index.html ] && PAGES="--pages how-it-works/,workflows/,referrals/,privacy/"
OUT=$(node "$SK/check_links.mjs" "$BASE/v3/" $PAGES --no-external || true)
echo "$OUT" | grep -v -E 'anchor #(staff|shop) missing on /work/' | grep -v '^FAIL: '
OTHER=$(echo "$OUT" | grep -E '^ +FAIL ' | grep -v -c -E 'anchor #(staff|shop) missing on /work/' || true)
echo "links: $OTHER unexpected problem(s)"
[ "$OTHER" = "0" ]
# 4. the pages on the real GPU
node v2-src/tools/gl-check.mjs home --base "$BASE"
[ -f v3/how-it-works/index.html ] && node v2-src/tools/gl-check.mjs inner --base "$BASE"
