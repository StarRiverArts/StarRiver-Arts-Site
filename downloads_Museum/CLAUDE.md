# StarRiver Arts — Design System: Agent Quick-Start

> **Read this first.** ~300 lines. Covers everything needed for 90% of tasks.
> After this, reach for `colors_and_type.css` (tokens) or a specific page file.
> Only read other docs when you need depth on one topic.

---

## 1 · What this project is

A **CSS design system + starting-point HTML pages** for StarRiver Arts and its sub-brands.
Deployed to GitHub Pages (`StarRiverArts/StarRiver-Arts-Site`).
An automated compiler reads this project and regenerates `_ds_bundle.js`, `_ds_manifest.json` — **never write those files manually**.

**Core purpose of the brand**: 保存 · 普及 · 發展 (preservation · accessibility · development). VRChat-anchored; Taiwan-rooted; bilingual zh-TW/EN.

---

## 2 · File map — what to touch for what

| File | What it is | Read depth |
|---|---|---|
| `colors_and_type.css` | **All tokens** — colours, type scale, spacing, radius, sub-brand scopes | Always for token names |
| `play.html` | Play section landing — DAY mountain register | Full for layout changes |
| `Time Attack.html` | Leaderboard starting point — NIGHT mountain register | Full for board/TA changes |
| `Events.html` | Race schedule — NIGHT mountain register | Full for events changes |
| `Driver Records.html` + `records.css` | Driver leaderboard — NIGHT; layout in CSS | Both for records changes |
| `time-attack.js` | Board render + interactions; reads `window.TA_DATA` | For logic changes |
| `time-attack-data.js` | Stub data for the starting-point board | For data shape changes |
| `records-core.js` | Driver/vehicle aggregation from `window.TA_DATA` | For records logic |
| `index.html` | Top-level brand landing | Separate from Play |
| `studio.html` / `museum.html` | Studio + Museum sections | Separate brand chassis |
| `preview/*.html` | DS card previews (shown in Design System tab) | Edit to update cards |
| `README.md` | Brand map, voice, political subtext, commercial structure | Deep reference only |
| `LAYOUT_PLAYBOOK.md` | Typography scale, grid, off-table rules (mother brand) | Deep reference only |
| `DESIGN_VOCABULARY.md` | Visual language sources; what is/isn't admitted | Deep reference only |
| `ENTRY_POINTS.md` | Per-section identity spec | Deep reference only |
| `LAYER0_PLAN.md` | JSON data pipeline plan | Deep reference only |

---

## 3 · The 5 hard rules (read before touching anything)

1. **No pure white or pure black.** Body ground = `--sr-paper #F3EEE3`. Body ink = `--sr-ink #14140E`.
2. **Amber is rationed: one amber event per viewport.** `--sr-amber #E88A2E`. Never distributed.
3. **No emoji.** Not even one. Anywhere.
4. **Type on dark surfaces must use the defensive `--fg-*` override.** See §5 — Play Night.
5. **Never write `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json`.** Auto-generated.

---

## 4 · Token quick-reference

### 4a · Brand scopes
```css
.sr-brand-starriver   /* StarRiver Arts + VR美術館 chassis */
.sr-brand-project-t   /* Project T: highway signage + mountain landscape */
.sr-brand-formosa     /* Formosa Aerospace (sealed/archived) */
.sr-brand-racing      /* VR Racing Club */
```
Apply one scope class to `<body>` on every page.

### 4b · Shared surface tokens
```
--sr-paper    #F3EEE3   warm cream — body ground
--sr-ink      #14140E   warm near-black — body ink
--sr-bone     #EAE4D6   stacked surfaces
--sr-chalk    #F8F5EC   inline wells (notes, code) — lighter than paper
--sr-graphite #282829   neutral badge ring
--sr-void     #0E0E10   ink-black for void surfaces
--sr-amber    #E88A2E   brand accent — ONE per viewport
--sr-comet    #B9E4E8   pale cyan — editorial highlight, fg-link on dark
```

### 4c · Semantic fg/bg tokens (default = cream/ink)
```
--fg-1  →  var(--sr-ink)      primary text
--fg-2  →  var(--gray-700)    secondary
--fg-3  →  var(--gray-500)    tertiary / meta
--bg-1  →  var(--sr-paper)
```
**On dark surfaces, override these immediately on `body` — see §5.**

### 4d · Mother-brand type scale
```
--fs-xs  12px  meta / mono / eyebrow
--fs-sm  14px  captions
--fs-md  16px  body
--fs-lg  18px  lead
--fs-xl  22px  subhead
--fs-2xl 28px  h3
--fs-3xl 36px  h2
--fs-4xl 48px  h1
--fs-5xl 64px  display h1
--fs-6xl 84px  poster / hero only
```
Scale jumps are intentionally wide — don't compress them.

