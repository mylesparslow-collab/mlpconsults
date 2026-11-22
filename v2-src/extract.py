#!/usr/bin/env python3
"""Extract the live mlpconsults.com pages into v2-src/content.json.

Reads the frozen copies in v2-src/source/ (made on first run from the live files at the
repo root), so the redesign always renders the same content the live site had.
Standard library only. Re-runnable. Asserts counts so a markup change cannot slip through.
"""
import json, os, re, shutil, html

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(HERE, 'source')
PAGES = {'home': 'index.html', 'how': 'how-it-works/index.html', 'workflows': 'workflows/index.html',
         'referrals': 'referrals/index.html', 'privacy': 'privacy/index.html'}


def freeze():
    for rel in PAGES.values():
        dst = os.path.join(SRC, rel)
        if not os.path.exists(dst):
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(os.path.join(ROOT, rel), dst)


def read(key):
    return open(os.path.join(SRC, PAGES[key]), encoding='utf-8').read()


def one(pat, s, flags=re.S):
    m = re.search(pat, s, flags)
    if not m:
        raise SystemExit('extract: pattern not found: ' + pat[:80])
    return m.group(1).strip()


def inner(s):
    """Collapse whitespace inside an HTML fragment."""
    return re.sub(r'\s+', ' ', s).strip()


def strip_svg(s):
    return re.sub(r'\s*<svg.*?</svg>', '', s, flags=re.S)


def text(s):
    return inner(html.unescape(re.sub(r'<[^>]+>', '', s)))


def meta(s):
    return {
        'title': html.unescape(one(r'<title>(.*?)</title>', s)),
        'description': html.unescape(one(r'<meta name="description" content="(.*?)">', s)),
        'canonical': one(r'<link rel="canonical" href="(.*?)">', s),
        'og_title': html.unescape((re.search(r'<meta property="og:title" content="(.*?)">', s) or [None, ''])[1]),
        'og_description': html.unescape((re.search(r'<meta property="og:description" content="(.*?)">', s) or [None, ''])[1]),
    }


def js_object(s, name):
    """Pull `var NAME={...};` out of the page script and turn it into Python data."""
    i = s.index('var ' + name + '={')
    j = i + len('var ' + name + '=')
    depth, k, q = 0, j, None
    while True:
        c = s[k]
        if q:
            if c == '\\':
                k += 1
            elif c == q:
                q = None
        elif c in '\'"':
            q = c
        elif c in '{[':
            depth += 1
        elif c in '}]':
            depth -= 1
            if depth == 0:
                break
        k += 1
    src = s[j:k + 1]
    # JS single-quoted strings -> JSON
    out, k, n = [], 0, len(src)
    while k < n:
        c = src[k]
        if c == "'":
            k += 1
            buf = []
            while src[k] != "'":
                if src[k] == '\\':
                    k += 1
                buf.append(src[k])
                k += 1
            out.append(json.dumps(''.join(buf), ensure_ascii=False))
        else:
            out.append(c)
        k += 1
    src = ''.join(out)
    src = re.sub(r'([{,]\s*)([A-Za-z_][\w-]*)\s*:', r'\1"\2":', src)
    return json.loads(src)


