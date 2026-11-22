#!/usr/bin/env python3
"""Render the "Shop Row" redesign of mlpconsults.com from v2-src/content.json into v2/.

  python3 -I v2-src/render.py            # preview build, served beside the live site at /v2/
  python3 -I v2-src/render.py --base ''  # build with root paths (what a promote would use)

Never hand-edit v2/: change content.json (via extract.py), this file, site.css or site.js, and re-run.
Standard library only.
"""
import html, json, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'v2')
BASE = '/v2'
if '--base' in sys.argv:
    BASE = sys.argv[sys.argv.index('--base') + 1].rstrip('/')
PREVIEW = BASE != ''
D = json.load(open(os.path.join(HERE, 'content.json'), encoding='utf-8'))
H = D['home']
e = html.escape

# Shopfront colours, hand-picked from each demo site's own screenshot (fascia colour, lettering colour, awning).
SHOPS = {
    'jewelry-store': ('#15120d', '#e3c98f', 0), 'brokerage-site': ('#7c3527', '#f6ead9', 1), 'site-birchway': ('#e9c85f', '#1b2a2a', 0),
    'site-camino': ('#b93a26', '#fff1e2', 1), 'site-paperwhale': ('#f3efe6', '#b02a20', 0), 'site-quietwell': ('#5d6b40', '#fbf7ee', 0),
    'site-little-orbit': ('#8a5c2a', '#fff6e6', 1), 'site-crestline': ('#22352b', '#f0a35c', 0), 'site-cedarline': ('#5a2a1a', '#f3dcc0', 1),
    'site-hollis': ('#f0d3c6', '#1b4539', 0), 'site-bellwood': ('#255049', '#f4f1e6', 0), 'site-coffee': ('#121f19', '#f08a2b', 1),
    'site-marlow': ('#e9dfcc', '#5b3a22', 1), 'site-salon': ('#216556', '#f6efe0', 0), 'site-pilates': ('#f1c9c2', '#3b1c25', 0),
    'site-boutique': ('#7f172b', '#f6e7d8', 1), 'site-solace': ('#dfe9e4', '#255344', 0),
}


def lum(hx):
    v = [int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    v = [c / 12.92 if c <= .03928 else ((c + .055) / 1.055) ** 2.4 for c in v]
    return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]


def contrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + .05) / (lb + .05)


for k, (c, t, _) in SHOPS.items():
    assert contrast(c, t) >= 4.5, (k, round(contrast(c, t), 2))


def shop_style(k):
    c, t, _ = SHOPS[k]
    dark, light = (c, t) if lum(c) < lum(t) else (t, c)
    return f'--c:{c};--t:{t};--d:{dark};--l:{light}'


def link(href):
    """Site pages get the preview base; demos, images and outside links are left alone."""
    if href.startswith('#'):
        return href
    if href.startswith('/') and not href.startswith(('/work/', '/img/', '/map/', '/dash/')):
        return BASE + href
    return href


def fix_links(fragment, home=False):
    def sub(m):
        h = m.group(1)
        if h.startswith('#') and not home:
            h = '/' + h
        return 'href="' + link(h) + '"'
    return re.sub(r'href="([^"]*)"', sub, fragment)


def nb(s):
    return e(s)


LOGO = H['logo_svg']
ARROW = ''  # arrows are drawn by CSS (.btn.go::after) so button text stays exactly as on the live site