### 4e · Fonts
```
var(--font-display)  →  TASA Orbiter Display (heroes, poster)
var(--font-deck)     →  TASA Orbiter Deck    (UI titles, nav)
var(--font-body)     →  TASA Orbiter Text    (body)
var(--font-mono)     →  monospace stack      (data, labels, shields)
```
CJK companion: **Noto Sans TC** (never SC — this is zh-TW).

---

## 5 · Play section — full current state (2026-06)

Play is a **house-within-a-house**: one landing page (day) + three leaderboard pages (night). All share the `--pt-*` mountain palette from `colors_and_type.css`.

### 5a · Unified mountain palette (DAY)

Used by: `play.html`

```
--pt-sky        #E3ECEA   天青 — pale haze sky (page ground)
--pt-sky-lo     #D4E1DF   lower sky band
--pt-mtn-far    #AFC1C2   far range — desaturated blue-grey
--pt-mtn-mid    #93A9A2   mid range
--pt-mtn-blue   #7E99A1   山藍 — cool distant ridge
--pt-mtn-green  #6E8B77   山綠 — nearer slope
--pt-near-green #46624F   deep near hill (fills, accents)
--pt-earth      #B29871   土黃 earth
--pt-earth-lo   #8A7350   darker earth
--pt-road       #2A2A2B   柏油黑 asphalt
--pt-line       #F4E04D   標線黃 centre-line (road stripe, not text)
```

**Day ink ramp (text only — scenery colours never carry type):**
```
--pt-ink    #24332D   primary  (≥12:1 on sky)
--pt-ink-2  #45564E   secondary
--pt-ink-3  #64756C   tertiary / meta — absolute minimum for text
```

**play.html structure**: nav (sticky, pale sky) → hero (layered SVG mountain ridges, NO photo) → hero-road strip (asphalt + centre-line) → body sections.
The mountain scene IS the hero; no photo overlaid on it.

### 5b · Mountain night palette (NIGHT)

Used by: `Time Attack.html`, `Events.html`, `Driver Records.html` + `records.css`

```
--pt-night        #141B19   page ground — mountain night (deep green-black)
--pt-night-2      #111715   gradient low end
--pt-night-panel  #1C2421   card / board panel
--pt-night-raised #25302B   raised well / hover
--pt-night-fg     #EFF2EC   primary text  (~13:1 on panel) ✓ AA
--pt-night-fg2    #C3CCC3   secondary     (~8:1)          ✓ AA
--pt-night-fg3    #94A098   labels/meta   (~4.9:1 — floor) ✓ AA
--pt-night-hair   rgba(255,255,255,.10)  dividers (very subtle)
--pt-night-line   rgba(255,255,255,.17)  borders (visible)
--pt-lamp         #EFD95B   車燈黃 headlight — PRIMARY night accent
--pt-lamp-dim     rgba(239,217,91,.12)  leader row tint / focus ring
--pt-night-green  #43935F   省道綠 (status: open / PR badge)
--pt-night-blue   #5B8FC9   省道藍 (status: soon / CR badge)
```

**Why headlight yellow, not studio amber?** Play-night accent must signal
"racing / headlights / night lamps", NOT the studio brand. `--pt-lamp` is
cooler (more yellow-green) than `--sr-amber` (orange-warm). It keeps Play
visually distinct from the Studio and Museum sections.

### 5c · CRITICAL: defensive token override on dark pages

Any page using the night palette MUST add this to its `body` rule. Without it, any element using `--fg-1` (set globally to near-black) renders unreadable:

```css
body {
  /* DEFENSIVE: force shared near-black ink tokens light on dark pages */
  --fg-1: var(--pt-night-fg);
  --fg-2: var(--pt-night-fg2);
  --fg-3: var(--pt-night-fg3);
  --sr-ink: var(--pt-night-fg);
  --fg-web: var(--pt-night-fg);
  --fg-vrc: var(--pt-night-fg);
  background: linear-gradient(to bottom, var(--pt-night) 0%, var(--pt-night-2) 100%);
  color: var(--pt-night-fg);
}
```

This pattern is confirmed in the live GitHub site (`timeattack.css`, `body.timeattack-page`).

### 5d · Shared Play-night chrome

All three night pages share:
- **Nav**: `background: rgba(17,23,21,.85); backdrop-filter: blur(8px); border-bottom: 1px solid var(--pt-night-hair)` sticky 60px bar
- **Centre-line strip**: `height:6px; background: repeating-linear-gradient(90deg, var(--pt-lamp) 0 26px, transparent 26px 54px)` — the road motif connecting all Play pages
- **Nav links**: `color: var(--pt-night-fg3)`, active = `border-bottom: 2px solid var(--pt-lamp)`
- **All three pages link to each other** in nav: 排行榜 / 車手榜 / 賽事

### 5e · Board type scale (Time Attack · Events · Records)