def home():
    s = read('home')
    d = {'meta': meta(s)}
    d['jsonld'] = one(r'<script type="application/ld\+json">(.*?)</script>', s)
    d['logo_svg'] = one(r'(<svg class="logo12".*?</svg>)', s)
    hero = one(r'<section class="hero".*?>(.*?)</section>', s)
    d['hero'] = {
        'kicker': [text(x) for x in re.findall(r'<span>(.*?)</span>', one(r'<p class="kicker"[^>]*>(.*?)</p>', hero))],
        'h1': [text(x) for x in re.findall(r'<span class="ln">(.*?)</span></span>', one(r'<h1[^>]*>(.*?)</h1>', hero))],
        'lead': text(one(r'<p class="lead">(.*?)</p>', hero)),
        'cta': [text(strip_svg(x)) for x in re.findall(r'<a class="btn[^>]*>(.*?)</a>', one(r'<div class="cta">(.*?)</div>', hero))],
        'reassure': text(one(r'<p class="reassure">(.*?)</p>', hero)),
        'sheet_title': text(one(r'<b id="sheet-t">(.*?)<small>', hero)),
        'sheet_small': text(one(r'<b id="sheet-t">.*?<small>(.*?)</small>', hero)),
        'tabs': [[k, text(v)] for k, v in re.findall(r'data-t="(\w+)"[^>]*>(.*?)</button>', hero)],
        'sheet_foot': text(one(r'<div class="sh-foot">(.*?)</div>', hero)),
        'facts': [[text(a), text(b)] for a, b in re.findall(r'<div><b>(.*?)</b><span>(.*?)</span></div>', one(r'<div class="facts">(.*?)</div>\s*</div>\s*$', hero))],
    }
    d['hero']['examples'] = js_object(s, 'EX')
    assert len(d['hero']['tabs']) == 4 and len(d['hero']['examples']) == 4 and len(d['hero']['facts']) == 3

    sv = one(r'<section id="services">(.*?)</section>', s)
    d['services'] = {
        'label': text(one(r'<p class="idx rv"><i>\d+</i>(.*?)</p>', sv)),
        'h2': text(one(r'<h2[^>]*>(.*?)</h2>', sv)),
        'lead': text(one(r'<p class="lead[^>]*>(.*?)</p>', sv)),
        'items': [], 'also': [],
    }
    for art in re.findall(r'<article class="svc rv" id="([\w-]+)">(.*?)</article>', sv, re.S):
        aid, a = art
        d['services']['items'].append({
            'id': aid,
            'letter': text(one(r'<h3><i>(.*?)</i>', a)),
            'name': text(one(r'<h3><i>.*?</i>(.*?)</h3>', a)),
            'price': text(one(r'<p class="price">(.*?)<small>', a)),
            'price_note': text(one(r'<p class="price">.*?<small>(.*?)</small>', a)),
            'cta': text(strip_svg(one(r'<a class="btn[^>]*>(.*?)</a>', a))),
            'interest': html.unescape(one(r'data-interest="(.*?)"', a)),
            'what_html': [inner(x) for x in re.findall(r'<p>(.*?)</p>', one(r'<div class="what">(.*?)</div>', a), re.S)],
            'bullets': [text(x) for x in re.findall(r'<li>(.*?)</li>', a, re.S)],
        })
    for b, p in re.findall(r'<div><b>(.*?)</b><p>(.*?)</p></div>', one(r'<div class="also rv" id="automations">(.*?)</div>\s*</div>\s*$', sv), re.S):
        d['services']['also'].append([text(b), text(p)])
    assert len(d['services']['items']) == 3 and len(d['services']['also']) == 3

    wk = one(r'<section id="work" class="mist">(.*?)</section>', s)
    cap = js_object(s, 'CAP')
    d['captions'] = cap
    d['work'] = {
        'label': text(one(r'<p class="idx rv"><i>\d+</i>(.*?)</p>', wk)),
        'h2': text(one(r'<h2[^>]*>(.*?)</h2>', wk)),
        'lead': text(one(r'<p class="lead[^>]*>(.*?)</p>', wk)),
        'note': text(one(r'<p class="fine note">(.*?)</p>', wk)),
        'sites': [], 'flows': [], 'cases': [],
    }
    for a in re.findall(r'<a class="row" (.*?)</a>', wk, re.S):
        k = one(r'data-k="(.*?)"', a)
        x = re.search(r'data-x="(.*?)"', a)
        d['work']['sites'].append({
            'no': text(one(r'<span class="n">(.*?)</span>', a)), 'name': text(one(r'<span class="nm">(.*?)</span>', a)),
            'trade': text(one(r'<span class="tr">(.*?)</span>', a)), 'href': one(r'href="(.*?)"', a), 'key': k,
            'extra': html.unescape(x.group(1)).split('|') if x else None,
            'cap_title': cap[k][0], 'cap': cap[k][1],
        })
    assert len(d['work']['sites']) == 17
    grp = re.findall(r'<div class="grp rv"[^>]*>\s*<h3>(.*?)</h3>\s*<p>(.*?)</p>', wk, re.S)
    d['work']['flows_head'] = [text(grp[0][0]), text(grp[0][1])]
    d['work']['cases_head'] = [text(grp[1][0]), text(grp[1][1])]
    for f in re.findall(r'<figure class="rv[^"]*"><button class="shot" type="button" data-k="(.*?)"><img[^>]*alt="(.*?)"[^>]*></button><figcaption><h4>(.*?)</h4><p>(.*?)</p></figcaption></figure>', one(r'<div class="flows">(.*?)</div>\s*<div class="grp', wk)):
        k = f[0]
        d['work']['flows'].append({'key': k, 'alt': html.unescape(f[1]), 'title': text(f[2]), 'text': text(f[3]), 'cap_title': cap[k][0], 'cap': cap[k][1]})
    assert len(d['work']['flows']) == 6
    for cid, c in re.findall(r'<details class="case" id="([\w-]+)">(.*?)</details>', wk, re.S):
        summ = one(r'<summary>(.*?)</summary>', c)
        body = one(r'<div class="case-body">(.*)</div>\s*$', c)
        cols = []
        grid = one(r'<div class="cb-grid">(.*?)</div>\s*<div class="gal', body)
        kv = re.search(r'<div class="kv">(.*?)</div>\s*$', grid, re.S)
        if kv:
            grid = grid[:kv.start()]
        for h5, rest in re.findall(r'<div><h5>(.*?)</h5>(.*?)</div>', grid, re.S):
            cols.append({'h': text(h5), 'html': inner(rest)})
        shots = []
        for fig in re.findall(r'<figure>(.*?)</figure>', body, re.S):
            k = one(r'data-k="(.*?)"', fig)
            x = re.search(r'data-x="(.*?)"', fig)
            shots.append({'key': k, 'alt': html.unescape(one(r'alt="(.*?)"', fig)), 'w': int(one(r'width="(\d+)"', fig)), 'h': int(one(r'height="(\d+)"', fig)),
                          'caption': text(one(r'<figcaption>(.*?)</figcaption>', fig)), 'extra': html.unescape(x.group(1)).split('|') if x else None,
                          'cap_title': cap[k][0], 'cap': cap[k][1]})
        demos = re.search(r'<div class="demos">(.*?)</div>', body, re.S)
        fine = re.search(r'<p class="fine">(.*?)</p>', body, re.S)
        d['work']['cases'].append({
            'id': cid, 'tag': text(one(r'<span class="tag">(.*?)</span>', summ)), 'title': text(one(r'<h4>(.*?)</h4>', summ)),
            'sum': text(one(r'</div>\s*<p>(.*?)</p>', summ)), 'cols': cols,
            'kv': [[text(a), text(b)] for a, b in re.findall(r'<div><b>(.*?)</b><span>(.*?)</span></div>', kv.group(1))] if kv else [],
            'shots': shots,
            'demos_label': text(one(r'<span>(.*?)</span>', demos.group(1))) if demos else '',
            'demos': [[text(t), h] for h, t in re.findall(r'<a[^>]*href="(.*?)"[^>]*>(.*?)</a>', demos.group(1))] if demos else [],
            'fine': text(fine.group(1)) if fine else '',
        })
    assert len(d['work']['cases']) == 3 and [len(c['cols']) for c in d['work']['cases']] == [3, 3, 3], [len(c['cols']) for c in d['work']['cases']]
    assert [len(c['shots']) for c in d['work']['cases']] == [4, 3, 1]

    ab = one(r'<section class="about" id="about">(.*?)</section>', s)
    d['about'] = {
        'label': text(one(r'<p class="idx rv"><i>\d+</i>(.*?)</p>', ab)),
        'h2': text(one(r'<h2>(.*?)</h2>', ab)),
        'figcaption': text(one(r'<figcaption>(.*?)</figcaption>', ab)),
        'body': [text(x) for x in re.findall(r'<p>(.*?)</p>', one(r'<div class="body">(.*?)</div>', ab), re.S)],
        'quote': text(one(r'<blockquote class="quote">\s*<p>(.*?)</p>', ab)),
        'quote_footer_html': inner(one(r'<footer>(.*?)</footer>', ab)),
    }
    assert len(d['about']['body']) == 3

    ct = one(r'<section class="cta-band" id="contact">(.*?)</section>', s)
    d['contact'] = {
        'label': text(one(r'<p class="idx"><i>\d+</i>(.*?)</p>', ct)),
        'h2': text(one(r'<h2>(.*?)</h2>', ct)),
        'avail': text(one(r'<p class="avail">(.*?)</p>', ct)),
        'lead_html': inner(one(r'<p class="lead">(.*?)</p>', ct)),
        'cal_text': text(one(r'<a class="btn line" href="https://cal\.com[^>]*>(.*?)</a>', ct)),
        'cal_href': one(r'<a class="btn line" href="(https://cal\.com.*?)"', ct),
        'email': one(r'href="mailto:(.*?)"', ct),
        'phone_text': text(one(r'<a class="addr" href="tel:[^>]*>(.*?)</a>', ct)),
        'phone_href': one(r'href="(tel:.*?)"', ct),
        # the form is carried over verbatim: same ids, names, options and order
        'form_html': one(r'(<form id="intake".*?</form>)', ct),
    }
    assert d['contact']['form_html'].count('<select') == 2 and 'name="budget"' in d['contact']['form_html'] and 'name="timing"' in d['contact']['form_html']
    # the submit handler, verbatim from the live page (same destinations and field mapping)
    js = one(r'<script>\s*(\(function\(\)\{\s*var reduce.*?)</script>', s)
    a = js.index('/* ---- offer buttons preselect')
    b = js.index("document.getElementById('copy').addEventListener")
    d['contact']['form_js'] = js[a:b].rstrip()
    assert 'api.web3forms.com/submit' in d['contact']['form_js'] and 'api.hsforms.com' in d['contact']['form_js'] and 'supabase.co/rest/v1/leads' in d['contact']['form_js']
    d['hubspot_loader'] = one(r'(<script type="text/javascript" id="hs-script-loader".*?</script>)', s)

    ft = one(r'<footer class="site">(.*?)</footer>', s)
    d['footer'] = {
        'blurb': text(one(r'<p>(.*?)</p>', ft)),
        'referral_html': inner(one(r'<div class="base"><span>(.*?)</span>', ft)),
        'copyright': text(one(r'<div class="base"><span>.*?</span><span>(.*?)</span>', ft)),
    }
    return d


