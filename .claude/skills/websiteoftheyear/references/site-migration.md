# Redesigning a whole site (not just a homepage)

A homepage mockup is the easy 20%. The real work is carrying every page, every piece of content and every old link into the new design without losing anything, then testing two directions and shipping one. This is the pipeline that took mylesparslow.com from its old design to "five rooms" (Nov 2026): 48 case studies on 5 area pages, 58 legacy anchors, 180 media files, two themed mockups A/B-tested with friends, one merged.

## Contents
1. The pipeline at a glance
2. Extract content into data
3. Render each design from the data
4. Prove nothing was lost
5. Images: sharpen before you judge
6. A/B test two directions
7. Promote the winner
8. Checklist before merge

---

## 1. The pipeline

```
old pages ──extract──▶ content.json ──render(design A)──▶ mockup-a/…
   │                        └──────render(design B)──▶ mockup-b/…
   └─freeze copy (source/)                                   │
                              parity.py  check_links.mjs  shoot.mjs  frame_perf.mjs
                                                             │
                          publish_bundle.py ─▶ two Artifact links ─▶ friends pick
                                                             │
                                    promote script ─▶ site root ─▶ PR ─▶ merge ─▶ verify live
```

Rules that held up:
- **Content lives in data, design lives in templates.** Never hand-edit generated pages; change the generator and re-run.
- **Each mockup is a self-contained folder** (`mockup-a/`, `mockup-b/`) with its own homepage, area pages and CSS/JS, so it can be served, published and compared without touching the live site.
- **Freeze the old pages** (`source/<page>.html`) before the winner overwrites them; the extractor reads the frozen copy from then on.

## 2. Extract content into data

Write a small extractor (stdlib `re` or `html.parser`) that turns each old page into structured records. For a portfolio, one record per case study:

```json
{ "id": "conflara", "eyebrow": "...", "title": "Conflion", "sub": "Conflicts & intake",
  "sum": "one-paragraph summary", "body_html": "<p class=links>…</p><figure>…</figure>…",
  "media": ["assets/conflion-hits.jpg"], "demo_links": ["demos/conflara-demo.html"] }
```

- **Keep the body as HTML, not re-written text.** Restyle the existing classes in each theme (`block`, `cols`, `grid3`, `stats`, `figure.wide`, `compare` sliders, `video`…). Rewriting content is where errors creep in.
- **Normalise paths to root-relative** (`assets/…`, `demos/…`) in the data; each renderer adds its own `../` depth.
- **Capture everything outside the main blocks too.** The first extraction took only `<details class="case">` blocks and silently dropped group headings and intros, a "Smaller pieces" section, and a legal disclaimer ("All names and figures in the screenshots are invented"). Model the page as an ordered list: groups (id, title, intro, member ids), the items, and any extra sections. Keep their ids, because old links point at them.
- **Assert counts** (`sum(group members) == items`) so a markup variant can't slip through. One case used `<p>` instead of `<p class="sum">` and lost its summary until the extractor fell back.

## 3. Render each design from the data

One generator per design (`render_a.py`, `render_b.py`), stdlib only, re-runnable:
- Reuse the homepage's chrome (menu, theme toggle, script tags) by reading it from the mockup's `index.html`, so area pages can't drift from the homepage.
- Every item gets `id` = its record id, and every group divider keeps its group id. Deep links like `legal/#conflara` must land below any fixed chrome (`scroll-margin-top`, plus re-landing after fonts load).
- Link rules: same-site area links stay in-theme (`../legal/#x`); separate apps such as demos open in a new tab with `rel="noopener"`, adding attributes only when missing (the first pass duplicated `target`/`rel` on 17 links); other external links open in a new tab.
- Rewrite the homepage's old-URL hash redirect (`/#conflara` → `legal/#conflara`) to point at the new pages, and check every entry resolves.

## 4. Prove nothing was lost

