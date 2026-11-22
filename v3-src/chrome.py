"""Shared chrome for the v3 pages (head, fixed header, menu overlay, footer, tail) and the small link helpers.

Standard library only. Pages: 'home', 'how', 'workflows', 'referrals', 'privacy'.
"""
import html, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BASE = '/v3'
D = json.load(open(os.path.join(ROOT, 'v2-src', 'content.json'), encoding='utf-8'))
H = D['home']
e = html.escape
LOGO = H['logo_svg']

MENU = [('Services', '#services'), ('Work', '#work'), ('How it works', BASE + '/how-it-works/'), ('About', '#about'),
        ('Contact', '#contact'), ('Workflows', BASE + '/workflows/'), ('Referrals', BASE + '/referrals/'), ('Privacy', BASE + '/privacy/')]


def link(href):
    """Site pages get the /v3 base; demos, images and outside links are left alone."""
    if href.startswith('#'):
        return href
    if href.startswith('/') and not href.startswith(('/work/', '/img/', '/map/', '/dash/', BASE + '/')):
        return BASE + href
    return href


def fix_links(fragment, home=False):
    def sub(m):
        h = m.group(1)
        if h.startswith('#') and not home:
            h = '/' + h
        return 'href="' + link(h) + '"'
    return re.sub(r'href="([^"]*)"', sub, fragment)


def _pre(page):
    return '' if page == 'home' else BASE + '/'


def _menu_href(h, page):
    return _pre(page) + h if h.startswith('#') else h


def head(meta, page):
    jsonld = f'<script type="application/ld+json">\n{H["jsonld"]}\n</script>\n' if page == 'home' else ''
    og = ''
    if meta.get('og_title'):
        og = (f'<meta property="og:title" content="{e(meta["og_title"])}">\n<meta property="og:description" content="{e(meta["og_description"])}">\n'
              f'<meta property="og:url" content="{meta["canonical"]}">\n<meta property="og:type" content="website">\n'
              '<meta property="og:image" content="https://mlpconsults.com/img/og.png">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
              '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="https://mlpconsults.com/img/og.png">\n')
    imap = json.dumps({'imports': {'three': BASE + '/assets/vendor/three.module.js', 'postprocessing': BASE + '/assets/vendor/postprocessing.js'}})
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex">
{og}<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="48x48" href="/img/logo-12/favicon-48.png">
<link rel="icon" type="image/png" sizes="96x96" href="/img/logo-12/favicon-96.png">
<link rel="icon" type="image/png" sizes="32x32" href="/img/logo-12/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/img/logo-12/icon-192.png">
<link rel="apple-touch-icon" href="/img/logo-12/apple-touch-icon.png">
<title>{e(meta["title"])}</title>
<meta name="description" content="{e(meta["description"])}">
<link rel="canonical" href="{meta["canonical"]}">
{jsonld}<meta name="theme-color" content="#0e0d0c">
<link rel="preload" href="{BASE}/assets/fonts/FunnelDisplay.ttf" as="font" type="font/ttf" crossorigin>
<link rel="preload" href="{BASE}/assets/fonts/FunnelSans.ttf" as="font" type="font/ttf" crossorigin>
<script type="importmap">{imap}</script>
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="{BASE}/assets/site.css">
</head>
'''


CHAPTERS = ['Welcome', 'Free assessment', 'Services', 'Work', 'Automations', 'Larger systems', 'Contact']


def header(page):
    home = page == 'home'
    pre = _pre(page)
    nojs = ''.join(f'<a href="{_menu_href(h, page)}">{e(t)}</a>' for t, h in MENU)
    counter = ''
    if home:
        counter = f'<div class="counter" id="counter" aria-hidden="true"><span id="cn">01 / 07</span> <span class="dot">·</span> <span id="cl">{CHAPTERS[0]}</span></div>\n'
    return f'''<a class="skip" href="#main">Skip to content</a>
<canvas id="scene" aria-hidden="true"></canvas>
<header class="chrome">
<a class="mark" href="{'#top' if home else BASE + '/'}" aria-label="MLP Consulting, home">{LOGO}<b>Consulting</b></a>
<div class="acts">
<a class="btn go" href="{pre}#contact" data-interest="Free assessment"><span class="cta-l">Get a free assessment</span><span class="cta-s">Free assessment</span></a>
<button class="menu-btn" type="button" id="menu-btn" aria-expanded="false" aria-controls="menu">Menu</button>
</div>
<noscript><nav class="nojs-nav" aria-label="Main">{nojs}</nav></noscript>
</header>
{counter}'''


def menu_overlay(page):
    items = ''.join(f'<li><a href="{_menu_href(h, page)}"><i aria-hidden="true">{i + 1:02d}</i><span>{e(t)}</span></a></li>' for i, (t, h) in enumerate(MENU))
    return f'''<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" hidden>
<div class="menu-top"><a class="mark" href="{'#top' if page == 'home' else BASE + '/'}" aria-label="MLP Consulting, home">{LOGO}<b>Consulting</b></a><button class="menu-x" type="button" id="menu-x">Close</button></div>
<nav aria-label="Menu"><ol>{items}</ol></nav>
</div>
'''


def footer(page):
    home = page == 'home'
    f = H['footer']
    rid = ' id="referrals"'
    links = ''.join(f'<a href="{_menu_href(h, page)}"{rid if t == "Referrals" else ""}>{e(t)}</a>' for t, h in MENU)
    return f'''<footer class="foot">
<div class="foot-in">
<div>
<a class="mark" href="{'#top' if home else BASE + '/'}" aria-label="MLP Consulting, home">{LOGO}<b>Consulting</b></a>
<p>{e(f["blurb"])}</p>
</div>
<nav aria-label="Footer">{links}</nav>
<div class="base"><span><a href="mailto:{H["contact"]["email"]}">{H["contact"]["email"]}</a></span><span>{fix_links(f["referral_html"], home)}</span><span>{e(f["copyright"])}</span></div>
</div>
</footer>
'''


def tail(extra=''):
    return f'<script src="{BASE}/assets/site.js"></script>\n{extra}</body>\n</html>\n'
