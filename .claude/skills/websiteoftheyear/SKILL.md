---
name: websiteoftheyear
description: Design and build websites to the standard of the 2020–2026 "website of the year" winners (Awwwards Site/Developer/E-commerce/Users' Choice of the Year, Agency/Studio/Independent of the Year, CSS Design Awards WOTY, Webby Best Visual Design, FWA), reverse-engineered into a workflow, jury checklist, agency playbook and code recipes. Use when the user says /websiteoftheyear, or asks for an award-winning, Awwwards-level, "site of the day", immersive, WebGL/3D, agency-grade or "make it look like Lusion / Immersive Garden / Locomotive / Obys / Active Theory / Igloo / Lando Norris" site, a studio or personal portfolio that should impress designers, or wants to know what makes a site win, or to reverse-engineer a site's stack and design. Also use it to upgrade an existing landing page or portfolio to that level, even if the user doesn't name awards.
---

# Website of the Year

Distilled from about 70 annual award winners 2020–2026 (Awwwards, CSS Design Awards, Webbys) and the own sites of the studios that win Agency/Studio/Independent of the Year. The research was done 2026-11-05: winner lists, static stack fingerprints, live runtime probes, and published case studies.

## Files (read only what the step needs)

| File | When |
|---|---|
| `references/agency-playbook.md` | Any studio, agency, portfolio or personal site. **Start here for those.** 12 studio patterns with measured specs and code. |
| `references/soty-teardowns.md` | Brand, product, campaign, commerce or story sites. Per-winner breakdown 2020–2025 + how the bar moved each year. |
| `references/motion.md` | **Any motion decision.** Measured timings, staggers and easing shapes from 32 recorded winners; catalogue of loaders, reveals, hovers, cursor, scroll and transitions; code for the signature moves. |
| `references/recipes.md` | When building: Lenis+GSAP base, loader-as-scene, line reveals, transitions, DOM-synced WebGL, cursor, quality tiers, a11y layer, image sequences, sound. |
| `references/winners.md` | The canonical list: who won what, studio, URL, score. JSON versions alongside. |
| `references/fingerprints.md`, `live-probes.md` | Raw measured stack/type/colour data per site. |
| `references/agency-teardowns-sources.md` | Source links and evidence behind the playbook. |
| `scripts/fingerprint.py` | Static stack fingerprint of any URL: `python3 -I scripts/fingerprint.py <url>` |
| `scripts/shoot.mjs` | Headless verification of your build: screenshots at desktop, mobile and reduced motion, plus errors and overflow (step 5). |
| `scripts/record-motion.mjs` | Record a site in motion (real Chrome + GPU, scripted idle/hover/scroll/click, action timeline, contact sheets) to extend `motion.md`. |
| `scripts/runtime-probe.js` | Paste into a live page (browser `javascript_tool`) for real fonts, type scale, colours, libs, canvases. |

## What actually wins (the short version)

Awwwards weights **Design 40% · Usability 30% · Creativity 20% · Content 10%**, and a separate developer jury scores animations, WPO (performance), responsiveness, accessibility, semantics and markup. Across six years of winners:

1. **One signature interaction jurors remember.** Igloo's procedurally grown ice blocks, Lusion's physics ball-pit, KPR's stencil "windows" into another world, Lando's cursor-blob hero, Obys's bracketed filmstrip. Everything else on the site serves it. If you can't name the one thing, the site won't win.
2. **The loader is the first scene.** A counter, letter drop, sound gate or real-time intro flows straight into the hero. It is never a spinner followed by a fade.
3. **Type does the heavy lifting with very few moves.** Use one family, or one grotesk plus one serif display. Keep sizes few and far apart: tiny 10–14px UI next to a huge display at 8–14vw. Weight 400 almost everywhere. Custom or foundry faces (Neue Montreal, Helvetica Now, Aeonik, Neue Haas, Brier, Scout Sans), never the default system stack.
4. **Restrained palette.** Near-black and off-white plus one hot accent (`#D2FF00` Lando, `#FF5432` Scout, `#ff642f` OFF+BRAND, `#1a2ffb` Lusion v3). Keep the palette in one config shared by CSS and shaders.
5. **Motion grammar is consistent** (measured details in `motion.md`). Short exits and long arrivals; jittered, random-order text; brand-shaped masks for wipes; one actor that persists from loader to scroll. Expo/quart-out curves (`cubic-bezier(.19,1,.22,1)`, `(.165,.84,.44,1)`, in-out `(.77,0,.175,1)`), 0.5–1.2s, line-masked text reveals, smooth scroll (Lenis), real page transitions. Every animation uses the same 2–3 curves.
6. **Chrome is minimal.** Fixed corner labels instead of a nav bar, a "Menu" that opens a numbered full-screen overlay, and counters everywhere ("01 / 30", "Recent Work(07)").
7. **Engineered weight.** Bake expensive things offline (lighting, cloth, fluids, camera paths), compress (Draco/meshopt/KTX2), and use quality tiers for mobile. Messenger shipped a multiplayer game in 5.7MB initial.
8. **The bar has split.** SOTY and Developer go to GL maximalism (canvas is the site). E-commerce, Mobile and Users' Choice often go to DOM-first craft with excellent type and illustration (Opal Tadpole, Don't Board Me, Pangram Pangram, Mana Yerba Mate). Louis Paquet won Independent of the Year 2025 while his own site is a single Inter 18px text page.
9. **Accessibility is every winner's weakest score** (5.8–7.6 on the dev jury). A real DOM layer under the canvas, keyboard paths and reduced motion are the cheapest way to beat past winners.

