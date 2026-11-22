#!/usr/bin/env python3
"""Render the v3 homepage ("Loose ends") from v2-src/content.json into v3/index.html.

  python3 -I v3-src/render_v3.py

Never hand-edit v3/index.html. Standard library only.
"""
import json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import chrome
from chrome import H, e, fix_links, head, header, footer, menu_overlay, tail

OUT = os.path.join(chrome.ROOT, 'v3', 'index.html')
nb = e


def shot(s, w=1600, h=1000):
    x = f' data-x="{e("|".join(s["extra"]))}"' if s.get('extra') else ''
    return (f'<button class="shot" type="button" data-title="{e(s["cap_title"])}" data-cap="{e(s["cap"])}"{x} aria-label="View larger: {e(s["cap_title"])}">'
            f'<img decoding="async" src="/img/{s["key"]}.webp" width="{w}" height="{h}" alt="{e(s["alt"])}" loading="lazy"></button>')


def home():
    hero, sv, wk, ab, ct = H['hero'], H['services'], H['work'], H['about'], H['contact']
    out = [head(H['meta'], 'home'), '<body>\n', header('home'), '<div class="scrim" data-scene-through aria-hidden="true"></div>\n', '<main id="main" tabindex="-1">\n']

    # 1 storm
    facts = ''.join(f'<div><dt>{nb(a)}</dt><dd>{nb(b)}</dd></div>' for a, b in hero['facts'])
    out.append(f'''<section class="ch" data-scene-through id="top" aria-labelledby="hero-title">
<div class="col">
<p class="kicker"><span>{nb(hero["kicker"][0])}</span><span>{nb(hero["kicker"][1])}</span></p>
<h1 id="hero-title"><span class="ln">{nb(hero["h1"][0])}</span><span class="ln">{nb(hero["h1"][1])}</span></h1>
<p class="lead">{nb(hero["lead"])}</p>
<div class="cta">
<a class="btn go" href="#contact" data-interest="Free assessment">{nb(hero["cta"][0])}</a>
<a class="tlink" href="#services">{nb(hero["cta"][1])}</a>
</div>
<p class="reassure">{nb(hero["reassure"])}</p>
<dl class="facts">{facts}</dl>
</div>
</section>
''')

    # 2 columns: the assessment sheet
    ex0 = hero['examples'][hero['tabs'][0][0]]
    tabs = ''.join(
        f'<button type="button" role="tab" id="tab-{k}" aria-selected="{"true" if i == 0 else "false"}" aria-controls="sheet-panel" data-t="{k}"{"" if i == 0 else " tabindex=\"-1\""}>{nb(v)}</button>'
        for i, (k, v) in enumerate(hero['tabs']))
    rows = ''.join(f'<li><i>{i + 1}</i><span class="k">{nb(r[0])}</span><span class="d">{nb(r[1])}</span><span class="v"><b>Fix:</b> {nb(r[2])}</span></li>' for i, r in enumerate(ex0))
    allx = ''.join(
        f'<div class="ex"><h3>{nb(v)}</h3><ol>' + ''.join(f'<li><i>{i + 1}</i><span class="k">{nb(r[0])}</span><span class="d">{nb(r[1])}</span><span class="v"><b>Fix:</b> {nb(r[2])}</span></li>' for i, r in enumerate(hero['examples'][k])) + '</ol></div>'
        for k, v in hero['tabs'])
    out.append(f'''<section class="ch" data-scene-through id="assessment" aria-labelledby="sheet-t">
<div class="col">
<h2 id="sheet-t">{nb(hero["sheet_title"])} <small>{nb(hero["sheet_small"])}</small></h2>
<div class="tabs" role="tablist" aria-label="Kind of business" id="tabs">{tabs}</div>
<div id="sheet-panel" role="tabpanel" aria-labelledby="tab-{hero["tabs"][0][0]}" aria-live="polite"><ol id="sheet-list">{rows}</ol></div>
<div class="ex-all">{allx}</div>
<p class="foot-note">{nb(hero["sheet_foot"])}</p>
</div>
</section>
''')

    # 3 stacks: services
    svcs = []
    for s in sv['items']:
        what = ''.join(f'<p>{fix_links(p, True)}</p>' for p in s['what_html'])
        lis = ''.join(f'<li>{nb(b)}</li>' for b in s['bullets'])
        word = '' if any(ch.isdigit() for ch in s['price']) else ' word'
        svcs.append(f'''<article class="svc" id="{s["id"]}">
<div class="svc-top"><h3><i>{nb(s["letter"])}</i> {nb(s["name"])}</h3></div>
<p class="price{word}">{nb(s["price"])}</p>
<p class="note">{nb(s["price_note"])}</p>
<div class="what">{what}</div>
<ul>{lis}</ul>
<p class="go-line"><a class="tlink" href="#contact" data-interest="{e(s["interest"])}">{nb(s["cta"])}</a></p>
</article>''')
    also = ''.join(f'<div><b>{nb(a)}</b><p>{nb(b)}</p></div>' for a, b in sv['also'])
    out.append(f'''<section class="ch" data-scene-through id="services" aria-labelledby="services-t">
<div class="col">
<p class="seclbl">{nb(sv["label"])}</p>
<h2 id="services-t">{nb(sv["h2"])}</h2>
<p class="lead">{nb(sv["lead"])}</p>
<div class="prices">
{chr(10).join(svcs)}
</div>
<div class="also" id="automations">{also}</div>
</div>
</section>
''')

    # 4 wall: work
    rows = []
    for s in wk['sites']:
        k = s['key']
        more = f'<a class="more" href="{s["extra"][1]}" target="_blank" rel="noopener">{nb(s["extra"][0])} ↗</a>' if s['extra'] else ''
        rows.append(f'''<li data-key="{k}">
<a class="row" href="{s["href"]}" target="_blank" rel="noopener"><span class="n">{nb(s["no"])}</span><span class="nm">{nb(s["name"])}</span><span class="tr">{nb(s["trade"])}</span><img class="th" src="/v3/assets/sites/{k}.jpg" width="400" height="640" alt="" loading="lazy" decoding="async"><span class="vh"> (opens in a new tab)</span></a>
<div class="detail"><p>{nb(s["cap"])}</p>{more}</div>
</li>''')
    out.append(f'''<section class="ch" data-scene-through id="work" aria-labelledby="work-t">
<div class="col">
<p class="seclbl">{nb(wk["label"])}</p>
<h2 id="work-t">{nb(wk["h2"])}</h2>
<p class="lead">{nb(wk["lead"])}</p>
<div id="case-sites">
<ol class="sites" aria-label="Seventeen working websites">
{chr(10).join(rows)}
</ol>
</div>
<p class="note">{nb(wk["note"])}</p>
</div>
</section>
''')

    # 5 conveyor lanes: automations
    flows = ''.join(f'<figure>{shot(f)}<figcaption><h3>{nb(f["title"])}</h3><p>{nb(f["text"])}</p></figcaption></figure>' for f in wk['flows'])
    out.append(f'''<section class="ch wide" data-scene-through id="case-automations" aria-labelledby="flows-t">
<div class="col">
<h2 id="flows-t">{nb(wk["flows_head"][0])}</h2>
<p class="lead">{nb(wk["flows_head"][1])}</p>
<div class="flows" data-grp>{flows}</div>
</div>
</section>
''')

    # 6 grid: larger systems, then about
    cases = []
    for c in wk['cases']:
        cols = ''.join(f'<div><h4>{nb(x["h"])}</h4>{x["html"]}</div>' for x in c['cols'])
        kv = '<div class="kv">' + ''.join(f'<div><b>{nb(a)}</b><span>{nb(b)}</span></div>' for a, b in c['kv']) + '</div>' if c['kv'] else ''
        gal = ''.join(f'<figure>{shot(s, s["w"], s["h"])}<figcaption>{nb(s["caption"])}</figcaption></figure>' for s in c['shots'])
        demos = ''
        if c['demos']:
            demos = f'<div class="demos"><span>{nb(c["demos_label"])}</span>' + ''.join(f'<a href="{h}" target="_blank" rel="noopener">{nb(t)}</a>' for t, h in c['demos']) + '</div>'
        fine = f'<p class="fine">{nb(c["fine"])}</p>' if c['fine'] else ''
        cases.append(f'''<details class="case" id="{c["id"]}">
<summary><span class="tag">{nb(c["tag"])}</span><h3>{nb(c["title"])}</h3><p>{nb(c["sum"])}</p></summary>
<div class="case-body">
{cols}{kv}
<div class="gal" data-grp>{gal}</div>
{demos}{fine}
</div>
</details>''')
    body = ''.join(f'<p>{nb(p)}</p>' for p in ab['body'])
    out.append(f'''<section class="ch wide" data-scene-through id="systems" aria-labelledby="cases-t">
<div class="col">
<h2 id="cases-t">{nb(wk["cases_head"][0])}</h2>
<p class="lead">{nb(wk["cases_head"][1])}</p>
<div class="cases">
{chr(10).join(cases)}
</div>
<div class="about" id="about">
<p class="seclbl">{nb(ab["label"])}</p>
<h2>{nb(ab["h2"])}</h2>
<figure class="portrait"><img decoding="async" src="/img/myles.webp" width="720" height="1080" alt="Myles Parslow" loading="lazy"><figcaption>{nb(ab["figcaption"])}</figcaption></figure>
<div class="body">{body}</div>
<blockquote class="quote"><p>{nb(ab["quote"])}</p><footer>{ab["quote_footer_html"]}</footer></blockquote>
</div>
</div>
</section>
''')

    # 7 one neat stack: contact (the form is the live one, verbatim)
    form = ct['form_html'].replace(' class="rv d1"', '')
    out.append(f'''<section class="ch" data-scene-through id="contact" aria-labelledby="contact-t">
<div class="col">
<p class="seclbl">{nb(ct["label"])}</p>
<h2 id="contact-t">{nb(ct["h2"])}</h2>
<p class="avail">{nb(ct["avail"])}</p>
<p class="lead">{fix_links(ct["lead_html"], True)}</p>
<p class="cal"><a class="tlink" href="{ct["cal_href"]}" target="_blank" rel="noopener">{nb(ct["cal_text"])}</a></p>
<div class="direct">
<div class="mailrow"><a class="addr" id="addr" href="mailto:{ct["email"]}">{ct["email"]}</a><button class="btn line sm" type="button" id="copy">Copy</button></div>
<div class="mailrow"><a class="addr" href="{ct["phone_href"]}">{nb(ct["phone_text"])}</a></div>
</div>
{form}
</div>
</section>
</main>
''')
    out.append(footer('home'))
    out.append(menu_overlay('home'))
    out.append('''<dialog class="lb" id="lb" aria-label="Screenshot viewer">
<figure><img decoding="async" id="lbi" alt=""><figcaption><b id="lbt"></b><span id="lbc"></span><a id="lbl" target="_blank" rel="noopener" hidden></a>
<span class="lbnav"><button class="lbp" type="button">Previous</button><span class="lbn" id="lbn"></span><button class="lbq" type="button">Next</button><button class="lbx" type="button">Close</button></span></figcaption></figure>
</dialog>
''')
    ex = json.dumps(hero['examples'], ensure_ascii=False).replace('</', '<\\/')
    form_js = '<script>\n/* The contact form handler, carried over unchanged from the live site: same fields, same destinations. */\n(function(){\n  ' + ct['form_js'] + '\n})();\n</script>\n'
    out.append(f'<script type="application/json" id="ex-data">{ex}</script>\n')
    out.append(tail(form_js))
    return ''.join(out)


if __name__ == '__main__':
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    text = home()
    open(OUT, 'w', encoding='utf-8').write(text)
    print('wrote v3/index.html', len(text))
