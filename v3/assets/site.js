/* MLP Consulting v3. Plain JS, no libraries. Scroll drives progress (0..6) and the night-to-morning custom properties. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = false;
  try { reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };
  var isHome = !!$('#top.ch');
  var chapters = $$('main > .ch');

  /* ---------- chapter text fades in once (never with reduced motion) ---------- */
  if (!reduced && 'IntersectionObserver' in window && chapters.length) {
    root.classList.add('fx');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('main > .ch > .col').forEach(function (c) { io.observe(c); });
  }

  /* ---------- menu overlay ---------- */
  var menu = $('#menu'), mbtn = $('#menu-btn'), mx = $('#menu-x');
  function menuOpen() { return menu && !menu.hidden; }
  function openMenu() {
    if (!menu) return;
    menu.hidden = false; mbtn.setAttribute('aria-expanded', 'true'); root.classList.add('menu-open');
    var f = $('nav a', menu); if (f) f.focus();
  }
  function closeMenu(restore) {
    if (!menuOpen()) return;
    menu.hidden = true; mbtn.setAttribute('aria-expanded', 'false'); root.classList.remove('menu-open');
    if (restore !== false) mbtn.focus();
  }
  if (menu && mbtn) {
    mbtn.addEventListener('click', function () { menuOpen() ? closeMenu() : openMenu(); });
    mx.addEventListener('click', function () { closeMenu(); });
    menu.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); closeMenu(); return; }
      if (ev.key !== 'Tab') return;
      var f = $$('a[href],button', menu).filter(function (x) { return !x.hidden; });
      var first = f[0], last = f[f.length - 1];
      if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { closeMenu(false); }); });
  }

  /* ---------- in-page links: instant jump, then focus the target; case hashes open their <details> ---------- */
  function reveal(id) {
    var t = id && document.getElementById(id);
    if (!t) return null;
    if (t.tagName === 'DETAILS') t.open = true;
    return t;
  }
  function focusTarget(t) {
    if (!t) return;
    if (!t.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(t.tagName)) t.setAttribute('tabindex', '-1');
    try { t.focus({ preventScroll: true }); } catch (e) {}
  }
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!a || ev.defaultPrevented || ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    var t = id ? reveal(id) : document.body;
    if (!t) return;
    if (menuOpen()) closeMenu(false);
    if (!id) return;
    ev.preventDefault();
    history.pushState(null, '', '#' + id);
    t.scrollIntoView({ block: 'start', behavior: 'instant' });
    focusTarget(t);
    schedule();
  });
  window.addEventListener('hashchange', function () {
    var t = reveal(decodeURIComponent(location.hash.slice(1)));
    if (t) { t.scrollIntoView({ block: 'start', behavior: 'instant' }); schedule(); }
  });
  if (location.hash.length > 1) {
    var h0 = reveal(decodeURIComponent(location.hash.slice(1)));
    if (h0) requestAnimationFrame(function () { h0.scrollIntoView({ block: 'start', behavior: 'instant' }); });
  }

  /* ---------- assessment tabs ---------- */
  var tabs = $('#tabs'), exEl = $('#ex-data');
  if (tabs && exEl) {
    var ex = {};
    try { ex = JSON.parse(exEl.textContent); } catch (e) {}
    var tb = $$('[role=tab]', tabs), list = $('#sheet-list'), panel = $('#sheet-panel');
    var show = function (b, focus) {
      var rows = ex[b.getAttribute('data-t')];
      if (!rows) return;
      tb.forEach(function (x) { var on = x === b; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; });
      panel.setAttribute('aria-labelledby', b.id);
      list.textContent = '';
      rows.forEach(function (r, i) {
        var li = document.createElement('li'), n = document.createElement('i'), k = document.createElement('span'), d = document.createElement('span'), v = document.createElement('span'), fb = document.createElement('b');
        n.textContent = i + 1; k.className = 'k'; k.textContent = r[0]; d.className = 'd'; d.textContent = r[1];
        v.className = 'v'; fb.textContent = 'Fix:'; v.appendChild(fb); v.appendChild(document.createTextNode(' ' + r[2]));
        li.appendChild(n); li.appendChild(k); li.appendChild(d); li.appendChild(v); list.appendChild(li);
      });
      if (focus) b.focus();
    };
    tb.forEach(function (b, i) {
      b.addEventListener('click', function () { show(b); });
      b.addEventListener('keydown', function (ev) {
        var j = -1;
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowDown') j = (i + 1) % tb.length;
        else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp') j = (i + tb.length - 1) % tb.length;
        else if (ev.key === 'Home') j = 0;
        else if (ev.key === 'End') j = tb.length - 1;
        if (j < 0) return;
        ev.preventDefault(); show(tb[j], true);
      });
    });
  }

  /* ---------- copy the email address ---------- */
  var copy = $('#copy'), addr = $('#addr');
  if (copy && addr) {
    copy.addEventListener('click', function () {
      var txt = addr.textContent.trim(), done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy'; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done, function () {}); return; }
      var r = document.createRange(); r.selectNodeContents(addr); var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      try { document.execCommand('copy'); done(); } catch (e) {}
    });
  }

  /* ---------- screenshot viewer ---------- */
  var lb = $('#lb');
  if (lb && lb.showModal) {
    var cur = null, grp = [], idx = 0;
    var lbi = $('#lbi'), lbt = $('#lbt'), lbc = $('#lbc'), lbn = $('#lbn'), lbl = $('#lbl'), pv = $('.lbp', lb), nx = $('.lbq', lb);
    var fill = function () {
      var b = grp[idx], im = $('img', b), x = b.getAttribute('data-x');
      lbi.src = im.currentSrc || im.src; lbi.alt = im.alt;
      lbt.textContent = b.getAttribute('data-title') || ''; lbc.textContent = b.getAttribute('data-cap') || '';
      if (x) { var p = x.split('|'); lbl.textContent = p[0] + ' ↗'; lbl.href = p[1]; lbl.hidden = false; } else { lbl.hidden = true; }
      lbn.textContent = (idx + 1) + ' of ' + grp.length;
      pv.disabled = idx === 0; nx.disabled = idx === grp.length - 1;
    };
    var step = function (d) { var j = idx + d; if (j < 0 || j >= grp.length) return; idx = j; fill(); };
    $$('.shot').forEach(function (b) {
      b.addEventListener('click', function () {
        var g = b.closest('[data-grp]'); grp = g ? $$('.shot', g) : [b]; idx = grp.indexOf(b); cur = b; fill(); lb.showModal();
      });
    });
    pv.addEventListener('click', function () { step(-1); });
    nx.addEventListener('click', function () { step(1); });
    $('.lbx', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (ev) { if (ev.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (ev) { if (ev.key === 'ArrowLeft') step(-1); else if (ev.key === 'ArrowRight') step(1); });
    lb.addEventListener('close', function () { if (cur) cur.focus(); });
  }

  if (!isHome) return;

  /* ---------- homepage: progress, scene, work index ---------- */
  var names = ['Welcome', 'Free assessment', 'Services', 'Work', 'Automations', 'Larger systems', 'Contact'];
  var cn = $('#cn'), cl = $('#cl');
  var scene = null, p = 0, tgt = 0, last = -1, raf = 0, tPrev = 0, chap = -1;

  function target() {
    var H = innerHeight, y = scrollY, s = 0;
    for (var k = 1; k < chapters.length; k++) {
      var top = chapters[k].getBoundingClientRect().top + y;
      s += clamp((y + 0.8 * H - top) / (0.6 * H), 0, 1);
    }
    return s;
  }
  function chapterNow() {
    var H = innerHeight, c = 0;
    for (var k = 0; k < chapters.length; k++) if (chapters[k].getBoundingClientRect().top <= 0.55 * H) c = k;
    return c;
  }
  function apply(force) {
    if (force || Math.abs(p - last) > 1e-4) {
      last = p;
      root.style.setProperty('--p', p.toFixed(3));
      root.style.setProperty('--light', clamp((p - 5.3) / 0.7, 0, 1).toFixed(3));
      if (scene) { try { scene.setProgress(p); } catch (e) {} }
    }
    var c = chapterNow();
    if (c !== chap && cn) { chap = c; cn.textContent = ('0' + (c + 1)).slice(-2) + ' / 07'; cl.textContent = names[c]; }
  }
  function tick(now) {
    raf = 0;
    tgt = target();
    var dt = tPrev ? Math.min(0.1, (now - tPrev) / 1000) : 0.016;
    tPrev = now;
    if (reduced) p = tgt;
    else { p += (tgt - p) * (1 - Math.exp(-dt * 9)); if (Math.abs(tgt - p) < 0.0005) p = tgt; }
    apply(false);
    if (p !== tgt) raf = requestAnimationFrame(tick); else tPrev = 0;
  }
  function schedule() { if (isHome && !raf) raf = requestAnimationFrame(tick); }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', function () { if (scene) { try { scene.resize(); } catch (e) {} } schedule(); });
  p = tgt = target(); apply(true);
  window.addEventListener('load', function () { p = tgt = target(); apply(true); });

  /* work index: rows highlight their site in the scene and vice versa */
  var rows = $$('#case-sites li'), activeLi = null;
  function setActive(li) {
    if (activeLi === li) return;
    if (activeLi) activeLi.classList.remove('on');
    activeLi = li; if (li) li.classList.add('on');
  }
  rows.forEach(function (li) {
    var k = li.getAttribute('data-key');
    var on = function () { setActive(li); if (scene) { try { scene.highlightSite(k); } catch (e) {} } };
    li.addEventListener('mouseenter', on);
    li.addEventListener('focusin', on);
    li.addEventListener('mouseleave', function () { if (scene) { try { scene.highlightSite(null); } catch (e) {} } });
  });
  if (rows[0]) setActive(rows[0]);
  var wrap = $('#case-sites');
  if (wrap) wrap.addEventListener('focusout', function (ev) { if (!wrap.contains(ev.relatedTarget) && scene) { try { scene.highlightSite(null); } catch (e) {} } });

  /* scene (optional): the page is complete without it */
  var canvas = $('#scene');
  function noGl() { root.classList.add('no-gl'); window.__scene = null; }
  if (/[?&]scene=off\b/.test(location.search) || !canvas) { noGl(); return; }
  (async function () {
    try {
      var mod = await import('/v3/assets/scene.js');
      var sites = rows.map(function (li) {
        var k = li.getAttribute('data-key'), a = $('a.row', li);
        return { key: k, name: $('.nm', li).textContent, href: a.getAttribute('href'), img: '/v3/assets/sites/' + k + '.jpg' };
      });
      var slips = ['A call at 5:40 rings out', 'A quote goes out', 'Nobody checks back', 'An invoice passes its due date', 'A job or visit is finished', 'A call goes unanswered', 'Monday morning', 'Requests for the back room', 'A missed appointment', 'No-shows', 'New inquiry', 'Quote follow-up, day 2', 'Payment reminder', 'Review request', 'Missed-call text back', 'Weekly owner summary'];
      scene = await mod.createScene(canvas, { sites: sites, slips: slips, reducedMotion: reduced });
    } catch (e) { scene = null; }
    if (!scene) { noGl(); return; }
    window.__scene = scene;
    try {
      scene.on('sitehover', function (k) { if (!k) return; var li = rows.filter(function (x) { return x.getAttribute('data-key') === k; })[0]; if (li) setActive(li); });
      scene.on('siteclick', function (k) { var li = rows.filter(function (x) { return x.getAttribute('data-key') === k; })[0]; if (li) window.open($('a.row', li).href, '_blank', 'noopener'); });
      scene.resize();
    } catch (e) {}
    apply(true);
  })();
})();
