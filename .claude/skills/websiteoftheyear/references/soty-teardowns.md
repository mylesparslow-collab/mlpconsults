# Awwwards annual winners 2020-2025: technique teardown

Compiled 2026-11-05. Method: Awwwards site pages (scores, tags, palette), Awwwards/Medium/Webby/WebGPU.com/Commarts write-ups, agency pages, and a direct read of each live site's HTML and JS bundles (fonts, libraries, easing). Conventions:
- **(verified)** = stated by an agency/Awwwards/dev source.
- **(live-site)** = read from the site as it is today, which may differ from the 2020-2025 build.
- **(inferred)** = my deduction. "Not found" means I did not find it, not that it doesn't exist.
- Awwwards palettes are 1-3 swatches the submitter picked, not full design tokens.
- Award categories were checked against Awwwards annual pages where reachable. Items marked (per brief) could not be re-verified.

---

## 2020

### Pioneer, Corn Revolutionized (Resn with Bader Rutter), Site of the Year
- Site: cornrevolution.resn.global. Awwwards SOTM July 2020, then SOTY. Awwwards page slug not reachable (404).
- **Concept:** Scroll-driven CGI story of how Pioneer develops and tests new corn, ending in an infinite seed-to-harvest loop. (verified)
- **Structure:** One vertical scroll. Homepage hero, internal pages, science section with DNA particles, interactive potted plant, loop ending. (verified)
- **Signature:** Photoreal corn that relights and refocuses as you scroll (faked, see below). Also the plant you tickle with the cursor.
- **Type:** Headline in MSDF fonts (multi-channel signed distance field), which handle layout and kerning. Typeface name not found. Animated outlines = glyph outline + stepped animated gradient mask. Particles placed at glyph positions, lines are InstancedBufferGeometry quads stretched between particle pairs. (verified)
- **Colour:** Not found. Awwwards palette not retrieved.
- **Motion:** Scroll-triggered timeline via GSAP. Easings not published.
- **3D/WebGL:**
  - Resn's "Jelly" pipeline: Three.js + GSAP lightweight framework, Blender and Octane for authoring, AWS/GraphicsMagick/ImageMagick for asset processing. (verified)
  - Nearly all UI and text is in WebGL, to avoid the cost of DOM animation over a canvas. Custom pointer events via bounding boxes + hit detection. (verified)
  - Strokes stay constant width and anti-aliased at any DPR using `dFdx`/`fwidth`. Masking happens in the fragment shader with screen coords; whole text effect = 3 draw calls. (verified)
  - **Fake relighting/DoF:** lighting and depth-of-field blur are baked into 4 textures at different light angles, blended in the shader. No real-time lighting or DoF. Works because rotation range is limited. (verified)
  - **DNA section:** thousands of points, point size grows with distance from a focal-plane uniform in the vertex shader (cheap DoF without render passes). SDF polygons in fragment shader, noise displacement + bloom in one post pass, pregenerated geometry. (verified)
  - **Plant:** a near-flat rigged textured quad; growth = scaling bones; top leaf gets rotational velocity when cursor hits an invisible hitbox. (verified)
- **Sound / loader / mobile:** Sound and loader not described. Mobile: device-specific content delivery, "pixel-consistent" rendering across sizes. (verified, vague)
- **Perf:** Lazy loading, GPU-compressed textures, per-device assets. (verified)
- **Accessibility:** Not found. Text in canvas implies weak semantics (inferred).
- **Reuse:** Bake the expensive look (light + blur) into texture variants and cross-fade by uniform; MSDF text with `fwidth` strokes; do UI in-canvas when the whole page is a canvas.
- Sources: https://awwwards.com/resns-pioneer-corn-revolutionized-wins-site-of-the-month-july-2020.html ; https://lbbonline.com/news/resn-and-bader-rutter-win-awwwards-site-of-the-year-for-pioneer-corn-revolutionized

### Kode Sports Club (Merci Michel), Developer Site of the Year
- Awwwards slug not reachable. Source: Awwwards case study (SOTM Nov 2020).
- **Concept:** A playful 3D sports "club" explored from a bird's-eye map and a third-person character. Visit = quest, unlock achievements and medals tied to brand values. Customizable non-gendered characters aimed at kids and adults. (verified)
- **Structure:** Map overview <-> zone-level exploration with camera transitions.
- **Signature:** Walk your character around the club; click-to-move.
- **Type / colour / sound / scroll / loader:** Not described in the case study.
- **3D:** three.js with custom shader edits. Blender (Python API) export incl. character movement curves the glTF exporter omits; Cesium glTF pipeline for Draco; Unity used to bake a navmesh; three-pathfinding tried and dropped. (verified)
  - Colour variation via texture alpha as mask (no per-object UV changes). Character tints via R/G/B channels of a texture recoloring zones in shader.
  - One feathered shadow map instead of cascades; shadow camera scales up in overview mode.
  - Lighting: hemisphere light for vertical gradients, rim light, matcap reflections, baked-style AO.
