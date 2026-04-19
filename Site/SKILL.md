# SKILL.md — StarRiver Arts Design System

> This file tells a Claude Agent how to use this design system to produce
> new design work for 星河 StarRiver Arts. Read `README.md` first for brand
> context; this file is the operational briefing for the agent.

---

## What this system covers

- **StarRiver Arts** (mother brand + VR 美術館)
- **Project T** (臺灣場景系列 + VR 賽車俱樂部)
- Formosa Aerospace (sealed / archived — do not redesign)

---

## Files to load before designing

| File | What it gives you |
|---|---|
| `README.md` | Brand brief, sub-brand map, content fundamentals |
| `LAYOUT_PLAYBOOK.md` | Typography scale, grid, layout patterns, off-table rules |
| `DESIGN_VOCABULARY.md` | Visual language sources (core vs scene vocab), exclusion list |
| `colors_and_type.css` | All CSS tokens (colours, type, spacing, radii, brands, medium) |

Always read in this order. Do not start designing before reading all four.

---

## CSS classes — how to configure a surface

```html
<!-- Sub-brand -->
class="sr-brand-starriver"   ← mother brand + museum
class="sr-brand-project-t"   ← Taiwan landscape / racing
class="sr-brand-formosa"     ← archived; do not use for new work
class="sr-brand-racing"      ← queued; uses project-t chassis

<!-- Medium -->
class="sr-medium-web"        ← flat screen (cream, animation on)
class="sr-medium-vrc"        ← VRChat (higher contrast, animation off)

<!-- Type opt-in -->
class="sr-type"              ← applies body font + smoothing

<!-- Semantic text classes -->
class="sr-h1"   class="sr-h2"   class="sr-h3"
class="sr-kicker"   class="sr-eyebrow"   class="sr-lead"
class="sr-p"   class="sr-meta"   class="sr-code"   class="sr-wordmark"
```

---

## Fonts

TASA Orbiter (Display / Deck / Text) is self-hosted in `fonts/`. Link
`colors_and_type.css` from the same level as `fonts/`.

Google Fonts loaded via `@import` in the CSS for CJK:
- `Noto Sans TC` (primary CJK, all surfaces)
- `Noto Serif TC` (museum long-form reading only)
- `JetBrains Mono` (timestamps, code, leaderboard data)

**Do not** serve `Noto Sans SC` — use `TC` for Taiwan/HK character forms.

---

## Colour rules (critical)

1. Body surface = `--sr-paper #F3EEE3`. Never pure white.
2. Body ink = `--sr-ink #14140E`. Never pure black.
3. Amber (`--sr-amber #E88A2E`): **one accent event per viewport only**.
4. No gradient tropes. The only brand gradient is the comet trail.
5. Don't invent new hues. Tint/shade existing tokens instead.
6. For Project T surfaces: use `--pt-*` token set. Don't mix into StarRiver.

---

## What "潛移默化" means for generated copy

- zh-TW surfaces: do NOT write 台灣 at brand level. Use 地名 / 路線 / 縣市.
- EN surfaces: "Taiwan" anchor is OK. Prefer specific over general.
- No traditional Chinese ornament, no lucky motifs, no 華國美學.
- Always 繁體字 for copy — no Simplified Chinese.

---

## Layout ground rules (the basics before any seasoning)

1. Cream ground, warm ink, one accent colour.
2. Wide gaps between sections (≥ 96px body; ≥ 48px between groups).
3. Left-aligned text by default. Centred only for single marquee lines.
4. Border-over-shadow. No drop shadows on cards.
5. Do not use `color: #000` or `background: #fff`. Always use tokens.

---

## What NOT to do

- No emoji.
- No gradient backgrounds (except starfield hero via `--bg-inverse`).
- No rounded pill buttons at >8px on mother-brand surfaces.
- No shadows on cards.
- No full-bleed landscape photos on StarRiver / Museum surfaces.
- No multiple accent colours in the same viewport.
- No decorative SVG ornaments.
- No Simplified Chinese character forms.
- No pure white (#fff) on body surfaces; no pure black (#000) on text.

---

## Asking for design work (how to prompt this system)

Good prompt structure:
```
Sub-brand: [starriver / project-t / racing]
Medium: [web / vrc]
Surface: [hero / work-index / work-detail / changelog / store / nav]
Language: [zh-TW / en / bilingual]
Key content: [what text/data/images will appear]
Special constraints: [anything specific]
```

Example:
```
Sub-brand: starriver
Medium: web
Surface: work-detail
Language: bilingual (zh-TW primary)
Key content: Project title "Beyond Gravity", year 2024, VRChat world link,
  3 screenshots, 200-word concept statement, 3 collaborators listed.
Special constraints: none
```

---

## Known gaps (as of this version)

- Project T UI kit not yet built.
- Icon system not confirmed (Lucide proposed).
- Hero photography art direction not written.
- VRChat in-world 美術館 UI requires separate pass.
- Audience-facing metric systems (per-audience evaluation indicators)
  not yet designed — discussed, to be developed.
- Multi-language routing logic not yet specified.
