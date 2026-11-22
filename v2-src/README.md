# Shop Row: an alternative design for mlpconsults.com

A complete second version of the site (home, how-it-works, workflows, referrals, privacy), built beside the live one. The live files at the repo root are untouched. Branch `claude/woty-redesign-v2`, local only.

## See it

Launch entry `mlpconsults-v2` (port 8872) serves the repo root, so:

- http://localhost:8872/v2/ is the redesign
- http://localhost:8872/ is the live design
- http://localhost:8872/v2-src/compare.html shows both side by side, page by page
- http://localhost:8872/v2-src/directions/contact-sheet.html is the three directions it was chosen from

## How it is made

```
live pages ──extract.py──▶ content.json ──render.py──▶ v2/
   └─ frozen copy in source/                 site.css, site.js, fonts/ ──▶ v2/assets/
```

- `extract.py` reads the frozen copies of the five live pages in `source/` and writes `content.json`. The contact form markup and its submit handler are taken verbatim.
- `render.py` writes `v2/`. Never hand-edit `v2/`; change the data, the generator, `site.css` or `site.js` and re-run. `--base ''` renders with root paths (what a promote would use) and puts the HubSpot tracking script back; the default preview build at `/v2` leaves that script out and marks the pages noindex.
- `check.sh` re-runs both, then checks content parity against the live pages, the 17 sites by name, the form fields and destinations, and every internal link.
- `JURY.md` is the design sheet: concept, the two rejected directions, the sameness check, type, palette, motion.

## Not done

- No promote script. If this design is chosen, the next step is one that copies `v2/` over the root pages with `--base ''`, on a branch off `origin/main`, as a pull request.
- The demo sites under `/work/` keep their own designs on purpose; they are the work being shown.
- `source/` was frozen from `origin/main` at c37e6a4 (2026-11-18). If the live pages change, delete `source/` and re-run `extract.py`.
