(() => {
  'use strict';

  // ---- client settings: everything specific to one contractor lives here ---------------------
  // Override any of it before this script loads: window.PP_CONFIG = { businessName: '...', accent: '#0a7' }
  const CONFIG = Object.assign({
    brandName: 'Permit Postcards',
    logoText: 'PP',
    businessName: 'Westside Stone & Surface',   // printed on the postcard
    phone: '(310) 555-0142',                    // printed on the postcard
    url: 'yourshop.example',                    // printed on the postcard
    defaultTrade: 'countertops',
    defaultPlace: null,                         // a preset id (e.g. 'anaheim'); null = first place with data
    radiusMiles: 10,
    accent: null                                // CSS colour; overrides the accent in both themes when set
  }, window.PP_CONFIG || {});

  // ---- copy templates (short, plain, no hype) --------------------------------
  const COPY = {
    kitchen:    { head: 'Your kitchen permit just came through.',      offer: 'Free measure and a written quote on your {trade}, before the work gets far along.' },
    bath:       { head: 'Your bathroom permit just came through.',     offer: 'Free measure and a written quote on your {trade}. Most jobs fit your build schedule.' },
    roof:       { head: 'Your re-roof permit just came through.',      offer: 'A free estimate on {trade} while the crew is already on site.' },
    pool_spa:   { head: 'Your pool permit just came through.',         offer: 'Free site visit and a written quote on {trade}, timed to your build.' },
    adu:        { head: 'Your ADU permit just came through.',          offer: 'Free quote on {trade} for your new unit, scheduled around construction.' },
    addition:   { head: 'Your addition permit just came through.',     offer: 'Free quote on {trade} for the new space, scheduled around your contractor.' },
    new_home:   { head: 'Your new home permit just came through.',     offer: 'Free quote on {trade}. We can plan it with your builder from the start.' },
    solar:      { head: 'Your solar permit just came through.',        offer: 'Free quote on {trade}, designed to go with your new system.' },
    demolition: { head: 'Your demolition permit just came through.',   offer: 'Free quote on {trade} for the clean-up and whatever you build next.' },
    hvac:       { head: 'Your HVAC permit just came through.',         offer: 'Free quote on {trade} while the walls and ceilings are open.' },
    other:      { head: 'Your building permit just came through.',     offer: 'Free quote on {trade}. No obligation.' }
  };
  const TRADE_NOUN = {
    countertops: 'countertops', cabinets: 'cabinets', appliances: 'appliances', flooring: 'flooring', tile: 'tile',
    shower_glass: 'shower glass', plumbing_fixtures: 'plumbing fixtures', fencing: 'fencing', landscaping: 'landscaping',
    pool_service: 'pool service', solar_pool_heating: 'solar pool heating', furniture: 'furniture',
    windows_blinds: 'windows and blinds', gutters: 'gutters', solar: 'solar', dumpsters: 'dumpster rental',
    battery_ev: 'battery and EV charging', insulation: 'insulation'
  };

  // all non-lead permits are one quiet grey (the --dot token)
  const PRESETS = [
    { id: 'santa-monica', label: 'Santa Monica', lat: 34.0195, lng: -118.4912, city: 'Los Angeles' },
    { id: 'van-nuys', label: 'Van Nuys', lat: 34.1899, lng: -118.4514, city: 'Los Angeles' },
    { id: 'downtown', label: 'Downtown LA', lat: 34.0522, lng: -118.2437, city: 'Los Angeles' },
    { id: 'san-pedro', label: 'San Pedro', lat: 33.7358, lng: -118.2923, city: 'Los Angeles' },
    { id: 'anaheim', label: 'Anaheim', lat: 33.8353, lng: -117.9145, city: 'Anaheim' },
    { id: 'newport-beach', label: 'Newport Beach', lat: 33.6189, lng: -117.9289, city: 'Newport Beach' },
    { id: 'costa-mesa', label: 'Costa Mesa', lat: 33.6411, lng: -117.9187, city: 'Costa Mesa' },
    { id: 'lake-forest', label: 'Lake Forest', lat: 33.6469, lng: -117.6892, city: 'Lake Forest' }
  ];
  const LIST_CAP = 200;
  const MI = 1609.344;
  const STATUSES = ['new', 'contacted', 'quoting', 'won', 'lost'];
  const STATUS_LABEL = { new: 'New', contacted: 'Contacted', quoting: 'Quoting', won: 'Won', lost: 'Lost' };
  // map colour token per status (CSS custom properties, defined for both themes)
  const STATUS_VAR = { new: '--stamp', contacted: '--s-contacted', quoting: '--s-quoting', won: '--s-won', lost: '--faint' };
  const LS_KEY = 'pp-leads-v1';
  const NOTE_CAP = 50;

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDate = (iso, year = true) => {
    const [y, m, d] = iso.split('-').map(Number);
    return `${MONTHS[m - 1]} ${d}${year ? ', ' + y : ''}`;
  };
  const trunc = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const pad2 = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const addDays = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };
  const ago = (iso) => {
    const t = new Date(iso), s = (Date.now() - t) / 1000;
    if (isNaN(t)) return '';
    if (s < 60) return 'Just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 604800) return Math.floor(s / 86400) + 'd ago';
    return `${MONTHS[t.getMonth()]} ${t.getDate()}` + (t.getFullYear() === new Date().getFullYear() ? '' : ', ' + t.getFullYear());
  };
  const leadId = (r) => (r.city.toLowerCase().replace(/\s+/g, '-') + '~' + r.nbr).replace(/[^A-Za-z0-9_\-.~:@+]/g, '-');
  const titleCase = (s) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());


  // ---- lead store (shared db in the published page, localStorage otherwise) --------
  // store.all() Map leadId -> record · store.save(id, rec) Promise · store.onChange(fn) · store.mode shared|local|readonly
  function createStore(env) {
    const recs = new Map(), subs = new Set(), pending = new Map(), chains = new Map();
    const profiles = new Map(), asked = new Set();
    const notices = { unreach: '', fail: '', ro: '' };
    let db = null, user = null, uid = null, readonly = false;
    let local = !(env.claude && typeof env.claude.use === 'function');
    let unreachTimer = 0, resolveReady;
    const ready = new Promise((r) => { resolveReady = r; });
    const cl = (o) => JSON.parse(JSON.stringify(o));
    const valid = (d) => !!d && typeof d === 'object' && STATUSES.includes(d.status);
    const emit = (kind) => subs.forEach((fn) => { try { fn(kind); } catch (e) { console.error(e); } });
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    function loadLocal() {
      try {
        const o = JSON.parse(env.storage().getItem(LS_KEY) || '{}');
        Object.keys(o || {}).forEach((id) => { if (valid(o[id]) && !recs.has(id)) recs.set(id, o[id]); });
      } catch (e) { /* storage unavailable or corrupt: start empty */ }
    }
    function writeLocal() {
      try {
        const o = {};
        recs.forEach((v, k) => { o[k] = v; });
        env.storage().setItem(LS_KEY, JSON.stringify(o));
        notices.fail = '';
      } catch (e) { notices.fail = 'Your browser blocked saving here, so changes last only until you close this page.'; }
    }
    function setReadonly() { readonly = true; notices.ro = 'You can view these leads but not change them.'; }
    function onWriteError(e) {
      const code = e && e.code;
      if (code === 'invalid_argument' || code === 'revoked' || code === 'not_granted' || code === 'capability_disabled') setReadonly();
      else if (code === 'quota_exceeded' || code === 'resource_exhausted') notices.fail = 'This page has reached its saving limit, so your last change was not saved.';
      else notices.fail = 'Could not save that change. Check your connection and try again.';
    }
    async function write(id, rec) {
      const ref = db.collection('leads').doc(id);
      try { await ref.set(rec); notices.fail = ''; return; } catch (e) {
        if (!(e && e.code === 'unavailable')) { onWriteError(e); return; }
      }
      await delay(300 + Math.random() * 900);   // unavailable: retry once
      try { await ref.set(rec); notices.fail = ''; } catch (e2) { onWriteError(e2); }
    }
    async function persist(id, snap) {
      try {
        await ready;
        if (local) writeLocal();
        else if (!readonly) { if (uid) snap.updatedBy = uid; await write(id, snap); }
      } finally {
        const n = (pending.get(id) || 1) - 1;
        if (n > 0) pending.set(id, n); else pending.delete(id);
        emit();
      }
    }
    function save(id, rec) {
      if (readonly) return Promise.resolve();
      const snap = cl(rec);
      recs.set(id, cl(rec));
      pending.set(id, (pending.get(id) || 0) + 1);
      emit();
      const p = (chains.get(id) || Promise.resolve()).then(() => persist(id, snap));   // one write at a time per doc
      chains.set(id, p);
      return p;
    }
    function want(id) {
      if (!user || !user.profiles || profiles.has(id) || asked.has(id)) return;
      asked.add(id);
      Promise.resolve(user.profiles([id])).then((m) => { if (m && m[id]) { profiles.set(id, m[id]); emit('profiles'); } }).catch(() => {});
    }
    function author(by) {
      if (!by) return local ? 'You' : 'Someone';
      if (by === uid) return 'You';
      const p = profiles.get(by);
      if (!p) { want(by); return 'Someone'; }
      return p.isMe ? 'You' : (p.name || 'Someone');
    }
    function onSnapshot(snap) {
      if (!(snap.metadata && snap.metadata.fromCache)) { clearTimeout(unreachTimer); notices.unreach = ''; }
      const next = new Map();
      snap.docs.forEach((d) => { if (d.exists === false) return; const v = d.data(); if (valid(v)) next.set(d.id, cl(v)); });
      pending.forEach((_, id) => { if (recs.has(id)) next.set(id, recs.get(id)); });   // keep unsaved local edits on top
      recs.clear();
      next.forEach((v, k) => recs.set(k, v));
      emit();
    }
    function onSnapshotError(e) {
      clearTimeout(unreachTimer);
      const code = e && e.code;
      if (code === 'revoked' || code === 'not_granted' || code === 'capability_disabled') setReadonly();
      notices.unreach = 'Saved leads could not be loaded. Reload the page to try again.';
      emit();
    }
    async function start() {
      if (local) { loadLocal(); resolveReady(); emit(); return; }
      try { db = await env.claude.use('db'); } catch (e) { db = null; }
      if (!db) { local = true; loadLocal(); writeLocal(); resolveReady(); emit(); return; }
      try { user = await env.claude.use('user'); } catch (e) { user = null; }
      unreachTimer = setTimeout(() => { notices.unreach = 'Saved leads can’t be reached yet.'; emit(); }, 10000);
      db.collection('leads').onSnapshot(onSnapshot, onSnapshotError);   // subscribed once
      try {
        if (user) {
          uid = await user.id();
          if ((await user.can('data.write')) === false) setReadonly();
        }
      } catch (e) { /* unknown: keep inputs, decide on the first rejected write */ }
      resolveReady();
      emit();
    }
    return {
      start, save, author,
      all: () => recs,
      onChange: (fn) => { subs.add(fn); return () => subs.delete(fn); },
      get mode() { return readonly ? 'readonly' : (local ? 'local' : 'shared'); },
      get notice() { return notices.ro || notices.fail || notices.unreach; },
      get uid() { return uid; }
    };
  }
  const store = createStore({ claude: window.claude, storage: () => window.localStorage });
  // ---- end lead store ----

  const state = {
    trade: CONFIG.defaultTrade, biz: CONFIG.businessName, preset: 'santa-monica',
    base: { lat: PRESETS[0].lat, lng: PRESETS[0].lng }, radius: CONFIG.radiusMiles, sort: 'date', rate: 0.95,
    clickMove: false, selected: null, flipped: false, filter: null, panel: false
  };
  let meta, rows = [], matches = [], pool = [], counts = {}, dueCount = 0, panelId = null, presets = PRESETS;
  let map, tiles, canvas, dotLayer, hitLayer, selMarker, baseMarker, radiusCircle, popup;

  // ---- theme ---------------------------------------------------------------
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  function currentTheme() {
    const t = document.documentElement.getAttribute('data-theme');
    return t === 'dark' || t === 'light' ? t : (mq.matches ? 'dark' : 'light');
  }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('pp-theme', t); } catch (e) { /* storage unavailable */ }
    applyTheme();
  }
  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function applyTheme() {
    const t = currentTheme();
    $('theme-toggle').textContent = t === 'dark' ? 'Light theme' : 'Dark theme';
    if (!map) return;
    // OSM standard tiles (Carto basemaps now need an API key). Paper/dark look comes from a CSS filter on the tile pane.
    // Published Artifacts can't load outside images, so there we draw Census city/county outlines instead.
    if (!tiles && !window.PP_NO_TILES) tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    document.documentElement.dataset.tiles = t;
    styleBasemap();
    rows.forEach((r) => r.dot.setStyle({ fillColor: cssVar('--dot') }));
    styleOverlays();
  }
  // ---- vector basemap (Census TIGERweb outlines) -----------------------------
  let baseCounties, basePlaces;
  function initBasemap() {
    const bm = window.PP_BASEMAP;
    if (!bm || !window.PP_NO_TILES) return;
    map.createPane('base');
    map.getPane('base').style.zIndex = 250;
    map.getPane('base').style.pointerEvents = 'none';
    const covered = new Set((meta.sources || []).map((s) => s.city));
    baseCounties = L.geoJSON(bm.counties, { pane: 'base', interactive: false }).addTo(map);
    basePlaces = L.geoJSON(bm.places, { pane: 'base', interactive: false }).addTo(map);
    basePlaces.eachLayer((l) => {
      l.covered = covered.has(l.feature.properties.n);
      if (l.covered) {
        L.marker(l.getBounds().getCenter(), {
          pane: 'base', interactive: false, keyboard: false,
          icon: L.divIcon({ className: 'city-label', html: `<span>${esc(l.feature.properties.n)}</span>`, iconSize: null })
        }).addTo(map);
      }
    });
    map.attributionControl.addAttribution('Outlines: US Census Bureau TIGERweb');
  }
  function styleBasemap() {
    if (!baseCounties) return;
    $('map').style.background = cssVar('--water');
    baseCounties.setStyle({ color: cssVar('--line'), weight: 1.2, fillColor: cssVar('--land'), fillOpacity: 1 });
    basePlaces.eachLayer((l) => l.setStyle(l.covered
      ? { color: cssVar('--pencil'), weight: 1, fillColor: cssVar('--covered'), fillOpacity: 1 }
      : { color: cssVar('--line'), weight: 0.6, fillOpacity: 0 }));
  }

  // lead dots are coloured by status; Lost is a hollow ring
  function hitStyle(r) {
    const c = cssVar(STATUS_VAR[r.status] || '--stamp');
    return r.status === 'lost'
      ? { color: c, weight: 2, fillColor: c, fillOpacity: 0 }
      : { color: cssVar('--panel'), weight: 1.5, fillColor: c, fillOpacity: 0.95 };
  }

  function styleOverlays() {
    const ink = cssVar('--ink'), blue = cssVar('--blue');
    if (radiusCircle) radiusCircle.setStyle({ color: blue, fillColor: blue });
    if (baseMarker) baseMarker.setStyle({ color: cssVar('--panel'), fillColor: ink });
    if (selMarker) selMarker.setStyle({ color: ink, fillColor: 'transparent' });
    hitLayer.eachLayer((m) => m.setStyle(hitStyle(m.lead)));
  }

  // ---- geo -----------------------------------------------------------------
  function miles(lat1, lon1, lat2, lon2) {
    const rad = Math.PI / 180, dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 3958.8 * 2 * Math.asin(Math.sqrt(a));
  }

  // ---- data ----------------------------------------------------------------
  async function load() {
    let raw;
    if (window.PERMIT_DATA) {
      raw = window.PERMIT_DATA.permits;
      meta = window.PERMIT_DATA.meta;
    } else {
      const [pRes, mRes] = await Promise.all([fetch('data/permits.json'), fetch('data/meta.json')]);
      if (!pRes.ok || !mRes.ok) throw new Error('data files missing. Run: python3 pipeline/fetch.py');
      raw = await pRes.json();
      meta = await mRes.json();
    }
    rows = raw.rows.map((a) => {
      const kinds = a[7].map((i) => raw.kinds[i]);
      const trades = new Set();
      kinds.forEach((k) => (meta.kinds[k] ? meta.kinds[k].trades : []).forEach((t) => trades.add(t)));
      return { nbr: a[0], addr: a[1], zip: a[2], city: a[9] || 'Los Angeles', date: a[3], val: a[4], lat: a[5], lng: a[6], kinds, desc: a[8], trades, primary: kinds[0], d: 0, contractor: a[10] || '', status: 'new', follow: null, isDue: false };
    });
    rows.forEach((r) => { r.id = leadId(r); });
  }

  // ---- map -----------------------------------------------------------------
  function initMap() {
    canvas = L.canvas({ padding: 0.3 });
    map = L.map('map', { preferCanvas: true, renderer: canvas, zoomControl: false, minZoom: 8 }).setView([state.base.lat, state.base.lng], 10);
    L.control.zoom({ position: 'topright' }).addTo(map);
    map.attributionControl.setPrefix(false);
    initBasemap();
    dotLayer = L.layerGroup().addTo(map);
    hitLayer = L.layerGroup().addTo(map);
    rows.forEach((r) => {
      r.dot = L.circleMarker([r.lat, r.lng], { renderer: canvas, radius: 2.6, weight: 0, fillColor: cssVar('--dot'), fillOpacity: 0.8, bubblingMouseEvents: false })
        .on('click', () => onDotClick(r));
      dotLayer.addLayer(r.dot);
    });
    radiusCircle = L.circle([state.base.lat, state.base.lng], { radius: state.radius * MI, weight: 1.5, dashArray: '6 6', fillOpacity: 0.05, interactive: false }).addTo(map);
    baseMarker = L.circleMarker([state.base.lat, state.base.lng], { renderer: canvas, radius: 7, weight: 3, fillOpacity: 1, interactive: false }).addTo(map);
    map.on('click', (e) => { if (state.clickMove) setBase(e.latlng.lat, e.latlng.lng, null, false); });
    popup = L.popup({ maxWidth: 300 });
    addLegend();
    applyTheme();
    fitBase();
  }

  // keep the radius clear of the floating card on wide screens
  function fitBase() {
    const wide = window.innerWidth > 880;
    map.fitBounds(radiusCircle.getBounds(), wide ? { paddingTopLeft: [420, 20], paddingBottomRight: [20, 20] } : { padding: [10, 10] });
  }

  function addLegend() {
    const ctl = L.control({ position: 'bottomleft' });
    ctl.onAdd = () => {
      const div = L.DomUtil.create('div', 'legend');
      div.innerHTML = '<details><summary><span class="hit"><i></i>Your leads</span></summary>' +
        STATUSES.map((st) => `<div><i class="sdot s-${st}"></i>${STATUS_LABEL[st]}</div>`).join('') + '</details>';
      L.DomEvent.disableClickPropagation(div);
      return div;
    };
    ctl.addTo(map);
  }

  function popupHtml(r) {
    const kinds = r.kinds.map((k) => (meta.kinds[k] || { label: 'Other' }).label).join(', ');
    return `<div class="pp"><strong>${esc(titleCase(r.addr))}, ${esc(r.city)} ${esc(r.zip)}</strong><div class="k">${esc(kinds)}</div>` +
      `<dl><dt>Issued</dt><dd>${esc(fmtDate(r.date))}</dd><dt>Valuation</dt><dd>${r.val > 0 ? money(r.val) : 'not listed'}</dd><dt>Permit</dt><dd>${esc(r.nbr)}</dd></dl>` +
      (r.desc ? `<p>${esc(trunc(r.desc, 200))}</p>` : '') + '</div>';
  }
  function showPopup(r) { popup.setLatLng([r.lat, r.lng]).setContent(popupHtml(r)).openOn(map); }
  function onDotClick(r) {
    if (matches.includes(r)) { map.closePopup(); openLead(r, false); } else showPopup(r);
  }

  // ---- state -> UI ---------------------------------------------------------
  function setBase(lat, lng, presetId, fit) {
    state.base = { lat, lng };
    state.preset = presetId;
    radiusCircle.setLatLng([lat, lng]);
    baseMarker.setLatLng([lat, lng]);
    if (fit) fitBase();
    if ($('place')) $('place').value = presetId || 'custom';
    refresh();
  }

  let pending = 0;
  function refresh() { clearTimeout(pending); pending = setTimeout(compute, 40); }

  function compute() {
    const { lat, lng } = state.base;
    const recs = store.all(), today = ymd(new Date());
    pool = [];
    for (const r of rows) {
      if (!r.trades.has(state.trade)) { r.d = Infinity; continue; }
      r.d = miles(lat, lng, r.lat, r.lng);
      if (r.d <= state.radius) pool.push(r);
    }
    counts = { new: 0, contacted: 0, quoting: 0, won: 0, lost: 0 };
    dueCount = 0;
    pool.forEach((r) => {
      const rec = recs.get(r.id);
      r.status = rec ? rec.status : 'new';
      r.follow = (rec && rec.followUp) || null;
      r.isDue = !!r.follow && r.follow <= today && r.status !== 'won' && r.status !== 'lost';
      counts[r.status]++;
      if (r.isDue) dueCount++;
    });
    const f = state.filter;
    matches = f ? pool.filter((r) => (f === 'due' ? r.isDue : r.status === f)) : pool.slice();
    if (state.sort === 'val') matches.sort((a, b) => b.val - a.val || b.date.localeCompare(a.date));
    else if (state.sort === 'follow') matches.sort((a, b) => (a.follow || '9999').localeCompare(b.follow || '9999') || b.date.localeCompare(a.date));
    else matches.sort((a, b) => b.date.localeCompare(a.date) || b.val - a.val);
    // an open lead stays selected even if the filter now hides it (so a status click doesn't make it vanish)
    const keep = state.selected && (matches.includes(state.selected) || (state.panel && pool.includes(state.selected)));
    if (!keep) { state.selected = matches[0] || null; state.panel = false; }

    // leads hidden by the filter lose their muted dot too
    const shown = new Set(matches);
    rows.forEach((r) => {
      const hide = r.trades.has(state.trade) && r.d <= state.radius && !shown.has(r);
      if (hide && !r.hidden) { dotLayer.removeLayer(r.dot); r.hidden = true; }
      else if (!hide && r.hidden) { dotLayer.addLayer(r.dot); r.hidden = false; }
    });

    hitLayer.clearLayers();
    matches.forEach((r) => {
      const m = L.circleMarker([r.lat, r.lng], Object.assign({ renderer: canvas, radius: 4.8, bubblingMouseEvents: false }, hitStyle(r)))
        .on('click', () => onDotClick(r));
      m.lead = r;
      hitLayer.addLayer(m);
    });
    renderStats();
    renderList();
    renderSelection();
  }

  function renderStats() {
    const n = pool.length;
    const days = Math.max(1, (new Date(meta.date_max) - new Date(meta.date_min)) / 86400000 + 1);
    const perWeek = counts.new / (days / 7);
    const vals = pool.map((r) => r.val).filter((v) => v > 0).sort((a, b) => a - b);
    const med = vals.length ? (vals.length % 2 ? vals[(vals.length - 1) / 2] : (vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2) : null;
    const week = n ? (perWeek >= 10 ? Math.round(perWeek) : perWeek.toFixed(1)) : '0';
    STATUSES.forEach((st) => {
      $('n-' + st).textContent = counts[st].toLocaleString('en-US');
      $('seg-' + st).setAttribute('aria-pressed', String(state.filter === st));
    });
    $('today').hidden = !dueCount;
    $('today').setAttribute('aria-pressed', String(state.filter === 'due'));
    $('today').textContent = `${dueCount} follow-up${dueCount === 1 ? '' : 's'} due`;
    $('s-sub').hidden = !!dueCount && n > 0;
    $('s-sub').textContent = n ? `About ${week} new leads a week.` : `Nothing within ${state.radius} miles yet. Try a bigger travel distance under Adjust.`;
    $('s-week').textContent = week;
    $('s-median').textContent = med === null ? 'not listed' : money(med);
    $('s-median-l').textContent = 'Typical project value';
    $('s-cost').textContent = money(n * (state.rate || 0));
    $('list-count').textContent = matches.length.toLocaleString('en-US');
    $('work-lead').disabled = !n;
    renderNotice();
  }

  function renderList() {
    const ul = $('matches');
    const note = $('list-note');
    if (!matches.length) {
      ul.innerHTML = '<li class="empty-list">No leads here. Try another status, a larger travel distance or another trade.</li>';
      note.hidden = true;
      return;
    }
    const shown = matches.slice(0, LIST_CAP);
    ul.innerHTML = shown.map((r, i) => {
      const kinds = r.kinds.map((k) => (meta.kinds[k] || { label: 'Other' }).label).join(' + ');
      return `<li><button type="button" class="row" data-i="${i}"${r === state.selected ? ' aria-current="true"' : ''}>` +
        `<span class="addr">${esc(titleCase(r.addr))}</span><span class="val">${r.val > 0 ? money(r.val) : '–'}</span>` +
        `<span class="sub"><span class="pill s-${r.status}">${STATUS_LABEL[r.status]}</span>` +
        `${r.follow ? `<span class="fu${r.isDue ? ' due' : ''}">Follow up ${esc(fmtDate(r.follow, false))}</span>` : ''}` +
        `<span class="kind">${esc(kinds)}</span>${esc(r.city)} · ${esc(fmtDate(r.date, false))} · ${r.d.toFixed(1)} mi</span></button></li>`;
    }).join('');
    note.hidden = matches.length <= LIST_CAP;
    note.textContent = `Showing the first ${LIST_CAP} of ${matches.length.toLocaleString('en-US')} leads. The map and counts include all of them.`;
  }

  function select(r, fly) {
    state.selected = r;
    renderSelection();
    ($('matches').querySelectorAll('.row')).forEach((b) => {
      const on = matches[+b.dataset.i] === r;
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    if (fly) {
      const z = Math.max(map.getZoom(), 14);
      // Background tabs pause animation frames, which can freeze Leaflet mid-zoom; jump instead when not visible.
      if (document.hidden) map.setView([r.lat, r.lng], z, { animate: false });
      else map.flyTo([r.lat, r.lng], z, { duration: 0.6 });
    }
  }

  function openLead(r, fly) {
    state.panel = true;
    select(r, fly);
    if (window.innerWidth <= 880) $('lead-panel').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function renderSelection() {
    const r = state.selected;
    if (r) {
      const ring = [r.lat, r.lng];
      if (!selMarker) selMarker = L.circleMarker(ring, { renderer: canvas, radius: 10, weight: 3, fillOpacity: 0, interactive: false }).addTo(map);
      else selMarker.setLatLng(ring);
      selMarker.setStyle({ color: cssVar('--ink') }).bringToFront();
    } else if (selMarker) { selMarker.remove(); selMarker = null; }
    renderPostcard();
    renderPanel();
  }

  // ---- lead panel (status, follow-up, notes) ------------------------------------
  function renderNotice() {
    const n = store.notice;
    $('store-note').hidden = !n;
    $('store-note').textContent = n;
    $('lp-notice').hidden = !n;
    $('lp-notice').textContent = n;
    $('adjust-note').hidden = store.mode !== 'local';
  }

  function renderPanel() {
    const r = state.panel ? state.selected : null;
    $('lead-panel').hidden = !r;
    $('app').classList.toggle('has-panel', !!r);
    if (!r) { panelId = null; return; }
    const rec = store.all().get(r.id);
    const ro = store.mode === 'readonly';
    const status = rec ? rec.status : 'new';
    const addr = titleCase(r.addr);
    $('lp-addr').textContent = addr;
    $('lp-city').textContent = `${r.city}${r.zip ? ', ' + r.zip : ''}`;
    $('lp-dir').href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(`${addr}, ${r.city}, ${r.state || 'CA'} ${r.zip}`.trim());
    const kinds = r.kinds.map((k) => `<span class="kind">${esc((meta.kinds[k] || { label: 'Other' }).label)}</span>`).join('');
    $('lp-meta').innerHTML = `${kinds}<span>Issued ${esc(fmtDate(r.date))}</span><span>${r.val > 0 ? money(r.val) : 'Value not listed'}</span><span class="mono">${esc(r.nbr)}</span>`;
    $('lp-contractor').hidden = !r.contractor;
    $('lp-contractor').textContent = r.contractor ? 'Contractor: ' + r.contractor : '';
    $('lp-status').querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.s === status));
      b.disabled = ro;
    });
    const fu = $('lp-follow');
    if (document.activeElement !== fu) fu.value = (rec && rec.followUp) || '';
    fu.disabled = ro;
    $('lead-panel').querySelectorAll('.quick button').forEach((b) => { b.disabled = ro; });
    const notes = rec && rec.notes ? rec.notes.slice().reverse() : [];
    $('lp-notes').innerHTML = notes.length
      ? notes.map((n) => `<li><div class="n-top"><b>${esc(store.author(n.by))}</b><time datetime="${esc(n.at)}">${esc(ago(n.at))}</time></div><p>${esc(n.text)}</p></li>`).join('')
      : '<li class="n-empty">No notes yet.</li>';
    if (panelId !== r.id) { panelId = r.id; $('lp-note-in').value = ''; }
    $('lp-note-in').disabled = ro;
    $('lp-note-add').disabled = ro;
    $('lp-prev').disabled = $('lp-next').disabled = matches.length < 2;
    $('lp-foot').textContent = store.mode === 'local' ? 'Saved on this device only.' : 'Shared with everyone who can open this page.';
    renderNotice();
  }

  // every change goes through here: copy the record, apply the edit, save the whole thing
  function commit(mutate) {
    const r = state.selected;
    if (!r || store.mode === 'readonly') return;
    const cur = store.all().get(r.id);
    const rec = cur ? clone(cur) : { status: 'new', followUp: null, notes: [], trade: state.trade, addr: titleCase(r.addr), city: r.city };
    if (!Array.isArray(rec.notes)) rec.notes = [];
    mutate(rec);
    rec.updatedAt = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    rec.updatedBy = store.uid;
    if (rec.notes.length > NOTE_CAP) rec.notes = rec.notes.slice(-NOTE_CAP);
    store.save(r.id, rec);
  }
  function setStatus(st) {
    const cur = state.selected && store.all().get(state.selected.id);
    if (!cur && st === 'new') return;
    commit((rec) => { rec.status = st; });
  }
  function setFollow(v) {
    const cur = state.selected && store.all().get(state.selected.id);
    if (!cur && !v) return;
    commit((rec) => { rec.followUp = v || null; });
  }
  function addNote() {
    const box = $('lp-note-in'), text = box.value.trim();
    if (!text) return;
    box.value = '';
    commit((rec) => { rec.notes.push({ at: new Date().toISOString().replace(/\.\d+Z$/, 'Z'), by: store.uid, text: text.slice(0, 2000) }); });
  }
  function copyAddress() {
    const r = state.selected;
    if (!r) return;
    const text = `${titleCase(r.addr)}, ${r.city}, ${r.state || 'CA'} ${r.zip}`.trim();
    const done = () => { $('lp-copy').textContent = 'Copied'; setTimeout(() => { $('lp-copy').textContent = 'Copy address'; }, 1500); };
    const fallback = () => {   // select the visible address so Cmd/Ctrl+C works
      const sel = window.getSelection(), range = document.createRange();
      range.selectNodeContents($('lp-addr'));
      sel.removeAllRanges(); sel.addRange(range);
      $('lp-copy').textContent = 'Press Ctrl/Cmd+C';
      setTimeout(() => { $('lp-copy').textContent = 'Copy address'; }, 2500);
    };
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
  }
  function workNewest() {
    if (!pool.length) return;
    const byDate = (a, b) => b.date.localeCompare(a.date) || b.val - a.val;
    const fresh = pool.filter((r) => r.status === 'new').sort(byDate);
    const target = fresh[0] || pool.slice().sort(byDate)[0];
    if (state.filter && !matches.includes(target)) { state.filter = null; compute(); }
    openLead(target, true);
  }
  // ---- postcard --------------------------------------------------------------
  function renderPostcard() {
    const r = state.selected;
    $('card-wrap').hidden = !r;
    $('card-empty').hidden = !!r;
    $('card-for').hidden = !r;
    $('flip').disabled = !r;
    $('prev-card').disabled = $('next-card').disabled = matches.length < 2;
    if (!r) return;
    const trade = state.trade;
    const kind = r.kinds.find((k) => meta.kinds[k] && meta.kinds[k].trades.includes(trade)) || r.kinds[0];
    const copy = COPY[kind] || COPY.other;
    const noun = TRADE_NOUN[trade] || (meta.trades[trade] || trade).toLowerCase();
    const head = `${copy.head} Let’s talk ${noun}.`;
    const offer = copy.offer.replace('{trade}', noun);
    const biz = state.biz.trim() || 'Your business name';
    const street = titleCase(r.addr);
    $('card-for').textContent = `Permit ${r.nbr} · ${fmtDate(r.date)} · ${street}`;
    $('face-front').innerHTML =
      `<div class="tag">Permit notice · issued ${esc(fmtDate(r.date, false))}</div>` +
      `<p class="head">${esc(head)}</p><p class="offer">${esc(offer)}</p>` +
      `<div class="where">Re: ${esc(street)}</div>` +
      `<div class="band"><span class="biz">${esc(biz)}</span><span class="contact">${esc(CONFIG.phone)}<br>${esc(CONFIG.url)}</span></div>`;
    $('face-back').innerHTML =
      `<div class="left"><p class="msg"><b>${esc(biz)}</b> works on ${esc(noun)} right after the permit stage. One call or one click gets you a written quote.</p>` +
      `<p class="legal">You’re receiving this because building permits are public record. Not affiliated with the City of ${esc(r.city)}.</p></div>` +
      `<div class="right"><div class="stamp"><span><i>★</i>Postage<br>here</span></div>` +
      `<div class="addr-block"><div class="to">To the homeowner at</div><div class="line">${esc(r.addr)}</div><div class="line">${esc(r.city)}, ${esc(r.state || 'CA')} ${esc(r.zip)}</div></div></div>`;
  }

  function setFlip(on) {
    state.flipped = on;
    $('postcard').classList.toggle('flipped', on);
    $('flip').setAttribute('aria-pressed', String(on));
    $('flip').textContent = on ? 'Flip to front' : 'Flip to back';
    $('face-front').setAttribute('aria-hidden', String(on));
    $('face-back').setAttribute('aria-hidden', String(!on));
  }

  // ---- controls --------------------------------------------------------------
  function renderPresets() {
    const opt = (p) => `<option value="${p.id}">${esc(p.label)}</option>`;
    const groups = [['Los Angeles', presets.filter((p) => p.city === 'Los Angeles')], ['Orange County', presets.filter((p) => p.city !== 'Los Angeles')]];
    $('place').innerHTML = groups.filter(([, ps]) => ps.length)
      .map(([name, ps]) => `<optgroup label="${name}">${ps.map(opt).join('')}</optgroup>`).join('') +
      '<option value="custom">A spot on the map…</option>';
    $('place').value = state.preset || 'custom';
    $('place-hint').hidden = !state.clickMove;
  }

  function wire() {
    const tradeSel = $('trade');
    const order = Object.keys(meta.counts_by_trade);
    tradeSel.innerHTML = order.map((t) => `<option value="${esc(t)}">${esc(meta.trades[t] || t)}</option>`).join('');
    if (!order.includes(state.trade)) state.trade = order[0];
    tradeSel.value = state.trade;
    tradeSel.addEventListener('change', () => { state.trade = tradeSel.value; state.selected = null; refresh(); });
    $('biz').addEventListener('input', (e) => { state.biz = e.target.value; renderPostcard(); });
    $('radius').addEventListener('input', (e) => {
      state.radius = +e.target.value;
      $('radius-out').textContent = state.radius + ' mi';
      radiusCircle.setRadius(state.radius * MI);
      refresh();
    });
    $('rate').addEventListener('input', (e) => { state.rate = Math.max(0, parseFloat(e.target.value) || 0); renderStats(); });
    $('sort').addEventListener('change', (e) => { state.sort = e.target.value; refresh(); });
    $('place').addEventListener('change', (e) => {
      if (e.target.value === 'custom') { state.clickMove = true; state.preset = null; $('place-hint').hidden = false; return; }
      state.clickMove = false;
      const p = presets.find((x) => x.id === e.target.value);
      setBase(p.lat, p.lng, p.id, true);
    });
    $('matches').addEventListener('click', (e) => {
      const b = e.target.closest('.row');
      if (b) select(matches[+b.dataset.i], true);
    });
    const openDialog = (d) => { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); };
    const closeDialog = (d) => { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); };
    const openCard = () => { setFlip(false); renderPostcard(); openDialog($('drawer')); };
    $('work-lead').addEventListener('click', workNewest);
    $('lp-card').addEventListener('click', openCard);
    $('lp-close').addEventListener('click', () => { state.panel = false; renderPanel(); });
    $('pipe').addEventListener('click', (e) => {
      const b = e.target.closest('.seg');
      if (!b) return;
      state.filter = state.filter === b.dataset.s ? null : b.dataset.s;
      compute();
    });
    $('today').addEventListener('click', () => { state.filter = state.filter === 'due' ? null : 'due'; compute(); });
    $('lp-status').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setStatus(b.dataset.s); });
    $('lp-follow').addEventListener('change', (e) => setFollow(e.target.value));
    $('lead-panel').querySelector('.quick').addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const v = b.dataset.d === 'clear' ? '' : addDays(+b.dataset.d);
      $('lp-follow').value = v;
      setFollow(v);
    });
    $('lp-note-add').addEventListener('click', addNote);
    $('lp-note-in').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); addNote(); } });
    $('lp-copy').addEventListener('click', copyAddress);
    $('lp-prev').addEventListener('click', () => step(-1));
    $('lp-next').addEventListener('click', () => step(1));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.panel && !document.querySelector('dialog[open]')) { state.panel = false; renderPanel(); }
    });
    store.onChange((kind) => {
      if (!map) return;
      if (kind === 'profiles') renderPanel(); else { refresh(); renderPanel(); }
      renderNotice();
    });
    $('collapse').addEventListener('click', () => closeDialog($('drawer')));
    $('about-open').addEventListener('click', () => openDialog($('about')));
    $('about-close').addEventListener('click', () => closeDialog($('about')));
    ['drawer', 'about'].forEach((id) => $(id).addEventListener('click', (e) => { if (e.target === $(id)) closeDialog($(id)); }));
    const step = (dir) => {
      if (!matches.length) return;
      const i = matches.indexOf(state.selected);
      select(i < 0 ? matches[0] : matches[(i + dir + matches.length) % matches.length], false);
    };
    $('prev-card').addEventListener('click', () => step(-1));
    $('next-card').addEventListener('click', () => step(1));
    $('flip').addEventListener('click', () => setFlip(!state.flipped));
    $('theme-toggle').addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark'));
    mq.addEventListener('change', applyTheme);
    renderPresets();
    setFlip(false);
  }

  function renderFresh() {
    const el = $('fresh');
    const src = meta.sources || [];
    const chips = src.map((s) => `<span class="src"><i></i>${esc(s.city)} <em>${esc(fmtDate(s.date_min, false))} – ${esc(fmtDate(s.date_max, false))}</em></span>`);
    const fails = (meta.sources_failed || []).map((s) => `<span class="src off" title="Portal blocked automated access this run">${esc(s.city)} <em>unavailable</em></span>`);
    el.innerHTML = `<span class="src total">${meta.total_rows.toLocaleString('en-US')} permits</span>` + chips.join('') + fails.join('');
  }

  function renderFooter() {
    const links = (meta.sources || []).map((s) => `<a href="${esc(s.credit.url)}" target="_blank" rel="noopener">${esc(s.credit.name)}</a>`);
    $('credits').innerHTML = links.length ? 'Data: ' + links.join('; ') + '. Prototype; no mail is sent.' : 'Prototype; no mail is sent.';
  }

  // ---- boot ----------------------------------------------------------------
  try { const t = localStorage.getItem('pp-theme'); if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t); } catch (e) { /* ignore */ }
  document.title = CONFIG.brandName;
  document.querySelector('.top h1').textContent = CONFIG.brandName;
  document.querySelector('.mark span').textContent = CONFIG.logoText;
  $('biz').value = state.biz;
  $('radius').value = state.radius;
  $('radius-out').textContent = state.radius + ' mi';
  if (CONFIG.accent) {
    const st = document.documentElement.style;
    st.setProperty('--blue', CONFIG.accent);
    st.setProperty('--stamp', CONFIG.accent);
    st.setProperty('--blue-soft', `color-mix(in srgb, ${CONFIG.accent} 12%, transparent)`);
    st.setProperty('--stamp-soft', `color-mix(in srgb, ${CONFIG.accent} 12%, transparent)`);
  }
  applyTheme();
  load().then(() => {
    const have = new Set((meta.sources || []).map((s) => s.city));
    if (have.size) presets = PRESETS.filter((p) => have.has(p.city));
    if (!presets.length) presets = PRESETS;
    const start = presets.find((p) => p.id === CONFIG.defaultPlace) || presets[0];
    state.preset = start.id;
    state.base = { lat: start.lat, lng: start.lng };
    renderFresh();
    renderFooter();
    initMap();
    wire();
    compute();
  }).catch((err) => {
    $('fresh').textContent = 'Could not load permit data: ' + err.message;
    $('card-empty').hidden = false;
  });
  store.start();
})();
