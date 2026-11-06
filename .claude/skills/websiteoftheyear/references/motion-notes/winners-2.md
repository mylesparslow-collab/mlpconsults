# Motion notes, batch 2 (11 sites)

Method: 1 fps overviews of every recording, then 8-12 fps strips at key moments (about 83-125 ms per frame). Timings are read from frame counts and are good to about +/-100 ms. "Observed" is what the frames show. "Inferred" is my guess about the implementation.

Capture quality, short version:
- Usable: mana, othersideoftruth, mrpops, buttermax, echo, opal, pangram.
- Partly usable: staratlas, persepolis (stuck on its loader).
- Useless: umamiland, and pioneer past its loader.

The `loader-wait-done` label was wrong or misleading for mana, mrpops, buttermax, echo, persepolis and pioneer. Details are per site below.

---

## 1. opal (opalcamera.com/opal-tadpole) - USABLE, but the page is now an essay, not the product site

Observed: the 2026 page is a dark essay, "the table", with a full-bleed top-down photo of a work table. It is not the Tadpole product page.

**Loader**
- There is no visible loader. White flash for about 1 s, then a cut to black.
- The small "opal electronics" wordmark sits top-left from about 1 s.

**Intro reveal**
- At about 3.4 s the title "the table" wipes in left to right with a fade, roughly 0.5 s. This is a clip or mask wipe with a soft edge.
- The date line follows immediately.
- The body paragraphs then reveal top to bottom as one soft-edged gradient mask, about 0.8 s, at about 3.8-4.5 s.
- The background photo fades up from black over about 0.5 s at the same time (4.0-4.6 s), so text and image settle together.
- Easing looks like a plain ease-out opacity, with no overshoot.

**Ambient motion**
- None during the 3 s idle. The frames are static.

**Cursor**
- No visible reaction in the sweep.

**Hover**
- The only hover target is a 20x20 logo. No visible change.

**Scroll**
- The long text scrolls fast. 45 ticks of 200 px cover about 11 s, and the recording cuts the page at its end.
- At the page end there is a black footer with a giant ghost wordmark "opalopal", nearly black on black.
- A slow lighter arc or highlight sweeps through the "a". It looks like a slow shader or SVG highlight, and the sheen is only visible when you look for it.
- The footer links are tiny (Support, Terms, Privacy, Jobs, Contact).
- The photo pans slightly under the text on scroll. Estimated parallax is 0.3-0.5x (inferred).

**Page transition**
- Clicking `/composer` is a hard cut. It leaves for op.al/composer, which is a different light-grey site.
- There is no transition. About 5 s of load was recorded before the cut.

**Signature motion**
- The soft-edged mask wipe on the title and paragraphs, plus a photo fade from black, in a single 1.2 s beat. Dark, quiet, editorial.
- How to rebuild: `mask-image: linear-gradient(to bottom, #000 calc(var(--p)*100%), transparent calc(var(--p)*100% + 40px))`, animate `--p` from 0 to 1 over 800 ms with an ease-out.

---

## 2. mana (en.manayerbamate.com) - USABLE, but a promo modal blocked everything after about 41 s

**Loader (best part)**
- A cream screen carries the text "INFUSED OF BIO ENERGY" in huge grotesk caps.
- Letters type in one at a time, about 70-80 ms apart, in 3 lines.
- Each new letter flashes through the pastel palette before it settles to black: yellow, light blue, pink, crimson, navy, orange.
- Because of that lag there is a rolling "rainbow tail" about 3-4 letters long behind the cursor point.
- Total type-on is about 1.8 s (frame strip at 14 s).
- Small sparkle glyphs and "YERBA" and "MATE" labels fade in at the sides at about 15.2 s.
- The exit starts at about 16.5 s. Green circles bloom (scale from 0) at random positions and sizes until the screen is flooded. About 12 circles over about 0.8 s, with the last ones the largest.
- Easing on each circle is ease-out, and they are staggered.
- The screen then stays plain green for about 14 s. This is slow asset loading, not an animation.
- `loader-wait-done` at 22 s landed during that green hold.

