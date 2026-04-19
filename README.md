# 星河 StarRiver Arts — Design System

> A Taiwan-based digital arts practice. Core purpose: **保存 · 普及 · 發展**
> — to let ideas, places, and communities grow beyond their origins.
> The practice's north star: 本土主義 · 人文關懷 · 邏輯思考與溝通 · 互動與學習.

---

## What this is

A reusable design system built around a **house of brands**, not a monolith.
Each sub-brand has its own visual personality, mark, and colour; they share
a narrow vocabulary (type spine, grid, bilingual wordmark convention, the
`by StarRiver Arts` endorsement lockup). The shared vocabulary does NOT
include brand colours, icon style, or patch geometry — those are each
sub-brand's own territory.

**Why house-of-brands?** Each sub-brand needs to survive across different
media (print, merch, VRChat in-world, flat screens). Over-coupling their
visuals hurts individual growth and makes it harder for each community to
claim its own identity.

---

## Brand map

| Sub-brand | zh name | Role | Medium | Priority |
|---|---|---|---|---|
| **StarRiver Arts** | 星河 | 個人品牌 · 專業作品 · 未來 VR 美術館 | Web, portfolio, commissions | **Active** |
| **Project T** | 臺灣場景系列 | 台灣地景還原 + 包含 VR 賽車俱樂部 | VRChat + web | **Active** |
| **Formosa Aerospace** | 福爾摩沙航太 | VRChat 太空科普群組 | VRChat in-world, posters | Sealed / archived |
| **VR 美術館** | — | StarRiver 旗下長期專業展館計畫 | VRChat + web | Long-term (same brand chassis as StarRiver) |

**Formosa Aerospace** is sealed pending future decision.
**VR 美術館** shares the StarRiver Arts visual chassis — same CSS class,
different content emphasis.

---

## Source materials

- **Logo marks**: `assets/logos/` (5 PNG originals from user uploads)
- **Reference screenshots**: `assets/reference/`
  - `project-t-highway9-signage.png` — 台 9 線 黃昏 reference
  - `beyond-gravity-interior.png` — Beyond Gravity / Formosa Aerospace world
- **Fonts**: `fonts/` — TASA Orbiter Display / Deck / Text, 4–5 weights
  each, user-supplied OTF. CJK: Noto Sans TC / Noto Serif TC (Google Fonts,
  SIL OFL).
- **Codebase reference**: `github.com/StarRiverArts/StarRiverVRCInfo` —
  VRChat tools; used for voice, product naming, and VRCInfo UI patterns.

---

## Index

```
README.md                   ← you are here (brand brief + index)
LAYOUT_PLAYBOOK.md          ← typography, grid, layout patterns, off-table rules
DESIGN_VOCABULARY.md        ← visual language sources (core vs scene vocab)
SKILL.md                    ← Agent Skill manifest for Claude
colors_and_type.css         ← all CSS design tokens
fonts/                      ← TASA Orbiter .otf + notes
assets/
  logos/                    ← brand marks
  reference/                ← work screenshots
preview/                    ← design-system preview cards (registered)
```

### Key linked docs

- **Typography & layout rules** → `LAYOUT_PLAYBOOK.md`
- **Where visual language comes from** → `DESIGN_VOCABULARY.md`
- **CSS tokens** → `colors_and_type.css`

---

## CONTENT FUNDAMENTALS

**Language**
- 繁體中文 primary for all product UI and zh-TW surfaces.
- English for wordmarks, technical labels, and EN-audience surfaces.
- Language follows audience — use specificity (地名 > 台灣) for zh-TW;
  explicit "Taiwan" allowed for EN audiences.
- Always serve Noto Sans TC (not SC) for CJK — Taiwan/HK 字形 convention.

**Voice by sub-brand**

| | zh_TW | en |
|---|---|---|
| StarRiver Arts | 「本計畫探討地誌保存與數位再敘事。」 | "On preservation, accessibility, and the way places survive into new media." |
| Project T | 「台 9 線，宜蘭往頭城，17.8 公里。」 | "Highway 9, Yilan → Toucheng, 17.8 km." |
| VR 賽車俱樂部 | 「週四晚上九點，賽道已開。」 | "Thursdays 21:00. Track's open." |

**Casing**
- English wordmarks: ALL CAPS + letter-spacing (`PROJECT T`, `STARRIVER ARTS`).
- English body: sentence case.
- Chinese: no artificial letter-spacing.

**Hard rules**
- No emoji anywhere.
- No padding. If a sentence adds no data or image, delete it.
- Numbers earn trust — cite route numbers, km, dates, visitor counts.
- `星河 StarRiver` stays bilingual always.
- No word 台灣 at brand-chassis level for zh-TW surfaces; use 地名 instead.

---

## VISUAL FOUNDATIONS