- **Controls:** click-to-path (pathfinding) abandoned as unreliable; joystick made U-turns hard; shipped click-to-move raycast on a flat plane. Character height follows a simplified navmesh with raycasts restricted by a 10x10 spatial grid; same grid adds/removes physics objects as you move. (verified)
- **Perf:** Target <10 MB first load, shipped 7.6 MB. Duplicates swapped for empties at export (-4 MB). Draco: map geometry 12 MB -> ~2 MB. Unique elements merged into 8 blocks for frustum culling; trees/ladders/cars merged to cut draw calls. gzip. (verified)
- **Reuse:** Spatial grid for cheap height/physics; texture-channel recoloring; merge-to-8-chunks for culling.
- Source: https://www.awwwards.com/kode-sports-club-by-merci-michel-wins-site-of-the-month-november-2020.html

### Mammut Expedition Baikal (Build in Amsterdam), E-commerce Site of the Year
- Site: eiger-extreme.mammut.com (returned 500 to my fetch). Awwwards: SOTD Dec 7 2020, 7.78; Dev 7.93 (Animations 7.33, lowest bar of this set).
- **Concept:** Shoppable expedition: follow Dani Arnold across Siberia / frozen Lake Baikal while browsing the Eiger Extreme collection. (verified)
- **Structure:** Scroll-navigated expedition trail through mountains, cliffs, ice walls, caves, frozen lake. Highlighted by Awwwards: scroll navigation, loading animation. Also a "Watch" documentary page and a "Development" page (live-site URL list).
- **Signature:** Product browsing embedded in a narrative scroll.
- **Type/colour:** Tagged Typography. Palette #2779a7 (blue), #DF6C4F (coral), #ffffff. Font not found.
- **Sound:** Tagged Sound-Audio; details not found.
- **Stack:** Next.js, React, Contentful (headless), Framer Motion per agency page; Awwwards lists Contentful, next.js, CSS, React. Not WebGL-based as far as found (inferred: image/video + CSS motion).
- **Mobile/perf/a11y:** Dev scores: responsive 8.33, semantics 8.33, accessibility 7.67, WPO 7.67. Highest semantic/SEO score of the 2020 set: this site wins on solid HTML, not on GL.
- **Reuse:** Make product pages the narrative's chapters; headless CMS gives the semantics a GL site lacks.
- Sources: https://www.awwwards.com/sites/mammut-expedition-baikal ; https://buildinamsterdam.com/case/expedition-baikal ; https://adobomagazine.com/?p=107298 (thin)

### Synchronized Studio (Zhenya Rynzhuk), Mobile Site of the Year
- **Thin.** Awwwards slug not reachable; no case study found. Sister site Chungi Folio (below) is by the same studio, so its patterns are my best proxy (inferred).
- Known: Synchronized Studio listed as Mobile Site of the Year 2020; Rynzhuk also Independent of the Year. Dribbble project "Synchronized Studio Mobile Layouts" exists (not read): https://dribbble.com/zhenyary/projects/3278435-Synchronized-Studio