Run these before anyone looks at the design:
- `python3 scripts/parity.py --old source/ --new mockup-b/ --map old=new …` (repeat `--map` per page): every old text node present in the new page, plus media and link counts. New pages are searched in full, footers included; on old pages only nav and header are skipped (`--skip-old`). Wording changes count as missing, which is by design: read each one. The redesign shipped with 0 missing across 10 pages, but only after this caught the dropped sections.
- `node scripts/check_links.mjs <url> --crawl --redirect-map-var map`: every internal link, #anchor, redirect-map entry and media file resolves. Run it against `http.server` locally (videos may stall there because it lacks Range support, which is fine), then against production after deploy. Keep concurrency low; 240 rapid requests to GitHub Pages timed out from a laptop.
- `node scripts/shoot.mjs` on the homepage and the two most varied inner pages, at desktop, mobile and reduced motion.

## 5. Images: sharpen before you judge

Small thumbnails make every design look worse. The portfolio's thumbs were 560px, shown at up to 600px in the new frames, and the user's first reaction was "extremely low res".
- `scripts/sharpen_thumbs.py` finds each thumbnail's full-size source (fingerprint, then template search for the exact crop) and recuts it at 2×, keeping the framing. 72 of 73 matched; the one with no source was flagged and kept, not replaced with a wrong crop.
- Put the sharp set in a new folder (`assets/thumbs-hd/`) so pages you aren't redesigning keep working.
- Projects with no image at all: screenshot their own demo page if one exists (two did), otherwise design a typographic tile. Never invent imagery.
- Match the frame to the image. A 3:4 portrait frame cropped 16:10 screenshots badly; a 16:10 frame fixed it.

## 6. A/B test two directions

- Build both as full mini-sites, not two homepages. Friends judge by clicking into a project, so "rooms should open in-theme, not link to the normal site" was the first feedback.
- Give them neutral names ("Myles Parslow A" / "… B") so the names don't steer anyone.
- Publish each as an Artifact with `scripts/publish_bundle.py`. The host serves files, not folder indexes, so links become `legal/index.html#x`, including links built in JS (`data-h` attributes, `map[id] + '/'`). The bundle copies only referenced media and keeps under the 64MB-per-publish limit (each mockup was about 35MB).
- Read every file you didn't write before publishing it. Once a link is shared, republishing updates what viewers see immediately.
- Expect feedback on motion that only shows on real hardware (B's sticky cards felt laggy). Profile with `scripts/frame_perf.mjs` before guessing.

## 7. Promote the winner

A promote script (re-runnable) that:
1. freezes the old pages into `source/` (first run only, and refuses if the page doesn't look like an original),
2. re-runs extract + render,
3. copies the mockup's homepage and area pages over the site, with shared CSS/JS under `assets/site/`, rewriting `../assets/` depths and pointing demo links at the site's own `demos/`,
4. reports leftover mockup-only paths (must be none).

**Guard the promote script against drift.** Once a redesign is live, other sessions edit the live files directly: new case studies on an area page, a scrolling tweak in `assets/site/b.js`, a favicon in `index.html`. Within two days, five PRs had done this on the portfolio. A plain re-run of the promote script would have wiped all of them, and only a surprising "49 case studies" in its output caught it. The script should fingerprint every file it writes (`.promoted.json`) and refuse when a live file no longer matches, listing the files, until those edits are ported into the source. Without fingerprints, it should refuse whenever a live file differs from what it's about to write. For a small fix on a site that has drifted, edit the live files surgically and make the same change in the generator, rather than regenerating.

Commit the design source (`mockup-b/`) and generators with the site. If the host publishes everything (`.nojekyll` on GitHub Pages), add `robots.txt` disallowing the source folders. Leave the losing mockup local.

## 8. Checklist before merge

- [ ] parity.py: 0 missing on every page, including group intros, extra sections and disclaimers
- [ ] check_links.mjs: all internal links, anchors, redirect entries and media return 200 locally
- [ ] Every legacy anchor used by other pages on the site (guides, demos, blogs) still lands
- [ ] shoot.mjs: 0 errors and 0 overflow at 375, 768, 1440 and 1920; no fixed chrome over text in mid-scroll shots
- [ ] Keyboard: skip link works, in-page jumps move focus, menus scroll and trap focus
- [ ] Themes: each one checked on the homepage and an inner page, with no flash on load and the choice persisting across pages
- [ ] frame_perf.mjs: no frames over 33ms on the heaviest scroll section
- [ ] Rebase on main, PR, merge only on the user's say-so, then re-run check_links against production and screenshot each theme live
