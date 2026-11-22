// "Loose ends": a few thousand paper slips and 17 site tiles in one instanced draw call, filing themselves
// into seven formations as the page scrolls.
//
// Structure follows instanced-grass.html (InstancedBufferGeometry, all motion in the vertex shader, pixel ratio
// cap, pause on hidden, one frame under reduced motion, low tier) and post-chain.html (EffectComposer with
// HalfFloatType, multisampling 0, RenderPass then EffectPass(SMAA, bloom, vignette, noise), antialias:false).
//
// The seven formations live in three float data textures (width = instance count, height = 7 formations):
//   T0 = position.xyz + w, T1 = quaternion, T2 = scale.xy, freedom, dim.
// Formations 0 (storm), 1 (columns) and 4 (lanes) store orbit / lane parameters instead and are evaluated with
// time in the vertex shader. Output colour space is Linear, so every hex value is used exactly as written.
import * as THREE from 'three';
import { EffectComposer, RenderPass, EffectPass, SMAAEffect, BloomEffect, VignetteEffect, NoiseEffect, DepthOfFieldEffect } from 'postprocessing';

const INK = '#1b1a18';
const NIGHT = '#0e0d0c', MORNING = '#f2eee6';
const TINTS = [['#f4f1e8', 0.52], ['#f1dc6a', 0.14], ['#f0b6bf', 0.12], ['#e6b04a', 0.10], ['#bcdcc6', 0.12]];
// receipt, square note, invoice, card (world units, before any formation scale)
const SHAPES = [{ w: 0.30, h: 0.84 }, { w: 0.52, h: 0.52 }, { w: 0.52, h: 0.68 }, { w: 0.66, h: 0.40 }];
const SHAPE_WEIGHTS = [0.24, 0.24, 0.32, 0.20];
const TILE = { w: 1.25, h: 0.78 };
const NT_MAX = 24;
const NF = 7;
const HALF_PI = Math.PI / 2;

// camera pose, framing box (fit = width, height the formation needs; 0 = unconstrained) and pointer strength per formation
const FORM = [
  { cam: [0, 1.4, 14], look: [0, 0, 0], fit: [10.5, 7.6], cap: 1.15, push: 1.0 },
  { cam: [0, 0.4, 14.5], look: [0, 0, 0], fit: [8.0, 8.4], cap: 1.15, push: 0.35 },
  { cam: [0, 5.6, 12.8], look: [0, 0.3, 0], fit: [8.2, 7.6], cap: 1.2, push: 0.18 },
  { cam: [0, 0, 14], look: [0, 0, 0], fit: [6.4, 5.5], cap: 1.5, push: 0.05 },
  { cam: [0, 0, 14], look: [0, 0, 0], fit: [0, 7.0], cap: 1.2, push: 0.2 },
  { cam: [0, 6.6, 11.5], look: [0, -1.4, -5.5], fit: [0, 0], cap: 1, push: 0.12 },
  { cam: [0, 4.6, 12.5], look: [0, -1.3, 0], fit: [3.6, 5.0], cap: 1.35, push: 0.1 },
];
const STACK_BASE_Y = -2.5;
const CUTW = [0, 1, 1, 1, 1, 1, 1];   // 1 = keep the left of a wide screen clear

// ------------------------------------------------------------------ small helpers
const raw = h => new THREE.Color().setHex(parseInt(h.slice(1), 16), THREE.LinearSRGBColorSpace);
function mulberry32(a) { return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const qAxis = (x, y, z, a) => { const s = Math.sin(a / 2); return [x * s, y * s, z * s, Math.cos(a / 2)]; };
const qMul = (a, b) => [a[3] * b[0] + b[3] * a[0] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] + b[3] * a[1] + a[2] * b[0] - a[0] * b[2], a[3] * b[2] + b[3] * a[2] + a[0] * b[1] - a[1] * b[0], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const smooth01 = t => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

function hasWebGL2() {
  try { const c = document.createElement('canvas'); return !!c.getContext('webgl2'); } catch (e) { return false; }
}
function isSoftwareGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2'); if (!gl) return false;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return /swiftshader|llvmpipe|software/i.test(String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER)));
  } catch (e) { return false; }
}

