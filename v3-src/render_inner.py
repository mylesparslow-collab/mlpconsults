#!/usr/bin/env python3
"""Render the four v3 inner pages (how it works, workflows, referrals, privacy) from v2-src/content.json.

  python3 -I v3-src/render_inner.py

Never hand-edit the output. Standard library only.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chrome
from chrome import BASE, D, H, e, fix_links, head, header, footer, menu_overlay, tail

nb = e
SITES = [{'key': s['key'], 'name': s['name'], 'href': s['href'], 'img': BASE + '/assets/sites/' + s['key'] + '.jpg'} for s in H['work']['sites']]
SITES_JSON = json.dumps(SITES, ensure_ascii=False).replace('</', '<\\/')
OUT = {'how': 'how-it-works', 'workflows': 'workflows', 'referrals': 'referrals', 'privacy': 'privacy'}
FORMATION = {'how': 1, 'workflows': 4, 'referrals': 2, 'privacy': 5}


def page(name, meta, body):
    h = head(meta, name).replace('</head>', f'<link rel="stylesheet" href="{BASE}/assets/inner.css">\n</head>')
    return ''.join([
        h, f'<body data-formation="{FORMATION[name]}">\n', header(name), '<main id="main" tabindex="-1">\n',
        f'<div class="pg">\n{body}</div>\n</main>\n', footer(name), menu_overlay(name),
        f'<script type="application/json" id="sites-data">{SITES_JSON}</script>\n',
        tail(f'<script src="{BASE}/assets/inner.js"></script>\n')])


def intro(eyebrow, h1, lead):
    lbl = f'<p class="seclbl">{nb(eyebrow)}</p>\n' if eyebrow else ''
    return f'<section class="top" aria-labelledby="pg-t">\n<div class="col">\n{lbl}<h1 id="pg-t">{nb(h1)}</h1>\n<p class="lead">{nb(lead)}</p>\n</div>\n</section>\n'


def how():
    d = D['how']
    steps = ''.join(f'<li><i aria-hidden="true">{nb(a)}</i><h3>{nb(b)}</h3><p>{nb(c)}</p></li>' for a, b, c in d['steps'])
    pr = ''.join(f'<div><h3>{nb(a)}</h3><p>{nb(b)}</p></div>' for a, b in d['principles'])
    faq = ''.join(f'<details><summary>{nb(a)}</summary><p>{fix_links(b)}</p></details>' for a, b in d['faq'])
    body = intro('', d['h1'], d['lead']) + f'''<section class="blk" id="how" aria-labelledby="how-t">
<div class="col">
<p class="seclbl">{nb(d["steps_label"])}</p>
<h2 id="how-t">{nb(d["steps_h2"])}</h2>
<ol class="steps">{steps}</ol>
</div>
</section>
<section class="blk" aria-labelledby="pr-t">
<div class="col">
<h2 id="pr-t">{nb(d["principles_h2"])}</h2>
<div class="prin">{pr}</div>
</div>
</section>
<section class="blk" id="faq" aria-labelledby="faq-t">
<div class="col">
<p class="seclbl">{nb(d["faq_label"])}</p>
<h2 id="faq-t">{nb(d["faq_h2"])}</h2>
<div class="faq">{faq}</div>
</div>
</section>
<section class="blk end" aria-labelledby="cta-t">
<div class="col">
<h2 id="cta-t">{nb(d["cta_h2"])}</h2>
<p class="avail">{nb(d["cta_avail"])}</p>
<p class="cta"><a class="btn go" href="{BASE}/#contact" data-interest="Free assessment">{nb(d["cta_btn"])}</a></p>
</div>
</section>
'''
    return page('how', d['meta'], body)


def workflows():
    d = D['workflows']
    rows = ''.join(f'<article class="flow"><p class="when">{nb(c["when"])}</p><h2>{nb(c["title"])}</h2><p>{nb(c["text"])}</p><p class="rule">{c["rule_html"]}</p></article>' for c in d['cards'])
    body = intro(d['eyebrow'], d['h1'], d['lead']) + f'''<section class="blk">
<div class="col">
<div class="lanes">{rows}</div>
</div>
</section>
<section class="blk end" aria-labelledby="note-t">
<div class="col">
<h2 id="note-t">{nb(d["note_h2"])}</h2>
<p class="lead">{nb(d["note"])}</p>
<p class="cta"><a class="btn go" href="{BASE}/#contact" data-interest="Free assessment">{nb(d["cta"])}</a></p>
</div>
</section>
'''
    return page('workflows', d['meta'], body)


def referrals():
    d = D['referrals']
    rates = ''.join(f'<div><b>{nb(a)}</b><span>{nb(b)}</span></div>' for a, b in d['rates'])
    prose = ''.join(f'<p>{nb(p)}</p>' for p in d['prose'])
    body = intro(d['eyebrow'], d['h1'], d['lead']) + f'''<section class="blk end">
<div class="col">
<div class="rates">{rates}</div>
<div class="prose">{prose}</div>
<p class="cta"><a class="tlink" href="{d["cta_href"]}">{nb(d["cta"])}</a></p>
</div>
</section>
'''
    return page('referrals', d['meta'], body)


def privacy():
    d = D['privacy']
    secs = []
    for a, b in d['sections']:
        b = b.replace('Fonts are loaded from Google Fonts.', 'Fonts are served from this site.')
        secs.append(f'<section class="psec"><h2>{nb(a)}</h2><p>{fix_links(b)}</p></section>')
    body = intro('', d['h1'], d['lead']) + f'<section class="blk end">\n<div class="col">\n{"".join(secs)}\n</div>\n</section>\n'
    return page('privacy', d['meta'], body)


if __name__ == '__main__':
    for name, fn in (('how', how), ('workflows', workflows), ('referrals', referrals), ('privacy', privacy)):
        p = os.path.join(chrome.ROOT, 'v3', OUT[name], 'index.html')
        os.makedirs(os.path.dirname(p), exist_ok=True)
        text = fn()
        open(p, 'w', encoding='utf-8').write(text)
        print('wrote v3/' + OUT[name] + '/index.html', len(text))
