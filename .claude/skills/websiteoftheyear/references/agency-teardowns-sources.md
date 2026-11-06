# Agency site teardowns (research date 2026-11-05)

Method and confidence legend
- "VERIFIED" = read directly from the live HTML/CSS/JS bundle (curl, 2026-11-05) or from a fetched Awwwards/Codrops page.
- "inferred" = my guess from tags, minified-bundle string matches (regex hits like `WebGLRenderer`, `Lenis`, `CustomEase`; these can be false positives) or from copy.
- Interactive behaviours (hero animation, hover previews, cursor, page transitions) could NOT be observed: I fetched HTML/JS, not a rendered page. Everything about motion feel below is inferred from bundle strings unless stated. Awwwards pages shown are the version that WON, which is often an older site than today's live one; I flag when they differ.
- Only a few of these studios published a "how we built our own site" write-up. Real written build sources found: Lusion 2019 (Awwwards case study), Immersive Garden (Awwwards case study of their newer site), Bizarro (open-source repo), Active Theory (bundle + Medium tech post). Everything else is thin.
- Award facts: Awwwards Studio/Agency/Independent of the Year winners per the Awwwards annual pages (searched, partly unverified): Obys = Studio of the Year 2023 (not "Agency"), Synchronized = Studio of the Year 2022, Locomotive = Agency of the Year 2022, Malvah = Studio of the Year 2025, Immersive Garden = Studio of the Year several years (2017/18/20/24 reported, sources disagree), Resn = Agency of the Year 2017 and 2018 plus Site of the Year 2021 (Pioneer Corn) and 2023 (KPR), Abeto built Igloo Inc = Site of the Year 2024, Aristide Benoist = Independent of the Year 2023, Zhenya Rynzhuk = Independent of the Year 2020 (+ another), Luis Bizarro = Independent of the Year 2021, Jesper Landberg = Independent of the Year (2022 and/or 2024, sources conflict), Hello Monday = Agency of the Year 2013-ish (LoveDays) and later, Merci-Michel = Site of the Year 2017 (OUIGO) + Developer award 2020 (not Agency of the Year).

---