def how():
    s = read('how')
    m = one(r'<main id="top">(.*?)</main>', s)
    d = {'meta': meta(s)}
    d['h1'] = text(one(r'<h1>(.*?)</h1>', m))
    d['lead'] = text(one(r'<p class="lead">(.*?)</p>', m))
    st = one(r'<section id="how">(.*?)</section>', m)
    d['steps_label'] = text(one(r'<p class="idx rv"><i>\d+</i>(.*?)</p>', st))
    d['steps_h2'] = text(one(r'<h2[^>]*>(.*?)</h2>', st))
    d['steps'] = [[text(a), text(b), text(c)] for a, b, c in re.findall(r'<li[^>]*><i[^>]*>(.*?)</i><h3>(.*?)</h3><p>(.*?)</p></li>', st, re.S)]
    pr = one(r'<section class="inv"[^>]*>(.*?)</section>', m)
    d['principles_h2'] = text(one(r'<h2[^>]*>(.*?)</h2>', pr))
    d['principles'] = [[text(a), text(b)] for a, b in re.findall(r'<h3>(.*?)</h3><p>(.*?)</p>', pr, re.S)]
    fq = one(r'<section id="faq"[^>]*>(.*?)</section>', m)
    d['faq_label'] = text(one(r'<p class="idx"><i>\d+</i>(.*?)</p>', fq))
    d['faq_h2'] = text(one(r'<h2>(.*?)</h2>', fq))
    d['faq'] = [[text(a), inner(b)] for a, b in re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>', fq, re.S)]
    c = one(r'<section class="sub-cta">(.*?)</section>', m)
    d['cta_h2'] = text(one(r'<h2>(.*?)</h2>', c))
    d['cta_avail'] = text(one(r'<p class="avail">(.*?)</p>', c))
    d['cta_btn'] = text(one(r'<a class="btn[^>]*>(.*?)</a>', c))
    assert len(d['steps']) == 3 and len(d['principles']) == 3 and len(d['faq']) == 5
    return d


def workflows():
    s = read('workflows')
    m = one(r'<main>(.*?)</main>', s)
    d = {'meta': meta(s)}
    d['eyebrow'] = text(one(r'<div class="eyebrow">(.*?)</div>', m))
    d['h1'] = text(one(r'<h1>(.*?)</h1>', m))
    d['lead'] = text(one(r'<p class="lead">(.*?)</p>', m))
    d['cards'] = [{'when': text(a), 'title': text(b), 'text': text(c), 'rule_html': inner(e)} for a, b, c, e in
                  re.findall(r'<article class="card"><div class="when">(.*?)</div><h2>(.*?)</h2><p>(.*?)</p><p class="rule">(.*?)</p></article>', m, re.S)]
    d['note_h2'] = text(one(r'<div class="note"><h2>(.*?)</h2>', m))
    d['note'] = text(one(r'<div class="note"><h2>.*?</h2><p>(.*?)</p>', m))
    d['cta'] = text(one(r'<p class="cta"><a[^>]*>(.*?)</a>', m))
    assert len(d['cards']) == 6
    return d


def referrals():
    s = read('referrals')
    m = one(r'<main>(.*?)</main>', s)
    d = {'meta': meta(s)}
    d['eyebrow'] = text(one(r'<div class="eyebrow">(.*?)</div>', m))
    d['h1'] = text(one(r'<h1>(.*?)</h1>', m))
    d['lead'] = text(one(r'<p class="lead">(.*?)</p>', m))
    d['rates'] = [[text(a), text(b)] for a, b in re.findall(r'<div><b>(.*?)</b><span>(.*?)</span></div>', one(r'<div class="rates">(.*?)</div>\s*<div class="prose">', m))]
    d['prose'] = [text(x) for x in re.findall(r'<p>(.*?)</p>', one(r'<div class="prose">(.*?)</div>', m), re.S)]
    d['cta'] = text(one(r'<p class="cta"><a[^>]*>(.*?)</a>', m))
    d['cta_href'] = one(r'<p class="cta"><a class="btn" href="(.*?)"', m)
    assert len(d['rates']) == 2 and len(d['prose']) == 2
    return d


def privacy():
    s = read('privacy')
    m = one(r'<main>(.*?)</main>', s)
    d = {'meta': meta(s)}
    d['eyebrow'] = text(one(r'<div class="eyebrow">(.*?)</div>', m))
    d['h1'] = text(one(r'<h1>(.*?)</h1>', m))
    d['lead'] = text(one(r'<p class="lead">(.*?)</p>', m))
    d['sections'] = [[text(a), inner(b)] for a, b in re.findall(r'<h2>(.*?)</h2><p>(.*?)</p>', one(r'<div class="prose">(.*?)</div>', m), re.S)]
    assert len(d['sections']) == 5
    return d


if __name__ == '__main__':
    freeze()
    data = {'home': home(), 'how': how(), 'workflows': workflows(), 'referrals': referrals(), 'privacy': privacy()}
    out = os.path.join(HERE, 'content.json')
    json.dump(data, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('wrote', out, os.path.getsize(out), 'bytes')