**Intro reveal**
- A black matte 3D can (WebGL, unlit) tosses up from below at about 32.4 s.
  - It rises about 600 px, tilting.
  - It overshoots and settles upright, about 1 s.
- The can goes lit and textured at about 33.4 s.
- The illustrated stickers (flowers, leaves, a sun, a character) slide in from the left and right edges with about 100-150 ms stagger over about 0.5 s.
- The nav, banner and product pill fade in last.

**Ambient motion**
- Not visible in the sweep.

**Cursor**
- No visible reaction.

**Hover**
- The two hovers were at y=900 (off-page). Nothing is visible.

**Scroll**
- A hero scroll scrub rotates the 3D can through about 150 degrees on the first scroll. This was the first 4 s of the scroll.
- The can goes front, then tilts, then top-down.
- The stickers shift slightly, a parallax of about 0.1-0.2x (inferred).
- At about 41 s a "Le Vendredi fou" promo modal opens (rounded card, dark overlay). It stays open for the rest of the recording.
- Everything after about 41 s shows only the modal, with a countdown clock ticking. The scroll-up and the click were useless (the click errored).

**Page transition**
- None observed. The click timed out.

**Signature motion**
- The rainbow-tail typewriter loader, then the circle bloom wipe.
- Rebuild:
  1. Per-letter spans revealed on a 75 ms interval.
  2. On reveal, cycle a CSS color through 5 pastel values over about 300 ms, then land on black.
  3. For the exit, 12 absolutely positioned green circles scale from 0 to 3-4x viewport, with a 40-60 ms stagger and an ease-out.

---

## 3. persepolis (getty.edu/persepolis) - STUCK ON LOADER; about 21 s of content