### Shared spine (cross-brand)

**Type**: TASA Orbiter (Display / Deck / Text) + one CJK companion.
See `LAYOUT_PLAYBOOK.md` for full scale, line-height, and measure rules.

**Ground colour**: warm cream `--sr-paper #F3EEE3`. Never pure white on body.
Body ink is `--sr-ink #14140E`. Never pure black. See `LAYOUT_PLAYBOOK.md §A.1`.

**Grid**: 4 px base. Spacing steps: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96.
Large jumps between sections are the breath — do not shrink them.

**Borders over shadows**. One branded shadow only (`--shadow-badge` on patches).

**Animation**: slow, mechanical, 220 ms default. One motion at a time.
Signature: 14 s orbit loop on amber ring for a standalone patch.
VRChat surfaces: animation disabled (`--dur-*: 0ms` via `.sr-medium-vrc`).

**Amber (`--sr-amber #E88A2E`)**: one event per viewport. It is the dot on
the i — concentrated, not distributed.

### Per-brand visual anchors

- **StarRiver / 美術館**: starfield patch · amber ring · void · comet trail.
  Surface: cream paper. Voice: archival, studio. Radius: 4 px.
- **Project T**: highway signage palette (sign-green `#1E6B3E`, sign-blue
  `#1F5EA8`, dusk gold `#F0A94C`, jungle `#2D5A3D`). Surface: map paper
  `#F4F0E6`. Route shields as first-class typographic elements. Radius: 2 px.
- **VR 美術館**: same CSS class as StarRiver; cooler bone surface, radius 0
  (gallery square). Long-form Noto Serif TC in reading bodies.

### Design vocabulary

Summary — see `DESIGN_VOCABULARY.md` for full treatment.

**Core (admitted to brand door)**:
- 公路標誌系統 — system thinking, information hierarchy, shield-shape logic.
- 山徑 / 國家公園標誌 — earthy palette, elevation markers, reading-distance
  discipline (fewer elements, bigger gaps).

**Scene only (inside works, not brand chrome)**:
騎樓招牌, 台鐵, 夜市攤, 水泥壓印 — use only when the work's subject demands it.

**Excluded everywhere**: traditional Chinese ornament, brush-stroke aesthetics,
lucky motifs, seal-style logomarks, rural-nostalgia tropes (paddy, buffalo,
straw hat), school-assembly layout.

### Medium matrix

- `--sr-medium-web`: default. Cream paper, warm ink, CSS animation enabled.
- `--sr-medium-vrc`: higher contrast fg, cleaner off-white, animation
  disabled (`--dur-* 0ms`), borders bumped one step.

---

## Monetisation & commercial structure

The practice includes a **creator economy layer**. Design accommodates:

- Digital goods store: 3D models, VRChat systems/tools, world presets.
- VRChat in-world creator economy: subscriptions, items, VIP access.
- Patreon and equivalent platforms.

Flows that lead to commerce should use the StarRiver chassis but can allow
amber for CTA accent. Store listing patterns: see `LAYOUT_PLAYBOOK.md §C.5`.

---

## Multi-language structure

Planned: 繁體中文 (primary) + English. Future: possibly 日本語.

- Each language variant serves different rendering of the SAME content —
  not separate products.
- zh-TW: localise voice; use 地名 not 台灣 at brand level.
- EN: explicit "Taiwan" anchor OK; wordmarks stay ALL-CAPS EN.
- Typeface fallback chain for each: TASA Orbiter → Noto Sans TC →
  PingFang TC → system-ui. Never serve Noto Sans SC for zh-TW.

---

## Quick start

```html
<!doctype html>
<html lang="zh-TW">
<head>
  <link rel="stylesheet" href="colors_and_type.css">
  <!-- Optional: preload TASA Orbiter Display Black for heroes -->
</head>
<body class="sr-brand-starriver sr-type sr-medium-web">
  <h1>星河 StarRiver Arts</h1>
  <p>On preservation, accessibility, and the way places survive into new media.</p>
</body>
</html>
```

Switch sub-brand by swapping the `sr-brand-*` class.
Switch medium by swapping `sr-medium-web` / `sr-medium-vrc`.

---

## Caveats & known gaps

- Project T token palette is **defined but not fully tested** in UI kits.
  2–3 visual concept explorations ("幾個方案") are the next design deliverable.
- VR 賽車俱樂部 brief is captured; design work queued under Project T.
- No icon system confirmed. Lucide (MIT) is **proposed** — please confirm
  or swap.
- 美術館 UI (VRChat in-world) requires a separate pass once web chassis is settled.
- Hero photo art direction (景觀攝影) and 3D-render colour grading
  guidelines are not yet written — those require more work samples.
- The political "暗線" is encoded in `DESIGN_VOCABULARY.md` — read that
  before writing any surface copy.
