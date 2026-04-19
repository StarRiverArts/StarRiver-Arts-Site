# Site Architecture

## URL structure

```
starriverarts.com/
│
├── index.html              ← Landing: four-column entry selector
│
├── studio.html             ← /studio  — Portfolio, commissions, professional
├── play.html               ← /play    — VRChat worlds, community, racing (TODO)
├── museum.html             ← /museum  — Exhibitions, open call (TODO)
└── works.html              ← /works   — Creator universe, concepts (TODO)
```

## File dependencies (all pages need these)

```
colors_and_type.css         ← all design tokens
fonts/
  TASAOrbiterDisplay-*.otf  ← hero / poster type
  TASAOrbiterDeck-*.otf     ← UI titles / headings
  TASAOrbiterText-*.otf     ← body text
assets/logos/
  starriver-primary.png     ← used in nav + footer of every page
```

## Language strategy

- Default: `zh-TW` (Traditional Chinese)
- Toggle: one button, persisted in `localStorage` key `sr-lang`
- Pattern: every bilingual text has two siblings:
  ```html
  <span class="zh">中文</span>
  <span class="en">English</span>
  ```
- CSS `.lang-zh .en { display:none }` / `.lang-en .zh { display:none }`
- Future Japanese: add `.ja` class + `<span class="ja">` pattern

## Per-page visual identity (Entry Points)

See `ENTRY_POINTS.md` for full treatment.

| Page | Ground | Accent | Radius | Notes |
|---|---|---|---|---|
| `index.html` | Graphite | Amber / Cyan / Graphite per column | — | Full-viewport split |
| `studio.html` | Cream `#F3EEE3` | Amber (rules only) | 4px | Professional, archive |
| `play.html` | Dark `#1A1E26` | Cyan `#B9E4E8` | 8–12px | TODO |
| `museum.html` | Near-white `#F0EDE6` | Graphite | 0 | TODO |
| `works.html` | Void `#0E0E10` | Amber (full) | 4px / circle | TODO |

## Deployment (GitHub Pages)

Repo: `StarRiverArts/StarRiver-Arts-Site`
Branch: `main`
Root: `/`

Push these files to repo root:
```
index.html
studio.html
colors_and_type.css
fonts/          (all .otf files)
assets/logos/   (starriver-primary.png minimum)
```

Pages auto-deploys on push via `.github/workflows/static.yml`.

## Navigation contract

- Every page links back to `index.html` via the wordmark in the nav.
- Active page is highlighted with `class="active"` on its nav link.
- Language state persists across pages via `localStorage`.
- Footer is consistent: void background, patch logo, four nav links, copyright.
