# mlpconsults.com v2, "Shop Row": jury sheet

Written 2026-11-21 before the build, revised after each of the three critique rounds; results are at the end. A full alternative to the live design, built beside it at `/v2/`. The live site is untouched.

**Concept sentence.** A consultancy site built like the row of shops it works for, seen from the sidewalk: the 17 demo sites are 17 shopfronts whose windows show the live sites, the type is sign lettering, the colours are the shops' own plus MLP's painted-shopfront green and one window-light yellow, and the motion is the street's daily ritual: the windows come on one by one, and at night they are the only light.

**Rejected directions** (contact sheet: `directions/contact-sheet.html`).
- B, "The Yellow Pages" (16/20): the site as a classified directory page with price boxes and a thumb index by trade. Fast to read, but it borrows the medium his customers stopped using, the red price bursts read as a discount flyer, and yellow repeats Opening Act v1.
- C, "The Switchboard" (13/20): every line into a business patched to something that answers it, with cords you can plug. It sells the automations and hides the websites, shows no price in the first view, and reads as a tasteful software diagram.
- One detail taken from B: the list of all 17 by name, as the plaza's tenant directory beside the street.

**Tier C** (no WebGL) · family: own (nearest 06 loud pop + 02 exhibition index) · audience: owners of small local businesses, not designers · the page's one job: get a free-assessment request. In the first screen a visitor gets what he does (the headline, and the pitch in the window of MLP's own shopfront), proof (the neighbouring shopfronts, each showing a real site), a price ($500 on the sidewalk board) and contact (the yellow button in the shop window and in the strip on every page). The price list is two sections down. Tier C because the proof is 17 real sites, and they are the picture; a shader would compete with them and slow the first paint on an owner's phone. The live design's WebGL contour map is the thing this version deliberately does not have.

**References.** Nordiska museet (a saturated institutional ground with a giant word set against the picture) for the green fascia hero; tiger.exposed (the list is the hero) for the tenant directory. Nothing else borrowed.

**Sameness check** (differs / same):

