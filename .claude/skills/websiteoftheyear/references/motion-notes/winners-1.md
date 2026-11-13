# Motion notes, batch 1 (11 sites, 1440x900 recordings)

Conventions: "observed" = seen in frames I extracted. "inferred" = my reading of the frames. Times are video seconds, not JSON seconds. The JSON `loader-wait-done` label was wrong or misleading on most sites: the recordings were slow-loading, so many scripted actions (hover, sweep) fired while the loader was still on screen. Real loader-exit times (from frames): zhenya ~5.3s, merci-michel ~25s, synchronized ~40s, lando ~44s, messenger ~64s, bizarro ~5s, scout ~8-11s, hellomonday ~4s. The video frame rate is low and uneven (about 25 fps with duplicates, heavy on WebGL sites), so durations below are ±100 ms.

Recording usability:
- USELESS (stuck on the loader the entire clip): **resn** (117s, only a 1-px white dot with a hairline), **igloo** (47s, blue-grey screen with a faint tiny line).
- PARTIAL: **synchronized** (loader and hero reveal only; every scripted hover/sweep happened during the loader; scroll fired at 114s, the last seconds, and showed nothing), **dontboardme** (never got past the "bounce a ball to enter" gate; the real site was never seen), **messenger** (white blank for ~40s, game intro only, no interaction visible).
- GOOD: zhenya, mercimichel, hellomonday, lando, scout, bizarro (bizarro is one page, so there is only one state to see).

---

## bizarro (bizar.ro)

- **Loader (observed):** No visible loader. First second is a white frame, then pure black until ~5.0s. No counter, no progress.
- **Intro reveal (observed):** At ~5.0-6.0s the full-screen WebGL cassette pile fades up from black over ~1s, with a bloom flare (a white specular glint that streaks) at the same time. No staggered text; the small bottom-left credit lines and the top bar are already there at first light. Easing looks like a plain ease-in-out opacity (inferred).
- **Ambient (observed):** The scene never rests. Dozens of Sony cassettes tumble and drift, the camera moves, and specular glints sweep across plastic faces. Between 1s samples the pile has rearranged completely, so the motion is fast (full-frame change per second). The flares pulse roughly every 1-3s.
- **Cursor sweep (observed, weak):** Moving the mouse makes a small pixel-block glitch panel appear at the top-left, with a thin line-drawn HUD (box, arcs, ticks, small mono text) and a title like "XBOX MUSEUM". Whether the camera parallaxes with the cursor is not clear from frames (inferred: the scene is moving too much on its own to tell).
- **Hover (observed):** Hovering the left-edge project list (1 line per project, at x=0, y 132-198) swaps the HUD panel to that project. The preview is a **pixel-mosaic image** that builds up in chunky blocks, with white rectangular glitch bars, over about 0.4-0.6s (4-6 frames at 10 fps), then holds. Each project has a different dominant colour (green, pink/red, orange, blue, violet, yellow), so the mosaic is the project's key image seen through a block-pixelate shader. The HUD line art (technical drawing around the preview) is constant.
- **Scroll:** No scroll (the scroll fired at 109.8s; frames show the same single-screen scene with hover-style panels still cycling). Single-viewport site.
- **Page transition:** None; no navigation happened.
- **Signature motion:** A pixel-dissolve (mosaic) image reveal inside a drifting 3D pile, plus HUD overlay.

## zhenya (zhenyary.com)