```
--ta-fs-label  11px      floor — mono eyebrows, column heads, chips
--ta-fs-meta   12.5px    dates, sub-lines, status pills
--ta-fs-body   15px      default cell text
--ta-fs-name   17px      driver & track names in rows
--ta-fs-time   21px      lap times in table rows
--ta-fs-hero   clamp(46px, 5.5vw, 68px)  featured fastest time
```

**11px is the absolute floor.** Nothing on a board may go below `--ta-fs-label`.
Previous versions had 9.5–10px eyebrows — those are the "字太小" complaints; they are now fixed.

### 5f · Badge system (all three boards)

```
TR  background: var(--pt-lamp);     color: #1A1B12   Track Record — fastest overall
CR  background: var(--pt-night-blue);  color: #fff   Car Record — fastest for vehicle
PR  background: var(--pt-night-green); color: #fff   Personal Record — driver PB
```

### 5g · Play page file dependencies

```
play.html                  ← landing; standalone; no external JS
Time Attack.html           ← requires time-attack-data.js + time-attack.js + image-slot.js
Events.html                ← standalone (data hardcoded in script block)
Driver Records.html        ← requires records.css + records-core.js + time-attack-data.js + image-slot.js
records.css                ← layout + theming for Driver Records (+ future Vehicle Records)
records-core.js            ← aggregates window.TA_DATA by driver/vehicle
time-attack.js             ← board render + route segmented controls + track finder
time-attack-data.js        ← stub data; real build tool: StarRiverVRCInfo/time_attack_tool/
```

---

## 6 · Other sections — brief state

**`index.html`** — four-column entry selector; graphite ground; each column gets one brand accent; no sub-brand CSS, only shared tokens.

**`studio.html`** — cream paper ground, amber accent (one per viewport), 4px radius, no shadows (borders only). Mother-brand chassis.

**`museum.html`** — near-white `#F0EDE6`, graphite, radius 0 (gallery square). Noto Serif TC in reading bodies. Same chassis as StarRiver Arts.

**`hub-planet.html`** — experimental. Don't inherit from this.

---

## 7 · Design system compiler rules

The DS compiler auto-runs; it reads:
- Root-level `styles.css` / `index.css` / `globals.css` / `colors_and_type.css` for tokens
- Any `<Name>.d.ts` + sibling `<Name>.jsx` (PascalCase) = a component
- Any `.html` with `<!-- @dsCard group="…" -->` on line 1 = a preview card
- Any `.html` with `<!-- @startingPoint section="…" -->` on line 1 = a starting point
- `templates/<slug>/index.html` with `<!-- @template … -->` on line 1 = a template

After any file edit, run `check_design_system` to confirm the compiler is happy.
Currently: 13 cards, 3 Play starting points, 238 tokens, 0 issues.

---

## 8 · Things that are OFF the table

**Mother brand surfaces (studio.html, museum.html, index.html)**:
- Pure white (#FFF) or pure black (#000) — use paper/ink
- Drop shadows on cards — use borders
- Gradient backgrounds (outside the starfield trail)
- Pill buttons >8px radius
- Multiple accent colours per viewport
- Hero photography (Project T only)
- Emoji
- "Read more ▸" filler links

**Play surfaces (all four pages)**:
- Any text below 11px
- Scenery colours (`--pt-mtn-*`, `--pt-sky`) as text colours — use ink ramps
- Studio amber (`--sr-amber`) — Play uses headlight yellow (`--pt-lamp`)
- Dark-on-dark: always add the defensive `--fg-*` override on night pages
- The hero photo on `play.html` — the SVG ridges ARE the hero

---

## 9 · GitHub live site reference

Repo: `StarRiverArts/StarRiver-Arts-Site` (branch: `main`)
Time Attack live source: `play/RacingClub/TimeAttack/`
- `timeattack.css` — full multi-page CSS (1883 lines); live accent is cyan + amber but **this DS intentionally uses headlight yellow** per design brief
- `timeattack.js` — 1600+ line multi-page router
- `build_timeattack.py` — Python pipeline that reads CSV → JSON → deploys

This design-system project is the **source of truth for tokens and visual language**. The live site reads from it; not the other way around.

---

## 10 · Language & voice quick-ref

| | zh-TW | EN |
|---|---|---|
| StarRiver Arts | 「本計畫探討地誌保存。」 | "On preservation, accessibility, and the way places survive." |
| Project T | 「台 9 線，宜蘭往頭城，17.8 公里。」 | "Highway 9, Yilan → Toucheng, 17.8 km." |
| VR Racing Club | 「週四晚上九點，賽道已開。」 | "Thursdays 21:00. Track's open." |

- `星河 StarRiver` is always bilingual.
- zh-TW: use 地名 (e.g. 台 9 線, 宜蘭, 合歡山), not 台灣 at brand level.
- EN: sentence case for body; ALL-CAPS for wordmarks.
- Serve Noto **Sans TC** (not SC) for CJK — zh-TW convention.