| Knob | this build | vs Working Drawings (11-20) | vs Reliable Rooter v2 (11-18) | vs Opening Act v2 (11-18) | vs live mlpconsults | vs award defaults |
|---|---|---|---|---|---|---|
| Ground | shopfront green `#0f3b2d`, stucco `#eee9dc` | differs | differs | differs | differs (white/grey) | differs |
| Type class | sign-lettering grotesk (Gabarito) | same (sans) | same | differs (condensed) | differs (serif display) | same |
| Weight/case | 800, sentence case | differs (300) | differs (500) | differs (900 caps condensed) | differs (400) | differs |
| Layout | street hero (MLP's shopfront, sidewalk board, neighbours running off the edge), price list, horizontal street + directory, night band | differs | differs | differs | differs (index + stage) | differs |
| Imagery | screenshots in shop windows | same | differs (none) | differs (halftone photos) | same | differs |
| Chrome | sticky green strip: mark, links, yellow button, day/night switch | differs | same (top strip) | differs | same-ish (top bar) | differs |
| Motion | lights come on in sequence, sign flip, drag | differs | differs | differs (none) | differs (fade-ups, shader) | differs |
| Signature | the street of 17 shopfronts, lit windows at night | differs | differs | differs | differs | differs |
| Differ count | | 6 | 6 | 8 | 6 | 7 |

Labels: plain sentence-case sign lettering (no tracked capitals, no mono, no pills). Round one used small solid plates; the critique read them as eyebrow badges, so they went.

**Type.** Gabarito (display, signs, numerals; `fonts/google-fonts/ofl/gabarito`, OFL) and Figtree (text and UI; `fonts/google-fonts/ofl/figtree`, OFL), both self-hosted variable files. Sizes: display `clamp(50px, 8.9vw, 128px)`, section heads `clamp(38px, 5.3vw, 76px)`, sign size 23px, body 17 to 20px, small 14 to 15.5px. Sentence case throughout.

**Palette.** Shopfront green `#0f3b2d`, sign cream `#f6f0e1`, window-light yellow `#ffcf3f` (the lit second line of the headline, calls to action, door signs at night; nothing else), stucco `#eee9dc`, sidewalk `#d9d1bd`, ink `#14201a`. Each shopfront takes two colours picked from its own site's screenshot (table in `render.py`, each pair checked at 4.5:1 or better).

**Motion.** One curve (`cubic-bezier(.19,1,.22,1)`). The hero's second line switches on like a sign once (1.1 s); shop windows light in sequence when a street enters view (85 ms apart) and again when day and night are switched; door signs swing on hover. Nothing fades up on scroll, and page jumps are instant. Reduced motion: none of it, everything lit.

**Chrome.** One sticky green strip: mark, four links, the yellow assessment button, and a Day / Night switch (follows the system until used, saved under the live site's own `mlp-theme` key). It was first a door sign reading Open / After hours; two reviewers read "Open" as a button that opens something, so it now says what it does. Under 1100px the links fold into a Menu button.

**Mobile.** MLP's shopfront goes full width under the headline, then the board and the neighbours; the street becomes a native swipe row with scroll snap; the directory board is hidden (the swipe row is the index); the price list and the three findings stack.

**A11y.** All content is plain HTML and reads with the script blocked. Skip link; in-page jumps move focus; tabs follow the ARIA tabs pattern with arrow keys; each shopfront is one link with a full name; the viewer is a native dialog that returns focus; visible focus rings on every ground.

**Themes.** Light and dark from the system, toggle saved, no flash on load.

**Pages.** All five, in-theme: home, how-it-works, workflows, referrals, privacy. The demo sites under `/work/` are the work itself and keep their own designs; every link to them is unchanged.

**The contact form** is the live one: the same markup (ids, names, the timing and budget selects, the referral field) and the same submit handler byte for byte, taken from the live page by `extract.py` and asserted by `check.sh`. It posts to the same three places (Web3Forms, HubSpot form, Supabase). No test submission was sent.

---

## Results (2026-11-21)

**Checks on the final build.**
- Content parity against the live pages: 0 of 209 text blocks missing (`check.sh`; eight documented exceptions, listed in the script, for controls and chrome that changed shape).
- Named checks: all 17 sites (name, trade, caption, link, extra link), the privacy sentences, every form field id, the three form destinations, and the submit handler byte for byte.
- Links: 99 internal links (46 with anchors) and 89 media files resolve on five pages. Four links to the demos' own script-handled routes (`#staff`, `#shop`) are skipped; they are the same links the live site has.
- `shoot.mjs`: 0 console errors and 0 horizontal overflow on all five pages at desktop, phone (390 @3x) and reduced motion.
- `frame_perf.mjs`, homepage: clean. 3 of 7,998 frames over 33 ms (one isolated 122 ms hitch on first image decode), worst p95 16.8 ms.
- Lighthouse accessibility: 100 on all five pages.
- First load of the homepage: 1,328 KB in 21 requests (fonts 216 KB as TTF, images 1,001 KB). The live homepage loads 481 KB including its tracker and web fonts, so this version is heavier by about 850 KB, nearly all of it screenshots in the first screen.

**Slop critique, three rounds, fresh reviewers given only screenshots and the tell catalogue.**

| Round | Design tells H / M | What changed afterwards |
|---|---|---|
| 1 | 3 / 5 | pill labels removed, yellow kept for lit things, tape strips removed, street moved into the first screen, doors added so shopfronts stop reading as cards |
| 2 | 4 / 7 (a stricter reviewer; two of the H were his own screenshots read as fake dashboards) | glow halos removed, heads set on one line, worded controls instead of circled icons, the theme switch renamed, the hero rebuilt as the street |
| 3 | 0 / 2 (the facts board as a stats stack; a box inside a box in MLP's shop window) | board squared up, door made legible, small fixes |

Copy tells stayed at 2 H and 2 M in every round. They are all in the live site's own wording, which this build carries over unchanged: the headline "More customers. Fewer late nights." and "Built for your business. Kept in your control." are clipped fragment pairs, several headlines have no noun from his trade, and the free assessment has four button labels.

**Blind lineup** (six heroes, shuffled each round: this build, a no-skill baseline from a one-line prompt, the live site, Working Drawings, Reliable Rooter v2, Opening Act v2). This build was ranked 3rd most AI-looking of six in all three rounds: less so than the baseline (1st) and the live site (2nd), more so than the three earlier builds. Round 1 named it and the live site the most-alike pair, because the hero kept the live page's skeleton; by round 3 it was in neither of the two most-alike pairs, and the reviewer named "the storefront idea (portfolio sites shown as shopfronts with an Open sign)" as the thing nobody else has, while also calling the idea unclear at a glance. The round 3 tell reviewer named the street of 17 open-able demo sites and the permit lead map as the things only this business has.

**Functional review** (a fresh reviewer with Playwright: script off, reduced motion, storage blocked, both colour schemes, five widths, keyboard, deep links). 12 defects, 1 high. Fixed and re-tested: the directory collapsing above 1600px wide (high), Tab skipping the open menu, the navigation disappearing on narrow screens with the script off, arrow buttons dropping focus at the ends of the street, the wrong directory row highlighted near the end, four shop numbers under 4.5:1 contrast, truncated directory names, links to a collapsed case row not opening it, Home and End in the tabs, the viewer stepping through every screenshot on the page. Left as on the live site: with the script off the form has nowhere to post (the live form is the same).

**Self-score.** Design 8 (one family of moves, holds from 390 to 1920; the price list and inner pages are plainer than the street). Usability 9 (what, proof, price and contact in the first screen; everything works by keyboard and without the script). Creativity 7 (the street is new for this brief, but two of three lineup reviewers called it unclear or a gimmick at first sight). Content 8 (all his; the copy tells above are his to change). Dev 9 (no libraries, 100 accessibility, clean frames; fonts are TTF, not WOFF2).

**For Myles to decide (content, not design).**
- The work note says business names are fictional while the brokerage caption says "Names and photos changed"; a reader can take those as contradicting each other.
- The phone number is a 518 area code on a page that says Irvine three times.
- "Now booking projects for December." will date.
- The privacy page said fonts load from Google Fonts; this version serves its own, so that one sentence now reads "Fonts are served from this site."
- This version adds his email address to the footer of every page (the old inner pages had it; the old homepage footer did not).
