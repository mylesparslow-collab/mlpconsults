# Style families beyond the award look

The award corpus (winners.md, agency-playbook.md) mostly rewards one look: a near-black or off-white ground, one hot accent, one grotesk at weight 400, WebGL, Lenis, line-masked reveals and corner chrome. Build from those files alone and every site comes out looking related. This file is the counterweight: 33 excellent live sites from 9 families the awards rarely reward, found through Typewolf Site of the Day, Siteinspire, Minimal Gallery, Hoverstates, Brutalist Websites, Awwwards tag pages, muuuuu.org, s5-style, io3000, sankoudesign, the Webbys (Cultural Institutions, Data Visualization), Information is Beautiful and the Sigma Awards.

**Measured 2026-11-07:** headless Chromium at 1440×900 rendered each site for 6s, then a probe read the computed body/heading fonts and background, and `fingerprint.py` read the fonts, colours, stack and easings. Raw data is in `styles-data.json`. **Look at the sheets** in `assets/styles/NN-family.jpg` (hero plus a scrolled shot per site) before you choose. (The public repo copy of this skill leaves the sheets out because they're screenshots of other people's sites. If `assets/styles/` is missing, screenshot the family's sites yourself at 1440×900 before choosing.) Facts below are measured unless marked *seen* (read off the screenshot) or *inferred*.

## Chooser (read this, then only your family's section)

| The brief is… | Family | Section |
|---|---|---|
| writing, essays, a publication, a bookshop, a newsletter | Editorial | 01 |
| many projects or items, an archive, an institution, a festival | Exhibition index | 02 |
| a writer, researcher or engineer who wants it to feel authored; a diary; a tiny budget | Plain web | 03 |
| a developer, a tool, a game, anything playful-technical | Retro computer | 04 |
| a maker, a small shop, gifts, florist, satire, very personal | Handmade paper | 05 |
| a consumer brand, food, kids, an event, a fun agency | Loud pop | 06 |
| a shop, beauty, home, hospitality, wellness | Warm commerce | 07 |
| two scripts, hospitality, friendly-corporate, dense information | Japanese web | 08 |
| advocacy, research findings, a data journalist's or analyst's portfolio | Argument and data | 09 |
| "win SOTY", a studio selling 3D/WebGL work | award look | agency-playbook.md |

A **hiring portfolio** works in the family of the person's own medium: data → 09, writing → 01, a big body of work → 02, code → 03 or 04. Editors and clients want the work and the contact within five seconds, so skip loaders.

## What the new set does differently (measured across all 33)

| Knob | Award default | What these sites do |
|---|---|---|
| Ground | #0b0b0b or #f2f0eb | **Saturated or dark-hued grounds:** wine `#4b0a23` (Nordiska), rust `#a33314` (SIHA), plum `#74003d` (Carnilove), violet `#5f45f2` (Viens-là), yellow `#fee214` (Siglitos), olive `#3f521a` (Heart & Soil), peach (Soft Labor), lined paper `#fbf6e6` (Nothing on Purpose) |
| Type class | one grotesk | **Serif-led** (Migra, Domaine Text, Alegreya, Bradford, PP Editorial, Times Seven, plain Times); **mono or pixel** (DotGothic16, JetBrains/Space Mono, Favorit Mono, PT Mono); **handwritten** (Patrick Hand, Caveat, Theodore Handwritten, Kiddo); **Japanese** (LINE Seed JP, Noto Sans JP) |
| Weight | 400 everywhere | Headlines at **600–700** are normal: New Lines 600, Aeon 600, PDR 700, yama-niwa 700, Siglitos 700. Union Boulangerie goes the other way, with a hairline display at weight 80 |
| Width/case | normal width, sentence case | **Condensed uppercase at 200px+** (Carnilove's TTBluescreens 234px), **ultra-wide variable** (Viens-là's Obviously), letter-spaced Japanese (yama-niwa: 40px with 8px tracking, .2em) |
| Layout | one-screen hero, then sections | magazine grids, five-column plain lists, OS windows, scrapbook pages, single-column essays, product grids, full-bleed colour slabs |
| Imagery | renders, video, WebGL | archival scans and engravings, hand illustrations reaching into the frame, real objects (tissue box, certificate, an incense stick), warm interior photography, no images at all |
| Chrome | four corner labels plus "Menu" | a centred masthead with section nav, window title bars, a plain pipe-separated nav, a circular stamp button, bracket tags like `[ Rest ]` |
| Motion | expo-out reveals everywhere | none (HN, Possible Bitmaps, tiger.exposed), physics you can tug (Charmling's cord), games (Union's ingredient hunt, Viens-là's budget game), boot sequences (EddyOS), a diagram that animates inside the essay (The Pudding) |

**The stack is not what makes sites look alike.** GSAP + Lenis appear in SIHA, Carnilove, yama-niwa, Board and Hashimoto, and none of them looks like an award site. The sameness comes from the visual choices in the table above, so change those, not the libraries.

---

## 01 · Editorial: the magazine on screen
*Sheet: `01-editorial.jpg`.* For writing-led, publishing, research, essays, newsletters, or anyone with a body of work to read.
- **New Lines Magazine** (newlinesmag.com): Migra 600 at 38px for headlines over Epilogue 16px; one rose accent `#b53c59` for kickers; a wide outlined-display masthead; a three-column story grid with images of mixed sizes.
- **Aeon** (aeon.co): custom serif at 72px/600; essay cards on **flat saturated colour blocks**, one colour per section (`#f74d41`, `#9d1d20`, `#005645`, `#035a6d`); a mono font for the small "Essay / Physics" labels.
- **The Public Domain Review** (publicdomainreview.org): Alegreya throughout; a scanned engraving as the hero; pull-quote testimonials in a left rail; a newsletter box in the right rail. It looks like a printed page.
- **Emergence Magazine** (emergencemagazine.org): Bradford + GT America + Courier Prime; the whole site is organised as **one volume with a theme** ("Vol. 7: Seeds and Structures"); an archival photo fills the hero; the issue cover sits as an object in the corner.
- **Every** (every.to): Signifier serif headlines with letters swapped for a custom display face (*seen*); a newspaper column grid with rules between columns; pixel-art illustrations as thumbnails.
**Moves:** a real masthead; serif headlines at 600; kicker/byline/date metadata in mono; rules between columns; issue or volume structure; drop caps and footnotes in long reads.

## 02 · Exhibition and index
*Sheet: `02-exhibition-index.jpg`.* For archives, portfolios with many projects, institutions, and anyone whose work is best shown as a list.
- **The Book of HOV** (thebookofhov.com, Webby 2024, Linked by Air): the **title split into four words, one in each corner**, in PP Editorial at about 150px; ABC Favorit Mono at about 9px for the meta; International Klein Blue `#002fa7` on white; a full-width "Begin Audio Journey" bar.
- **Nordiska museet** (nordiskamuseet.se, Webby 2025): a **wine ground `#4b0a23`**, cream `#faf5eb`, red `#ff4629`; a giant word ("VÄLKOMMEN") running behind a photo so the image cuts it; Domaine Text for text, Mabry for UI; a custom cursor.
- **tiger.exposed** (Hoverstates): the homepage is **five columns of plain links, every project by discipline**, in system sans with no images. One small pixel mascot is the only picture.
- **Rijksmuseum** (rijksmuseum.nl): one painting fills the frame at full bleed, with the ticket call-to-action in the corner.
**Moves:** let the list be the hero; use an institutional colour as the ground; set the title as a composition across the page; put the mono metadata small.

## 03 · Plain web: personal, default, honest
*Sheet: `03-plain-web.jpg`.* For writers, researchers, technical people, diaries, and anything where the content should feel authored rather than marketed. Louis Paquet won Independent of the Year 2025 with a site like this.
- **Hacker News**: Verdana 13.33px, `#f6f6ef` ground, one `#ff6600` bar. It has worked unchanged for 19 years.
- **Possible Bitmaps** (possiblebitmaps.com): browser-default Times, dense columns of links, a dithered black-and-white photo, a cyan header bar.
- **Soft Labor** (softlabor.biz): **Times Seven at 24px for everything**, on a peach ground; the wordmark looks like **ink bleeding into paper**; numbered essays in a three-column feed.
- **The Pudding, "afterlife of pi"** (pudding.cool): default Times body; an animated SVG figure sits inline in the text, with a "Pause animation" button; 20 canvases appear only where the story needs them.
**Moves:** one family at one or two sizes; default faces used on purpose; dense links; content before chrome; one hand-made image treatment (dither, ink bleed) instead of motion.

## 04 · Retro computer, OS and terminal
*Sheet: `04-retro-computer.jpg`.* For developers, tools, games and anything playful-technical. It's easy to make this look like a gimmick: commit to one era and do it fully.
- **EddyOS** (eddy-naboulet.dev): DotGothic16 + Jacquard 12 (pixel blackletter); an **amber CRT boot screen** with "[ OK ]" lines; windows and files as navigation; a CRT toggle; colour themes named Phosphore, Sorbet and Néon; Howler sound; a playable Doom port.
- **Peaches** (peaches.world): JetBrains Mono + Space Mono; one **giant glossy orange 3D ENTER key** (`#ff5a00`) on a scanline grid (`#0a0b0e`); "any key works"; display modes Grid/Pixels/Dots/Glyphs. **8KB of JS/CSS in total.**
- **Elevenyellow** (elevenyellow.com): bitmap faces (Profontwindows, Nk57 Monospace); a full-bleed red hero, then `#bdfe00` on `#1a1b1d`; a manifesto set in all-caps mono; WASD-style exploration.
**Moves:** a bitmap or mono face at true pixel sizes; a boot or "press a key" loader that takes the place of a hero; keyboard-first interaction; one era's palette (amber phosphor, Mac OS 9 grey, CGA). See the `ascii-library` skill for glyph art.

## 05 · Handmade, paper and scrapbook
*Sheet: `05-handmade-paper.jpg`.* For makers, small shops, gifts, satire, florists and anyone personal and warm.
- **Nothing on Purpose** (nothingonpurpose.com): Patrick Hand + Caveat + Special Elite (typewriter); a **lined-paper ground** `#fbf6e6`; yellow highlighter swipes behind words; sticky notes; a certificate as the product object; a cookie banner styled like a paper slip.
- **Heart & Soil Flowers** (heartandsoilflowers.com, Typewolf SOTD): Cardinal Fruit + Baskervville + Sweet Sans + PT Mono; an **olive ground `#3f521a`** that changes to paper textures on scroll; a circular "Inquire now" stamp; season tabs (Spring, Summer…); thin outlined frames waiting for photos.
**Moves:** a textured or ruled ground; two to three expressive faces (one hand, one typewriter or serif); objects with shadows and slight rotations; marker and highlighter marks; copy in the first person.

## 06 · Loud pop: colour slabs and condensed display
*Sheet: `06-loud-pop.jpg`.* For consumer brands, food, kids, games, events, and an agency that wants to look fun.
- **Carnilove** (carnilove.ashfall.studio, muuuuu): **TTBluescreens condensed uppercase at 234px**, `#4a002a` ink on `#f6e1ce`, with red `#f00037` and plum `#74003d` sections; a draggable pet-profile quiz.
- **Viens-là** (viens-la.com, Httpster): an **ultra-wide variable Obviously "ÇA CHARGE" loader in violet `#5f45f2` on butter `#ffe375`**; mint, peach and sky secondary colours; a handwritten accent face; a character guide and a budget mini-game in WebGL.
- **Siglitos** (siglitos.com, Awwwards colourful): Hobeaux 700 uppercase on yellow `#fee214`; six named characters; a "Jugar" game.
- **Klim Type Foundry** (klim.co.nz): **full-bleed slabs of single colour** (`#e4001c`, black, `#ffcc01`), each with only a typeface name in tiny type in the corner.
- **Board** (board.fun, Typewolf SOTD): Kabel + Neue Haas Grotesk on cream `#fffef1`; saturated photo blocks; `elastic.out` easing.
**Moves:** two or three saturated colours at equal weight (not one accent); a condensed or ultra-wide display at 15vw or more; chunky radius; bouncy or elastic easing (the award curves are too polite here); characters.

## 07 · Warm commerce and lifestyle
*Sheet: `07-warm-commerce.jpg`.* For shops, beauty, home, food, hospitality and wellness.
- **Fume** (fume-studio.com, Siteinspire): Inter in 14px caps + Roboto Mono; **warm 1970s interior photography**; each product on a single terracotta ground; a slide-out cart.
- **SIHA** (siha.com.au, Siteinspire): ABC Walter Neue; a **rust ground `#a33314`** with cream `#fbfbf9`; products on sand-coloured cards in a grid; a three-step "Find your routine" quiz.
- **Union Boulangerie** (unionboulangerie.com, Siteinspire): Serial Blur at **weight 80** uppercase with Kiddo handwriting written across it; orange `#f65128` and blue `#2259ec` tab buttons; a video hero of the bakery; a hidden ingredient-collecting game.
- **Charmling** (charmling.app, Awwwards illustration): Instrument Serif italic + Clash Display + General Sans; gold `#e3b55c` on `#0b0812`; a **lucky charm on a cord you can pull**, with physics and sound.
**Moves:** photography with warm light and real rooms; a coloured ground carried through product cards; a quiz or finder in place of a feature grid; one hidden delight.

## 08 · Japanese web
*Sheet: `08-japanese.jpg`.* For hospitality, lifestyle, corporate-friendly brands and any site in two scripts. Japanese sites are denser and friendlier than Western award sites, and lean on illustration and geometric shapes.
- **yama-niwa** (yama-niwa.jp, s5-style): Noto Sans JP 700 at 40px with **8px tracking (.2em)**; **green triangles `#5bb442`** as wayfinding on `#f7f4ef`; bracketed English tags like `[ Rest ]` under Japanese headings; a mountain photo with a caption overlaid. Astro, Lenis, CSS scroll-driven animation.
- **&CRECiA** (and.crecia.co.jp, io3000): LINE Seed JP + Tilt Warp; **illustrated hands reaching in from the top edge** to hold the cards; a tissue box as the page's object; cream `#fcf8f2` with cyan `#19b7e4`.
- **Toshiyuki Hashimoto** (toshiyukihashimoto.jp, s5-style): ABC Diatype + Noto Sans JP; the name stacked large in Latin with the **Japanese name set vertically** beside it; hairline diagonal construction lines across the page.
- **Hello Beauty & Mag.** (mag.hello-beauty-wellness.com, sankoudesign): a Playfair masthead over a **photo cropped to an organic blob**; pastel blobs carrying names set on curves; Noto Serif JP article titles; `#fbf8f3` with a `#d9ff43` accent.
**Moves:** mixed scripts as design (vertical Japanese, bracketed English); wide tracking on headings; geometric wayfinding shapes; illustration around photos; more items per screen than a Western site would show.

## 09 · Argument and data
*Sheet: `09-data-argument.jpg`.* For advocacy, research findings, reports and anything with numbers that should hit hard.
- **Energy Profits** (energy-profits.org, Webby 2024 Best Data Visualization): aktiv-grotesk at **23px body** with the figures as the hero ("$33.4b"); black with `#fd3e12` and amber `#ffa022`; vertical labels on the edge; a "Download data" button on every block; numbered sources.
- **The Pudding** (see 03): the figure animates inside the paragraph that describes it.
- **Blond** (blond.cc, Siteinspire): a Swiss-ish product studio: Monument Grotesk at 10px for UI, the **wordmark in chartreuse `#e9fe79` at full width over an office photo**, and a Selected/All filter on the work. It sits closest to the award look, so use it as the bridge between the two.
**Moves:** the number is the headline; body text larger than usual (20–24px); a source on every claim; download links; motion only to show a change in the data.

---

## How to use this file
1. Read the brief and pick **one family** that fits the subject and audience. Use the award references (agency-playbook, soty-teardowns) only when the brief is explicitly "win SOTY" or a studio selling WebGL work.
2. Open that family's sheet and look at it. Write down two sites and the exact moves you're taking from each.
3. Fill in the jury sheet with that family's knobs: ground, type class, weight, case, layout model, imagery, chrome, motion.
4. Run the **sameness check** in SKILL.md step 1b against `recent-builds.md`.
5. Re-skin everything. Copy the moves, never the fonts you don't own, the copy, or the brand.

To add sites: put the URL in a list, run `fingerprint.py --json` plus a 1440×900 screenshot, look at the shot, then add it here under its family with measured facts and rebuild that family's sheet.