**Loader**
- The page is dark charcoal (#262626) with "Getty" top-left.
- A tiny gold counter "0" sits in the centre.
- At about 14 s an ornamental circular rosette (a ring of scalloped, Persian-style border) draws around the counter. The ring is gold, thin-line, and fades in over about 0.5 s.
- The counter runs 0 to 38 in about 3 s (fast, then stalls). It reaches 37-38 at about 17 s and does not move for the remaining 40+ s. The load stalled.
- The background cross-fades to a smoky blue-grey photo at about 17.5 s. It stays there as soft, slowly drifting smoke or cloud texture. The drift is slow (about 5-10 px/s, inferred).
- Bottom-right has two small circular icon buttons (probably sound and a menu or info toggle).

**Cursor**
- No visible reaction.

**Hover (icon buttons)**
- A circular button fills solid white from the bottom upward, a liquid or "rise" fill. It takes about 0.5-0.7 s in about 8 frames (strip at 32.2 s).
- The white stays filled while the pointer is on it.
- Easing is ease-out. It reverses when the pointer leaves.

**Scroll / transition**
- Nothing happens. The page is stuck on the loader.

**Signature motion**
- The ornamental ring plus count-up loader. That is all that can be seen.

---

## 4. othersideoftruth (theothersideoftruth.com) - USABLE, richest of the batch

**Loader**
- White, then a flat yellow (#F5E64B) for about 5 s. No loader UI.
- A thin nav element (a black "W." Awwwards badge) appears first, at about 12 s.
- The label said loader-done at 22 s, which is actually after the hero was fully built.

**Intro reveal (physics letters)**
- A blue to yellow sky gradient wipes in from the top at about 12.9 s.
- The giant yellow letters of the word UKRAINE drop one at a time from above the frame and stack along the bottom.
  - Each is rotated at a random angle, and they land staggered, about 300-400 ms apart.
  - They are semi-transparent in flight (fading in as they fall, about 0.5 s).
  - Motion is gravity-like: accelerating fall, brief settle. There is a small bounce at the end, not a spring.
  - The whole drop runs about 4 s (12.9-17 s).
- Letters overlap, kerning loosely.
- This is physics-style (inferred matter.js or hand-rolled gravity) with the letters acting as rigid bodies.
- Nav items fade in along the baseline: "/ BEGINNING", "/ DATE", "/ WAR IN NUMBERS", "/ DESTRUCTION", and so on.
- Bottom captions: "A MOMENT OF TRUTH: RUSSIA-UKRAINE WAR", "DAYS OF WAR: 1715", and a Kyiv clock.

**Ambient motion**
- The letter pile is static during the idle and sweep. I could not see letters reacting to the cursor.

**Hover**
- Nav labels: only a faint colour shift (a subtle opacity change on "/ DESTRUCTION"). Too small to time.
- The #STANDWITHUKRAINE and DONATE links showed no visible effect.

**Scroll**
- On the first ticks the giant letters scale up and swing past the camera. The whole pile zooms, with a fast ease-out (visible in the 38 s strip).
- Content then comes up as a yellow field with building photos in a staggered grid. They fade in with a sepia or tint wash.
- A cluster of chat-bubble stickers rotated at random angles scrolls through, overlapping headline text ("WE WANT TO BRING PEACE BACK...").
- Later, a giant blue "24 FEB 2022" headline is rotated about -5 degrees and moves across horizontally. Rotated photo cards pop around it in staggered fashion, each tilted a few degrees.
- At about 53 s the field flips to an olive or khaki block with white type ("RUSSIA IS THE REASON UKRAINIAN...").
- Headline parallax is about 1.5-2x the scroll rate (inferred from relative speeds).

**Page transition**
- None. The recording ends back at the hero after scroll-up.

**Signature motion**
- The falling-letters hero (physics drop of the giant rotated letters over a blue-to-yellow sky), then the whole pile zooming past the camera on the first scroll.
- Rebuild: absolutely positioned letter divs, each with `translateY(-120vh) rotate(r)` going to a resting pose.
  - Use a 350 ms stagger and a cubic-bezier(0.55, 0, 1, 0.45)-type gravity ease, then a 150 ms settle with a tiny rebound.
  - On scroll, scale the whole group with `transform: scale(1 + p*3)`.

---

## 5. umamiland (umamiland.withgoogle.com) - USELESS

- The page redirects to a dark-mode Google search home page ("Google", search bar, About, Store, Gmail, Images, Sign in). The Umami Land experience is gone.
- The nav hovers show Google chrome (pill highlight on Sign in). That is not the target site.
- Do not draw any conclusions from this recording.

---

## 6. staratlas (staratlas.com) - PARTLY USABLE (video background + gated modal)

- The recording ran 70 s, but the page was gated by an "EARLY ACCESS" email modal the whole time.
- The "Close" click at 39 s did not remove it (the modal is still there in the frames).
- The goto timeout (30 s) was only a network-idle issue. The page actually rendered at about 5 s.

**Intro**
- A dark teal screen at about 5.3 s, with a soft green radial glow rising from behind the modal.
- The modal (a HUD-style panel with a thin border, "A" logo, close X) is present from the start. A cyan "GET EARLY ACCESS NOW" button sits inside.
- At about 8.5 s, "EXPLORE, CONQUER, AND EARN IN A PLAYER-DRIVEN ECONOMY" and the STAR ATLAS wordmark fade in above the modal. Easing is an ease-out fade, about 0.4 s. No letter stagger.
- At about 7.5 s a video background fades in (a close-up of a closed alien eye).
- The video runs in a loop. At about 42 s the eyes snap open, then it cuts to a space scene (planet, asteroids, burning ship).
- This is a pre-edited cinematic cut, not a UI animation.

**Ambient**
- A live timestamp ("STAR ATLAS LOG 2025.11.25 23:11:53") ticks in the modal footer, monospace.
- The modal panel has a subtle scanline or glow flicker (inferred).

**Cursor**
- No visible reaction. The sweep was blocked by the modal.

**Hover (CTA button)**
- An inner second keyline (a double border) appears around the button in under 100 ms (a few frames). It is near-instant.
- The fill goes slightly brighter.

**Scroll**
- Nothing scrolled. The modal blocks it.

**Signature motion**
- The cinematic video background with the HUD modal. Little UI motion to rebuild beyond a typewriter-style timestamp and the double-keyline button.

---

## 7. mrpops (mrpops.ua/en) - USABLE; the loader lasted 45 s, so all interactions before about 68 s were wasted

**Loader (about 23 s to about 67 s)**
- A cream background (#FCE5C8).
- A hand-drawn wavy circle outline (a scalloped, double-line ring) draws itself as a stroke (stroke-dashoffset) over about 1.5 s. The first frames show only the start of the arc at the top.
- A red U-shaped brand mark (the "pops" mouth shape, two quarter-circle wedges) grows in the centre in about 0.5 s.
- The mark sits there for a long time, which is the slow load.
- At about 66.5 s the U closes and morphs into a tall "0" / oval over about 0.8 s. The two halves join as the counter closes. This is a loading-complete beat, or a 0 from a percent count (inferred).

**Exit and hero reveal**
- The photo panel rises from the bottom, with its top edge a curved or wavy arc that flattens as it rises (a curved curtain wipe).
- Easing is ease-in-out, about 0.8-1.0 s (66.9-67.8 s).
- The photo (a woman holding a popsicle) starts zoomed and scales down slightly as it fills the screen.
- The huge white display headline "TRUE ICE CREAM" (a 3-line, quirky ligature typeface) slides in line by line, each line clipped at its baseline. It takes about 0.7 s with a 100-150 ms stagger. This is a line-mask reveal.
- The nav pills (cart, "Flavours", "Menu") fade in at about 68 s. A small body paragraph fades in beside the headline.
- A circular "CLASSIC"-style button with a thin ring sits near the copy. A small cursor-like dot inside it blinks, and I can't confirm what it is.

**Scroll (at about 70 s, after the loader)**
- A red full-bleed section slides over the photo, with the headline "THIS IS MR. POPS. HE'LL WIN OVER EVEN THOSE WHO ARE COMPLETELY INDIFFERENT TO ICE CREAM." in condensed caps.
- Cut-out photos (a smiling woman with a popsicle, a couple) float up from below at different speeds (parallax about 1.3-1.6x).
- Hand-drawn cloud doodles drift sideways.
- A beige panel with a faint repeating marquee text ("A BRIGHT PRODUCT OF NATURAL QUALITY...") scrolls in as a ghost layer behind the photo.
- Sections change background colour (cream to red to cream) as hard bands, not fades.

**Hover**
- Everything hovered before about 68 s was during the loader, so the target text ("Flavours", "Menu") shows nothing.
- No hover data.

**Page transition**
- The click `/en/` loaded the same URL. It reloaded the page with no transition visible.

**Signature motion**
- The loader mark morph (U to 0), then the curved-edge curtain rising with a zoomed photo.
- Rebuild: `clip-path: path()` or an SVG mask with a quadratic curve on the top edge. Animate the curve control point's y from sag to flat as the panel translateY goes from 100% to 0, over 900 ms with an ease-in-out. Start the image at scale 1.3 and settle to 1.

---

## 8. pangram (pangrampangram.com) - USABLE

**Loader**
- No loader. A white page appears at about 0.5 s.

**Intro reveal**
- A rounded-rectangle grey card appears with a tiny red tag and a pill CTA pair ("Explore font" and "Try for free"), but with no title yet.
- At about 1.8 s, black line-art ornaments (radial "Aa" specimen burst diagrams) fade in on the left and right, about 0.3 s.
- The tagline "One typeface. Nine Universes." and buttons fade in at about 2.6 s.
- The title "Altera" fades up from the grey (opacity, about 0.4 s) at about 2.9 s.
- The next card, a mountain photo "Neue Gstaad", peeks from the bottom edge and fades its title in later (about 3.5 s).
- The nav (All fonts, Font starter pack, Font in use, Academy, Support) shows at about 1 s.

**Ambient**
- A very slow drift in the radial ornaments (inferred from small differences between frames).
- No marquee.

**Cursor**
- No visible reaction.

**Hover (nav links)**
- Hover turns the link text red. It is near-instant (1-2 frames at 12 fps, so under 150 ms), with no underline.
- There is a slight shift on "Font starter pack" and "Font in use", but only the colour change is clear.

**Scroll**
- Hero cards stack like a sticky deck. The first card (Altera) shrinks and stays pinned as a thin strip at the top, and the next card (Neue Gstaad) takes over the viewport.
- The same happens again with a blood-orange photo card ("A familiar Humanist with Fizz").
  - Each card change takes about 1 s of scroll.
  - Rounded corners are kept.
  - The old card is dimmed slightly while it shrinks.
- Below the cards, a "Our newest fonts" grid fades in with skeleton cards whose counters show "00" before the data arrives.
  - The cards stagger in by column, about 60-100 ms each.
- A black "We provide trend-conscious, free to try fonts for designers" slide, a carousel of cards, and an academy strip follow.
- The large footer is a dense mega-menu and a script-font "Pangram Pangram Foundry" mark.
- On scroll-up, the page returns to the hero. The nav stays visible at the top through the whole scroll.

**Page transition**
- The click on `/collections/fonts` timed out, so no navigation was observed.

**Signature motion**
- The sticky stacking hero cards, where each rounded card shrinks to a strip as the next takes over.
- Rebuild: `position: sticky; top: 0` with scroll-linked `scale` and `translateY`. As the next card enters, scale the previous one to about 0.94, keep a rounded `overflow: hidden`, and darken it with an overlay.

---

## 9. pioneer (cornrevolution.resn.global) - STUCK ON LOADER AT 42%; USELESS after that

**Loader**
- A black screen. At about 11 s an outline-only "PIONEER" lockup (a corn-field logo plus word) appears, with glitchy, shaky contour lines (jittering stroke outlines that re-draw every frame).
- Below it is a percent counter ("0%"), with "Loading your experience" beneath, in tiny type.
- A small chip in the bottom-left reads "CLOSE ... PRIVACY"-style, and it is cyan-green when active. I cannot read it at this resolution.
- The counter went 0% to 42% in 33 s, with plateaus. For example it sat at 33% for about 5 s, then moved in steps. The site never finished.
- Its progress is discrete, not eased, so it jumps.

**Everything else**
- Nothing past the loader was recorded. The 3 s idle, sweep, hover (one at x=0) and scroll are all on top of the loader.
- I cannot report anything about reveal, hover, scroll or transition.

---

## 10. buttermax (buttermax.net) - USABLE, but the scroll and the click were not useful

**Loader (about 24 s to about 53 s, long)**
- A near-black screen (#111) with a yellow (#FFD800) "X"-shaped logo (four rounded blobs) at centre.
- It loops: X, then the blobs retract to a single dot (about 0.35 s), and a few tiny satellite dots scatter out and return, then back to X. About 1.1 s per loop.
- This is a metaball or blob-morph with an elastic ease (overshoot visible at the X reforming).
- The label said loader-done at 23.6 s but the loader was still running until about 53 s.

**Exit (about 53.2 s, about 1.2 s)**
- A halftone dot field blooms from the centre. An RGB-split (cyan/green and magenta fringes) dot grid appears on black and expands outward while the dots grow.
- The dots then swell until they merge into the yellow field. At that point the yellow floods the screen.
- Dots on the far side shrink to nothing as the wave passes.
- A diagonal stripe pattern (like a moire or wavy halftone) is visible midway.
- The effect reads as a threshold-based halftone wipe (inferred fragment shader: a dot radius from a noise or distance field with chromatic aberration).
- A black paintbrush-stroke mark flicks across the top-right at the same time. It is a small blob with a tail, a quick flick.

**Intro reveal**
- The nav is already there: a top-left X, a centre logo (striped oval), and pill buttons WORKS / PROFILE / CONTACT at top right. A black cookie bar runs along the bottom with two outlined pill buttons.
- A 3D holographic-looking handheld game console (iridescent shader at first) fades and glitch-dissolves in around 54.0 s.
  - It has an iridescent rainbow sheen at first and loses it as it settles, about 0.8 s.
  - It sits tilted with a very slight slow float.
  - It reads as a pixel or scan-dissolve with an iridescent shader (inferred).

**Scroll**
- During the scroll the console disappears and the screen is plain yellow with only the nav and cookie bar. No scrolled content was recorded. Either the content hadn't loaded or the projects page is lazy.
- No parallax data.

**Hover / cursor**
- No hover data (none were logged), and the sweep shows no visible reaction.

**Page transition**
- The click on `/projects` reloaded the home page. Nothing observable.

**Signature motion**
- The X-to-dot blob loop, then the halftone dot-grid wipe with chromatic fringes that floods to yellow.
- Rebuild:
  - A full-screen WebGL quad. The fragment shader computes a rotated dot-grid cell, a dot radius of `smoothstep(0, 1, uProgress*1.6 - dist)` per cell, and samples R, G and B with a 2-3 px offset for the fringing.
  - Mix to flat yellow when the dots exceed the cell size.
  - Animate `uProgress` from 0 to 1 over 1.2 s with ease-in-out.

---

## 11. echo (airforceecho.com) - USABLE; a very slow loader and a sign-in gate (no scroll)

**Loader (about 29 s to about 48 s, long)**
- A pale blue-grey screen (#A6B5BA).
- Centre text "INITIALIZING SYSTEM_" in small tracked caps, with a trailing blinking underscore cursor. Before it, a brief "INIT_" fragment is visible.
- Behind it, a large pale ghost counter (0 to 99, thin digits) counts up. It is visible as an ultra-light number. It runs 21, 28, 35, 37 (stalls), 46 (stalls), 79 (stalls), 96, 99. It is step-wise, with long holds.
- Four corner square brackets (small "o" marks) frame the text.
- Tiny scattered glyph particles flicker around the centre (a scramble of characters).
- The US Air Force logo sits top-centre and a headphones icon with "HEADPHONES RECOMMENDED" sits at the bottom.
- A cookie banner sits at the bottom from about 38 s.

**Loader exit (about 47.8 s to about 49 s)**
- The "INITIALIZING SYSTEM" letters drop out randomly, one at a time (a scramble or delete effect). Only a few letters remain, and then none. It takes about 0.8 s.
- The ghost number fades. Then the corner marks and the particles vanish, and the logo and headphones icon fade out last.

**Intro text (about 50 s to about 59 s)**
- "THERE ARE SKILLS YOU ARE TAUGHT." then "AND SKILLS YOU DEVELOP."
- Each line types in left to right with a soft-edge wipe (a clip with a fade), about 1 s each.
  - Each holds for about 1.5 s, then fades out.
  - The first line is bold and gets lighter as it fades.
- A very faint hexagon grid texture sits in the background.

**Logo reveal (about 61.8 s to about 63.5 s)**
- "E.C.H.O." fades in as a glitchy pixel-block dissolve (the glyphs are assembled from blocky segments that resolve and sharpen over about 1 s). It looks like a stepped digital scan or reveal.
- The USAF logo and the sub-line "ENHANCED COGNITIVE HUMAN OPS" fade in at about 0.3 s offsets.
- A SIGN IN pill button fades in last, about 0.4 s.
- Nav (Cookies, Accessibility, a small toggle) is top-right.

**Ambient**
- A soft rippling fabric or flag-like WebGL surface slowly drifts behind the lettering (visible as a lighter wave at the right in the later frames). A glint of light sweeps across the letters (a diagonal gradient moving through the glyph fill), which makes the letters flicker between solid and lighter. The sweep takes about 3-4 s, and it repeats (inferred loop).

**Cursor**
- No visible reaction in the 9 s sweep window (it was spent partly in the loader).

**Hover**
- The hover targets were the cookie links at x=0 (off-screen, bad). The last one, "Accept Cookies", was clicked or hovered at 59 s, and the banner stays.
- No usable hover data. The SIGN IN pill looked unchanged in the frames I saw.

**Scroll / transition**
- There is no scroll. The page is a single locked gate.
- No page transition.

**Signature motion**
- The loader's ghost counter plus letter-drop scramble exit, then the glitch-dissolve reveal of "E.C.H.O." over a drifting fabric.
- Rebuild:
  - A giant 20%-opacity counter behind the status text, with step-wise updates.
  - On complete, per-character `opacity` going to 0 on a random stagger (0-600 ms).
  - Logo reveal using a sprite or `clip-path` of blocks, with the block order randomised and a 12 fps step easing (`steps()`).

---

## Cross-site motion grammar (this batch)

**Durations**
- Text and element reveals: 400-800 ms. This is the sweet spot (opal 500-800 ms, pangram about 400 ms, staratlas about 400 ms, echo about 1 s).
- Big transitions or loader exits: 800-1200 ms (mana circle bloom about 0.8 s, mrpops curtain about 0.9 s, buttermax halftone about 1.2 s, echo scramble about 0.8 s).
- Long ambient loops: 1-4 s (buttermax blob loop 1.1 s, echo light glint 3-4 s).
- Hover feedback: under 150 ms for colour (pangram, staratlas) or 500-700 ms for a fill (persepolis).

**Staggers**
- 70-80 ms per letter for typewriter reveals (mana).
- 100-150 ms per line or per element (mrpops lines, mana stickers, pangram cards at 60-100 ms).
- 300-400 ms per big object (othersideoftruth letters).
- Random stagger 0-600 ms for scramble-style exits (echo).

**Easing shapes**
- Reveals are mostly ease-out (fast start, long settle), as in expo or quart out. This applies to opal, pangram, staratlas and the intros on mana.
- Curtain and wipe moves are ease-in-out (mrpops, buttermax).
- Physics or gravity (othersideoftruth) uses accelerating motion with a tiny rebound.
- Overshoot or elastic shows up only on playful brand loaders (mana can toss, buttermax blob).
- Near-linear or stepped is used for tech or HUD moods (echo's counter, staratlas's timestamp, pioneer's percent).

**Common reveal patterns**
1. Soft-edged mask wipe (gradient mask, left to right or top to bottom), as in opal and echo.
2. Line mask or per-line clip slide-up (mrpops).
3. Per-letter colour cycling or scramble (mana, echo).
4. Shape-based full-screen wipes: circles (mana), curved curtain (mrpops), halftone dots (buttermax). Three different ways to cover the screen with one brand colour.
5. Fade from black or from grey for photography (opal, staratlas, pangram).
6. Elements entering from the page edges with a stagger (mana stickers).

**Common hover patterns**
- A near-instant colour swap on nav links (pangram).
- A fill rising inside a round icon button (persepolis).
- A double keyline on a CTA (staratlas).
- No hover data survived for the rest.

**Scroll patterns**
- Sticky card stacking with the previous card scaling down (pangram).
- Scroll-scrubbed 3D object rotation (mana).
- Hard colour bands that change as sections slide over each other (mrpops, othersideoftruth).
- Parallax of about 1.3-2x on floating cut-outs and headlines (mrpops, othersideoftruth).
- A big scale-zoom of a hero type on the first scroll (othersideoftruth).
- Five of the sites ran long loaders (mana about 17 s of intro plus a 14 s hold, mrpops about 45 s, buttermax about 29 s, echo about 19 s, pioneer more than 33 s and never done). Treat slow assets as a recording artefact, not a design choice.

**Loader language**
- Big typography (mana), a logo morph (mrpops, buttermax), an outline logo plus a percent (pioneer), a ghost counter in a HUD frame (echo), and an ornamental ring with a counter (persepolis).
- Counters are almost always stepped or jumpy because they follow real load progress.

**Recording problems to remember**
- umamiland is a redirect to Google (useless).
- pioneer and persepolis never left the loader.
- mana is blocked by a modal after about 41 s.
- staratlas is gated by a modal throughout.
- mrpops and buttermax spent the scripted interaction time on loaders, and the clicks timed out.
- echo's hovers hit the wrong elements (x=0) and it never scrolls.
- `loader-wait-done` was wrong for six of eleven sites.
