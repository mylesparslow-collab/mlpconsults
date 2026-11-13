// Runtime probe: paste into a browser console (or javascript_tool) on a loaded page.
// Returns what the static fetch can't see: live globals, canvases/WebGL, the fonts
// actually rendered, the real type scale, colours in use, fixed UI and scroll setup.
(() => {
  const w = window, d = document;
  const has = (k) => { try { return k in w && w[k] != null; } catch { return false; } };
  const libs = {
    three: w.__THREE__ || (has('THREE') && w.THREE.REVISION) || null,
    gsap: (has('gsap') && w.gsap.version) || null,
    ScrollTrigger: has('ScrollTrigger'), lenis: has('lenis') || !!d.querySelector('html.lenis, .lenis'),
    pixi: has('PIXI'), barba: has('barba'), swup: has('swup'), locomotive: !!d.querySelector('[data-scroll-container]'),
    vue: !!d.querySelector('[data-v-app]') || has('__VUE__'), nuxt: has('__NUXT__') || has('$nuxt'),
    next: has('__NEXT_DATA__') || has('next'), react: !!d.querySelector('[data-reactroot]') || has('React'),
    astro: !!d.querySelector('astro-island'), webflow: has('Webflow'), framer: !!d.querySelector('[data-framer-name]'),
    howler: has('Howler'), lottie: has('lottie') || has('bodymovin'), rive: has('rive'),
  };
  const canvases = [...d.querySelectorAll('canvas')].map((c) => {
    let ctx = 'unknown';
    try { ctx = c.getContext('webgl2') ? 'webgl2?' : 'other'; } catch {}
    const r = c.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), fixed: getComputedStyle(c).position, z: getComputedStyle(c).zIndex, ctx };
  });
  // rendered fonts and type scale from visible text elements
  const els = [...d.querySelectorAll('h1,h2,h3,h4,p,a,span,li,button,div')].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width && r.height && e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
  }).slice(0, 600);
  const fonts = {}, sizes = {}, colors = {}, bgs = {};
  for (const e of els) {
    const s = getComputedStyle(e);
    const fam = s.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    fonts[fam] = (fonts[fam] || 0) + 1;
    const key = `${Math.round(parseFloat(s.fontSize))}px/${s.fontWeight}/${s.textTransform === 'uppercase' ? 'UC' : 'mixed'}/ls:${s.letterSpacing}/lh:${s.lineHeight}`;
    sizes[key] = (sizes[key] || 0) + 1;
    colors[s.color] = (colors[s.color] || 0) + 1;
  }
  for (const e of [d.body, d.documentElement, ...d.querySelectorAll('section,main,header,footer')].slice(0, 40)) {
    const b = getComputedStyle(e).backgroundColor; if (b && b !== 'rgba(0, 0, 0, 0)') bgs[b] = (bgs[b] || 0) + 1;
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ×${v}`);
  const sizeList = Object.keys(sizes).map((k) => parseInt(k)).filter(Boolean);
  const fixedUI = [...d.querySelectorAll('body *')].filter((e) => { const p = getComputedStyle(e).position; return (p === 'fixed' || p === 'sticky') && e.getBoundingClientRect().width > 0; })
    .slice(0, 12).map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].slice(0, 2).join('.')} "${(e.innerText || '').trim().slice(0, 40).replace(/\s+/g, ' ')}"`);
  const rootVars = [...d.styleSheets].flatMap((ss) => { try { return [...ss.cssRules]; } catch { return []; } })
    .filter((r) => r.selectorText === ':root').flatMap((r) => [...r.style].filter((p) => p.startsWith('--')).map((p) => `${p}:${r.style.getPropertyValue(p).trim()}`)).slice(0, 40);
  return {
    url: location.href, title: d.title,
    viewport: `${innerWidth}x${innerHeight}`, docHeight: d.documentElement.scrollHeight, screensTall: +(d.documentElement.scrollHeight / innerHeight).toFixed(1),
    libs: Object.fromEntries(Object.entries(libs).filter(([, v]) => v)),
    canvases, videos: d.querySelectorAll('video').length, imgs: d.images.length, svgs: d.querySelectorAll('svg').length,
    fontsLoaded: [...d.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}${f.style === 'italic' ? 'i' : ''}`).filter((v, i, a) => a.indexOf(v) === i).slice(0, 15),
    fontsUsed: top(fonts, 6), typeScale: top(sizes, 12), maxFontPx: Math.max(0, ...sizeList),
    textColors: top(colors, 6), backgrounds: top(bgs, 5),
    htmlCursorHidden: getComputedStyle(d.body).cursor === 'none' || getComputedStyle(d.documentElement).cursor === 'none',
    fixedUI, rootVars,
    scrollBehavior: getComputedStyle(d.documentElement).scrollBehavior,
    reducedMotionCSS: [...d.styleSheets].some((ss) => { try { return [...ss.cssRules].some((r) => r.media && /prefers-reduced-motion/.test(r.media.mediaText)); } catch { return false; } }),
  };
})();
