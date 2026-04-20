# Layer 0 — Content Management Plan

> Layer 0 is the offline content editing and packaging system for
> StarRiver Arts. It sits outside the website itself and controls
> what content appears in each page's data slots.

---

## Concept

```
Layer 0 (local editor / scripts)
    ↓  edits
data/*.json  (in the GitHub repo)
    ↓  read by
HTML pages (fetch + render)
    ↓  deployed to
GitHub Pages (public site)
```

The HTML files are **permanent templates** — they never change for
content updates. Only the JSON data files change.

---

## JSON schemas (planned)

### `data/works.json` — for Studio page

```json
[
  {
    "id": "beyond-gravity",
    "title": "Beyond Gravity",
    "title_zh": "天鉤太空站",
    "year": 2024,
    "medium": "VRChat",
    "group": "Formosa Aerospace",
    "status": "released",
    "description_zh": "...",
    "description_en": "...",
    "vrchat_url": "https://vrchat.com/home/world/wrld_...",
    "thumb": "assets/works/beyond-gravity.jpg",
    "tags": ["vrchat", "science-communication", "solo"],
    "axes": { "preservation": 0.3, "accessibility": 0.8, "development": 0.5 }
  }
]
```

### `data/worlds.json` — for Play page

```json
[
  {
    "id": "starsight-mt",
    "title": "StarSight Mt.",
    "title_zh": "觀星山",
    "year": 2024,
    "type": "racing",
    "status": "released",
    "vrchat_url": "...",
    "thumb": "assets/worlds/starsight.jpg",
    "description_zh": "...",
    "description_en": "..."
  }
]
```

### `data/exhibitions.json` — for Museum page

```json
[
  {
    "id": "exhibition-slug",
    "title": "Exhibition Title",
    "title_zh": "展覽標題",
    "date_start": "2026-06-01",
    "date_end": "2026-07-31",
    "status": "upcoming",
    "open_call": true,
    "open_call_deadline": "2026-04-30",
    "description_zh": "...",
    "description_en": "...",
    "thumb": "assets/exhibitions/slug.jpg"
  }
]
```

### `data/site.json` — global site config

```json
{
  "site_name": "StarRiver Arts",
  "site_name_zh": "星河",
  "tagline_zh": "保存 · 普及 · 發展",
  "tagline_en": "Preservation · Accessibility · Development",
  "contact_email": "StarRiverAnything@gmail.com",
  "contact_phone": "0963-440-412",
  "social": {
    "vrchat_profile": "...",
    "youtube": "https://www.youtube.com/@StarRiverAnythings",
    "discord": ""
  },
  "nav": [
    { "label_zh": "工作室", "label_en": "Studio", "href": "studio.html" },
    { "label_zh": "遊玩",   "label_en": "Play",   "href": "play.html" },
    { "label_zh": "美術館", "label_en": "Museum",  "href": "museum.html" }
  ]
}
```

---

## How pages consume the data

Each content page runs a `loadPage()` on `DOMContentLoaded`:

```js
async function loadPage() {
  const [site, works] = await Promise.all([
    fetch('data/site.json').then(r => r.json()),
    fetch('data/works.json').then(r => r.json()),
  ]);
  renderNav(site);
  renderWorks(works);
}
```

The HTML contains **slot containers**:
```html
<div id="works-list"><!-- rendered by JS --></div>
```

No content is hardcoded in HTML (except fallback text for no-JS).

---

## Layer 0 tooling options (not yet built)

**Option A — Manual JSON editing**
Edit `data/*.json` directly in VS Code.
Pros: zero tooling cost.
Cons: error-prone, no preview.

**Option B — Simple local HTML editor**
A local `editor.html` that loads the JSON, shows a form per item,
lets you edit fields, then exports the updated JSON to copy-paste back.
Pros: no server needed, runs in browser.
Cons: manual copy-paste step.

**Option C — Node.js CLI + watch mode**
A script that watches `content/` (markdown or YAML) and compiles
to `data/*.json`. Push the compiled JSON.
Pros: author in readable format.
Cons: requires Node.js.

**Recommended starting point**: Option A (manual JSON) → Option B
(local HTML editor) when the friction becomes painful.

---

## Deployment flow

```
1. Edit data/works.json locally
2. git add data/works.json
3. git commit -m "Add work: Project T Wuling"
4. git push
→ GitHub Pages auto-deploys in ~60 seconds
```

No build step. No CI required.

---

## What needs to be done (next pass)

- [ ] Create `data/` folder with initial JSON files
- [ ] Migrate hardcoded content in `studio.html` → `data/works.json`
- [ ] Refactor `studio.html` to use `fetch()` + render functions
- [ ] Design render templates for work cards, world cards, exhibition listings
- [ ] Build `play.html` with `data/worlds.json` data slot
- [ ] Build `museum.html` with `data/exhibitions.json` data slot
- [ ] (Optional) Build `editor.html` as Layer 0 local tool
