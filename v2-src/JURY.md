# mlpconsults.com v2, "Shop Row": jury sheet

Written 2026-11-21 before the build; results added at the end. A full alternative to the live design, built beside it at `/v2/`. The live site is untouched.

**Concept sentence.** A consultancy site built like the row of shops it works for, seen from the sidewalk: the 17 demo sites are 17 shopfronts whose windows show the live sites, the type is sign lettering, the colours are the shops' own plus MLP's painted-shopfront green and one window-light yellow, and the motion is the street's daily ritual, where the door sign flips from Open to After hours and the windows come on one by one.

**Rejected directions** (contact sheet: `directions/contact-sheet.html`).
- B, "The Yellow Pages" (16/20): the site as a classified directory page with price boxes and a thumb index by trade. Fast to read, but it borrows the medium his customers stopped using, the red price bursts read as a discount flyer, and yellow repeats Opening Act v1.
- C, "The Switchboard" (13/20): every line into a business patched to something that answers it, with cords you can plug. It sells the automations and hides the websites, shows no price in the first view, and reads as a tasteful software diagram.
- One detail taken from B: the list of all 17 by name, as the plaza's tenant directory beside the street.

**Tier C** (no WebGL) · family: own (nearest 06 loud pop + 02 exhibition index) · audience: owners of small local businesses, not designers · the page's one job: get a free-assessment request. A visitor sees what he does (headline and lead), proof (shopfronts in the first screen, the street one section down), price ($500 in the first screen, the price list as section two) and contact (yellow button in the strip on every page) without scrolling far. Tier C because the proof is 17 real sites, and they are the picture; a shader would compete with them and slow the first paint on an owner's phone. The live design's WebGL contour map is the thing this version deliberately does not have.

**References.** Nordiska museet (a saturated institutional ground with a giant word set against the picture) for the green fascia hero; tiger.exposed (the list is the hero) for the tenant directory. Nothing else borrowed.

**Sameness check** (differs / same):

| Knob | this build | vs Working Drawings (11-20) | vs Reliable Rooter v2 (11-18) | vs Opening Act v2 (11-18) | vs live mlpconsults | vs award defaults |
|---|---|---|---|---|---|---|
| Ground | shopfront green `#0f3b2d`, stucco `#eee9dc` | differs | differs | differs | differs (white/grey) | differs |
| Type class | sign-lettering grotesk (Gabarito) | same (sans) | same | differs (condensed) | differs (serif display) | same |
| Weight/case | 800, sentence case | differs (300) | differs (500) | differs (900 caps condensed) | differs (400) | differs |
| Layout | fascia hero, price list, horizontal street + directory, night band | differs | differs | differs | differs (index + stage) | differs |
| Imagery | screenshots in shop windows | same | differs (none) | differs (halftone photos) | same | differs |
| Chrome | sticky green strip with a door-sign toggle | differs | same (top strip) | differs | same-ish (top bar) | differs |
| Motion | lights come on in sequence, sign flip, drag | differs | differs | differs (none) | differs (fade-ups, shader) | differs |
| Signature | the street + the Open / After hours door sign | differs | differs | differs | differs | differs |
| Differ count | | 6 | 6 | 8 | 6 | 7 |

Labels: sentence-case sign lettering on small solid plates (no tracked capitals, no mono, no hairline rules).

**Type.** Gabarito (display, signs, numerals; `fonts/google-fonts/ofl/gabarito`, OFL) and Figtree (text and UI; `fonts/google-fonts/ofl/figtree`, OFL), both self-hosted variable files. Sizes: display `clamp(50px, 8.9vw, 128px)`, section heads `clamp(38px, 5.3vw, 76px)`, sign size 23px, body 17 to 20px, small 14 to 15.5px. Sentence case throughout.

**Palette.** Shopfront green `#0f3b2d`, sign cream `#f6f0e1`, window-light yellow `#ffcf3f` (calls to action, lit things, nothing else), stucco `#eee9dc`, sidewalk `#d9d1bd`, ink `#14201a`. Each shopfront takes two colours picked from its own site's screenshot (table in `render.py`, each pair checked at 4.5:1 or better).

**Motion.** One curve (`cubic-bezier(.19,1,.22,1)`). The hero's second line switches on like a sign once (1.1 s); shop windows light in sequence when a street enters view (85 ms apart) and again when the door sign is flipped; door signs swing on hover; the door-sign toggle flips (0.5 s). Nothing fades up on scroll. Reduced motion: none of it, everything lit.

**Chrome.** One sticky green strip: mark, four links, the yellow assessment button, the door sign (Open = light, After hours = dark, follows the system until flipped, saved under the live site's own `mlp-theme` key). Under 1100px the links fold into a Menu button.

**Mobile.** The street becomes a native swipe row with scroll snap; the directory board is hidden (the swipe row is the index); the price list stacks; the assessment notice stacks its three findings.

**A11y.** All content is plain HTML and reads with the script blocked. Skip link; in-page jumps move focus; tabs follow the ARIA tabs pattern with arrow keys; each shopfront is one link with a full name; the viewer is a native dialog that returns focus; visible focus rings on every ground.

**Themes.** Light and dark from the system, toggle saved, no flash on load.

**Pages.** All five, in-theme: home, how-it-works, workflows, referrals, privacy. The demo sites under `/work/` are the work itself and keep their own designs; every link to them is unchanged.

**The contact form** is the live one: the same markup (ids, names, the timing and budget selects, the referral field) and the same submit handler byte for byte, taken from the live page by `extract.py` and asserted by `check.sh`. It posts to the same three places (Web3Forms, HubSpot form, Supabase). No test submission was sent.