### Dark, Official Netflix Guide (Monks + HAS.WORKS), Site of the Year Users' Choice
- Site: darknetflix.io. Awwwards SOTD Nov 3 2020, 7.96; Dev 7.25 (Accessibility 6.33). Users 8.41.
- **Concept:** Interactive guide to a time-travel series: characters, places, events across timelines; ~750 key events checked by showrunners for spoilers. (verified)
- **Structure:** Timelines per character across worlds, season/episode browser, character dossiers, easter eggs. (verified/Awwwards elements)
- **Signature:** "Mirror effect" and kaleidoscopic transitions between states; time-travel visualisation that works for every character.
- **Type/colour:** Show's visual language; palette #000000, #987654, #DF6C4F. Font not found.
- **Motion:** Animated timelines, kaleidoscopic image transitions (WebGL shaders), effects triggered by interaction; animation, image transitions and sound added during dev. (verified)
- **Stack:** HTML5, WebGL, Vue.js (Monks' framework), GSAP, After Effects, PHP for localized sharing. (verified)
- **Sound:** Yes, tagged and described as added for immersion. Loader: a bespoke loading animation (Awwwards highlighted element).
- **Reuse:** Mirror-style shader transitions as the grammar for "time", content tested against spoilers as a design constraint.
- Sources: https://www.awwwards.com/sites/dark-official-netflix-guide ; https://www.webbyawards.com/crafted-with-code/netflix-dark

---

## 2021

### Prometheus Fuels (Active Theory), Site of the Year (per brief)
- Awwwards SOTD May 4 2021, 8.40; Creativity 8.94, Content 8.79. Dev 7.61 (Animations 9.00, Markup 6.80).
- **Concept:** Scrolling, stylized interactive story of making fuel from air, with a retro-futurist brand the client already had. Chapter 1 explains the technology; built so new chapters can be added later; two chapters live at the time. (secondary summary of Active Theory's Medium post, which returned 403 to me)
- **Structure:** Chapters; interactive prompts keep the visitor engaged; contact form updates in place (Awwwards highlight "Updating form").
- **Signature:** The stylized WebGL story you scroll through.
- **Colour:** #2779a7, #D14836, #ffffff (Awwwards). Font not found.
- **3D:** Active Theory's in-house Hydra framework (their custom JS framework, with GUI for scene building). (verified in general; that Prometheus uses it is inferred) Tags: Filters and Effects, WebGL, Fullscreen.
- **Live site today:** the domain now serves a WordPress/Elementor site; the original experience is gone (live-site). Use the Medium post and Awwwards videos instead.
- **Thin:** no primary technical breakdown retrieved.
- Sources: https://www.awwwards.com/sites/prometheus-fuels ; https://medium.com/active-theory/prometheus-2d3c05b88ec0 (blocked)

### Umami Land (Monks for Google), Developer Site of the Year
- Site: umamiland.withgoogle.com. Awwwards SOTM Feb 2021; SOTD 8.23; Dev 7.95 (Animations 9.00, WPO 8.33).
- **Concept:** A free-roaming "theme park" of Japanese cuisine that drives Google Searches; world gets more vivid the more you search. (verified)
- **Structure:** Zones: Main Rice Street, Sizzle Yokocho (street food), Long Valley (noodles), Sweet Kingdom (desserts), Savory Bay (underwater seafood), a souvenir shop. Hotspots open search cards or nearby restaurants; downloadable guide. Collectibles and side challenges. (verified)
- **Signature:** Illustrated 360 world you pan around, with animated 3D bits inside it.
- **Type/colour:** Google Sans / Google Sans Text (live-site). Palette #2779a7, #49c5b6, #ECD06F.
- **3D/2D mix:** Custom WebGL framework; non-animated art merged onto one large 2D sphere, with 3D animated objects placed on top to form a 360 environment. 3D chosen over frame-by-frame 2D for load speed and editability; illustrators and 3D artists matched textures. (verified)
- **Stack:** Vue.js UI layer, GSAP, Lottie, Google Sheets API as CMS, Google App Engine. (verified)
- **Mobile:** Works on mobile and desktop, multilingual. (verified)
- **Reuse:** Paint the static world as one sphere texture, animate only the objects that move.
- Sources: https://www.awwwards.com/umami-land-by-google-wins-site-of-the-month-february-2021.html ; https://www.awwwards.com/sites/umami-land

### Pangram Pangram Foundry (Locomotive), E-commerce Site of the Year (per brief)
- Awwwards SOTD Nov 11 2021, 7.79; Dev 7.73. Users 8.49.
- **Concept:** A type foundry store; free-to-try fonts. Content architecture around type specimens.
- **Signature:** Animated dropdown menu; "Font Characteristics" panel on product pages (Awwwards highlights).
- **Colour:** #000000, #9C9C9C, #FFFFFF. Typeface: the foundry's own (Awwwards links the slug "migra"); the site is monochrome so the fonts are the colour (inferred).
- **Stack:** HTML5, CSS, JS, Shopify, **Locomotive Scroll** (verified, Awwwards). Tags: Parallax, Typography, Clean.
- **Reuse:** A pure CSS/JS + Locomotive Scroll build still wins E-commerce; the signal is typographic craft and clean IA.
- **Thin:** no case study found. Source: https://www.awwwards.com/sites/pangram-pangram-foundry

### Chungi Folio (Synchronized Studio / Zhenya Rynzhuk), Mobile Site of the Year
- Site: chungiyoo.com (returned 500 to my fetch). Awwwards SOTD Jan 7 2021, 8.03; Design 8.38; Dev 7.32 (Accessibility 6.33).
- **Concept:** Folio for a Germany-based art director/illustrator.
- **Signature:** Overlay-menu hover interaction and a playful interaction layer (Awwwards highlights), plus a custom 404.
- **Colour:** #2779a7, #FF9398, #ffffff. Font not found.
- **Stack:** Vue + Nuxt, GSAP, HTML5, CSS framework. (Awwwards)
- **Mobile:** Won Mobile SOTY, so layouts were designed for phone, not shrunk (inferred). Dribbble mobile layouts exist.
- **Thin:** no case study found. Source: https://www.awwwards.com/sites/chungi-folio

### Star Atlas (Hello Monday / DEPT), Site of the Year Users' Choice
- Awwwards SOTD Nov 3 2021, 7.78; Dev 7.03 (Accessibility 5.80, Semantics 6.20, WPO 6.40; the weakest dev numbers of any winner here, won on community vote). Users 8.24.
- **Concept:** Hype site for a blockchain space MMO; deliberately bright, light palette to escape dark sci-fi. (verified)
- **Structure:** Galactic-portal hero; scroll through lore chapters; explorable 3D ships and planets; nav organised like a solar system with its own iconography; CTAs: whitepaper, sign-up, "play now". (verified)
- **Signature:** The point-cloud rendering of ships and planets with animated depth of field.
- **3D:** Custom WebGL **point cloud shader**: models are made by projecting light rays onto real game models and rendering the hits as stars/points; "faked but very performant, animated" DoF. Models run through a custom Draco-based compression pipeline. Cinema4D, Photoshop, Figma; Three.js, GSAP, Draco. (verified)
- **Colour:** #987654, #D14836, #FFFFFF (Awwwards). Fonts: not found; live site currently a different build.
- **Reuse:** Point-size-by-focal-distance DoF is the same trick as Pioneer's DNA section, so it's a recurring cheap-DoF idiom (inferred link).
- Sources: https://www.webbyawards.com/crafted-with-code/star-atlas/ ; https://hellomonday.com/work/staratlas ; https://www.awwwards.com/sites/star-atlas

---

## 2022

### KPR (Resn), Site of the Year (per brief)
- Site: kprverse.com. Awwwards SOTM Dec 2022; SOTD 7.98; Dev 7.61 (Animations 9.60, Accessibility 6.00).
- **Concept:** Home of a "living world" with digital collectibles. New Eden, humanity's last refuge; the Keep, factions, world. (verified)
- **Structure:** Scroll reveals tableaux (the Keep, the Factions, the World) in concept-art style; **click-and-hold** opens a second interactive layer showing geography, factions, lifestyle. Collectibles act as portals. (verified)
- **Signature:** Press-and-hold to peel the page into the world behind it.
- **Type:** Whyte (variable width, ink traps) paired with the logotype; live site CSS shows ABC Whyte Plus + IBM Plex Mono (live-site). Layouts draw on futuristic poster design and manga panels, grid-heavy. (verified)
- **Colour:** Awwwards palette: #6D64A3 only. Case study says clean futuristic look with generous white space.
- **Motion:** Hold sequences built in After Effects (Quick Exporter), animated in WebGL + HTML using **CSS transforms only** for movement. Parallax on tableaux; high-energy beats alternate with smooth hover motion. (verified)
- **Loader:** KPR logo gradient reveal made of stacked After Effects frames at varying opacity; code reads a colour value to select the frame; sprite sheet + SDF create the morphing/bleeding edge. (verified)
- **3D:** Stencil-buffer technique: one 3D scene masks another (all windows, card flips, layer transitions); hidden scenes are discarded, not rendered. 3D characters combined with 2D design. Nuxt site with Three.js and Basis/KTX2 texture loading (live-site).
- **Sound / mobile:** not found.
- **Reuse:** Stencil "windows" into a second world; a loader that is a frame-picker driven by a single scalar.
- Sources: https://www.awwwards.com/kpr-by-resn-wins-sotm.html ; https://www.awwwards.com/sites/kpr

### Persepolis Reimagined (Monks for Getty), Developer Site of the Year
- Site: getty.edu/persepolis. Awwwards SOTD Jun 1 2022, 7.96; Dev 8.03 (Animations 9.60, Semantics 8.20). Users 8.69.
- **Concept:** Virtual reconstruction of ancient Persepolis, built from the Getty's architecturally accurate model, retopologised with experts. (verified)
- **Structure:** Preloader (night -> day blend) -> title sequence -> intro video -> WebGL. Scroll flies the camera on a fixed path to the Gate of All Nations; 360 dome view, map view, film shots. (verified)
- **Signature:** Immersive WebGL menu and the seamless handoff from prerendered video to the live scene.
- **Colour:** #987654, #D14836, #ECD06F (Awwwards). Grade moves night to day; post (vignette, bloom, grain) is applied to preloader, video, map and citadel alike so they feel like one thing. Per-scene values hard-coded in a Unity timeline. (verified)
- **3D:** WebGL 2.0 with instancing; geometry split into reusable parts reassembled at runtime; frustum culling; LODs; normal maps for pillars/sculptures; dynamic instancing = one draw call per mesh+material; floor-reflection casters listed manually. Authoring: Unity (scene + camera, custom exporter to JSON), Maya, Substance, After Effects, World Creator (terrain from satellite data), Clarisse. (verified)
- **Transition trick:** last preloader frame = first video frame; video-to-GL via chroma key through a shader. (verified)
- **Sound:** Score mixing kemenche, duduk, ney, daf, tombak, darbuka, zurna with synthesis; mixed for the 360 dome. (verified)
- **Stack:** Vue.js + GSAP front end. Mobile not discussed.
- **Reuse:** Fixed camera path = performance and art direction in one choice; match first/last frames across media.
- Sources: https://awwwards.com/case-study-getty-persepolis-reimagined.html ; https://www.awwwards.com/sites/persepolis-reimagined

### Mr. Pops (advanced.team), E-commerce Site of the Year (per brief)
- Site: mrpops.ua. Awwwards SOTD Oct 25 2022, 7.81; Dev 7.91.
- **Concept:** Craft ice cream ordering; "easy to buy". Product pages with 3D.
- **Signature:** 3D product page (Awwwards highlight "Ecommerce product page MR. POPS").
- **Colour:** #FEE5CA (cream), #B00E2F (red). Fonts not identified from HTML.
- **Stack:** Three.js, React, Next.js, TypeScript, Lottie, SVG (Awwwards + live-site Next.js chunks).
- **Thin:** no case study. Source: https://www.awwwards.com/sites/mr-pops

### The Other Side of Truth (The First The Last), Site of the Year Users' Choice
- Site: theothersideoftruth.com. Awwwards SOTD Jun 2 2022, 7.85; Users 9.07 (high vs jury); Dev 7.88.
- **Concept:** War documentation. A toggle flips between the narrative of Western media and Russian media; each side has its own pop-up messages that reappear when dismissed. (verified)
- **Structure:** Five sections: start of the invasion; losses and destruction (civilian casualties shown as bullet holes, shifting footage); leaders and reputations; aid to Ukraine; contacts for help. Magazine flip-through. Real comments/posts from both sides. (verified)
- **Signature:** The two-truth toggle and the whole page colour change (Awwwards highlight "Color change").
- **Type:** Helvetica Neue Cyr (Roman/Medium/Heavy), Nitti, Dewi (live-site CSS).
- **Colour:** #2779a7, #ECD06F (Awwwards).
- **Stack:** Nuxt/Vue, GSAP, WebGL and PixiJS per Awwwards tags; Basis textures present in bundle (live-site). Case study stresses smooth, soft animation; it does not describe PixiJS use.
- **Reuse:** A single binary toggle that re-skins the entire page as the argument itself.
- Sources: https://www.awwwards.com/the-other-side-of-truth-design-under-shelling.html ; https://www.awwwards.com/sites/the-other-side-of-truth

---

## 2023

### Lusion v3 (Lusion), Site of the Year + Developer Site of the Year
- Site: lusion.co. Awwwards SOTD Oct 2 2023, 8.25; Creativity 8.65; Dev 8.41 (Animations **10.00**, WPO 9.00). Users 9.22.
- **Concept:** Studio portfolio v3 "featuring some of our latest work, experiments and thought process." (Awwwards)
- **Structure:** Home, project pages, About. Awwwards highlights: reactive cursor interaction, scroll animation.
- **Signature:** A physics ball-pit and 3D objects that move between HTML blocks while you scroll, reacting to the cursor. (the physics ball pit is from third-party recreation, see below)
- **Colour:** #1a2ffb (blue), #f0f1fa (off-white) (Awwwards). Fonts not found.
- **Official sources:** No v3 making-of found; Codrops April 2026 studio feature was blocked (403). The 2019 Lusion v1 case study (not v3) shows the studio's habits: three.js, Houdini pre-sim baked into compact textures/ArrayBuffers (cloth in 16-bit PNG vertex-animation textures, 246 KB mobile vs 983 KB desktop variant), per-device asset tiers, video-sync via encoded frame counter. (verified for v1 only)
- **Live bundle (live-site, Astro):** presence of postprocessing, SDF, OffscreenCanvas, AudioContext, WebGPU, WebSocket and many GL extension probes. Indicates a custom engine with post chain, audio, and probable WebGPU path (inferred from strings).
- **Third-party recreation (Mark Nguyen; his code, not Lusion's):** full-screen canvas behind HTML; layout from CSS, screen-to-world conversion for pixel-accurate 3D placement; Rapier.js colliders following the mouse; stencil buffer for rounded-corner "window" in which balls render; single `animateProgress` 0..1 uniform driving grow/shrink masks in vertex shader. Treat as plausible technique, not fact about Lusion. A DEV.to "reverse engineering" post gives unverifiable claims; disregard.
- **Reuse:** DOM drives layout, canvas follows; stencil windows; one progress uniform per element.
- Sources: https://www.awwwards.com/sites/lusion-v3 ; https://mark-n.co/projects/lusion-reverse-engineered/ ; https://awwwards.com/case-study-for-lusion-by-lusion-winner-of-site-of-the-month-may.html (v1)

### Mana Yerba Mate (Louis Paquet, Michael Garcia, Pam), E-commerce Site of the Year
- Site: en.manayerbamate.com. Awwwards SOTD Mar 13 2023, 8.03; Creativity 8.45; Dev 7.8 (Animations 9.20).
- **Concept:** Playful brand intro for Montreal yerba mate, via 3D, illustration, animation, photography. (Awwwards)
- **Signature elements (Awwwards):** "Super Mario footer", preloader and 3D slider, 3D scrolling animation, bubbly page transition, colourful text animation.
- **Type:** Neue Montreal (live-site). **Colour:** #FFD372 (yellow), #F15B40 (red-orange).
- **Stack:** Shopify (Awwwards + live-site) with Lottie animations in the DOM (live-site). The "3D" is likely pre-rendered/Lottie (inferred), not real-time, consistent with a Shopify theme.
- **Thin:** no case study; the live site may be a later theme. Source: https://www.awwwards.com/sites/mana-yerba-mate

### Noomo Agency, Site of the Year Users' Choice
- Site: noomoagency.com. Awwwards SOTD Sep 21 2023, 7.72; Users 8.73; Dev 7.47.
- **Concept:** Agency site with glass-material 3D and a jellyfish. (Noomo Labs article)
- **Structure:** Unusual **upward** scroll from banner to projects; user testing said it boosted memorability. Project/case previews, 3D hover, showreel controls. (verified)
- **Signature:** Glass sphere + jellyfish with customizer (colour, opacity, reflectivity) persisted for the session; shatter shards via physics. (from Noomo Labs write-up; confirms this is the same hero system, inferred)
- **Type:** Neue Roman / Neue Machina / Neue Light (live-site CSS, Nuxt). **Colour:** #DEE7F1.
- **3D:** Three.js + GSAP + Nuxt 3; **no React Three Fiber**; cannon-es for glass sphere and shards; Blender for baked camera moves, jellyfish path, word animations; camera driven by two empties (focus, camera). Glass: real reflections hard to get; invisible off-camera objects exist only to be reflected; background light spots/gradients tint reflections. (verified)
- **Perf:** No post-processing on the main page; 3 glass variants with hidden ones disabled; leak fixed by disposing glass textures; GSAP groups to avoid one-object-per-tween overhead; mobile lowers glass quality and physics. (verified)
- **Sound:** subtle SFX + background music; avg visit ~2 min (their claim). Live site references ScrollSmoother (GSAP).
- **Reuse:** Bake camera/choreography in Blender, code only the interactive layer; reflection-only props.
- Sources: https://www.awwwards.com/new-focus-new-brand-new-website.html ; https://www.awwwards.com/noomo-labs-a-hub-for-cutting-edge-immersive-experiences.html ; https://www.awwwards.com/sites/noomo-agency

---

## 2024

### Igloo Inc (abeto + Bureaux), Site of the Year + Developer Site of the Year
- Site: igloo.inc. Awwwards SOTD Jul 23 2024, 7.92; Creativity 8.31; Dev 7.66 (Animations 9.60, WPO 8.00, Accessibility 6.60, Semantics 6.60). Users 8.55. Also 2026 Webby winner, Best Visual Design.
- **Concept:** Landing site for Pudgy Penguins' parent company. Cold, tech outdoor scene; mission = largest onchain community.
- **Structure:** Three-section scroll. Real-time intro doubles as loader, flows into main experience; project ice blocks; links footer of particles. (verified)
- **Signature:** Each project sits in a unique procedurally grown ice block; footer particles swirl into shapes per hovered link.
- **Type:** All UI in WebGL via SDF text; no typeface named. **Colour:** #b6bac5, #383e4e (icy grey-blues; Awwwards).
- **3D/shaders:**
  - Whole UI rendered in WebGL (glitch via shader; text scramble by shifting SDF texture offsets, no DOM restyle). Scene transitions: chromatic aberration, "tech displacement", frost dissolve. (verified)
  - Ice: custom crystal-growth algorithm grows ice inside a container shape (cube/cylinder); first planned one block, then made each unique when it looked repetitive. (verified)
  - Particles: simulated footer; colour shifts with velocity; shapes come from a custom **VDB-to-browser volume exporter** (Houdini), compressed to smaller than a typical web image. A fluid sim was also built (named, not detailed). (verified)
  - Stack: Three.js, three-mesh-bvh, Svelte, GSAP, Vite, vanilla JS; Houdini, Blender; Figma/Photoshop/Affinity; sound edited in DaVinci Resolve. (verified; Svelte confirmed in live-site)
- **Motion:** Camera path planned with previs (grey-box animation) incl. the dive to the footer particles. Easings not published.
- **Sound:** Music and SFX by Bureaux, synced to particle motion. (verified)
- **Perf/mobile:** Real-time intro keeps file size down; custom geometry exporters; textures loaded and shaders compiled in background after load; continuous perf measurement on low-end devices; KTX2 textures and request-idle loading per a secondary source. Intro "displayed at high resolution on all devices". (verified/secondary)
- **Accessibility:** Jury scored 6.60: UI-in-canvas trades semantics for control.
- **Reuse:** Procedural variation instead of authored variants; SDF text for cheap glitch/scramble; compress volumes into tiny assets; make loader the first scene.
- Sources: https://awwwards.com/igloo-inc-case-study.html ; https://webgpu.com/showcase/igloo-inc-procedural-crystals/ ; https://www.awwwards.com/sites/igloo-inc

### Opal Tadpole (Claudio Guglieri, dev Ingamana), Mobile/E-commerce winner (per brief)
- Site: opalcamera.com/opal-tadpole. Awwwards SOTD Jan 11 2024, 7.52; Dev 7.84 (Animations 8.60). Lowest SOTD among 2024 winners, which suggests the annual award was won on category fit, not raw score (inferred).
- **Concept:** "The smallest webcam ever built." Product-story single page.
- **Awwwards elements:** "The hand flip" (hero), "Explain it like I'm 5", "Smooth Criminal" (products), "Show don't tell" (stats). Tags: 3D, microinteractions, photographic, single page.
- **Colour:** #FFDB01 yellow on white.
- **Stack:** Next.js (live-site). No technology list on Awwwards; 3D approach not documented (hero is likely video/sequence based, inferred).
- **Thin:** no case study found. Credits: Guglieri, Ingamana, Hugo Ahlberg, Anthony Koch, Jason Bradley, Bryan James. Source: https://www.awwwards.com/sites/opal-tadpole

### Don't Board Me (The First The Last), (per brief; category unverified)
- Site: dontboardme.com. Awwwards SOTD Mar 11 2024, 7.83; Dev 7.26 (WPO 6.80). Users 8.92.
- **Concept:** Pet-sitting/boarding alternative; friendly illustration-led storytelling; custom 404 and a strong footer.
- **Type:** Bayon (display) + Neue Montreal (live-site). **Colour:** #E33529 (red), #AFD8FB (light blue).
- **Stack:** Nuxt, Lenis smooth scroll, Swiper, some Three (live-site). Easing in CSS: `cubic-bezier(0.24, 1, 0.36, 1)` (live-site, expo-out-like).
- **Tags:** Scrolling, Storytelling, UI design, Graphic design, Colorful.
- **Thin:** no case study found. Source: https://www.awwwards.com/sites/dont-board-me

---

## 2025

### Lando Norris (OFF+BRAND), Site of the Year + Users' Choice
- Site: landonorris.com. Awwwards SOTD Nov 17 2025, 8.18; Creativity 8.71; Dev 7.58 (Animations 8.60). Users 8.86. Votes: SOTY 43, Users' Choice 596.
- **Concept:** High-performance personal platform capturing his on-track energy and playful off-track side; McLaren heritage + youth. (verified)
- **Structure:** Hero with blob-like reactive overlays on image, career highlights, behind-the-scenes, media galleries, "Helmets Hall of Fame" with 3D helmet rotation. (agency/WebGPU.com)
- **Signature:** Cursor-reactive blob masks over the hero; 3D helmets; Rive-driven transitions.
- **Type:** "Brier" (live-site CSS); bold display. **Colour:** #D2FF00 (neon yellow-green), #111112 (near black).
- **Stack (live-site, fits agency page):** Webflow with large custom JS hosted on the agency's own CDN, Lenis smooth scroll (Lenis classes in DOM), GSAP, Rive transitions in a separate script, WebGL, jQuery from Webflow. Secondary roundup also lists Taxi.js and SplitText (unverified).
- **Motion:** `cubic-bezier(0.65, 0.05, 0, 1)` found in CSS (live-site). Speed-inspired, sharp transitions; cinematic scroll. (verified in words)
- **Perf:** lazy loading, optimised asset delivery, "streamlined code" (agency). No metrics.
- **Mobile:** responsive treatment of scroll sequences (agency).
- **Accessibility:** jury 7.00; a cookie-consent layer is present (iubenda).
- **Thin on deep technique:** no Codrops or dev write-up found; "depth maps / custom shaders / CSS masking" claims came from one secondary source and are unverified.
- **Reuse:** A Webflow-hosted CMS shell with externally-hosted custom JS; Rive for motion graphics so designers can own timing; one hot accent colour against near-black.
- Sources: https://www.itsoffbrand.com/our-work/lando-norris ; https://www.webgpu.com/showcase/mclaren-f1-driver-lando-norris-official-website/ ; https://www.awwwards.com/sites/lando-norris

### Messenger (abeto), Developer Site of the Year
- Site: messenger.abeto.co. Awwwards SOTD Nov 10 2025, 7.92; Dev 8.21 (Animations 9.00, WPO 8.80). Users **9.56**. Votes: Dev SOTY 54.
- **Concept:** Multiplayer parcel-delivery game on a tiny round planet; calm/strange mood from Asian countries; "walk in a straight line and circle the world", no invisible walls. (Commarts interview)
- **Structure:** Game, not a page: character creation menu (hair, jacket, pants, sneakers), emoji reactions, NPCs, delivery quests. Awwwards highlights: character navigation, NPCs, character configuration.
- **Look:** Cel-shaded outlines, muted palette chosen up front; hand-drawn graphics; compared to Jet Set Radio and Mario Galaxy. Palette #81BFBC, #C9D5C3. (verified)
- **Tech:** three.js, three-mesh-bvh, Blender + Houdini, Substance textures, WebSocket multiplayer on Node.js; shaders, controls, camera, networking and back end custom (no Unity/Godot). A hand-tuned beach shader. (verified) Live bundle: Svelte UI, KTX2/Basis, Draco, meshopt, EffectComposer, MSDF text, AudioContext (live-site).
- **Perf:** 5.7 MB initial, 17.5 MB total (WebGPU.com / CreativeDevJobs); runs on phones. Cap of 10 players per world by design; backend can scale further. (verified)
- **Sound:** lo-fi music by Kevin Colombin (WebGPU.com).
- **Controls:** Automatic camera centring, trimmed options so non-gamers could play. (verified)
- **Team:** two people (Vicente Lucendo, Michael Sungaila). Story written last.
- **Accessibility:** jury 7.60; keyboard/gamepad not found.
- **Reuse:** Worlds that tile on a sphere remove edge cases; budget the whole game in single-digit MB with KTX2 + Draco + meshopt.
- Sources: https://www.commarts.com/webpicks/messenger ; https://webgpu.com/showcase/messenger/ ; https://www.awwwards.com/sites/messenger

### Scout Motors (Locomotive), E-commerce Site of the Year
- Site: scoutmotors.com. Awwwards SOTD Jan 16 2025, 7.60 (another source says Apr 5 2025; I used the Awwwards site page); Dev 7.36. Webby 2025 Best Home Page honoree. Votes: 28.
- **Concept:** Relaunch of the off-road Scout as an EV maker (Traveler SUV, Terra truck): "Scouts always come back", heritage + adventure. (Locomotive page)
- **Structure:** Home sections (live-site script names): Camp, Treadmill (a sequence-driven section), Viewfinder, Sequence/SequenceKey, ProductTile, SplitLines, Menu. Interactive "traveler" page. (script names are live-site; their meaning is inferred)
- **Signature:** Image/video sequences scrubbed with scroll; viewfinder-style crop UI (inferred from component names).
- **Type:** Custom "Scout Sans" family (regular, medium, wide medium, semi-condensed bold) + IBM Plex Mono (live-site preloads). **Colour:** #FF5432 (orange-red), #D7D4D3 (warm grey).
- **Stack (live-site):** Astro with per-component scripts, Lenis (prevent classes), Locomotive's usual toolkit; reCAPTCHA. Easing `cubic-bezier(.4,0,.2,1)` seen in CSS. Locomotive's own boilerplate and Locomotive Scroll are documented in their other case studies (verified for others, inferred here).
- **Credits:** Scout CDO, Raymond Ng; Locomotive: Sebastien Leblanc, Bastien Allard, Mathieu Ducharme, three front-end devs.
- **Mobile:** Awwwards highlights "Mobile UI" (UI components).
- **Perf/a11y:** Dev: Animations 7.80, accessibility 7.40, WPO 7.40: the lowest dev scores of any SOTY-tier winner; the award leaned on design and commerce, not tech.
- **Thin:** no technical write-up or interview found. Sources: https://locomotive.ca/en/work/scout-motors ; https://www.awwwards.com/sites/scout-motors

---

## Cross-cutting patterns

**2020, the "scroll story + custom framework" era.** Winners are mostly narrative scrolls on bespoke agency stacks: Resn's Jelly (Three.js + GSAP), Monks' Vue framework, Merci Michel's game-like three.js. Common move: bake the expensive look (lighting, DoF, cloth, trees) offline and fake the dynamism in shaders (Pioneer's 4 relit textures, Kode's merged meshes and channel recoloring). Budget is explicit: Kode shipped 7.6 MB. E-commerce (Mammut) and Mobile (Synchronized) were won with DOM-first React/Vue and strong editorial design, no GL.

**2021, illustration and 3D fused, UI starts moving into the canvas.** Umami Land (2D sphere + 3D props), Star Atlas (point-cloud shader with fake DoF), Prometheus (stylised story). Cheap DoF via point size and baked blur recurs (Pioneer 2020, Star Atlas 2021). Locomotive Scroll + Shopify still wins E-commerce (Pangram). Palettes are bright; dev jury accessibility scores of 5.8-7.2 are normal.

**2022, theatrical transitions and cinematic realism, plus socially driven winners.** KPR (stencil-buffer worlds, click-and-hold), Persepolis (video-to-GL handoff, instancing, matched post across all scenes), Other Side of Truth (a content toggle as the whole design). Motion/transition scores peak: Animations 9.60 for KPR and Persepolis. Nuxt/Vue is the dominant framework in this group. Users' Choice goes to cause-led content with high community votes (9.07).

**2023, studio self-promotion with real physics, and 3D inside commerce.** Lusion v3 sweeps with a perfect 10.00 for Animations; Noomo uses cannon-es and glass reflections with explicit mobile fallbacks; Mana does 3D feeling on Shopify. Pattern: bake choreography in Blender, code the interactive layer, disable invisible variants, drop post-processing on the home page. Also: physical/gestural cursor response replaced scroll-only reveals as the memory hook.

**2024, UI-in-the-canvas and procedural content.** Igloo (SDF text everywhere, procedural ice, VDB volumes, loader = first scene, previs) is the clearest statement: authoring tools (Houdini) feed custom exporters; web size is treated as a design variable. At the same time the other 2024 winners (Opal, Don't Board Me) are DOM, Next.js/Nuxt and Lenis with strong illustration and typography. The bar split: GL maximalism for SOTY and Dev, solid craft for the rest. Svelte appears in the top-tier GL team.

**2025, the website becomes a game, or the brand site gets hyper-polished.** Messenger is a full multiplayer game in 5.7 MB, built with the same Three.js/Svelte/KTX2/Draco/meshopt toolkit; Lando Norris is a Webflow shell with externally hosted custom JS, Rive and Lenis, proving that no-code hosting no longer limits the top end; Scout Motors is Astro with a custom type family and scroll sequences. Characteristic traits: distinct custom typefaces (Brier, Scout Sans), single-hot-accent palettes (#D2FF00, #FF5432), designer-friendly motion tools (Rive), and WebGPU-adjacent engines.

**Persistent patterns across all six years**
1. Awwwards' own palette swatches overlap: #2779a7, #D14836, #987654, #FAD15F, #ECD06F recur across 2020-2022 pages. These look like default-suggested picks, so don't treat the palette field as the designer's colour system; real palettes come from CSS.
2. Dev jury scores for Accessibility (5.8-7.6) and Semantics/SEO (6.2-8.3) are consistently the weakest; Animations/Transitions (7.3-10.0) and WPO (6.4-9.0) are the strongest. Winning does not require accessibility.
3. Smooth scroll became a commodity: Locomotive Scroll (2021) -> Lenis (Lando, Don't Board Me, Scout 2024-25) and GSAP ScrollSmoother (Noomo).
4. Size and loading are always engineered: Draco, KTX2/Basis, meshopt, merged meshes, background shader compilation. Reported budgets: 7.6 MB (2020), 5.7 MB initial (2025).
5. The loader is part of the story in most winners: KPR logo frame-picker, Persepolis night-to-day blend, Igloo real-time intro, Mana preloader.
6. Sound is used on the narrative winners (Persepolis, Dark, Igloo, Noomo, Messenger) and ignored on commerce.
7. Mobile is mostly a degraded-quality path (smaller meshes, fewer physics steps), not a redesign, except the Mobile category winners.
8. Easing evidence from live CSS: expo-out-like curves dominate (0.24,1,0.36,1 and 0.65,0.05,0,1); the in-canvas easings are not published.
9. Frameworks by era: custom Three.js/Vue (2020-21), Nuxt (2021-24), React/Next on commerce, Svelte for top GL (2024-25), Webflow/Astro for brand sites (2025).

## Information gaps (thin sources)
- **Synchronized Studio (2020 Mobile):** no case study, Awwwards page unreachable.
- **Chungi Folio, Pangram Pangram, Mr. Pops, Opal Tadpole, Don't Board Me, Mana Yerba Mate, Scout Motors:** Awwwards data plus live-site clues only.
- **Prometheus Fuels:** original site is gone (now a WordPress site); Medium case study blocked (403).
- **Lusion v3:** no official v3 write-up; Codrops April 2026 article blocked (403).
- **Mammut, Lando Norris:** agency pages are high level; deeper claims here come from live-site files.
- Awwwards annual pages for several years were not machine-readable, so category assignments for KPR, Prometheus, Mr. Pops, Pangram, Opal, Don't Board Me are "per brief".
- No Codrops case study was found for Igloo Inc, Lando Norris, Lusion v3, or Messenger. Several Codrops pages and Medium returned 403/404.