def head(meta, page):
    robots = '<meta name="robots" content="noindex">\n' if PREVIEW else ''
    jsonld = f'<script type="application/ld+json">\n{H["jsonld"]}\n</script>\n' if page == 'home' else ''
    og = ''
    if meta.get('og_title'):
        og = (f'<meta property="og:title" content="{e(meta["og_title"])}">\n<meta property="og:description" content="{e(meta["og_description"])}">\n'
              f'<meta property="og:url" content="{meta["canonical"]}">\n<meta property="og:type" content="website">\n'
              '<meta property="og:image" content="https://mlpconsults.com/img/og.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
              '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="https://mlpconsults.com/img/og.png">\n')
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
{robots}{og}<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="48x48" href="/img/logo-12/favicon-48.png">
<link rel="icon" type="image/png" sizes="96x96" href="/img/logo-12/favicon-96.png">
<link rel="icon" type="image/png" sizes="32x32" href="/img/logo-12/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/img/logo-12/icon-192.png">
<link rel="apple-touch-icon" href="/img/logo-12/apple-touch-icon.png">
<title>{e(meta["title"])}</title>
<meta name="description" content="{e(meta["description"])}">
<link rel="canonical" href="{meta["canonical"]}">
{jsonld}<meta name="theme-color" content="#0f3b2d">
<link rel="preload" href="{BASE}/assets/fonts/Gabarito.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="{BASE}/assets/fonts/Figtree.ttf" as="font" type="font/ttf" crossorigin>
<script>try{{var t=localStorage.getItem('mlp-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}}catch(e){{}}</script>
<link rel="stylesheet" href="{BASE}/assets/site.css">
</head>
'''


def strip(page):
    home = page == 'home'
    pre = '' if home else BASE + '/'
    cur = ' aria-current="page"' if page == 'how' else ''
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="strip" id="strip">
<div class="wrap">
<a class="mark" href="{'#top' if home else BASE + '/'}" aria-label="MLP Consulting, home">{LOGO}<b>Consulting</b></a>
<nav class="links" id="nav" aria-label="Main">
<a href="{pre}#services">Services</a>
<a href="{pre}#work">Work</a>
<a href="{BASE}/how-it-works/"{cur}>How it works</a>
<a href="{pre}#about">About</a>
<a class="btn lamp" href="{pre}#contact" data-interest="Free assessment"><span class="cta-l">Get a free assessment</span><span class="cta-s">Free assessment</span></a>
</nav>
<button class="doorsign" type="button" id="sign" aria-label="Switch between day (light) and night (dark)"><svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 1.8a6.2 6.2 0 0 1 0 12.4z" fill="currentColor"/></svg><span>Day</span></button>
<button class="menu-btn" type="button" id="menu" aria-expanded="false" aria-controls="nav">Menu</button>
</div>
</header>
'''


def footer(page):
    home = page == 'home'
    pre = '' if home else BASE + '/'
    f = H['footer']
    return f'''<footer class="foot">
<div class="wrap">
<div>
<a class="mark" href="{'#top' if home else BASE + '/'}" aria-label="MLP Consulting, home">{LOGO}<b>Consulting</b></a>
<p>{nb(f["blurb"])}</p>
</div>
<nav aria-label="Footer"><a href="{pre}#services">Services</a><a href="{pre}#work">Work</a><a href="{BASE}/how-it-works/">How it works</a><a href="{pre}#about">About</a><a href="{pre}#contact">Contact</a><a href="{BASE}/workflows/">Workflows</a><a href="{BASE}/referrals/" id="referrals">Referrals</a><a href="{BASE}/privacy/">Privacy</a></nav>
<div class="base"><span><a href="mailto:{H["contact"]["email"]}">{H["contact"]["email"]}</a></span><span>{fix_links(f["referral_html"], home)}</span><span>{nb(f["copyright"])}</span></div>
</div>
</footer>
'''


def tail(extra=''):
    return f'<script src="{BASE}/assets/site.js"></script>\n{extra}</body>\n</html>\n'


LIGHTBOX = '''<dialog class="lb" id="lb" aria-label="Screenshot viewer">
<figure><img decoding="async" id="lbi" alt=""><figcaption><b id="lbt"></b><span id="lbc"></span><span class="lbn" id="lbn"></span><span class="lbl" id="lbl"></span>
<span class="lbnav"><button class="lbp" type="button" aria-label="Previous screenshot">←</button><button class="lbq" type="button" aria-label="Next screenshot">→</button><button class="lbx" type="button" aria-label="Close">✕</button></span></figcaption></figure>
</dialog>
'''


def shot(s, w=1600, h=1000):
    x = f' data-x="{e("|".join(s["extra"]))}"' if s.get('extra') else ''
    return (f'<button class="shot" type="button" data-title="{e(s["cap_title"])}" data-cap="{e(s["cap"])}"{x} aria-label="View larger: {e(s["cap_title"])}">'
            f'<img decoding="async" src="/img/{s["key"]}.webp" width="{w}" height="{h}" alt="{e(s["alt"])}" loading="lazy"><span class="vl" aria-hidden="true">View larger</span></button>')


def peek_strip(sites, n=8):
    """A row of small shopfronts (decorative; the real links are in the street on the homepage)."""
    out = []
    for s in sites[:n]:
        k = s['key']
        aw = '<span class="awning"></span>' if SHOPS[k][2] else ''
        out.append(f'<span class="mini" style="{shop_style(k)}"><span class="mf">{nb(s["name"])}</span>{aw}'
                   f'<span class="mrow"><span class="mw"><img src="{BASE}/assets/peek/{k}.jpg" width="560" height="350" alt="" decoding="async"></span>'
                   f'<span class="door"><span class="sign">Open</span></span></span><span class="mr">No. {int(s["no"])}</span></span>')
    return ''.join(out)


# ------------------------------------------------------------------ home
def home():
    hero, sv, wk, ab, ct = H['hero'], H['services'], H['work'], H['about'], H['contact']
    sites = wk['sites']

    ex0 = hero['examples'][hero['tabs'][0][0]]
    tabs = ''.join(
        f'<button type="button" role="tab" aria-selected="{"true" if i == 0 else "false"}" aria-controls="sheet-panel" data-t="{k}"{"" if i == 0 else " tabindex=\"-1\""}>{nb(v)}</button>'
        for i, (k, v) in enumerate(hero['tabs']))
    rows = ''.join(f'<li><i>{i + 1}</i><span class="k">{nb(r[0])}</span><span class="d">{nb(r[1])}</span><span class="v"><b>Fix:</b> {nb(r[2])}</span></li>' for i, r in enumerate(ex0))
    facts = ''.join(f'<li><b>{nb(a)}</b><span>{nb(b)}</span></li>' for a, b in hero['facts'])
    peek = peek_strip(sites)

    out = [head(H['meta'], 'home'), '<body>\n', strip('home')]
    out.append(f'''<main id="main">
<section class="hero green" id="top" aria-labelledby="hero-title">
<div class="wrap">
<h1 id="hero-title"><span class="ln">{nb(hero["h1"][0])}</span><span class="ln lit">{nb(hero["h1"][1])}</span></h1>
</div>
<div class="hstreet">
<div class="mlpshop" style="--c:#0f3b2d;--t:#f6f0e1">
<p class="kicker" id="industries"><span>{nb(hero["kicker"][0])}</span><span>{nb(hero["kicker"][1])}</span></p>
<div class="mbay">
<div class="mwin">
<p class="lead">{nb(hero["lead"])}</p>
<div class="cta">
<a class="btn lamp go" href="#contact" data-interest="Free assessment">{nb(hero["cta"][0])}</a>
<a class="tlink" href="#services">{nb(hero["cta"][1])}</a>
</div>
<p class="reassure">{nb(hero["reassure"])}</p>
</div>
<span class="door" aria-hidden="true"><span class="sign">Open</span><span class="knob"></span></span>
</div>
</div>
<ul class="decal">{facts}</ul>
<div class="peekrow lights" aria-hidden="true">{peek}</div>
</div>
</section>
<section class="band assess" aria-labelledby="sheet-t">
<div class="wrap">
<div class="as-head">
<h2 id="sheet-t">{nb(hero["sheet_title"])} <small>{nb(hero["sheet_small"])}</small></h2>
<div class="tabs" role="tablist" aria-label="Kind of business" id="tabs">{tabs}</div>
</div>
<div id="sheet-panel" role="tabpanel" aria-live="polite" aria-label="Three example findings"><ol id="sheet-list">{rows}</ol></div>
<p class="nf">{nb(hero["sheet_foot"])}</p>
</div>
</section>
''')

    # services: the price list
    svcs = []
    for i, s in enumerate(sv['items']):
        what = ''.join(f'<p>{fix_links(p, True)}</p>' for p in s['what_html'])
        lis = ''.join(f'<li>{nb(b)}</li>' for b in s['bullets'])
        svcs.append(f'''<article class="svc" id="{s["id"]}">
<div class="svc-top"><h3><i>{nb(s["letter"])}</i> {nb(s["name"])}</h3><span class="dots" aria-hidden="true"></span><p class="price{'' if any(ch.isdigit() for ch in s["price"]) else ' word'}">{nb(s["price"])}</p></div>
<div class="svc-body">
<div><p class="note">{nb(s["price_note"])}</p><a class="btn ink go sm" href="#contact" data-interest="{e(s["interest"])}">{nb(s["cta"])}</a></div>
<div class="what">{what}</div>
<ul>{lis}</ul>
</div>
</article>''')
    also = ''.join(f'<div><b>{nb(a)}</b><p>{nb(b)}</p></div>' for a, b in sv['also'])
    out.append(f'''<section class="band" id="services">
<div class="wrap">
<div class="sh"><div><p class="seclbl">{nb(sv["label"])}</p><h2>{nb(sv["h2"])}</h2></div><p class="lead">{nb(sv["lead"])}</p></div>
<div class="prices">
{chr(10).join(svcs)}
</div>
<div class="also" id="automations">{also}</div>
</div>
</section>
''')

    # work: the street
    shops, dirs = [], []
    for s in sites:
        k = s['key']
        aw = '<span class="awning" aria-hidden="true"></span>' if SHOPS[k][2] else ''
        more = f'<a class="more" href="{s["extra"][1]}" target="_blank" rel="noopener">{nb(s["extra"][0])} ↗</a>' if s['extra'] else ''
        shops.append(f'''<li class="shop" id="shop-{k}">
<a class="front" href="{s["href"]}" target="_blank" rel="noopener" style="{shop_style(k)}">
<span class="fascia"><h3>{nb(s["name"])}</h3></span>{aw}
<span class="bay"><span class="window"><img src="/img/{k}.webp" width="1600" height="1000" alt="" loading="lazy" decoding="async"></span>
<span class="riser">No. {int(s["no"])}</span>
<span class="door"><span class="sign">Open <span aria-hidden="true">↗</span><span class="vh"> (opens in a new tab)</span></span><span class="knob" aria-hidden="true"></span></span></span>
</a>
<div class="curb"><b>{nb(s["trade"])}</b><p>{nb(s["cap"])}</p>{more}</div>
</li>''')
        dirs.append((k, s['no'], s['name']))
    directory = ''.join(f'<li><a href="#shop-{k}" data-shop="shop-{k}"><span>{n}</span>{nb(nm)}</a></li>' for k, n, nm in dirs)
    flows = ''.join(f'<figure>{shot(f)}<figcaption><h4>{nb(f["title"])}</h4><p>{nb(f["text"])}</p></figcaption></figure>' for f in wk['flows'])
    cases = []
    for c in wk['cases']:
        cols = ''.join(f'<div><h5>{nb(x["h"])}</h5>{x["html"]}</div>' for x in c['cols'])
        kv = '<div class="kv">' + ''.join(f'<div><b>{nb(a)}</b><span>{nb(b)}</span></div>' for a, b in c['kv']) + '</div>' if c['kv'] else ''
        n = len(c['shots'])
        gal = ''.join(f'<figure>{shot(s, s["w"], s["h"])}<figcaption>{nb(s["caption"])}</figcaption></figure>' for s in c['shots'])
        demos = ''
        if c['demos']:
            demos = f'<div class="demos"><span>{nb(c["demos_label"])}</span>' + ''.join(f'<a href="{h}" target="_blank" rel="noopener">{nb(t)}</a>' for t, h in c['demos']) + '</div>'
        fine = f'<p class="fine">{nb(c["fine"])}</p>' if c['fine'] else ''
        cases.append(f'''<details class="case" id="{c["id"]}">
<summary><img class="cth" src="/img/{c["shots"][0]["key"]}.webp" width="{c["shots"][0]["w"]}" height="{c["shots"][0]["h"]}" alt="" loading="lazy" decoding="async"><div><span class="tag">{nb(c["tag"])}</span><h4>{nb(c["title"])}</h4></div><p>{nb(c["sum"])}</p><span class="tg" aria-hidden="true"></span></summary>
<div class="case-body">
<div class="cb-grid">{cols}{kv}</div>
<div class="gal {'g1' if n == 1 else 'g3' if n == 3 else ''}">{gal}</div>
{demos}{fine}
</div>
</details>''')
    out.append(f'''<section class="streetband" id="work">
<div class="wrap">
<div class="sh"><div><p class="seclbl">{nb(wk["label"])}</p><h2>{nb(wk["h2"])}</h2></div><p class="lead">{nb(wk["lead"])}</p></div>
</div>
<div class="plaza" id="case-sites">
<nav class="directory" aria-label="Directory of the seventeen sites">
<p class="dh">Directory <small>17 sites</small></p>
<ol>{directory}</ol>
</nav>
<div class="streetwrap">
<div class="arrows"><button type="button" id="pv" aria-label="Back along the street">← Back</button><button type="button" id="nx" aria-label="Further along the street">Further →</button></div>
<ol class="track lights" id="track" aria-label="Seventeen working websites">
{chr(10).join(shops)}
</ol>
</div>
</div>
<div class="walk"><div class="wrap"><p class="note">{nb(wk["note"])}</p></div></div>
</section>
<section class="nightband" id="case-automations" aria-labelledby="flows-t">
<div class="wrap">
<div class="grp"><div><h3 id="flows-t">{nb(wk["flows_head"][0])}</h3></div><p>{nb(wk["flows_head"][1])}</p></div>
<div class="flows">{flows}</div>
</div>
</section>
<section class="casesband" aria-labelledby="cases-t">
<div class="wrap">
<div class="grp cases-head"><h3 id="cases-t">{nb(wk["cases_head"][0])}</h3><p>{nb(wk["cases_head"][1])}</p></div>
<div class="cases">
{chr(10).join(cases)}
</div>
</div>
</section>
''')

    # about
    body = ''.join(f'<p>{nb(p)}</p>' for p in ab['body'])
    out.append(f'''<section class="about" id="about">
<div class="wrap">
<div class="cols">
<figure class="portrait"><img decoding="async" src="/img/myles.webp" width="720" height="1080" alt="Myles Parslow" loading="lazy"><figcaption>{nb(ab["figcaption"])}</figcaption></figure>
<div>
<p class="seclbl">{nb(ab["label"])}</p>
<h2>{nb(ab["h2"])}</h2>
<div class="body">{body}</div>
<blockquote class="quote"><p>{nb(ab["quote"])}</p><footer>{ab["quote_footer_html"]}</footer></blockquote>
</div>
</div>
</div>
</section>
''')

    # contact: the form is the live one, verbatim
    form = ct['form_html'].replace(' class="rv d1"', '').replace('class="btn solid" type="submit" style="justify-self:start"', 'class="btn solid" type="submit" style="justify-self:start"')
    out.append(f'''<section class="counter green" id="contact">
<div class="wrap">
<div>
<p class="seclbl">{nb(ct["label"])}</p>
<h2>{nb(ct["h2"])}</h2>
<p class="avail">{nb(ct["avail"])}</p>
<p class="lead">{fix_links(ct["lead_html"], True)}</p>
<p class="cal"><a class="btn line" href="{ct["cal_href"]}" target="_blank" rel="noopener">{nb(ct["cal_text"])}</a></p>
<div class="direct">
<div class="mailrow"><a class="addr" id="addr" href="mailto:{ct["email"]}">{ct["email"]}</a><button class="btn line sm" type="button" id="copy">Copy</button></div>
<div class="mailrow"><a class="addr" href="{ct["phone_href"]}">{nb(ct["phone_text"])}</a></div>
</div>
</div>
{form}
</div>
</section>
</main>
''')
    out.append(footer('home'))
    out.append(LIGHTBOX)
    ex = json.dumps(hero['examples'], ensure_ascii=False).replace('</', '<\\/')
    hub = '' if PREVIEW else H['hubspot_loader'] + '\n'
    form_js = '<script>\n/* The contact form handler, carried over unchanged from the live site: same fields, same destinations. */\n(function(){\n  ' + ct['form_js'] + '\n})();\n</script>\n'
    out.append(f'<script type="application/json" id="ex-data">{ex}</script>\n')
    out.append(tail(form_js + hub))
    return ''.join(out)


# ------------------------------------------------------------------ inner pages
def pagehead(label, h1, lead):
    plate = f'<p class="seclbl">{nb(label)}</p>' if label else ''
    return f'''<main id="main">
<section class="pagehead green">
<div class="wrap">
{plate}
<h1>{nb(h1)}</h1>
<p class="lead">{nb(lead)}</p>
</div>
</section>
'''


def how():
    d = D['how']
    steps = ''.join(f'<li><i aria-hidden="true">{nb(a)}</i><h3>{nb(b)}</h3><p>{nb(c)}</p></li>' for a, b, c in d['steps'])
    pr = ''.join(f'<div><h3>{nb(a)}</h3><p>{nb(b)}</p></div>' for a, b in d['principles'])
    faq = ''.join(f'<details><summary>{nb(a)}</summary><p>{fix_links(b)}</p></details>' for a, b in d['faq'])
    return ''.join([head(d['meta'], 'how'), '<body>\n', strip('how'), pagehead('', d['h1'], d['lead']), f'''<section class="band" id="how">
<div class="wrap">
<div class="sh"><div><p class="seclbl">{nb(d["steps_label"])}</p><h2>{nb(d["steps_h2"])}</h2></div></div>
<ol class="steps">{steps}</ol>
</div>
</section>
<section class="band green" aria-labelledby="pr-t">
<div class="wrap">
<h2 id="pr-t">{nb(d["principles_h2"])}</h2>
<div class="prows">{pr}</div>
</div>
</section>
<section class="band" id="faq">
<div class="wrap">
<div class="faqw">
<div><p class="seclbl">{nb(d["faq_label"])}</p><h2>{nb(d["faq_h2"])}</h2></div>
<div class="faq">{faq}</div>
</div>
</div>
</section>
<section class="closer green">
<div class="wrap"><h2>{nb(d["cta_h2"])}</h2><p class="avail">{nb(d["cta_avail"])}</p><a class="btn lamp go" href="{BASE}/#contact" data-interest="Free assessment">{nb(d["cta_btn"])}</a></div>
</section>
</main>
''', footer('how'), tail()])


def workflows():
    d = D['workflows']
    rows = ''.join(f'<article class="flowrow"><div class="when">{nb(c["when"])}</div><div><h2>{nb(c["title"])}</h2><p>{nb(c["text"])}</p><p class="rule">{c["rule_html"]}</p></div></article>' for c in d['cards'])
    return ''.join([head(d['meta'], 'workflows'), '<body>\n', strip('workflows'), pagehead(d['eyebrow'], d['h1'], d['lead']), f'''<section class="band">
<div class="wrap">
<div class="flowrows">{rows}</div>
<div class="slab"><h2>{nb(d["note_h2"])}</h2><p>{nb(d["note"])}</p></div>
<p class="pcta"><a class="btn ink go" href="{BASE}/#contact">{nb(d["cta"])}</a></p>
</div>
</section>
</main>
''', footer('workflows'), tail()])


def referrals():
    d = D['referrals']
    rates = ''.join(f'<div><b>{nb(a)}</b><span>{nb(b)}</span></div>' for a, b in d['rates'])
    prose = ''.join(f'<p>{nb(p)}</p>' for p in d['prose'])
    return ''.join([head(d['meta'], 'referrals'), '<body>\n', strip('referrals'), pagehead(d['eyebrow'], d['h1'], d['lead']), f'''<section class="band">
<div class="wrap">
<div class="rates">{rates}</div>
<div class="prose">{prose}</div>
<p class="pcta"><a class="btn ink" href="{d["cta_href"]}">{nb(d["cta"])}</a></p>
</div>
</section>
</main>
''', footer('referrals'), tail()])


def privacy():
    d = D['privacy']
    secs = []
    for a, b in d['sections']:
        # The redesign serves its own font files, so the old Google Fonts sentence would be untrue here.
        b = b.replace('Fonts are loaded from Google Fonts.', 'Fonts are served from this site.')
        secs.append(f'<h2>{nb(a)}</h2><p>{fix_links(b)}</p>')
    return ''.join([head(d['meta'], 'privacy'), '<body>\n', strip('privacy'), pagehead('', d['h1'], d['lead']), f'''<section class="band">
<div class="wrap">
<div class="prose" style="margin-top:0">{''.join(secs)}</div>
</div>
</section>
</main>
''', footer('privacy'), tail()])


def write(rel, text):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(text)
    print('  wrote v2/' + rel, len(text))


if __name__ == '__main__':
    write('index.html', home())
    write('how-it-works/index.html', how())
    write('workflows/index.html', workflows())
    write('referrals/index.html', referrals())
    write('privacy/index.html', privacy())
    os.makedirs(os.path.join(OUT, 'assets', 'fonts'), exist_ok=True)
    for f in ('site.css', 'site.js'):
        shutil.copyfile(os.path.join(HERE, f), os.path.join(OUT, 'assets', f))
    for f in ('Gabarito.ttf', 'Figtree.ttf', 'Gabarito-OFL.txt', 'Figtree-OFL.txt'):
        shutil.copyfile(os.path.join(HERE, 'fonts', f), os.path.join(OUT, 'assets', 'fonts', f))
    os.makedirs(os.path.join(OUT, 'assets', 'peek'), exist_ok=True)
    for f in os.listdir(os.path.join(HERE, 'peek')):
        shutil.copyfile(os.path.join(HERE, 'peek', f), os.path.join(OUT, 'assets', 'peek', f))
    print('base:', repr(BASE), '(preview: noindex, no HubSpot tracker)' if PREVIEW else '(root paths)')