- **Loader (observed):** Black screen. The word "Hey!" (white serif, italic-looking) sits at upper left with two flat circles (pale pink and orange-red) bouncing next to it. About 4.0-4.3s: the pair of circles and the word hop up (about 90 px per 0.25s, ease-out). From ~4.4s, the circles scatter to many sizes (grey, then **beige**); beige discs grow and merge like a metaball/blob mask (circle scale up, staggered, back-out feel), and fill the page in ~1.2s (≈4.4-5.6s). The hero is revealed through the blob holes: some holes show the photo and the white name before the beige covers the black. Exit type: blob/circle scatter mask, not a wipe.
- **Intro reveal:** The beige hero is already composed when the blobs finish: oversized serif name "Zhenya Rynzhuk" (white, in two halves, overlapping a portrait square), thin top nav (Info / Work | Workflow / Contact me), small orange asterisk-star with 3 lines of text, bottom micro-copy and an orange underlined link. No visible staggered reveal after the blobs (inferred: reveal is baked into the blob exit).
- **Ambient:** Static. The orange star appears to rotate slowly (not measurable).
- **Cursor sweep (observed):** The portrait square in the middle **hard-cuts** to a different image as the cursor moves across the page (about 10 different images seen: dancer in black coat, hands in b/w, curly hair, still life with white flower, UI mockup card, limbs). Cuts are instant, 0 fade, with holds of 100 ms to 1s. Looks like pointer-position zones or a distance-travelled counter that advances an image index (inferred).
- **Hover:** Nav links (Info, Work, Workflow, Contact me): **no visible state change** at frame scale; at most a colour change to orange on "Work" when it is the current item (observed in the 50s cells: "Work" turns orange). PLAY/SHOWREEL and "CLICK CLICK" labels: no visible change either.
- **Scroll (observed, 71-80s):** Wheel ticks first flip the hero image (same hard-cut sequence as the cursor), the hero block then slides up as one unit while a white-ish "Services" panel rises from the bottom. The list "Art direction • Product design / Visual design Mobile & web design / Interaction design — Animation" is typeset as large serif, with a **partial-letter reveal** ("Art direct", "Mobile & w e") finishing within about 0.6s per line, and ghost-grey text turning black ("Product design"). A red underline appears on "Visual design". The fixed nav stays on top with white text turning dark.
- **Further scroll (observed, ~85-96s):** Full-bleed case images stack with a colour block (orange-red) and the cases slide over each other (card-stack/overlap). The small "C." and "R." glyphs hint at a case-name text. End shows "All cases here" in white on a photo.
- **Page transition:** None observed.
- **Signature motion:** The blob-circle loader that opens up onto the page, then the cursor-driven hard-cut image slideshow behind an oversized serif name.

## synchronized (synchronized.studio)

- **Loader (observed, 2-40s, stalled):** Dark-grey screen, small text: "We Are Synchronized" lower-left, "All About Digital Experiences" lower-right, tiny mono lines and a small hatched icon. A counter at top-left reads **0** for ~32s (the page was just slow), jumps to **12** (a small wavy line draws under it) and **100** within about 0.5s, then cuts. So the real animation is: number steps 0→12→100, probably tweened but the capture is too choppy to say.
- **Hero reveal (observed, ~40-41s):** A huge condensed serif stack "Synchronized / Digital / Creative / Studio" appears first as a **ghosted dark-grey, letters clipped/overlapped** version (words cut into chunks "Syn|chro|nized", "Digi|tal"), holds 1-2s (the frame rate had collapsed), then goes to bright white in one frame. Inferred: per-letter or per-chunk mask reveal with a staggered opacity ramp, and the wireframe-looking dark background (faint radial lines) behind it.
- **Ambient:** Faint radial-line mesh behind the type; subtle only.
- **Cursor sweep / hover / scroll:** Not usable. The sweep and SHOWREEL hover occurred during the loader; the scroll fired in the last 6 seconds with no visible movement.
- **Page transition:** None.
- **Signature (partial):** Overlapped chunked-serif headline reveal, counter-style loader.

## resn (resn.co.nz): USELESS

- Stuck on the loader for the whole recording: dark background, a single small white dot with a hairline beneath it (looks like a bouncing-dot loader, no visible motion at 1 fps sampling). No content was ever shown. Nothing to report beyond that.

## mercimichel (merci-michel.com)