// ------------------------------------------------------------------ shaders
const VERT = /* glsl */`
  #define NT ${NT_MAX}
  attribute vec4 aMeta;     // seed, isTile, tileIndex (-1 for slips), -
  attribute vec4 aRand;
  attribute vec2 aSize;
  attribute vec4 aAtlas;    // uv rectangle in its atlas
  attribute vec3 aTint;
  uniform sampler2D uT0, uT1, uT2;
  uniform int uFA, uFB;
  uniform float uT, uTime, uIntro;
  uniform vec4 uTiltQ;
  uniform vec2 uLane; uniform float uLaneP, uCut, uCutW;
  uniform float uLift[NT];
  uniform vec3 uPO[8], uPD[8]; uniform float uPS[8]; uniform float uPushK, uPushR;
  uniform vec3 uCam; uniform float uEdgeK[7];
  varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying float vDist; varying float vDim; varying vec2 vSz; varying float vEdgeK;
  flat varying float vKind; flat varying vec4 vAtlas; varying vec3 vTint;

  struct F { vec3 p; vec4 q; vec2 s; float curv; float fr; float dim; };

  vec4 qmul(vec4 a, vec4 b){ return vec4(a.w*b.xyz + b.w*a.xyz + cross(a.xyz, b.xyz), a.w*b.w - dot(a.xyz, b.xyz)); }
  vec3 qrot(vec4 q, vec3 v){ return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
  vec4 qaxis(vec3 ax, float a){ return vec4(ax * sin(a * 0.5), cos(a * 0.5)); }
  vec4 qslerp(vec4 a, vec4 b, float t){
    float d = dot(a, b); if (d < 0.0) { b = -b; d = -d; }
    if (d > 0.9995) return normalize(mix(a, b, t));
    float th = acos(d), s = sin(th);
    return a * (sin((1.0 - t) * th) / s) + b * (sin(t * th) / s);
  }

  F evalF(int f, int id){
    vec4 a = texelFetch(uT0, ivec2(id, f), 0);
    vec4 b = texelFetch(uT1, ivec2(id, f), 0);
    vec4 c = texelFetch(uT2, ivec2(id, f), 0);
    F r; r.p = a.xyz; r.q = vec4(0.0, 0.0, 0.0, 1.0); r.s = c.xy; r.fr = c.z; r.dim = c.w; r.curv = 0.0;
    if (f == 0) {                       // storm: tilted ring. a.x radius, a.y height, a.z start angle, a.w angular speed
      float th = a.z + a.w * uTime;
      float br = 1.0 + 0.05 * sin(uTime * 0.6 + a.z) + 0.03 * sin(uTime * 0.27 + aRand.x * 6.28);
      float y2 = a.y * (1.0 + 0.12 * sin(uTime * 0.5 + a.z * 0.5)) + 0.22 * sin(th * 3.0 + uTime * 0.45 + aRand.y * 6.28);
      float r2 = a.x * br;
      vec3 p = vec3(r2 * cos(th), y2, r2 * sin(th));
      vec4 q = qaxis(vec3(0.0, 1.0, 0.0), -(th + 1.5708));   // long axis along the orbit
      float roll = (aRand.y - 0.5) * 1.5 + 0.8 * sin(uTime * (0.5 + 1.1 * aRand.z) + aRand.w * 30.0);
      q = qmul(q, qaxis(vec3(1.0, 0.0, 0.0), roll));
      q = qmul(q, qaxis(vec3(0.0, 1.0, 0.0), 0.5 * sin(uTime * 0.9 * (0.5 + aRand.x) + aRand.z * 20.0)));
      q = qmul(q, qaxis(vec3(0.0, 0.0, 1.0), 0.35 * sin(uTime * 1.9 + aRand.w * 30.0)));
      r.p = qrot(uTiltQ, p); r.q = qmul(uTiltQ, q);
    } else if (f == 1) {                // columns: a.x axis x, a.y height, a.z radius, a.w angle, b.x turn speed
      float th = a.w + b.x * uTime;
      r.p = vec3(a.x + a.z * cos(th), a.y, a.z * sin(th));
      r.q = qmul(qaxis(vec3(0.0, 1.0, 0.0), 1.5708 - th), qaxis(vec3(1.0, 0.0, 0.0), 0.28));
    } else if (f == 4) {                // lanes: a.x queue slot, a.y lane y, a.z depth, a.w speed; single file, wraps offscreen
      float xx = mod(a.x * uLaneP + a.w * uTime, uLaneP);
      float x = uLane.x + xx;
      r.p = vec3(x, a.y, a.z);
      r.q = b;
      r.s *= smoothstep(0.0, 0.35, xx) * (1.0 - smoothstep(uLane.y + 0.2, uLane.y + 0.7, x));
    } else {
      r.curv = a.w; r.q = b;
      if (f == 3) r.p.y += (aMeta.y > 0.5 ? 0.03 : 0.012) * sin(uTime * 0.7 + aMeta.x * 30.0);
    }
    return r;
  }

  // fly from a to b: own arc, tumble in flight, land square
  F blendF(F a, F b, float e, float len){
    F o; float arc = sin(3.14159 * e);
    float amp = 0.4 + 0.13 * min(len, 8.0);
    o.p = mix(a.p, b.p, e) + arc * amp * vec3((aRand.x - 0.5) * 2.0, (aRand.y - 0.5) * 2.0, 0.5 + aRand.z);
    vec3 ax = normalize(aRand.wxy * 2.0 - 1.0 + vec3(0.001));
    o.q = qmul(qaxis(ax, arc * (3.0 + 4.0 * aRand.w)), qslerp(a.q, b.q, e));
    o.s = mix(a.s, b.s, e) * (1.0 + 0.1 * arc);
    o.curv = mix(a.curv, b.curv, e);
    o.fr = max(mix(a.fr, b.fr, e), arc);
    o.dim = mix(a.dim, b.dim, e);
    return o;
  }

  void main(){
    int id = gl_InstanceID;
    float seed = aMeta.x;
    F A = evalF(uFA, id);
    F C = A;
    if (uT > 0.0) {
      F B = evalF(uFB, id);
      float sweep = clamp(0.5 + ((A.p.x + B.p.x) * 0.5 + 0.3 * (A.p.y + B.p.y) * 0.5) / 20.0, 0.0, 1.0);
      float delay = 0.4 * mix(seed, sweep, 0.55);
      float loc = clamp((uT - delay) / 0.6, 0.0, 1.0);
      C = blendF(A, B, loc * loc * (3.0 - 2.0 * loc), length(B.p - A.p));
    }
    if (uIntro < 1.0) {
      F S = evalF(6, id);
      float dI = 0.4 * mix(aRand.z, clamp(length(C.p.xy) / 6.0, 0.0, 1.0), 0.5);
      float loc = clamp((uIntro - dI) / 0.6, 0.0, 1.0);
      C = blendF(S, C, loc * loc * (3.0 - 2.0 * loc), length(C.p - S.p));
    }
    // formations 1 to 6 keep the left of a wide screen clear for the page text
    { vec4 cc = projectionMatrix * modelViewMatrix * vec4(C.p, 1.0);
      C.s *= mix(1.0, smoothstep(uCut - 0.07, uCut, cc.x / cc.w), uCutW); }
    // a lifted site tile comes toward the camera and grows
    float lift = 0.0;
    if (aMeta.z >= 0.0) { lift = uLift[int(aMeta.z)]; C.p += normalize(uCam - C.p) * 0.9 * lift; C.s *= 1.0 + 0.12 * lift; }
    // pointer: slips near any recent pointer ray are pushed away and drift back as the trail fades
    float twist = 0.0; vec3 push = vec3(0.0);
    for (int k = 0; k < 8; k++) {
      float st = uPS[k];
      if (st > 0.001) {
        vec3 d = uPD[k]; vec3 v = C.p - (uPO[k] + d * dot(C.p - uPO[k], d));
        float dist = length(v), fo = smoothstep(uPushR, 0.0, dist) * st;
        push += v / (dist + 1e-3) * fo; twist += fo;
      }
    }
    C.p += push * uPushK * 1.1;
    C.q = qmul(qaxis(normalize(aRand.yzw * 2.0 - 1.0 + vec3(0.001)), twist * uPushK * 1.3), C.q);

    vec2 dm = aSize * C.s;
    float lx = position.x * dm.x, ly = position.y * dm.y;
    float cA = 0.5 * C.curv + C.fr * (aRand.x - 0.5) * 1.6;
    float cB = C.fr * (aRand.y - 0.5) * 0.9;
    float cC = C.fr * (aRand.z - 0.5) * 0.9;
    float ph = uTime * (2.0 + 3.0 * aRand.w) + seed * 40.0;
    float D = C.fr * 0.05, FQ = 5.0;
    float z = cA * lx * lx + cB * ly * ly + cC * lx * ly + D * sin(FQ * ly + ph);
    vec3 nL = normalize(vec3(-(2.0 * cA * lx + cC * ly), -(2.0 * cB * ly + cC * lx + D * FQ * cos(FQ * ly + ph)), 1.0));
    vec3 wp = C.p + qrot(C.q, vec3(lx, ly, z));
    vN = qrot(C.q, nL);
    vP = wp; vUv = uv; vKind = aMeta.y; vAtlas = aAtlas; vTint = aTint; vDim = C.dim; vSz = dm;
    vEdgeK = mix(uEdgeK[uFA], uEdgeK[uFB], smoothstep(0.0, 1.0, uT));
    vec4 mv = modelViewMatrix * vec4(wp, 1.0);
    vDist = length(mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;

const FRAG = /* glsl */`
  uniform sampler2D uAtlasS, uAtlasT;
  uniform vec3 uGround, uLight, uLamp; uniform vec2 uFog; uniform float uMorn;
  varying vec2 vUv; varying vec3 vN; varying vec3 vP; varying float vDist; varying float vDim; varying vec2 vSz; varying float vEdgeK;
  flat varying float vKind; flat varying vec4 vAtlas; varying vec3 vTint;
  void main(){
    bool front = gl_FrontFacing;
    vec3 n = normalize(vN); if (!front) n = -n;
    vec2 auv = mix(vAtlas.xy, vAtlas.zw, vUv);
    bool tile = vKind > 0.5;
    vec3 face = tile ? texture2D(uAtlasT, auv, -0.5).rgb : texture2D(uAtlasS, auv).rgb;
    vec3 paper = front ? face * vTint : vTint * 0.84;
    if (!front) {                                         // back: faint ruled print and a margin line
      float yy = vUv.y * vSz.y * 16.0;
      float rule = 1.0 - smoothstep(0.0, 0.07, abs(fract(yy) - 0.5));
      float marg = 1.0 - smoothstep(0.0, 0.012, abs(vUv.x - 0.16));
      paper *= 1.0 - 0.09 * rule * step(0.1, vUv.y) - 0.07 * marg;
      if (tile) paper = vec3(0.9, 0.88, 0.84);
    }
    vec3 V = normalize(cameraPosition - vP);
    float nl = dot(n, uLight);
    float diff = clamp(nl * 0.5 + 0.5, 0.0, 1.0); diff *= diff;
    float sheen = pow(max(dot(reflect(-uLight, n), V), 0.0), 18.0) * 0.07;
    float lamp = mix(0.74 + 0.5 * smoothstep(12.0, 0.0, distance(vP, uLamp)), 1.0, uMorn);
    vec3 lit = vec3(0.44 + 0.84 * diff) * lamp;
    lit = tile ? mix(vec3(1.0), lit, 0.22) : lit;
    vec3 col = paper * lit * vDim + sheen * vDim;
    if (!front) col *= 0.9;
    col *= tile ? mix(1.0, 0.94, uMorn) : mix(1.0, 0.83, uMorn);
    float edge = smoothstep(0.0, 0.013, min(min(vUv.x, 1.0 - vUv.x) * vSz.x, min(vUv.y, 1.0 - vUv.y) * vSz.y));
    col *= 1.0 - (0.05 + 0.38 * uMorn) * vEdgeK * (1.0 - edge);
    col *= 1.0 - 0.10 * uMorn * (1.0 - vUv.y);
    gl_FragColor = vec4(mix(col, uGround, smoothstep(uFog.x, uFog.y, vDist)), 1.0);
  }`;

// the "implied desk": a warm lamp pool at night and soft contact shadows under the stacks
const DESK_VERT = /* glsl */`
  varying vec2 vXZ;
  void main(){ vXZ = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, 0.0, -position.y, 1.0); }`;
const DESK_FRAG = /* glsl */`
  varying vec2 vXZ;
  uniform float uD2, uD6, uMorn, uTall; uniform vec3 uGround;
  float box(vec2 p, vec2 c, vec2 hs, float soft){ vec2 d = abs(p - c) - hs; float s = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); return 1.0 - smoothstep(-soft, soft * 2.5, s); }
  void main(){
    vec2 p = vXZ;                       // x, z in model space
    float sh = 0.0;
    sh = max(sh, uD2 * max(box(p, vec2(-2.5 + 0.22, 0.24), vec2(0.55, 0.71), 0.16), max(box(p, vec2(0.22, 0.24), vec2(0.55, 0.71), 0.2), box(p, vec2(2.5 + 0.3, 0.3), vec2(0.55, 0.71), 0.26))));
    sh = max(sh, uD6 * box(p, vec2(0.22, 0.2), vec2(0.8, 1.03), 0.28));
    float pool = smoothstep(10.0, 0.0, length(p * vec2(1.0, 1.25))) * 0.5 * (1.0 - uMorn) * max(uD2, uD6);
    vec3 rgb = mix(vec3(0.24, 0.185, 0.115), vec3(0.03, 0.025, 0.02), sh);
    float a = max(pool, sh * mix(0.55, 0.22, uMorn));
    gl_FragColor = vec4(rgb, a);
  }`;

// ------------------------------------------------------------------ atlas drawing
function wrapLines(ctx, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
function fitText(ctx, text, maxW, maxLines, start, min, weight, family) {
  for (let s = start; s >= min; s -= 2) {
    ctx.font = `${weight} ${s}px ${family}`;
    const L = wrapLines(ctx, text, maxW); if (L.length <= maxLines) return { lines: L, size: s };
  }
  ctx.font = `${weight} ${min}px ${family}`;
  return { lines: wrapLines(ctx, text, maxW).slice(0, maxLines), size: min };
}
function drawSlipDesign(ctx, shape, j, x, y, w, h, text, DISP, SANS) {
  const pad = Math.round(Math.min(w, h) * 0.07) + 6;
  ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = INK; ctx.strokeStyle = INK; ctx.textBaseline = 'top';
  const line = (x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  const label = ['MESSAGE', 'NOTE', 'INVOICE', 'APPOINTMENT'][shape];
  ctx.font = `600 ${shape === 0 ? 15 : 19}px ${SANS}`; ctx.fillText(label, pad, pad);
  const ly = pad + (shape === 0 ? 26 : 32);
  ctx.lineWidth = j % 2 ? 7 : 4; line(pad, ly, w - pad, ly);
  if (j >= 2) { ctx.lineWidth = 1.5; line(pad, ly + 11, w - pad, ly + 11); }
  const big = fitText(ctx, text, w - 2 * pad, shape === 0 ? 6 : shape === 3 ? 3 : 4, shape === 3 ? 50 : shape === 0 ? 32 : 54, 20, 600, DISP);
  ctx.font = `600 ${big.size}px ${DISP}`;
  let cy = ly + 24; const lh = big.size * 1.1;
  for (const l of big.lines) { ctx.fillText(l, pad, cy); cy += lh; }
  cy += 14;
  const bottom = h - pad - (shape === 3 ? 54 : 74);
  const step = shape === 0 ? 30 : 34;
  ctx.lineWidth = 1.6; ctx.globalAlpha = 0.75;
  for (let yy = cy; yy < bottom; yy += step) line(pad, yy, w - pad, yy);
  ctx.globalAlpha = 1;
  if (shape === 2) { ctx.lineWidth = 1.4; ctx.globalAlpha = 0.6; const cx = pad + (w - 2 * pad) * 0.62; line(cx, cy, cx, bottom); ctx.globalAlpha = 1; }
  const by = h - pad - (shape === 3 ? 44 : 62);
  if (j === 0) {                                          // checkbox row
    ctx.lineWidth = 3; for (let k = 0; k < (shape === 0 ? 2 : 3); k++) ctx.strokeRect(pad + k * (shape === 0 ? 40 : 64), by + 6, 30, 30);
  } else if (j === 1) {                                   // rotated stamp outline
    ctx.save(); ctx.translate(w * 0.5, by + 22); ctx.rotate(-0.14); ctx.lineWidth = 4;
    const word = ['', 'OVERDUE', 'FOLLOW UP', 'PENDING'][1 + (shape % 3)], sw = Math.min(w - 2 * pad - 8, shape === 0 ? 150 : 230);
    ctx.font = `700 ${shape === 0 ? 20 : 26}px ${SANS}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.strokeRect(-sw / 2, -24, sw, 48); ctx.lineWidth = 1.5; ctx.strokeRect(-sw / 2 + 5, -19, sw - 10, 38); ctx.fillText(word, 0, 2); ctx.restore();
  } else if (j === 2) {                                   // barcode strip
    let bx = pad; const rr = mulberry32(shape * 17 + 3);
    while (bx < w - pad - 4) { const bw = 2 + Math.floor(rr() * 5); ctx.fillRect(bx, by + 2, bw, 40); bx += bw + 2 + Math.floor(rr() * 4); }
  } else {                                                // total box with signature rule
    ctx.lineWidth = 3; ctx.strokeRect(w - pad - 120, by, 120, 40); ctx.lineWidth = 1.5; line(pad, by + 40, w - pad - 140, by + 40);
  }
  ctx.restore();
}