## Workflow

### 0. Load companions
Say which you load. `design-archive` (Myles's Specimen Room: check `catalog.json` for type/palette/motion specimens before inventing), `gsap-core` / `gsap-scrolltrigger` / `gsap-timeline` for motion, `animate` for curve decisions, `animation-vocabulary` to name effects, `awesome-ai-motion` (637 effect cards) and `gl-transitions` for more effects, `animation-performance` if GL + scroll compete, `bbc-sfx` for sound, `artifact-design` if the output is an Artifact. If the brief wants an ASCII/glyph look, add `ascii-library`.

### 1. Pick the tier (decide, don't ask, unless budget is unknown and it matters)
- **A · Canvas-first.** The site is a WebGL world; the DOM is a thin overlay plus an a11y layer. Igloo, Lusion, Active Theory, Messenger, Immersive Garden. Use it for studios selling 3D/interactive work, launches with a story, and games.
- **B · DOM-first with GL accents (the default).** Real HTML layout, a canvas that follows it (image distortion, one hero object, cursor field), Lenis + GSAP, view transitions. Lando Norris, Locomotive, Noomo, Malvah. Use it for most portfolios, agencies, brands and products.
- **C · Pure craft, no GL.** Type, layout, illustration, CSS/SVG motion. Opal, Don't Board Me, Pangram, Louis Paquet, Obys's restraint. Use it for commerce, content-heavy sites, tight budgets, or when the work itself is the show.

### 2. Choose references
Studio, agency or portfolio: use the chooser table at the top of `agency-playbook.md` and pick **one primary pattern and at most one secondary**. Brand, product or campaign: pick the closest winner in `soty-teardowns.md`. Write down what you take from each (e.g. "Obys two-size type + Immersive Garden corner frame"). Mixing more than two reads as a collage.

### 3. Write the jury sheet before any code
Put it at the top of your reply or in a `JURY.md`, then build to it:
```
Concept (one line):
Signature interaction (the one thing):
Loader → hero handoff:
Type: family 1 / family 2 · sizes (≤4, far apart, in vw or clamp) · case · tracking
Palette: ink / paper / accent (hex) · shared with shaders? 
Motion: curves (2–3) · durations · reveal style · transition style · scroll · the persistent actor · the one hard cut
Chrome: corners / menu / counters
Sound: none | gated | ambient+UI
Mobile path: what degrades, what changes
Budget: KB before first interaction · tier switch
A11y: DOM layer, keyboard path, reduced motion
```

### 4. Build
- **Single-file / Artifact:** vanilla JS + GSAP + Lenis (+ three.js for tier A/B) from cdnjs/unpkg, pinned versions. Start from `recipes.md` §1.
- **Real project:** Astro (Lusion, Scout) or Nuxt (Immersive Garden, Malvah, Noomo, KPR) are the proven homes; Webflow is fine for client-editable (OFF+BRAND, Lando); Svelte + Vite for heavy GL (Igloo, Messenger). Follow the project's existing stack if there is one.
- **Read `recipes.md` §0 (pitfalls) before writing motion code.** Each pitfall there cost a test build a debug round.
- Build the content and layout in plain DOM first, then motion, then GL. A site that's beautiful with JS off is a site that survives WebGL failing.
- **No photos or reel?** This is common for a studio of one or a side-project portfolio. Don't fake a gallery. Give each project a small live procedural scene (canvas 2D is enough) drawn in the site palette and driven by the cursor, and show it in one shared stage (Obys filmstrip / bracket frame). In testing this beat stock-looking thumbnails and kept the site coherent.
- "≤4 sizes" means the text sizes: tiny UI, body, one middle size, one display. A footer email or counter reuses one of them rather than adding a fifth.
- Re-skin every borrowed pattern into this site's tokens, type and copy. Copy patterns and techniques, never another studio's assets, fonts, copy or brand. Pick fonts the user owns, or free foundry alternatives (e.g. Neue Montreal → Pangram Pangram personal-use download, licence it for clients; Helvetica Now → Inter Display/Geist; Times-style serif → Instrument Serif/Newsreader).

### 5. Self-judge like the jury, then fix the lowest score
Score 1–10 with one line of evidence each. Fix anything under 8, then re-score:
- **Design (40%):** does the type system have ≤2 families and ≤4 sizes? Do spacing and alignment hold at 375, 768, 1440 and 1920?
- **Usability (30%):** can a first-time visitor find work and contact in under 5s? Do the menu, back and close controls work by keyboard? No scroll-jacking that fights the trackpad.
- **Creativity (20%):** is the signature interaction new to this brief, not a stock demo?
- **Content (10%):** are copy and imagery specific? No lorem ipsum and no generic stock.
- **Dev:** 60fps on a mid laptop, under 3MB before first interaction, Lighthouse a11y ≥ 90, `prefers-reduced-motion` honoured, no console errors.
Verify with screenshots before claiming anything. `node scripts/shoot.mjs <index.html> <out-dir>` takes desktop, mobile and reduced-motion runs, logs console errors and horizontal overflow, and saves hero plus two mid-scroll shots each. Look at every shot. The mid-scroll ones catch fixed chrome colliding with content, and the mobile hero shot catches empty space. Use the browser pane instead when you need to hover or click.

### 6. Things that never win (avoid)
A centred hero with a gradient blob plus three feature cards. Purple-to-blue gradients. Bold weights everywhere. Five different easings. Fade-in-up on every element. A generic spinner before a fade. Particle backgrounds unrelated to the concept. A custom cursor dot that merely follows. Autoplaying sound. Glassmorphism cards as decoration. Any section you can't tie back to the concept line.

## Reverse-engineer a new site (to extend this skill)
1. `python3 -I scripts/fingerprint.py <url> --json`: framework, motion/3D libs, fonts, colours, easings, weight.
2. Open it in the browser pane at 1440×900, wait for the loader, run `scripts/runtime-probe.js` via `javascript_tool` (rendered fonts, real type scale, colours, canvases, fixed UI), then screenshot hero + one scroll. A hidden pane pauses rAF, so heavy GL loaders stall. Rely on the probe there, or ask the user to show the pane.
3. Record it in motion: `node scripts/record-motion.mjs <out> <name> <url>`, then break it down from the contact sheets and 12 fps ffmpeg strips. Recordings stall on slow loaders and modals, so check frames, not the timeline labels. Never spoof a user agent or bypass a bot check; for sites that block automation, look at them in the user's own Chrome.
4. Search for a case study: the Awwwards site page (jury sub-scores, "highlighted elements"), the agency's work page, Codrops "case study" or "behind the scenes", webgpu.com/showcase, studio Medium posts.
5. Add a section to `soty-teardowns.md` or `agency-playbook.md` in the same format, marking each fact measured / verified / inferred. Refresh `winners.md` each February when Awwwards and CSSDA announce.