- **Loader (observed, 3-25s, stalled):** Dark charcoal screen with the logotype "MERCI-MICHEL" in a chunky pixel/stencil font, centered and small (about 80 px wide). The text **fills in letter by letter from left to right** (stepped, one character per ~1.5s while loading; looks like a progress mask where every letter is a bar), with a white underline bar under the finished part. When full, it holds.
- **Exit (observed, ~25-27s):** (1) The charcoal screen fades out to reveal the red 3D hero scene in about 0.6s (opacity ease). (2) The logo then **erases right to left in stepped pixel blocks** (about 1s), collapsing to a single "M" monogram that slides to the top-left corner as the nav appears. (3) The serif title "MERCI-MICHEL / digital gamification studio" and a mono paragraph fade in over about 0.8s at the centre, after the logo has shrunk.
- **Intro/ambient (observed):** The background is a red 3D racetrack/arena with glowing white curved lines; the camera drifts slowly (a few percent per second) in an orbit. The title block is fixed at the centre and does not move.
- **Cursor sweep:** Not separable (fired during loader). No visible custom cursor.
- **Hover:** Top-right nav (CONTACT, PROJECTS, REEL, ABOUT) hovers fired during loader, so no data. Centre hero 'GAMING' hover at 30.7s: nothing visible.
- **Scroll (observed, from ~40s):** The fixed title stays. The full-screen **background scene hard-cuts** from project to project: red arena → forest path (low-poly) → pink/blue pinball → dark-blue night scene → red road tunnel with speed lines → toy-museum monsters → purple neon shapes → blue robot character → pink contact room. Cuts are 1 frame (no crossfade; the first frame after the cut is slightly darker). Each scene held ~1.5-3s at the speed the script scrolled. The scene change seems to be scroll-position bound (inferred).
- **Scroll up:** Reverse order, same hard cuts.
- **Page transition (observed, ~54-57s, /contact):** Went straight to a pink full-bleed room; a title "LET'S play together" in serif (white + yellow italic) and mono contact text. Cyan and yellow bubbles with faces drift (physics-like float, ~3-4s per crossing), orange smaller bubbles in a trail. The exact transition shape was not captured; the new page was fully formed within the 1s sample.
- **Signature motion:** Stepped fill-in logotype loader collapsing into a monogram, then a fixed centered title over hard-cut full-screen 3D project scenes.

## hellomonday (hellomonday.com)