// ------------------------------------------------------------------ scene
export async function createScene(canvas, opts = {}) {
  if (!hasWebGL2()) return null;
  const sites = (opts.sites || []).slice(0, NT_MAX);
  const lines = opts.slips && opts.slips.length ? opts.slips : ['Loose ends'];
  const reduced = !!opts.reducedMotion;
  const q = opts;
  const soft = isSoftwareGL();
  const lowEnd = q.tier ? q.tier === 'low' : (soft || matchMedia('(pointer:coarse)').matches || (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 8) <= 4);
  const tier = lowEnd ? 'low' : 'desktop';
  const N = lowEnd ? 900 : 2600;
  const T = sites.length;
  const PR_CAP = lowEnd ? 1.25 : 1.5;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.info.autoReset = false;
  const nightC = raw(NIGHT), morningC = raw(MORNING), ground = nightC.clone();
  renderer.setClearColor(ground, 1);

  // ---- fonts
  const DISP = '"Funnel Display", sans-serif', SANS = '"Funnel Sans", sans-serif';
  try {
    const specs = [['Funnel Display', '600 48px "Funnel Display"', 'FunnelDisplay.ttf'], ['Funnel Sans', '600 24px "Funnel Sans"', 'FunnelSans.ttf']];
    for (const [fam, spec, file] of specs) {
      let ok = (await document.fonts.load(spec)).length > 0;
      if (!ok) { const ff = new FontFace(fam, `url(${new URL('./fonts/' + file, import.meta.url)})`, { weight: '300 800' }); await ff.load(); document.fonts.add(ff); }
    }
    await document.fonts.load('600 48px "Funnel Display"'); await document.fonts.load('600 24px "Funnel Sans"');
  } catch (e) { /* draw with sans-serif */ }

  // ---- slip atlas: 16 printed designs on a 2048 canvas (cells of 512; four designs per shape)
  const CELL = 512, SA = 2048;
  const slipCanvas = document.createElement('canvas'); slipCanvas.width = slipCanvas.height = SA;
  const sctx = slipCanvas.getContext('2d');
  sctx.fillStyle = '#fff'; sctx.fillRect(0, 0, SA, SA);
  const designRect = [];
  for (let d = 0; d < 16; d++) {
    const shape = d >> 2, j = d & 3, sh = SHAPES[shape], asp = sh.w / sh.h;
    const rw = asp <= 1 ? Math.round(CELL * asp) : CELL, rh = asp <= 1 ? CELL : Math.round(CELL / asp);
    const x0 = (d % 4) * CELL, y0 = Math.floor(d / 4) * CELL;
    drawSlipDesign(sctx, shape, j, x0, y0, rw, rh, lines[(d * 5 + shape) % lines.length], DISP, SANS);
    const ins = 3;
    designRect.push([(x0 + ins) / SA, 1 - (y0 + rh - ins) / SA, (x0 + rw - ins) / SA, 1 - (y0 + ins) / SA]);
  }
  const slipTex = new THREE.CanvasTexture(slipCanvas);
  slipTex.colorSpace = THREE.NoColorSpace; slipTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  slipTex.generateMipmaps = true; slipTex.minFilter = THREE.LinearMipmapLinearFilter;

  // ---- site atlas: 4 x 5 cells of 512 x 320; name first, screenshot over it on load
  const SCW = lowEnd ? 512 : 640, SCH = lowEnd ? 320 : 400, SW = SCW * 4, SH = SCH * 5;
  const siteCanvas = document.createElement('canvas'); siteCanvas.width = SW; siteCanvas.height = SH;
  const tctx = siteCanvas.getContext('2d');
  tctx.fillStyle = '#f3f0e8'; tctx.fillRect(0, 0, SW, SH);
  const siteRect = [];
  sites.forEach((s, i) => {
    const x0 = (i % 4) * SCW, y0 = Math.floor(i / 4) * SCH;
    tctx.fillStyle = '#f3f0e8'; tctx.fillRect(x0, y0, SCW, SCH);
    tctx.strokeStyle = INK; tctx.lineWidth = 3; tctx.strokeRect(x0 + 14, y0 + 14, SCW - 28, SCH - 28);
    tctx.fillStyle = INK; tctx.textBaseline = 'middle'; tctx.textAlign = 'center';
    const ft = fitText(tctx, s.name, SCW - 80, 3, 52, 24, 600, DISP);
    tctx.font = `600 ${ft.size}px ${DISP}`;
    ft.lines.forEach((l, k) => tctx.fillText(l, x0 + SCW / 2, y0 + SCH / 2 + (k - (ft.lines.length - 1) / 2) * ft.size * 1.15));
    tctx.textAlign = 'left';
    const ins = 2;
    siteRect.push([(x0 + ins) / SW, 1 - (y0 + SCH - ins) / SH, (x0 + SCW - ins) / SW, 1 - (y0 + ins) / SH]);
  });
  const siteTex = new THREE.CanvasTexture(siteCanvas);
  siteTex.colorSpace = THREE.NoColorSpace; siteTex.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  siteTex.generateMipmaps = true; siteTex.minFilter = THREE.LinearMipmapLinearFilter;
  let siteDirty = false, destroyed = false, requestRender = () => {};
  sites.forEach((s, i) => {
    if (!s.img) return;
    const im = new Image(); im.decoding = 'async';
    im.onload = () => {
      if (destroyed) return;
      tctx.drawImage(im, (i % 4) * SCW, Math.floor(i / 4) * SCH, SCW, SCH); siteDirty = true; requestRender();
    };
    im.onerror = () => {};
    im.src = s.img;
  });

  // ---- per-instance data
  const rnd = mulberry32(20261121);
  const pick = (arr) => { let r = rnd(), a = 0; for (const [v, w] of arr) { a += w; if (r < a) return v; } return arr[0][0]; };
  const shapeOf = new Uint8Array(N), baseW = new Float32Array(N), baseH = new Float32Array(N);
  const meta = new Float32Array(N * 4), rand = new Float32Array(N * 4), size = new Float32Array(N * 2), atlas = new Float32Array(N * 4), tint = new Float32Array(N * 3);
  const invoices = [];
  for (let i = 0; i < N; i++) {
    const tile = i < T;
    let shape = 4;
    if (!tile) { let r = rnd(), a = 0; shape = 0; for (let k = 0; k < 4; k++) { a += SHAPE_WEIGHTS[k]; if (r < a) { shape = k; break; } } }
    shapeOf[i] = shape;
    const jit = tile ? 1 : 0.93 + 0.14 * rnd();
    const dims = tile ? TILE : SHAPES[shape];
    baseW[i] = dims.w * jit; baseH[i] = dims.h * jit;
    size[i * 2] = baseW[i]; size[i * 2 + 1] = baseH[i];
    meta.set([rnd(), tile ? 1 : 0, tile ? i : -1, 0], i * 4);
    rand.set([rnd(), rnd(), rnd(), rnd()], i * 4);
    if (tile) { atlas.set(siteRect[i], i * 4); tint.set([1, 1, 1], i * 3); }
    else {
      atlas.set(designRect[shape * 4 + Math.floor(rnd() * 4)], i * 4);
      const c = raw(pick(TINTS.map(([h, w]) => [h, w]))); tint.set([c.r, c.g, c.b], i * 3);
      if (shape === 2) invoices.push(i);
    }
  }
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 0.75;

  const d0 = new Float32Array(NF * N * 4), d1 = new Float32Array(NF * N * 4), d2 = new Float32Array(NF * N * 4);
  for (let f = 0; f < NF; f++) for (let i = 0; i < N; i++) { d1[(f * N + i) * 4 + 3] = 1; d2.set([1, 1, 0, 1], (f * N + i) * 4); }
  const put = (f, i, p, qt, s) => {
    const o = (f * N + i) * 4;
    if (p) d0.set(p, o); if (qt) d1.set(qt, o); if (s) d2.set(s, o);
  };

  // 0 storm: a tilted ring with a sparse core, one orbit direction, speed falling with radius; a few slips on wide orbits pass near and far
  for (let i = 0; i < N; i++) {
    const u = rnd(); let r, y;
    if (u < 0.04) { r = 8 + 3 * rnd(); y = (rnd() - 0.5) * 3; }
    else if (u < 0.50) { r = 1.5 + 2.1 * rnd(); y = gauss() * 0.5; }
    else { r = Math.max(3.6, 4.6 + gauss() * 0.3); y = gauss() * 0.2; }
    put(0, i, [r, y, rnd() * Math.PI * 2, 1.1 / (r + 2) * (0.94 + 0.12 * rnd())], null, [1, 1, 1, 1]);
  }
  // 1 columns: slips on a regular helical lattice, upright and facing outward, like a card index wound round a post
  {
    const order = shuffle([...Array(N).keys()]), oms = [0.2, -0.16, 0.18];
    for (let c = 0; c < 3; c++) {
      const ids = order.filter((_, n) => n % 3 === c), q = Math.round(Math.sqrt(ids.length * 0.375)), R = Math.ceil(ids.length / q);
      ids.forEach((i, k) => {
        const r = Math.floor(k / q), jj = k % q, s = Math.min(0.30 / baseH[i], 0.2 / baseW[i]);
        put(1, i, [(c - 1) * 3.0, -3.5 + 7.0 * r / Math.max(1, R - 1), 0.74, Math.PI * 2 * jj / q + r * Math.PI * 2 / q * 0.33], [oms[c], 0, 0, 0], [s, s, 0, 1]);
      });
    }
  }
  // stacks helper: invoices go on top so the visible faces are not stretched
  const buildStack = (f, ids, cx, cz, fw, fh, thick, yawJit, posJit, y0) => {
    // ids ordered bottom to top
    ids.forEach((i, k) => {
      const yaw = (rnd() - 0.5) * 2 * yawJit, tilt = (rnd() - 0.5) * 2 * yawJit * 0.15;
      const qt = qMul(qAxis(0, 1, 0, yaw), qMul(qAxis(1, 0, 0, -HALF_PI + tilt), qAxis(0, 0, 1, 0)));
      put(f, i, [cx + (rnd() - 0.5) * 2 * posJit, y0 + (k + 0.5) * thick, cz + (rnd() - 0.5) * 2 * posJit, 0], qt,
        [fw / baseW[i] * (1 + (rnd() - 0.5) * 0.01), fh / baseH[i] * (1 + (rnd() - 0.5) * 0.01), 0, 1]);
    });
  };
  const invPool = shuffle(invoices.slice());
  const stackIds = (count, topN, used) => {
    const top = []; while (top.length < topN && invPool.length) { const v = invPool.pop(); top.push(v); }
    return { top, count };
  };
  const allocate = (counts, topN) => {
    // reserve top-layer invoices for each stack, then deal the rest out at random
    const tops = counts.map(() => []);
    counts.forEach((c, s) => { while (tops[s].length < topN && invPool.length) tops[s].push(invPool.pop()); });
    const rest = shuffle([...Array(N).keys()].filter(i => !tops.some(t => t.includes(i))));
    return counts.map((c, s) => { const need = c - tops[s].length; return rest.splice(0, need).concat(tops[s]); });
  };
  // 2 three stacks (short, medium, tall)
  {
    const tallH = 5.0, counts = [Math.round(N * 0.2), Math.round(N * 0.3)]; counts.push(N - counts[0] - counts[1]);
    const thick = tallH / counts[2];
    const groups = allocate(counts, 24);
    groups.forEach((ids, s) => buildStack(2, ids, (s - 1) * 2.5, 0, 1.1, 1.42, thick, 0.03, 0.012, STACK_BASE_Y));
  }
  // 3 wall: tiles in a 4 x 5 grid, bent like a section of a cylinder; the rest a far, larger, faint wall
  const wallTiles = []; let laneP = 60;
  {
    const cols = 4, pitchX = 1.42, pitchY = 0.94, R = 20, cells = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) cells.push([(c - 1.5) * pitchX, (2 - r) * pitchY]);
    // 17 tiles in 20 cells: four full rows, the last tile at the left of the fifth row
    const slots = cells.slice(0, Math.min(16, T)); if (T > 16) slots.push([-1.5 * pitchX, (2 - 4) * pitchY]); if (T > 17) { slots.length = 16; for (let r = 4; r < 5; r++) for (let c = 0; c < T - 16; c++) slots.push([(c - (T - 17) / 2) * pitchX, (2 - r) * pitchY]); }
    for (let i = 0; i < T; i++) {
      const [x, y] = slots[i], phi = x / R;
      wallTiles.push({ p: [R * Math.sin(phi), y, R * (1 - Math.cos(phi))], yaw: -phi });
      put(3, i, [R * Math.sin(phi), y, R * (1 - Math.cos(phi)), 1 / R], qAxis(0, 1, 0, -phi), [1, 1, 0, 1]);
    }
    const M = N - T, wc = Math.round(Math.sqrt(M * 1.55)), wr = Math.ceil(M / wc), px = 0.62, py = 0.42, Rb = 16, z0 = -13;
    const ids = shuffle([...Array(M).keys()].map(k => k + T));
    ids.forEach((i, k) => {
      const c = k % wc, r = Math.floor(k / wc), x = (c - (wc - 1) / 2) * px, y = ((wr - 1) / 2 - r) * py, phi = x / Rb;
      const s = 0.88 * Math.min(px / baseW[i], py / baseH[i]);
      put(3, i, [Rb * Math.sin(phi), y, z0 + Rb * (1 - Math.cos(phi)), 1 / Rb], qAxis(0, 1, 0, -phi), [s, s, 0.08, 0.36]);
    });
  }
  // 4 lanes: six single-file queues, upright, one yaw, one speed; slot spacing 0.15 gives the small overlap
  {
    const lanes = [[], [], [], [], [], []];
    shuffle([...Array(N).keys()]).forEach((i, n) => lanes[n % 6].push(i));
    const maxLen = Math.max(...lanes.map(l => l.length)), qt = qAxis(0, 1, 0, 0.4);
    laneP = maxLen * 0.15;
    lanes.forEach((ids, l) => ids.forEach((i, k) => {
      const s = Math.min(0.6 / baseH[i], 0.5 / baseW[i]);
      put(4, i, [k / maxLen, (l - 2.5) * 1.1, k * 0.0007, 0.7], qt, [s, s, 0, 1]);
    }));
  }
  // 5 grid: every slip flat in one perfect grid, receding
  {
    const C = Math.round(Math.sqrt(N * 1.05)), pitch = 0.56, z0 = 4.5;
    const flat = qAxis(1, 0, 0, -HALF_PI);
    shuffle([...Array(N).keys()]).forEach((i, k) => {
      const c = k % C, r = Math.floor(k / C), s = 0.86 * Math.min(pitch / baseW[i], pitch / baseH[i]);
      put(5, i, [(c - (C - 1) / 2) * pitch, 0, z0 - r * pitch, 0], flat, [s, s, 0, 1]);
    });
  }
  // 6 one stack, low in the frame
  {
    const ids = allocate([N], 40)[0], H = 2.3;
    buildStack(6, ids, 0, 0, 1.55, 2.0, H / N, 0.006, 0.004, STACK_BASE_Y);
  }

  function dataTex(a) { const t = new THREE.DataTexture(a, N, NF, THREE.RGBAFormat, THREE.FloatType); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; }
  const tex0 = dataTex(d0), tex1 = dataTex(d1), tex2 = dataTex(d2);

  // ---- geometry: one lightly subdivided plane, instanced
  const SX = 8, SY = 4, gp = [], gu = [], gi = [];
  for (let y = 0; y <= SY; y++) for (let x = 0; x <= SX; x++) { gp.push(x / SX - 0.5, 0.5 - y / SY, 0); gu.push(x / SX, 1 - y / SY); }
  for (let y = 0; y < SY; y++) for (let x = 0; x < SX; x++) { const a = y * (SX + 1) + x, b = a + 1, c = a + SX + 1, d = c + 1; gi.push(a, c, b, b, c, d); }
  const geo = new THREE.InstancedBufferGeometry();
  geo.setIndex(gi);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(gp, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(gu, 2));
  geo.setAttribute('aMeta', new THREE.InstancedBufferAttribute(meta, 4));
  geo.setAttribute('aRand', new THREE.InstancedBufferAttribute(rand, 4));
  geo.setAttribute('aSize', new THREE.InstancedBufferAttribute(size, 2));
  geo.setAttribute('aAtlas', new THREE.InstancedBufferAttribute(atlas, 4));
  geo.setAttribute('aTint', new THREE.InstancedBufferAttribute(tint, 3));
  geo.instanceCount = N;

  const ptrO = [], ptrD = []; for (let k = 0; k < 8; k++) { ptrO.push(new THREE.Vector3()); ptrD.push(new THREE.Vector3(0, 0, -1)); }
  const tilt = qMul(qAxis(0, 0, 1, 0.3), qAxis(1, 0, 0, 0.8));
  const fogV = new THREE.Vector2(15, 41);
  const uniforms = {
    uT0: { value: tex0 }, uT1: { value: tex1 }, uT2: { value: tex2 }, uAtlasS: { value: slipTex }, uAtlasT: { value: siteTex },
    uFA: { value: 0 }, uFB: { value: 0 }, uT: { value: 0 }, uTime: { value: 3.7 }, uIntro: { value: 1 }, uMorn: { value: 0 },
    uTiltQ: { value: new THREE.Vector4(...tilt) }, uLane: { value: new THREE.Vector2(-5, 5) }, uLaneP: { value: 60 }, uCut: { value: -0.16 }, uCutW: { value: 0 }, uLift: { value: new Float32Array(NT_MAX) },
    uPO: { value: ptrO }, uPD: { value: ptrD }, uPS: { value: new Float32Array(8) }, uPushK: { value: 0 }, uPushR: { value: 1.35 },
    uCam: { value: new THREE.Vector3(0, 0, 14) }, uEdgeK: { value: [1, 1, 0.12, 1, 1, 1, 0.12] }, uGround: { value: ground }, uFog: { value: fogV },
    uLight: { value: new THREE.Vector3(-0.45, 0.75, 0.55).normalize() }, uLamp: { value: new THREE.Vector3(-3.5, 5.5, 5.5) },
  };
  const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms, side: THREE.DoubleSide });
  const slips = new THREE.Mesh(geo, material); slips.frustumCulled = false;

  const deskU = { uD2: { value: 0 }, uD6: { value: 0 }, uMorn: uniforms.uMorn, uTall: { value: 0 }, uGround: { value: ground } };
  const deskMat = new THREE.ShaderMaterial({ vertexShader: DESK_VERT, fragmentShader: DESK_FRAG, uniforms: deskU, transparent: true, depthWrite: false });
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), deskMat);
  desk.position.y = STACK_BASE_Y - 0.01; desk.frustumCulled = false; desk.renderOrder = -1; desk.visible = false;

  const scene = new THREE.Scene(); scene.background = ground;
  scene.add(desk, slips);
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 90);

  // ---- post
  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 0 });
  composer.addPass(new RenderPass(scene, camera));
  let bloom = null, vignette = null, dof = null;
  const smaa = new SMAAEffect();
  if (lowEnd) {
    composer.addPass(new EffectPass(camera, smaa));
  } else {
    if (q.dof !== false) { dof = new DepthOfFieldEffect(camera, { worldFocusDistance: 14, worldFocusRange: 12, bokehScale: 1.15, height: 480 }); composer.addPass(new EffectPass(camera, dof)); }
    bloom = new BloomEffect({ mipmapBlur: true, luminanceThreshold: 0.9, luminanceSmoothing: 0.1, intensity: 0.32, radius: 0.55 });
    vignette = new VignetteEffect({ offset: 0.3, darkness: 0.62 });
    const noise = new NoiseEffect({ premultiply: true }); noise.blendMode.opacity.value = 0.06;
    composer.addPass(new EffectPass(camera, smaa, bloom, vignette, noise));
  }

  // ---- state
  const listeners = { sitehover: [], siteclick: [] };
  const emit = (n, v) => { for (const fn of listeners[n] || []) { try { fn(v); } catch (e) { /* page handler errors stay the page's */ } } };
  let W = 1, H = 1, aspect = 1;
  let target = 0, cur = 0, vel = 0, firstSet = true;
  const t0 = performance.now();
  let introStart = reduced ? -1e9 : t0, introDone = reduced;
  const INTRO = 1800;
  let S = [1, 1, 1, 1, 1, 1, 1];
  const lift = new Float32Array(NT_MAX), liftTarget = new Float32Array(NT_MAX);
  const keyIndex = new Map(sites.map((s, i) => [s.key, i]));
  let hoverKey = null, lastFrame = t0, raf = 0;
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();

  function computeFit() {
    const visH = 2 * 14 * Math.tan(THREE.MathUtils.degToRad(17.5));
    const wide = aspect >= 1;
    const rw = wide ? 0.58 * visH * aspect * 0.92 : visH * aspect * 0.94;
    const rh = wide ? visH * 0.9 : 0.55 * visH * 0.92;
    S = FORM.map(f => {
      let s = f.cap;
      if (f.fit[0] > 0) s = Math.min(s, rw / f.fit[0]);
      if (f.fit[1] > 0) s = Math.min(s, rh / f.fit[1]);
      return s;
    });
    // lane span in model space: from just inside the content area to past the right edge
    const halfW = 14 * Math.tan(THREE.MathUtils.degToRad(17.5)) * aspect, shift = wide ? 0.42 : 0;
    uniforms.uLaneP.value = laneP; uniforms.uCut.value = -0.16;
    uniforms.uLane.value.set(((wide ? -0.1 : -1.12) - shift) * halfW / S[4], (1.14 - shift) * halfW / S[4]);
  }
  function resize() {
    W = Math.max(1, canvas.clientWidth || innerWidth); H = Math.max(1, canvas.clientHeight || innerHeight); aspect = W / H;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, PR_CAP));
    renderer.setSize(W, H, false);
    composer.setSize(W, H, false);
    camera.aspect = aspect;
    computeFit(); requestRender();
  }

  // pose from smoothed progress; also the day/night blend
  function updatePose(p) {
    const i = Math.min(5, Math.floor(p)), t = p >= 6 ? 1 : p - i, i2 = p >= 6 ? 6 : i + 1, ie = p >= 6 ? 6 : i, e = smooth01(t);
    const a = FORM[ie], b = FORM[i2];
    camPos.set(lerp(a.cam[0], b.cam[0], e), lerp(a.cam[1], b.cam[1], e), lerp(a.cam[2], b.cam[2], e));
    camLook.set(lerp(a.look[0], b.look[0], e), lerp(a.look[1], b.look[1], e), lerp(a.look[2], b.look[2], e));
    const s = lerp(S[ie], S[i2], e);
    slips.scale.setScalar(s); desk.scale.setScalar(s);
    camera.position.copy(camPos); camera.lookAt(camLook);
    const wide = aspect >= 1;
    if (wide) camera.setViewOffset(W, H, -0.21 * W, 0, W, H); else camera.setViewOffset(W, H, 0, 0.225 * H, W, H);
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    uniforms.uCam.value.copy(camPos).divideScalar(s);
    uniforms.uPushK.value = lerp(a.push, b.push, e);
    uniforms.uPushR.value = 1.35;
    const m = smooth01(clamp((p - 4.6) / 1.4, 0, 1));
    ground.copy(nightC).lerp(morningC, m);
    uniforms.uMorn.value = m;
    deskU.uD2.value = Math.max(0, 1 - Math.abs(p - 2) * 1.6);
    deskU.uD6.value = Math.max(0, 1 - Math.abs(p - 6) * 1.6);
    desk.visible = deskU.uD2.value > 0.01 || deskU.uD6.value > 0.01;
    const w3 = Math.max(0, 1 - Math.abs(p - 3) * 1.6);          // keep the wall tiles out of bloom and blur
    if (bloom) { bloom.intensity = 0.32 * (1 - m) * (1 - 0.95 * w3); bloom.luminanceMaterial.threshold = lerp(0.95, 1.6, m); }
    if (dof) dof.blendMode.opacity.value = 1 - w3;
    uniforms.uCutW.value = wide ? lerp(CUTW[ie], CUTW[i2], e) : 0;
    if (vignette) vignette.darkness = lerp(0.62, 0.2, m);
    if (dof) dof.cocMaterial.worldFocusDistance = camPos.distanceTo(camLook) - 2.0 * Math.max(0, 1 - p);   // keep the formation's centre in focus
    return s;
  }

  // ---- pointer
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let ptrHead = 0, lastMove = -1e9, lastPush = -1e9, ptrAge = new Float32Array(8).fill(1e9), pointerNdcValid = false;
  const setRay = k => {
    ray.setFromCamera(ndc, camera);
    const s = slips.scale.x;
    ptrO[k].copy(ray.ray.origin).divideScalar(s); ptrD[k].copy(ray.ray.direction);
  };
  function tileRect(i) {
    const tw = wallTiles[i]; if (!tw) return null;
    const s = slips.scale.x, c = Math.cos(tw.yaw), sn = Math.sin(tw.yaw);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; const v = new THREE.Vector3();
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const lx = sx * TILE.w / 2, ly = sy * TILE.h / 2;
      v.set(tw.p[0] + lx * c, tw.p[1] + ly, tw.p[2] - lx * sn).multiplyScalar(s).project(camera);
      x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y);
    }
    return [x0, y0, x1, y1];
  }
  function hitSite(cx, cy) {
    if (Math.abs(cur - 3) > 0.3 || !T) return null;
    const nx = cx / W * 2 - 1, ny = 1 - cy / H * 2;
    for (let i = 0; i < T; i++) { const r = tileRect(i); if (r && nx >= r[0] && nx <= r[2] && ny >= r[1] && ny <= r[3]) return sites[i].key; }
    return null;
  }
  const setCursor = on => { try { document.body.style.cursor = on ? 'pointer' : ''; } catch (e) { /* ignore */ } };
  const checkHover = (cx, cy) => {
    const k = hitSite(cx, cy);
    if (k !== hoverKey) { hoverKey = k; setCursor(!!k); emit('sitehover', k); }
  };
  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    ndc.set(cx / r.width * 2 - 1, 1 - cy / r.height * 2); pointerNdcValid = true;
    const now = performance.now(); lastMove = now;
    if (!reduced && now - lastPush > 40) {
      lastPush = now; ptrHead = (ptrHead + 1) % 8; ptrAge[ptrHead] = 0; setRay(ptrHead);
    }
    checkHover(cx, cy);
  }
  function onClick(e) {
    if (e.target && e.target.closest && e.target.closest('a,button,input,select,textarea,summary,label,dialog,[data-noscene]')) return;
    const r = canvas.getBoundingClientRect();
    const k = hitSite(e.clientX - r.left, e.clientY - r.top);
    if (k) emit('siteclick', k);
  }
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('click', onClick);

  // ---- loop
  function smoothDamp(dt) {
    const om = 2 / 0.35, x = om * dt, ex = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const change = cur - target, tmp = (vel + om * change) * dt;
    vel = (vel - om * tmp) * ex; cur = target + (change + tmp) * ex;
    if (Math.abs(cur - target) < 1e-4 && Math.abs(vel) < 1e-4) { cur = target; vel = 0; }
    cur = clamp(cur, 0, 6);
  }
  let calls = 0, frameCalls = 0;
  function frame(now) {
    const dt = Math.min(0.25, (now - lastFrame) / 1000); lastFrame = now;
    if (reduced) { cur = Math.round(target); vel = 0; } else smoothDamp(dt);
    const elapsed = (now - t0) / 1000;
    uniforms.uTime.value = reduced ? 3.7 : elapsed;
    // formation indices and blend
    const p = cur, fa = Math.min(6, Math.floor(p + 1e-6)), fb = Math.min(6, fa + 1);
    uniforms.uFA.value = fa; uniforms.uFB.value = fb; uniforms.uT.value = fa >= 6 ? 0 : clamp(p - fa, 0, 1);
    if (uniforms.uT.value < 1e-5) uniforms.uT.value = 0;
    const introT = introDone ? 1 : clamp((now - introStart) / INTRO, 0, 1);
    if (introT >= 1) introDone = true;
    uniforms.uIntro.value = introT;
    updatePose(p);
    // highlight lifts (about 0.2 s)
    const k = 1 - Math.exp(-dt * 11);
    for (let i = 0; i < NT_MAX; i++) { lift[i] += (liftTarget[i] - lift[i]) * (reduced ? 1 : k); if (Math.abs(lift[i] - liftTarget[i]) < 0.002) lift[i] = liftTarget[i]; uniforms.uLift.value[i] = lift[i]; }
    // pointer trail
    if (!reduced) {
      if (pointerNdcValid && now - lastMove < 500) { ptrAge[ptrHead] = 0; setRay(ptrHead); }
      for (let i = 0; i < 8; i++) { ptrAge[i] += dt; uniforms.uPS.value[i] = ptrAge[i] > 2.5 ? 0 : Math.exp(-ptrAge[i] / 0.85); }
    }
    if (siteDirty) { siteTex.needsUpdate = true; siteDirty = false; }
    renderer.info.reset();
    composer.render();
    frameCalls = renderer.info.render.calls;
    calls = 1 + (desk.visible ? 1 : 0);
    // a hover rectangle follows the settled wall; keep it right while the camera moves
    if (hoverKey && Math.abs(cur - 3) > 0.3) { hoverKey = null; setCursor(false); emit('sitehover', null); }
  }
  const animating = () => !reduced && !document.hidden;
  function loop(now) { raf = 0; frame(now); if (animating()) raf = requestAnimationFrame(loop); }
  let pending = 0;
  requestRender = () => {
    if (destroyed) return;
    if (reduced) { if (!pending) pending = requestAnimationFrame(t => { pending = 0; frame(t); }); }
    else if (!raf && !document.hidden) raf = requestAnimationFrame(loop);
  };
  const onVis = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else { lastFrame = performance.now(); requestRender(); } };
  document.addEventListener('visibilitychange', onVis);
  addEventListener('resize', resize);
  resize();
  if (reduced) { frame(performance.now()); } else requestRender();

  // ---- API
  const api = {
    setProgress(x) {
      x = clamp(+x || 0, 0, 6);
      target = x;
      if (firstSet) { cur = x; vel = 0; firstSet = false; }
      requestRender();
    },
    setFormation(i) {
      i = clamp(Math.round(+i || 0), 0, 6);
      target = cur = i; vel = 0; firstSet = false; introDone = true;
      requestRender();
    },
    highlightSite(key) {
      liftTarget.fill(0);
      if (key != null && keyIndex.has(key)) liftTarget[keyIndex.get(key)] = 1;
      requestRender();
    },
    on(name, fn) { if (listeners[name] && typeof fn === 'function') listeners[name].push(fn); return api; },
    resize,
    destroy() {
      destroyed = true; cancelAnimationFrame(raf); cancelAnimationFrame(pending);
      removeEventListener('pointermove', onMove); removeEventListener('click', onClick); removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis); setCursor(false);
      geo.dispose(); material.dispose(); desk.geometry.dispose(); deskMat.dispose();
      tex0.dispose(); tex1.dispose(); tex2.dispose(); slipTex.dispose(); siteTex.dispose();
      composer.dispose(); renderer.dispose();
    },
    info() { return { tier, instances: N, drawCalls: calls, frameCalls, post: true, dof: !!dof }; },
  };
  return api;
}