## Locomotive (locomotive.ca)
- Concept: "Digital-first design agency" in Montreal, deliberately plain, wordy, tongue-in-cheek (emoji in labels, "Freshness guaranteed").
- Homepage structure (VERIFIED from HTML text): looping hero ticker "Digital-First Design Agency / Based in Montreal, Canada" (text is staggered progressively: "Digital", "Digital-First", ... "Digital-First Design"), logo "Locomotive®", nav (Work, Agency, Careers, Store, Let's talk, Français), side meta "Montréal, Quebec", "©2008-2026", "Seven Years Running 2018-2024 The dynasty" (Agency of the Year streak brag), "Featured work" (5 items: Lightship, Wolverine Worldwide, The Drake Hotel, Dulcedo, Scout Motors, each with "Read more about this project"), "All Work – See all projects", manifesto paragraph ("Design and code are only tools of expression. What sets us apart is people."), "Always looking for top shelf talent", services paragraph, footer.
- Hero mechanic: the text-stack ticker builds a word at a time (VERIFIED the repeated progressive strings in markup); beyond that unobserved.
- Navigation: a "Menu" toggle plus inline links (Work/Agency/Careers/Let's talk/Store) and FR/EN toggle; full-screen overlay menu repeats them (VERIFIED duplicate lists).
- Project index: featured list of 5 with per-project line-break titles ("The / Drake Hotel", "Scout / Motors"), i.e. big stacked two-line titles (VERIFIED markup), link to full archive.
- Type/colour/grid: CSS custom properties `--color:#000000; --color-bg:#FFFFFF; --font-size:15px` (VERIFIED). Accent hexes seen in CSS: #DA382E, #312DFB, #da532c (the last is a favicon tile colour, ignore). Font names not exposed in HTML (loaded from bundle). Awwwards page for the 2014 version shows #000, #49c5b6, #fff but that is a different design.
- Motion: bundle contains GSAP (Power2/Power4 out, power1/2.inOut), Barba.js-style page transitions (`barba` string), Locomotive Scroll (`locomotive-scroll` string in HTML), SplitText-style splitting, three/ogl/howler strings (inferred, could be vendor noise). CSS ease `cubic-bezier(0.215,0.61,0.355,1)` (easeOutCubic) VERIFIED.
- 3D/WebGL: a canvas appears (inferred WebGL used for image distortion/hover, not confirmed).
- Sound/loader/mobile: not verified.
- Sources: https://locomotive.ca (curl), https://www.awwwards.com/sites/locomotive (2014 SOTD page), https://tympanus.net/codrops/tag/case-study/page/4 (Codrops case study "itsnotviolent.com" by Locomotive, not their own site), https://locomotive.ca/en/work/k72.
- Thin: no write-up of their own site.

## Immersive Garden (immersive-g.com)
- Concept: "Transcend anything seen or felt before by crafting unparalleled experiences for ambitious brands." Luxury-maison immersive web (Louis Vuitton VIA, Cartier, Dior).
- Structure (VERIFIED from HTML text): hero "Immersive Garden / Innovative digital experiences studio / Scroll down", "Transcend anything seen or felt before...", "Our approach", then project vignettes each with one-sentence blurb + title + type chip (Louis Vuitton VIA, David Whyte Experience, Cartier End of Year 23 [E-Shop], "Our mission", Chartogne Taillet, Cartier in Time, Aten7, Gleec [Corporate], Dior...). Each project is a mini-chapter, not a grid. Awwwards case study (below) adds a hidden "Backstage" section (technical breakdowns, design rationale, easter eggs) and 3D roman-numeral nav anchors.
- Navigation: Roman numerals rendered in 3D, each uniquely detailed, act as menu anchors; one-click access emphasis (Awwwards case study, of the newer site; the site live today may be a later revision, inferred).
- Type (VERIFIED CSS): faces `PSTimes` (serif display, custom Times) + `HelveticaNeueLight` / `HelveticaNeueRegular` + monospace. Sizes are authored in vw on a 1440 base: .972vw (14px), 1.944vw (28px), 2.5vw (36px), 3.889vw (56px). Tracking .01em / -.01em. Not uppercase by default.
- Colours (VERIFIED): #030303 near-black, #ffffff, #e8e8e8, #a6a6a6, one pop #90ee90 (probably a debug/accent).
- Motion (VERIFIED strings in bundle): GSAP 3.12.5 incl. CustomEase; ease list includes `cubic-bezier(.77,0,.175,1)`, `(.165,.84,.44,1)`, `(.445,.05,.55,.95)`, `(0.425,0.031875,0,0.971875)`, `(0.33125,0.02,0,0.971875)`, `(0.40,0,0.10,1)`, `(0.33,0.02,0,0.97)`, back-like `(0,1.2,1,0.68)`; plus power2/3.inOut, quart.out, sine.out. Lenis smooth scroll (VERIFIED in HTML+bundle). Vue/Nuxt SPA.
- 3D/WebGL: three.js, assets from Blender, Houdini, ZBrush; KTX compression done server-side; texture channel packing; modular export pipeline via gltf-transform + custom JS/Blender scripts (Awwwards case study). Bundle also hits MSDF, postprocessing, fluid, Howler/audio, lil-gui/dat.gui strings (inferred, bundle string matches).
- Backend: Strapi CMS, Node API, hosted on Vercel (case study).
- Performance: KTX2, channel-packed textures, gltf-transform pipeline.
- Sound/loader/mobile: not covered by the case study.
- Sources: https://www.awwwards.com/case-study-immersive-gardens-new-website.html (stack, Backstage, roman numerals), https://immersive-g.com (curl), https://awwwards.com/interview-immersive-garden-win-studio-and-developer-site-of-the-year.html (intro only).

## Unseen Studio (unseen.co)
- Concept: "A brand, digital and motion studio creating refreshingly unexpected ideas and striking visuals that help bold brands cut through the noise." Site is a navigable 3D "World" plus a project index.
- Structure (VERIFIED HTML): sound-gate preloader with letters U-N-S-E-E-N and two buttons "Enter" / "Enter without audio" and "(Loading)"; menu overlay numbered 01 Index, 02 Projects, 03 Contact, 04 World; Home with "Drag to explore our world"; "Selected Projects" with filter All / Branding / Digital / Motion / Experiment; "View our work"; contact "Say hello, we look forward to hearing from you" (New Business / General, Bristol + London addresses); "Click & Hold" hint; "Toggle Sound"; "Our 2025 Wrapped" promo.
- Hero mechanic: 3D world explored by dragging; click & hold interaction; audio toggle.
- Navigation: overlay menu with numbered entries, duplicated spans (mask-roll hover; VERIFIED duplicated labels "Index Index", "Projects Projects" = classic two-layer text-roll hover).
- Type (VERIFIED): `Neue Montreal` (grotesk) + `Saol Display` (serif display). Uppercase used for some labels. CSS ease `cubic-bezier(.34,1.56,.64,1)` (back-out overshoot) in HTML.
- Motion: GSAP incl. CustomEase; eases seen: power4.inOut, expo.in/out, circ.inOut, elastic.out(1,0.3), power2/3. WordPress theme "unseen" (Laravel-Mix-style `public/scripts/theme.js`).
- 3D/WebGL (bundle strings, inferred): three.js, Draco, postprocessing (EffectComposer/bloom), fluid sim, Howler, Rapier-style physics. Codrops: Unseen published "When Cells Collide: The Making of an Organic Particle Experiment with Rapier & Three.js" (authorship by Unseen inferred from Telegram snippet) and a Crosswire 3D case study.
- Sound: yes, opt-out at the gate (VERIFIED buttons).
- Sources: https://unseen.co (curl + bundles), https://www.awwwards.com/unseenstudio/ (profile: 3 SOTM, 26 SOTD), https://primarytech.com/?p=8005 (Cells Collide mirror), https://tympanus.net/codrops/tag/case-study/page/3.
- Thin: no per-site Awwwards page reachable (404 on guessed slug); no build write-up for the studio site itself.

## Synchronized (synchronized.studio)
- Concept: "Full-service creative studio crafting unparalleled digital experiences." Studio of the Year 2022 (Awwwards).
- Structure (VERIFIED text): giant repeated marquee "synchronized archive" (runs ~40x in markup, a horizontally scrolling text band), then stacked "Synchronized / Digital / Creative / Studio" headline lines repeated (mask/slot-machine effect, inferred), then services copy.
- Stack: Nuxt (Vue), GSAP with Power2/3/4 easeOut/easeInOut and back.out (VERIFIED), PixiJS strings (inferred: likely 2D WebGL distortion of images), three strings in vendor (inferred, may be noise). Awwwards tags many of their sites with PixiJS/Nuxt but not confirmed for this one.
- Colours in markup: muted greys/pastels (#CFCFCF #84918D #AA918A #9393A0 #DBDAD3 #EAEAFF) probably per-project tint swatches (inferred).
- Sources: https://synchronized.studio (curl), Awwwards 2022 Studio of the Year page (via search).
- Thin: no type, no interview, no motion details.

## Obys (obys.agency)
- Concept: concept-driven design studio, founded 2018 (Kharkiv), now monochrome; site is a numbered project index.
- Structure (VERIFIED): project list numbered 01-16+ with sector and role per row ("Fashion | Web Design/Dev", "Architecture", "Technology | Web Design/Dev, 3D"...), clients: Makhno, Source Unknown, Autex, Odin's Crow, Olga Prudka, Yulia, The Ways We Work (Miro), Design Education Series, Eminente, Abetka, BlackSheep, Salience Labs, Glyphic Biotechnologies, Porsche Taycan, Ayocin, Peter Lindbergh. List markup is duplicated (once for index, once for preview/gallery, inferred).
- Awwwards (winning version, Sotd 4 May 2026, 7.46; Dev 7.98): tags Business & Corporate, Design Agencies, Portfolio, Scrolling, Gallery, Storytelling, UI design, Project Page, WebGL, Figma; palette #000 and #fff; highlighted Transition / Video / About Us; Dev sub-scores Animations/Transitions 8.4, Responsive 8.4, WPO 7.6. The earlier version (SOTD 9 Jan 2020, 7.69) was black/white/gold.
- Type: single custom family `Obys` (VERIFIED @font-face); CSS vars `--white:#fff; --black:#000`.
- Motion/tech: HTML is server-rendered shell; I did not find the main bundle (only GTM script in head), so engine unverified. Page transitions and video are called out by Awwwards (VERIFIED from Awwwards page).
- Sources: https://www.awwwards.com/sites/obys-2, https://obys.agency (curl).
- Thin: no interview or technical write-up found.

## Malvah (malvah.co)
- Concept: "Awwwards Studio of the Year '25. Crafting distinctive brand experiences." Cape Town, "started in the back of a skate park", est. 2018; playful meta tags (SI_01, CT_SA, "Born through passion / fixated on progress", "Just another design studio").
- Structure (VERIFIED): menu (Home, Work, Studio, Words, Contact), intro blurb, "Play reel", "What we do_" (Branding, Digital Design, Motion, 3D), "Recent Work(0)" counter (count filled dynamically) + View All, footer ("Keen to work with us? Drop us a mail", click-to-copy email with "Email copied!" toast, address). Awwwards highlighted: Preloader, Footer, Studio, 404, Archive, Case Study.
- Awwwards winning site (SOTD 22 Mar 2024, 7.7; Dev 7.33): tags Clean, Flat Design, Minimal, Portfolio, Microinteractions, 404 Pages; palette #000000 / #ffffff.
- Type (VERIFIED): `NeueHaasGroteskText Pro`; fluid sizing `calc(40px + 6.67vw)` style formulas capped at min-width 1440px; labels uppercase with letter-spacing .14em.
- Motion/tech (bundle, VERIFIED strings): Nuxt, GSAP with CustomEase named `pageTransitionEase`, power3/power2.inOut, expo.out; Lenis; SplitText-like text splitting. Default CSS eases `cubic-bezier(.4,0,.2,1)` and `(0,0,.2,1)` (tailwind defaults).
- 3D: four "3D" services; three/draco strings in bundle (inferred). Signature.js loaded (console signature easter egg, inferred).
- Sources: https://www.awwwards.com/sites/malvah-studio, https://www.malvah.co (curl), https://lbbonline.com/news/Malvah-Studio-of-the-Year-2025-Awwwards (403 to me).
- Thin: no build write-up.

## Lusion (lusion.co)
- Concept: "We create 3D visual storytelling and interactive web experiences that help brands stand out" (current, VERIFIED). "Bold Ideas, Brought to Life."
- Structure (VERIFIED, current live site): nav (back, Let's talk, Menu: Home / About us / Projects / Contact / Labs; newsletter), hero, "scroll to explore", "Bold Ideas, Brought to Life" + "Our Approach" + "Play Reel", "Featured Work" (Oryzo AI, Atlas Motion, Devin AI, Of The Oak, Everswap, Porsche Dream Machine, Synthetic Human, Meta Spatial Fusion, Spaace, DDD 2024, Choo Choo World, Soda Experience) each with a discipline line "concept • web • design • development • 3d • animation", "See all projects", footer. Astro static build.
- Winning version (Lusion v3, SOTD 2 Oct 2023, 8.25; Dev 8.41 with Animations/Transitions 10.00, WPO 9.00; users 9.22): tags Design Agencies, Promotional, Animation, Clean, 3D, About Page; palette #1a2ffb blue + #f0f1fa off-white; highlighted: reactive cursor interaction, scroll animation, project/home/about pages. Live site today uses warmer hexes (#1a1411, #ffedd7, #FFFDE0, #d9f3de, #E3E3F8 in CSS, VERIFIED) so palette changed.
- Cursor: reactive 3D/WebGL cursor effect; forum reply says the mouse effect is a post-processing pass on only the WebGL layer, HTML text unaffected (threejs forum thread).
- Tech (VERIFIED bundle): three.js r158, postprocessing, Howler/WebAudio, TWEEN-style tweening, a physics library string (inferred). Their earlier 2019 site: three.js + TweenLite + webpack + Less, Node-generated static site; Houdini cloth pre-baked to ArrayBuffer (~220KB gz), vertex animation stored in two PNG textures (positions and normals; 11 keyframes for 66 frames; 16-bit ints) 983KB desktop / 246KB mobile; pre-rendered normals/AO/thickness + matcaps; Redshift video with a binary frame counter encoded in the video and read with `readPixels()`; camera path exported as JSON, scene as glTF (~150KB); point light follows cursor; camera rotates ~1.72 deg.
- Codrops: Curly Tubes from the Lusion website (https://tympanus.net/codrops/2021/05/17/curly-tubes-from-the-lusion-website-with-three-js/ returned 403; summary from search only: light-scattering tubes effect).
- Sources: https://lusion.co (curl), https://www.awwwards.com/sites/lusion-v3, https://www.awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html, https://discourse.threejs.org/t/mouse-effet-at-the-top-of-three-js-like-on-https-lusion-co/57385/6.
- Thin: nothing first-party on v3 (2023) construction.

## Active Theory (activetheory.net)
- Concept: "Founded in 2012. We blend story, art & technology as an in-house team of passionate makers." Whole site is a single canvas.
- Structure: HTML is an empty shell (VERIFIED): `#Stage`, black background, loads `assets/js/app.<hash>.js` (1.8MB), noscript warning, unsupported-browser redirect via `obj?.prop` test. Content comes from a CMS via the engine (`window._CMS_`).
- Winning version Awwwards "Active Theory v4" (SOTD 29 Jan 2018, 8.2; Dev 7.15): tags Portfolio, Video, Transitions, 3D, WebGL; Technologies: Three.js, Google App Engine, GLSL, WebGL; palette #000, #49c5b6 (teal), #FF9398 (pink); highlighted: Interactive Typographic Menu, Interactive Intro Page. The current site is v6 (storage bucket named `activetheory-v6`), so the Awwwards v4 data is dated.
- Type (VERIFIED): `NB Architekt` Std Light 300 / Regular 400 / Bold 700 (self-hosted woff2).
- Engine (VERIFIED in the bundle): custom framework "Hydra" (`Hydra.ready`, `Hydra.LOCAL`), render pipeline named `Nuke` (post/FX layers, `FXLayer`), `RenderManager` with scheduled loops and framerate-normalised lerps (`Math.framerateNormalizeLerpAlpha`), `Thread` workers for off-main-thread asset/class uploads with offscreen canvas, built-in `TweenManager` with the full Penner easing set (easeOutQuart, easeInOutExpo, easeOutBack, easeOutElastic, etc.), GPU tier detection (`Device.graphics`), DPR scaling, `Fluid` sim (simSize 128, dyeSize 512) and `MouseFluid` cursor splat, UIL (their live GUI editor, JSON-loaded config `uil.<hash>.json`), WebAudio. Medium posts: Hydra engine optimised for throughput; Hydra GUI lets designers build scenes with no code; "Aura" runs WebGL code natively on 8 platforms; Prometheus case study notes ping-pong between scenes so only one scene renders per frame.
- Accessibility hook: `.GLA11y` clipped hidden layer for screen readers on a canvas site (VERIFIED CSS).
- Mobile: `.ios` / `.mob` classes, safe-area insets, `maximum-scale=1`, touch-action none.
- Sources: https://activetheory.net (curl, app bundle), https://www.awwwards.com/sites/active-theory-v4, https://medium.com/active-theory/the-story-of-technology-built-at-active-theory-5d17ae0e3fb4, https://medium.com/active-theory/prometheus-2d3c05b88ec0.

## Resn (resn.co.nz)
- Concept: "a creative studio bringing brand, content and digital experiences to life through stories shaped with global brands and emerging innovators." Weird, tactile, storytelling.
- HTML (VERIFIED): black body, custom `.loader` with `loader__inner` and `loader__drop` (letter-by-letter drop loader), es6-shim, modernizr, HubSpot. Everything else is in JS I did not open.
- Tech/info: in-house "Jelly" Web3D pipeline (campaignbrief/LBB press on Pioneer Corn); site launched 6/6/16 redesign (FWA/SOTD); Agency of the Year 2017 & 2018; Site of the Year 2021 (Pioneer – Corn Revolutionized) and 2023 (KPR).
- Sources: https://resn.co.nz (curl, shell only), https://lbb.lbbonline.com/news/resn-and-bader-rutter-win-awwwards-site-of-the-year-for-pioneer-corn-revolutionized, https://www.awwwards.com/interview-resn-wins-agency-of-the-year-at-awwwards-conference-london.html (intro only), https://www.awwwards.com/awwwards-interviews-kris-hermansson-franc-cheetham-from-resn.html (intro only).
- Thin: very.

## Abeto (abeto.co)
- Concept: "a studio specialized in the production of realtime experiences for the web: immersive sites, multiplayer games, WebGL/WebGPU applications and more." Built Igloo Inc (Site of the Year 2024 + Developer SOTY 2024).
- Site (VERIFIED): `<body>` is empty; a 12KB Vite module bundle sets up full-viewport styles (`html,body{overflow:hidden; background:#fff...}`, `text-rendering: optimizeLegibility`) and dynamically imports the real app chunks (code-splitting; first paint is tiny). No libs visible in the entry chunk.
- Awwwards jury on Igloo: praised micro-interactions and effects; no stack details published that I could find.
- Sources: https://abeto.co (curl), https://www.awwwards.com/abeto/, https://www.awwwards.com/annual-awards-2024/site-of-the-year.
- Thin: very (lazy-chunked, not analysed beyond entry).

## OFF+BRAND (itsoffbrand.com, formerly offbrand.studio)
- Concept: "A Different creative approach. With EMOTION + INNOVATION, we push the boundaries of digital creativity." Scottish-born, Webflow Enterprise partner, founder-led.
- Structure (VERIFIED): numeric percentage loader (5%...100% in steps of 5), hero "A Different / creative / approach" with "scroll ↓", manifesto statement, About Us, "Trusted by Leaders", "Featured work" list (Microsoft Windows, Trevor Noah, Lando Norris, Steven.com, Dialed Coffee, Vizcom...) numbered ("11") with discipline icons: ● Brand & Design, △ Development, ⁂ WebGL, 3d. Nav: Home/About/Work/Services/Contact/W. Enterprise/Manifesto/Privacy/Careers each with "->" arrow. Separate MANIFESTO site (Awwwards SOTD 2023 and March 2024 per profile).
- Colours (VERIFIED CSS vars): --main-dark #1d1d1d, --main-dark-alt #252525, --main-light #e5e4e0, --main-light-alt #f1f0ec, --primary-color #ff642f, grey-rotate #bfbebe; other hexes #facb0e, #f06ba8, #78bae6 (accent pastels). Radius vars --large-radius 6.25em, --med-radius, --small-radius .4rem. Letter-spacing .1em / .15em on labels. A type size 1.058vw (≈ 16px at 1512 wide).
- Tech (VERIFIED script tags): Webflow + jQuery + custom JS (`offbrand-2023`, `ob.2026.index`) + `offbrand-orb.min.js` (a WebGL "orb"); Lenis smooth scroll. Ease `cubic-bezier(0.165,0.84,0.44,1)` (easeOutQuart).
- Sources: https://www.itsoffbrand.com (curl), https://www.awwwards.com/offbrand/ (via search), https://webflow.com/webflowconf/webflow-awards-recipient/off-brand.
- Claim to check: I found no source confirming Agency of the Year for OFF+BRAND; its Awwwards recognitions are SOTDs.

## Noomo (noomoagency.com)
- Concept: "Noomo helps enterprise teams shape how their brand, products and platforms show up across digital" (current copy, VERIFIED). Winning version (Awwwards SOTD 21 Sep 2023, 7.72; Dev 7.47; users 8.73): LA-based "boutique interactive design agency".
- Structure (VERIFIED): nav Work / Our Story / Labs / Insights / Connect + Menu; "Let's work together"; uppercase hero statement; services list (Enterprise Websites, Digital Event Experiences, Corporate & Brand Websites, Campaign & Product Launch Websites, Digital AI Transformation, Video & Motion, Interactive Experiences, Digital Brand Activations, 3D Product Storytelling, Digital-first Branding); client marquee (Samsung, Salesforce, AMD, Coinbase, Red Bull, Harman, Intel...); "♥‿♥". Awwwards highlighted: hero animation, 3D hover effect, button hover interaction, case 3D animation, glass cards on-scroll, case preview animation, showreel video controls, Our Story page, 3D transitions between scroll sections, scroll animation.
- Type (VERIFIED): `NeueRoman`, `NeueLight`, `NeueMachina` (Neue Machina is a display mono-ish face; assume Pangram Pangram, inferred) plus Source Sans Pro fallback; headings uppercase, letter-spacing .02em; mobile `clamp(32px,12.8vw,62px)`.
- Colours (VERIFIED in CSS): dark purple-navy #231b35 / #181520 with cool light tints #c9d2e7, #dee7f1, #dae2f2, #7e7f8f; Awwwards lists #DEE7F1.
- Tech (VERIFIED bundle): Nuxt, three.js, GSAP + CustomEase 3.14.2 (ease sine.inOut, power2.out), Draco, Swiper.
- Sources: https://noomoagency.com (curl + bundle), https://www.awwwards.com/sites/noomo-agency (slug listed as accessible via `noomo-agency` via fetch result for SOTD).
- Thin: no first-party write-up.

## Aristide Benoist (aristidebenoist.com)
- Concept: "a developer who specializes in motion and interaction. As an independent, he works with companies, agencies, startups and individuals all over the world."
- Site (VERIFIED): HTML is a blank shell; fonts `TNY` (400) and `jws` (700) (obfuscated names, files `/static/font/t.woff2` and `jw.woff2`), bg #141414, accent greens like #bac4b8, #0B0C0C, #171717; page colours are stored in a JS config `window._A.color.bg {hex, rgbNorm}` so the WebGL layer reads the same palette as CSS (VERIFIED concept, shows the colour tokens are normalised for shader use). Hidden `#load` element; `font-feature-settings: "liga" off`.
- Awwwards: 2017 version SOTD (11 Oct 2017, 7.37; Dev 7.6, Animations 8.67): tags Parallax, Transitions, 3D; CSS, HTML5, PHP, Three.js; palette #000, #D14836, #9C9C9C; design by Ben Mingo, 3D by Michael Novia. 2021 version: SOTM June 2021, homepage images rendered via WebGL. 2023: Independent of the Year; jury cites tools built from scratch and raw WebGL.
- Sources: https://aristidebenoist.com (curl), https://www.awwwards.com/sites/aristide-benoist-portfolio, https://www.awwwards.com/aristidebenoist/.
- Thin: no interview; JS bundle path not discovered (shell loads script dynamically).

## Jesper Landberg (jesperlandberg.dev)
- Concept: portfolio for a creative front-end developer; design agency Alpacka credited.
- Awwwards (SOTD 17 Jan 2020, 7.62; Dev 7.73, Animations 8.67, WPO 8.0): tags WebGL, GSAP, Portfolio, Animation; palette #000/#FFFFFF; highlighted elements: horizontal scroll drag navigation, "pull up next project" gesture.
- Live site: `jesperlandberg.dev` did not respond to curl from this machine (timeout). Could not read it. One Pager Love entry (old version) says AJAX-loaded portfolio items with hover parallax, built on WordPress.
- Sources: https://www.awwwards.com/sites/jesper-landberg-2, https://onepagelove.com/jesper-landberg-3.
- Thin: very (live site unreachable; Independent of the Year year uncertain).

## Louis Paquet (louispaquet.com)
- Concept: "Digital Creative Director and Designer", Montreal, "over 50 Site of the Day awards", also sells courses.
- Structure (VERIFIED): hero (name + title), About paragraph, "Latest work" (Good is the new cool, C2 Montreal, Mana Yerba Maté, Prime Asia Leather, Afterglo, Edifis, Má Sài Gòn Space, HTA Architectes, Vazzi, Pangram Pangram Foundry... ~25 names), "Courses, Masterclasses & Conferences" (Memorable UI design for Interactive Experiences; Using Motion Design to Animate with Purpose; Innovative Web Design in Figma...).
- Type/colour (VERIFIED): Inter variable (opsz 14-32, wght 100-900) from Google Fonts; palette #1F1F1F and #E0DEDA.
- Tech: Vite bundle `app-*.js` 123KB (small); no heavy 3D lib visible (the `ogl` flag in my scan was a false positive from "google").
- Awards (Awwwards profile): 52 works, 40 SOTD, 2 SOTM, 1 SOTY (Mana Yerba Mate, 2023). No Independent of the Year found.
- Sources: https://louispaquet.com (curl + bundle), https://www.awwwards.com/louispaquet/.
- Thin: motion not analysed.

## Zhenya Rynzhuk (zhenyary.com)
- Concept: art director's folio; sections Info / Work / Workflow / Contact; showreel "Play", themed "In red" / "In light" variants. Development credit: "Special thanks to Romain Avalle for development." (VERIFIED)
- Structure (VERIFIED): Hey! + Info (about me), Work (some cases), Workflow (all the processes), Contact; "Showreel – Click click"; services (Art direction, Product design, Visual design, Mobile design, Web design, Interaction design, Animation); "selected works" with Cure (boutique promo), Rafal Bojar (portfolio), each "Check full case +" and a giant initial letter ("C", "R"); "All cases here"; "Let's make something great!".
- Type (VERIFIED): `GT Walsheim` + `Schnyder L` (serif display); sizes up to 12vw / 10vw / 8.7vw; uppercase labels, letter-spacing 3px / 6px.
- Colours (VERIFIED): #191919 dark, #f93700 / #ff501e orange-red, #dbd5c9 / #ded5c4 warm stone, #f9dddd pink, #f2f2f2, #3b8070 green, #505050.
- Motion: CSS eases `cubic-bezier(.215,.61,.355,1)`, `(.455,.03,.515,.955)`, `(.55,.085,.68,.53)`, `(.25,.46,.45,.94)` (VERIFIED, i.e. standard easings-net quad/cubic set). Nuxt. Winning-year Awwwards page unreachable (404).
- Awards: Independent of the Year 2020 (Awwwards page via search), Synchronized art director/partner.
- Sources: https://zhenyary.com (curl), https://www.awwwards.com/zhenyary/, https://www.awwwards.com/annual-awards-2020/independent-of-the-year.

## Luis Bizarro (bizar.ro)
- Concept (current live site, VERIFIED): the portfolio is one full-screen fixed WebGL canvas; there is a visually hidden but focusable `.projects` list (clip-path inset(50%), becomes a left-edge 420px vertical list masked with a fade gradient on focus-within) for accessibility. Title "Luis Bizarro — Creative Technologist". Projects listed by name, client, year (MiniDiscs, Age of Learning, Gudu Records, NASA Force, Norm Law, Expa, Zerotrillion, Airbnb 2025 Summer Release / Experiences / Services, Apple iPhone 16 / MacBook Pro M4 / Vision Pro, Active Theory work such as Tarot with YouTube and Ambush SILVER FCTRY...).
- Type/colour (VERIFIED CSS): Inter variable 100-900, 14px body (13px secondary), bg #000, text #f2f2f2. Canvas fades in with `transition: opacity 1.2s` once `.is-ready`; `cursor:none` (custom cursor drawn in the canvas); `touch-action:none`; reduced-motion shortens fade to .3s.
- Motion (VERIFIED): the list scrolls via `translateY(calc(132px - var(--active) * 22px))` with `.6s cubic-bezier(.19,1,.22,1)` (easeOutExpo), i.e. active index drives a CSS variable.
- Tech: Vite ES module bundle (472KB); strings include ogl-style `Transform`; renderer not verified. Older repo (https://github.com/bizarro/bizar.ro, "Luis Bizarro's Portfolio from 2020 to 2023") is open source: plain ES2015+ JavaScript, no framework, GSAP + Lodash + ogl, Webpack, Pug templates, static output on Vercel. Submitted to Awwwards 14 Dec 2020 and did not win SOTD (so the Independent of the Year 2021 came from body of work, not this site).
- Sources: https://bizar.ro (curl), https://github.com/bizarro/bizar.ro (README, file tree: app/, styles/, shared/, partials/, public/, fonts/).
- Best open-source teardown candidate of the list.

## Merci-Michel (merci-michel.com)
- Concept: "Gamification & Advergame Studio" (current title, VERIFIED).
- Structure (VERIFIED): nav Contact / Projects / Reel / About; filter chips All / Gaming / Online event / Installation / Website / Brand content; a "2012 / 2026" range and an "00 / 00" counter (carousel or list index counter); no body copy in HTML (client-rendered).
- Colours seen in CSS (VERIFIED): #000, #fff, #bbe1f8, #404048, #003d86, #aafbba, #003436, #e067c3, #2c305f (per-project themes, inferred).
- Tech: custom static build with `vendors.js` + `build.js` under a dated folder (20260528); WebGL strings in bundle (inferred, not three-confirmed).
- Awards: OUIGO Let's Play (with Rosapark) Site of the Year 2017; KODE Sports Club SOTM Nov 2020; Developer award 2020. Interview (Awwwards 2018): "We don't look into technology at first, it's all about the creativity"; in-house producers, technologists, motion designers.
- Sources: https://www.merci-michel.com (curl), https://www.awwwards.com/interview-merci-michel-the-studio-behind-site-of-the-year.html.
- Thin: yes.

## Hello Monday (hellomonday.com)
- Concept: "We make digital (and magical)..." (VERIFIED). Now part of DEPT.
- Structure (VERIFIED): nav Work / Services / About / Stories / Product + socials; project grid with "Filter by" chips (Experiences, Branding, Platform, E-commerce, Products): Dream With AI, Nex Playground, Google Gemini Developer Competition, B&O See yourself in Sound, Strava Year in Sport, Fingerspelling with Machine Learning, Netflix identity, Ramasjang, Undo the Firewall, Universal Music for Creators, Star Atlas...
- Colours: favicon colours #5bbad5 / #da532c are boilerplate; palette #1D1F23, #fff, #000 (VERIFIED).
- Tech: bundle `/build/js/main-*.js` (Vue/GSAP/Three/Pixi/Draco strings, inferred, since regex was loose), Plausible analytics (privacy-friendly).
- Awards: Awwwards Agency of the Year at LoveDays era (2013), Site of the Year "Into the Arctic" 2013; recent Webby Global Network of the Year (via DEPT) 2022. I found no 2020 Agency of the Year confirmation.
- Sources: https://hellomonday.com (curl), https://www.awwwards.com/awwwards-interviews-hello-monday-denmark.html (intro only).
- Thin: yes.

---
## Cross-site patterns (VERIFIED where stated)
- GSAP + CustomEase + Lenis + Nuxt/Vue is the dominant stack (Immersive Garden, Malvah, Noomo, Unseen/Synchronized variants).
- Signature easings are expo/quart out: `cubic-bezier(.19,1,.22,1)` (Bizarro), `(.165,.84,.44,1)` (Off Brand, Immersive Garden), `(.77,0,.175,1)` (Immersive Garden inOut).
- vw-based sizing on a 1440 base (Immersive Garden), or `calc(Npx + Mvw)` fluid formulas (Malvah), up to 12vw for display type (Zhenya).
- Canvas-first accessibility fallback: hidden focusable DOM (Bizarro `.projects`, Active Theory `.GLA11y`).
- Unseen/Active Theory: gate with sound opt-in before WebGL starts.
- Active Theory: runs a GPU-tier and framerate-normalised render loop; offloads uploads to workers; shares one renderer across scenes.