- **Loader/exit (observed, ~3.5-4.5s):** The first frames show a **black organic mass** on the right with a wavy edge (like a liquid curtain) retreating **to the right** over ~0.5s (4 frames at 8 fps, accelerating, ease-in-out or expo-in), leaving a white page. Before that, a grey area at left (the previous grey backdrop).
- **Intro reveal (observed):** White page with a minimal black line-drawing of two standing figures. The figures fade up from light grey to black over ~0.7s (linear-ish opacity); a small serif caption and the logo appear at the same time, and the word under the figures appears as ghost → black.
- **Ambient (observed):** The keyword under the figures **cycles Products → Branding → Experiences** every ~1.2s with a cross-fade through light grey (opacity 1→0.15→1, ~0.3s each way); the figures hold still. A small dot below the word blinks.
- **Cursor sweep (observed):** No visible custom cursor or distortion at 8 fps. (Nothing noticeable.)
- **Hover:** Logo hover (20.4s): no visible change.
- **Scroll (observed):** The figures and word scroll off, and a **3-column grid of tall work cards** appears. Cards first show as light-grey skeleton blocks, then images pop in (teal/pink, black spacewalk, green portrait) with a **curved, bulging top/bottom edge during scroll** (the teal card's lower edge visibly arcs: a velocity-driven bend/warp on the media plane, strongest mid-scroll, flat at rest, ~0.4s settle). Cards enter staggered by column (~100-150 ms between columns, inferred). Further down a black section with a large headline "A booster rocket for digital product teams" over a full-width video; scroll back up is smooth.
- **Page transition (observed, ~44-50s, /work/dream-with-ai):** On click, a **black liquid-edged curtain rises from the bottom** (wavy top edge, same blob shape as the loader exit) and covers the viewport in about 0.4-0.5s (3 frames at 5 fps). The recording then stays black (the next page never rendered in the 6s window).
- **Signature motion:** The black liquid curtain used for both loader-out and page-in.

## lando (landonorris.com, SOTY 2025)

- **Loader (observed, ~3-43s, stalled):** Flat acid-lime (#D2FF00) screen. At centre a small black angular "LN" monogram **draws on, holds, and un-draws** in a loop (about 1.8s per loop: draw ~0.5s, hold ~0.5s, collapse to a dot ~0.3s), with a hairline and tiny "LOAD NORRIS" text beneath it. It loops while the page loads. A Close/consent click was scripted at 16.9s.
- **Exit (observed, ~43.9-44.6s):** The monogram collapses to a point, then a **slanted number "4" shaped mask** grows from that point to fill the viewport in about 0.35-0.45s (expo-out: tiny at frame 4, fills by frame 6 at 10 fps). The 4 contains the hero (portrait, McLaren-livery blur) and reveals it as a window. The lime ends up fully replaced by the white hero.
- **Intro reveal (observed):** White hero with a large front-facing portrait, a wireframe/translucent headset outline around the head (a dissolve from a "papaya + black" texture on the head to a clean headset outline in ~0.5s), thin top-bar with brand "LANDO NORRIS" left, small lime STORE pill right, and a tiny centre logo. A little yellow Android sticker briefly appears on the chin (an easter egg/hover sticker; observed twice).
- **Scroll (observed, 46-74s):** (1) The portrait **shrinks to a framed card** while the page background changes from white to dark olive-green; a looped marquee of huge sans text "WE DID IT AT HOME / I WILL REMEMBER FOREVER A BRITISH GP WEEKEND" crosses behind and overlaps the card (marquee about 250-300 px/s, two rows moving the same way; inferred from 8 fps frames). (2) A **lime signature** scribble is drawn across the card (stroke-dashoffset, about 0.6s, ease-in-out). (3) Dark section: centred serif/sans statement "REDEFINING LIMITS, FIGHTING FOR WINS..." with 2 words in lime serif, **line-by-line** reveal moving up (0.4-0.5s per line, 60-80 ms stagger; inferred). (4) Floating photo cards drift at different speeds (parallax, ~0.6-1.4x). (5) Background colour changes: dark olive → grey → off-white → black as sections scroll through. (6) Light section "ON TRACK / OFF TRACK" split headline with a helmet photo wiping in (sliding clip) and portraits; (7) black "HELMETS HALL OF FAME" with a grid of helmet tiles that pop in with a staggered scale (inferred).
- **Hover:** Hover events fired during the loader, so no data. The "LOAD NORRIS" hover at 44.3s was in the exit moment.
- **Page transition:** The click on /calendar failed (timeout), so none observed.
- **Signature motion:** The "4" mask opening from the collapsed logo. Rebuild: a full-screen lime layer with an SVG clipPath of a skewed "4"; scale the path from 0 to ~12x with expo-out in ~0.4s while the page underneath stays still.

## igloo (igloo.inc): USELESS

- Stuck on the loader for 47s: flat grey-blue background with a tiny pale line at the centre. No content, no interactive state. Nothing else to report.

## messenger (messenger.abeto.co)

- **Loader (observed):** The navigation hit a 30s timeout; white screen for ~40s; then a tiny grey envelope icon (about 14 px) with a caption appears at the centre of white for ~20s (the loader).
- **Exit/Intro (observed, ~63.5-68s):** (1) A **teal panel wipes in from the bottom with a slightly slanted top edge** (skewed diagonal, ~1s, ease-in-out) and covers white. (2) A small low-poly **planet** appears near the bottom edge and **rises to centre while growing** (about 1.5s, ease-out; it rotates). (3) Chunky blocky white letters "MES SEN GER" **pop onto the planet** (about 1.2s, scale-in with a slight overshoot, inferred) and a small yellow "BEGIN" button appears below (~0.3s, slides/fades in).
- **Ambient (observed):** The planet rotates slowly (about 10-15°/s), snow/particle speckles drift in the teal background.
- **Cursor / scroll / hover / transition:** Nothing observable. The scroll events hit a game screen that did not respond.
- **Signature (partial):** The planet rising from the bottom with the blocky logotype popping on.

## scout (scoutmotors.com)

- **Loader (observed, 0-9s):** A white bar (the top nav: logo "Scout", links, button) shows at 2s on black; the page behind goes **grey with a tiny spinner** (a small rotating curl, ~1 rev/s) for ~6s; a cookie panel appears at the bottom-left at ~4s (Reject was clicked at ~20s per the log, but it still shows in frames to ~37s).
- **Intro reveal (observed, ~9.8-13.5s):** The hero video **fades up from black** (~1.3s, ease in) to a golden-hour field with trucks; then a large sans headline **"Scouts always come back."** fades in at the bottom (opacity only, ~0.5s, no mask).
- **Ambient (observed):** The hero is a looping video (trucks, grass moving). The video reached a black frame between loops (~14-22s) for several seconds, which looks like a video buffer stall, not a design.
- **Cursor:** No custom cursor visible. Nav hover (31-36s, TRAVELER SUV, TERRA TRUCK, RESERVE): a soft **grey rounded pill** appears behind the hovered item (~150-200 ms fade; observed in 10 fps frames, exact radius unclear).
- **Scroll (observed, 39-57s):** (1) The hero video keeps playing as the headline cycles ("An off-road icon reborn." → "The one that started it all.") with the red CTA lower-right. (2) A **light "sheet" slides up over the sticky video** (card-stack, the video stays fixed underneath): a body paragraph at left and a giant "An Icon From Day One" headline in black with "Day One" in orange; a **ring of ~16 tilted polaroid-like photo frames** (grey placeholders, the images never loaded) **rotates around the headline** and the ring scales with scroll. (3) Further down: a "Day One" orange repeat at the top.
- **Page transition (observed, 61-68s, /traveler):** The nav stays; the content area drops to a **flat grey with a thin progress hairline** at the bottom for ~3.5s, then to black, then a white centred title "Traveler" appears. So: persistent nav, content cross to a grey loading plate, no animated wipe.
- **Signature motion:** The ring of tilted photo cards rotating around an oversized headline as a white sheet slides over a pinned video.

## dontboardme (dontboardme.com): gate only

- **Gate (observed, 0-67s):** A pink (#F1C4CB-ish) screen with a red condensed all-caps headline "BOUNCE A BALL TO GET TO THE SITE", small red microcopy below it, and a **yellow ball** (a tennis-ball with a stitch pattern). The headline appears at ~5s (fade/pop, instant at 1 fps). The ball starts at the right and settles on the lower right of the headline.
- **Cursor sweep (observed):** The ball is a **physics body**: moving the cursor bats it. In the sweep it was pushed across the title, bounced off the headline text (it collides with the letters/box), up and to the right side, then rolled down (each arc took ~0.6-1s; gravity-like, with a damped bounce). It looks like it responds to cursor speed (inferred).
- **Hover / scroll / transition:** The nav targets (PRICING, ABOUT US, etc.) were never reachable. The page stayed on the gate, so nothing else was observed. The /pricing click timed out.
- **Signature (concept only):** A physics-ball gate; the ball gets knocked by the cursor and must land on a target to enter.

---

## Cross-site motion grammar (this batch)

**Durations (observed unless stated):**
- Loader exit: 0.35-0.5s for graphic masks (lando "4" ≈0.4s, hello monday curtain ≈0.5s). 1-1.5s for scene-based exits (zhenya blobs, messenger planet rise, scout video fade). Merci-michel is two-step: 0.6s fade then ~1s stepped erase.
- Hero text/image fade-ins: 0.5-0.8s.
- Hover feedback: 150-250 ms (scout pill; inferred), stepped pixel build for bizarro 0.4-0.6s.
- Image/background swaps: 0 ms (hard cut) on zhenya and merci-michel; keyword swap 0.3s fades on hellomonday.
- Page curtain/transition: 0.4-0.5s (hello monday), ~1s fade/plate (scout).
- Scroll text line reveals: 0.4-0.6s per line, 60-100 ms stagger (inferred from lando and zhenya).

**Easing shapes (inferred from frame spacing):**
- Reveals and scale-ups: expo-out/quart-out (fast first 2-3 frames, long settle): lando "4", messenger planet, zhenya blobs.
- Curtains and wipes: ease-in-out or expo-in-out: hellomonday.
- Fades and cross-dissolves: linear or sine in-out.
- Overshoot: only the pop-on logotype in messenger and the bounce on zhenya's circles; nothing elastic otherwise.

**Stagger patterns:**
- 60-150 ms between items in grids and lines.
- Per-character or per-chunk reveal (synchronized, merci-michel loader, zhenya list).
- Column stagger in cards (hellomonday).

**Common reveal patterns:**
- Hard-cut slideshows driven by pointer or scroll (zhenya portrait, merci-michel scenes), with no easing at all. The feeling comes from the snap.
- Masks shaped like the brand (lando "4", merci-michel stepped logotype, zhenya circles) used as the loader exit.
- Sticky/pinned layer with a sheet sliding over (scout, lando's shrinking hero card).
- Scroll-driven background colour changes (lando).
- Large type over imagery with overlap (zhenya, synchronized).

**Common hover patterns:** Very restrained. Soft pill background (scout), colour change to accent (zhenya nav "Work" to orange), pixel-mosaic preview (bizarro). Most sites showed no visible hover on text links at this resolution.

**Ambient motion:** Continuous 3D drift (bizarro, merci-michel), slow rotation (messenger), looping marquee text (lando), keyword cycling at ~1.2s (hello monday), looped logo draw (lando loader).

**Capture caveats:** Frame rates dropped heavily on WebGL sites, so durations are rough. Hover and cursor-sweep data is missing for lando, synchronized, merci-michel nav, and dontboardme because those actions fired while the loader was still showing or the gate blocked the page.
