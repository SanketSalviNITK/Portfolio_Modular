# The Professor's Digital Transcendence — Modular Portfolio

An immersive, scroll-driven 3D portfolio for **Dr. Sanket Salvi**, themed as a detective
investigation of a professor who has "digitally transcended." Built with three.js (r128)
and GSAP. This is the **modular** build: the page, scripts, and heavy assets are separate
files (better caching, easier updates) rather than one inlined HTML.

## Structure

```
Portfolio_Modular/
├── index.html              ← main page (loads assets + modules)
├── resume-data.json        ← résumé content the site reads on load (edit to update)
├── admin.html              ← local résumé editor (optional; exports resume-data.json)
├── .nojekyll               ← tells GitHub Pages to serve all files as-is
├── assets/
│   ├── office.glb          ← 3D office model
│   ├── intro.mp4           ← cinematic intro video
│   └── resume.pdf          ← downloadable résumé (the CV)
├── js/
│   ├── data.js             ← the 19 evidence "dossiers" (CV content for the 3D markers)
│   ├── resume.js           ← the "skip the story" plain résumé view (data-driven)
│   ├── engine.js           ← 3D scene, GLB parser, camera, markers, cinematic
│   ├── anim.js             ← ambient scene animation
│   ├── audio.js            ← procedural Web Audio score (no copyrighted assets)
│   ├── offaxis.js          ← head-tracked "Observer" parallax mode
│   └── walk.js             ← free-roam walkthrough mode
└── tools/                  ← data-management workflow (not served as part of the site)
    ├── Salvi_Master_Resume_Data.xlsx   ← master data sheet (import to Google Sheets)
    ├── Generate_Resume_JSON.gs         ← Apps Script: generates resume-data.json
    └── NIT_IIT_faculty_field_schema.md ← reference schema for faculty applications
```

## Run locally

The page uses `fetch()` for its assets, so it must be served over HTTP (not opened
as a `file://` path). From this folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

## How updates work (Google-Sheets driven)

1. Edit content in the master Google Sheet (imported from `tools/Salvi_Master_Resume_Data.xlsx`).
2. Run **Résumé Tools ▸ Generate Website JSON** (from `tools/Generate_Resume_JSON.gs`).
3. Commit the generated file as `resume-data.json` in this repo root.
4. GitHub Pages redeploys; the site reads the new data on next load.

`index.html` also ships with the current data baked in as a fallback, so the page still
renders if `resume-data.json` is ever missing.

## Deploy on GitHub Pages

1. Push this repo (see below).
2. Repo ▸ **Settings ▸ Pages** ▸ Source: `Deploy from a branch`, Branch: `main` / root.
3. Enable **Enforce HTTPS** once the certificate is issued.
4. For a custom domain (GoDaddy): set the domain under Pages, add the matching DNS
   records at GoDaddy, and Pages will generate a `CNAME` file.

## Credits
3D, interaction, audio, and data tooling built collaboratively. All audio is procedurally
generated (no licensed tracks). © 2026 Dr. Sanket Salvi.
