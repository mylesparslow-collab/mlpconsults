/* MLP Consulting v2, "Shop Row". Source: v2-src/site.js (copied to v2/assets/ by render.py).
   Everything here is progressive: the pages read and work with this file blocked. */
(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  if (!reduce) root.classList.add('anim');

  /* ---- the door sign: Open (light) / After hours (dark); follows the system until flipped ---- */
  var sign = $('sign');
  function isDark() { var t = root.dataset.theme; return t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches); }
  function paintSign() {
    if (!sign) return;
    var d = isDark();
    sign.querySelector('span').textContent = d ? 'After hours' : 'Open';
    sign.setAttribute('aria-label', d ? 'After hours (dark) is on. Switch to open (light).' : 'Open (light) is on. Switch to after hours (dark).');
  }
  paintSign();
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', paintSign); } catch (e) {}
  if (sign) sign.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    function apply() {
      root.dataset.theme = next;
      try { localStorage.setItem('mlp-theme', next); } catch (e) {}
      paintSign();
      relight();
    }
    if (reduce) { apply(); return; }
    sign.classList.remove('flip'); void sign.offsetWidth; sign.classList.add('flip');
    setTimeout(apply, 250);
  });

  /* ---- menu on narrow screens ---- */
  var strip = $('strip'), mb = $('menu');
  function setMenu(o) { strip.classList.toggle('open', o); mb.setAttribute('aria-expanded', o ? 'true' : 'false'); }
  if (mb) {
    mb.addEventListener('click', function () { setMenu(!strip.classList.contains('open')); });
    strip.querySelectorAll('.links a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && strip.classList.contains('open')) { setMenu(false); mb.focus(); } });
  }

  /* ---- in-page jumps move focus as well as the scroll position ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || a.target === '_blank' || a.hasAttribute('data-shop')) return;
    var u; try { u = new URL(a.href); } catch (err) { return; }
    if (u.pathname !== location.pathname || !u.hash) return;
    var t = document.getElementById(decodeURIComponent(u.hash.slice(1)));
    if (!t) return;
    setTimeout(function () {
      if (!t.hasAttribute('tabindex')) { t.setAttribute('tabindex', '-1'); t.style.outline = 'none'; }
      t.focus({ preventScroll: true });
    }, 0);
  });

  /* ---- example assessment: pick a kind of business ---- */
  var exEl = $('ex-data'), sl = $('sheet-list');
  if (exEl && sl) {
    var EX = JSON.parse(exEl.textContent);
    var tabs = [].slice.call(document.querySelectorAll('#tabs button'));
    var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var pick = function (b, focus) {
      tabs.forEach(function (t) { var on = t === b; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
      if (focus) b.focus();
      var html = EX[b.getAttribute('data-t')].map(function (r, i) {
        return '<li><i>' + (i + 1) + '</i><span class="k">' + esc(r[0]) + '</span><span class="d">' + esc(r[1]) + '</span><span class="v"><b>Fix:</b> ' + esc(r[2]) + '</span></li>';
      }).join('');
      if (reduce) { sl.innerHTML = html; return; }
      sl.style.transition = 'opacity .16s'; sl.classList.add('sw');
      setTimeout(function () { sl.innerHTML = html; sl.classList.remove('sw'); }, 170);
    };
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { pick(b); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); pick(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
  }

  /* ---- lights: windows come on one after another, the way a street does ---- */
  var lightGroups = [].slice.call(document.querySelectorAll('.lights'));
  function light(group, delay) {
    var items = [].slice.call(group.children);
    items.forEach(function (el, i) {
      if (reduce) { el.classList.add('lit-on'); return; }
      setTimeout(function () { el.classList.add('lit-on'); }, delay + Math.min(i, 9) * 85);
    });
  }
  function relight() {
    if (reduce) return;
    lightGroups.forEach(function (g) {
      if (!g._seen) return;
      [].forEach.call(g.children, function (el) { el.classList.remove('lit-on'); });
      void g.offsetWidth; light(g, 140);
    });
  }
  if ('IntersectionObserver' in window && !reduce) {
    var lio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target._seen = true; light(e.target, 120); lio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    lightGroups.forEach(function (g) { lio.observe(g); });
  } else lightGroups.forEach(function (g) { g._seen = true; light(g, 0); });

  /* ---- the street: arrows, drag, and the tenant directory ---- */
  var track = $('track');
  if (track) {
    var shops = [].slice.call(track.children), pv = $('pv'), nx = $('nx');
    var dirLinks = [].slice.call(document.querySelectorAll('[data-shop]'));
    var step = function () { return shops[0].getBoundingClientRect().width * 2; };
    var go = function (x) { track.scrollTo({ left: x, behavior: reduce ? 'auto' : 'smooth' }); };
    var sync = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (pv) { pv.disabled = track.scrollLeft <= 2; nx.disabled = track.scrollLeft >= max; }
      var edge = track.getBoundingClientRect().left + (parseFloat(getComputedStyle(track).paddingLeft) || 0), best = 0, bd = 1e9;
      shops.forEach(function (s, i) { var d = Math.abs(s.getBoundingClientRect().left - edge); if (d < bd) { bd = d; best = i; } });
      if (track.scrollLeft >= max) best = shops.length - 1;
      dirLinks.forEach(function (a) { var on = a.getAttribute('data-shop') === shops[best].id; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    };
    if (pv) { pv.addEventListener('click', function () { go(track.scrollLeft - step()); }); nx.addEventListener('click', function () { go(track.scrollLeft + step()); }); }
    var raf = 0; track.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; sync(); }); }, { passive: true });
    addEventListener('resize', sync); sync();
    dirLinks.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var s = document.getElementById(a.getAttribute('data-shop')); if (!s) return;
        e.preventDefault();
        var pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
        go(s.offsetLeft - track.offsetLeft - pad);
        var r = track.getBoundingClientRect();
        if (r.top < 80 || r.bottom > innerHeight) track.scrollIntoView({ block: 'center' });
        /* focus once the street has stopped moving: focusing mid-scroll cancels a smooth scroll */
        var link = s.querySelector('a.front');
        if (link) setTimeout(function () { link.focus({ preventScroll: true }); }, reduce ? 0 : 520);
      });
    });
    /* drag with a mouse; touch and trackpads scroll natively */
    var down = false, sx = 0, sl0 = 0, moved = false;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button) return; down = true; moved = false; sx = e.clientX; sl0 = track.scrollLeft; });
    addEventListener('pointermove', function (e) {
      if (!down) return; var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('drag'); }
      if (moved) track.scrollLeft = sl0 - dx;
    });
    addEventListener('pointerup', function () { if (!down) return; down = false; setTimeout(function () { track.classList.remove('drag'); }, 0); });
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  /* ---- screenshot viewer ---- */
  var lb = $('lb');
  if (lb && lb.showModal) {
    var items = [].slice.call(document.querySelectorAll('button.shot')), cur = 0, opener = null;
    var show = function (i) {
      cur = (i + items.length) % items.length; var el = items[cur];
      var img = $('lbi'); img.src = el.querySelector('img').getAttribute('src'); img.alt = el.getAttribute('data-title') || '';
      $('lbt').textContent = el.getAttribute('data-title') || ''; $('lbc').textContent = el.getAttribute('data-cap') || '';
      $('lbn').textContent = (cur + 1) + ' of ' + items.length;
      var l = $('lbl'); l.textContent = '';
      var x = el.getAttribute('data-x');
      if (x) { var q = x.split('|'), a = document.createElement('a'); a.href = q[1]; a.target = '_blank'; a.rel = 'noopener'; a.textContent = q[0] + ' ↗'; l.appendChild(a); }
    };
    items.forEach(function (el, i) { el.addEventListener('click', function () { opener = el; show(i); if (!lb.open) lb.showModal(); }); });
    lb.querySelector('.lbx').addEventListener('click', function () { lb.close(); });
    lb.querySelector('.lbp').addEventListener('click', function () { show(cur - 1); });
    lb.querySelector('.lbq').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1); });
    lb.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  /* ---- copy the email address ---- */
  var copy = $('copy');
  if (copy) copy.addEventListener('click', function () {
    var b = this, a = $('addr');
    function sel() { var r = document.createRange(); r.selectNodeContents(a); var x = getSelection(); x.removeAllRanges(); x.addRange(r); b.textContent = 'Selected'; }
    try { navigator.clipboard.writeText(a.textContent).then(function () { b.textContent = 'Copied'; }, sel); } catch (e) { sel(); }
  });
})();
