# VR Gallery Spatial System
**虛擬實境美術館・空間設計準則**

A spatial design system for VR / virtual museum and gallery environments. It is **not** a visual-identity or UI system — wayfinding, signage, exhibition graphics and on-screen UI are governed by a separate visual system. This system governs **the space itself**: materials, light, spatial scale, whitespace, exhibit reserve volumes, and curve geometry, all calibrated for a **130 cm VR avatar** with eye-height at 130 cm.

> 本系統規範 VR 美術館 / 畫廊的空間設計。視覺識別、平面、導覽 UI 由另一套設計系統負責；本系統處理「空間本體」：材質、光、空間尺度、留白、展品預留量體與曲線幾何，均以 **130 公分高的 VR avatar** 為基準。

---

## Scope — what this system covers

1. **Materials × Light (材質 × 光源)** — how surfaces read under lighting. Each material is documented as a triplet: *target colour → simulated actual colour → suggested adjustment.* The system assumes a neutral gallery key-light at 5000K with diffused fill.
2. **Spatial Ergonomics (空間人因)** — viewing height differential, viewing distance, viewing cone — all derived from a 130 cm avatar with eye-height at 130 cm.
3. **Whitespace as Structure (留白即結構)** — the artistic principle of *liú bái* (留白) translated into measurable rules for inter-exhibit spacing and object grouping.
4. **Exhibit Reserve Volumes (展品預留量體)** — four reserve sizes (S / M / L / XL) for stress-testing layouts before art is placed.
5. **Curve Geometry (曲線幾何)** — a small set of approved radii for soft architecture (alcoves, rounded partitions, plinth corners, vault transitions).
6. **Virtual Light · 虛擬光源** — emission types for VR-native artworks (point / edge / volumetric / emissive surface / projected), with an *emission budget* that caps how much an artwork tints its body wall.
7. **Particles · 粒子** — density (sparse / medium / dense) × behaviour (float / swirl / fall) matrix, with VR-comfort caps.
8. **Interactives · 互動物件** — reach zones (grab 55 / near 120 / far 300 cm) and float bands (low 40 / eye 130 / high 200 cm) for objects that can be picked up, orbited, or nudged.
9. **Information · 資訊浮層** — three display ranges (near label / mid context / far ambient sky-text) with persistence and opacity rules.

---

## Brand context — why these colours

The palette is anchored to the four roles a VR gallery surface can play:

| Token | Hex | Role | 中文 |
|---|---|---|---|
| `--col-env` | `#689F38` | Surrounding / natural environment (foliage, terrain, daylight bleed) | 周邊・自然 |
| `--col-body` | `#EEEEEE` | The gallery itself (walls, floors, primary architecture) | 本體・建築 |
| `--col-cool` | `#E8EAF6` | Cool accent — north-facing rooms, contemplative spaces, water | 冷色調 |
| `--col-warm` | `#FFF8E1` | Warm accent — south-facing rooms, intimate spaces, candlelight | 暖色調 |

These four colours are starting *targets*. After material and light have acted on a surface, the system's job is to predict the **actual** rendered colour and prescribe a correction (a tint of the material itself, or a shift in light colour temperature).

---

## How to use this system

This system is a **method**, not a stylebook. You use it in three stages:

1. **Plan** — sketch the room in the Spatial Planner (`ui_kits/spatial-planner/index.html`). Place reserve volumes for exhibits. Check the plan and elevation views together.
2. **Specify** — for every surface and exhibit, pick a material card and read off the target / actual / adjustment triplet. Pick a curve radius from the curve cards.
3. **Validate** — drop the 130 cm avatar reference into the elevation view and confirm every exhibit centroid falls in the viewing cone.

---

## CONTENT FUNDAMENTALS

This is a **technical-architectural** system. Copy is written like an architect's specification, not a marketing surface.

- **Voice:** declarative, dimensional, neutral. State the rule, then state the reason.
- **Person:** third-person and imperative. *"The exhibit centroid sits at 130 cm."* Not *"You should put the artwork at…"*.
- **Casing:** Sentence case for prose. ALL-CAPS reserved for token names and section headers in technical drawings.
- **Numerics:** Always include units. cm for built scale, ° for angles, m for room dimensions, K for colour temperature.
- **Language:** Bilingual, Traditional Chinese + English. Chinese first when the term is culturally specific (留白, 立面圖, 平面圖). English first when the term is technical-international (LUX, CCT, plinth).
- **Tone:** Calm, measured, museum-quiet. No exclamation marks. No emoji. No "magic" or "delight" or any consumer-product vocabulary.
- **Examples:**
  - ✅ "Exhibit reserve M (60 × 60 × 100 cm) requires 90 cm clear circulation on three sides."
  - ✅ "材質：霧面石灰岩。目標 #EEEEEE。實際 #E4E2DD（暖移 +3%）。建議：光源色溫降至 4600K。"
  - ❌ "Add a pop of color with our warm accent! ✨"

---

## VISUAL FOUNDATIONS

The visual language of the *documentation* mirrors the language of *architectural drawings* — not the language of the gallery itself.

- **Type:** 思源黑體 (Noto Sans TC) for Chinese; **TASA Orbiter Deck** for Latin and numerals (Sora is the open-source fallback when no licensed copy is dropped into `fonts/`); JetBrains Mono for dimensions and tokens. Tabular numerals everywhere a dimension appears.
- **Colour (of the docs):** Paper-white `#FAFAF7` background; ink `#1A1A1A` for text; the four palette colours appear only as swatches and as plan / elevation fills. No vivid accents anywhere else.
- **Backgrounds:** Always solid paper white or neutral grey. **No** gradients, **no** photographs, **no** patterns. Plan and elevation drawings are line-on-paper, never filled illustrations.
- **Lines:** Hairline (0.5 px), thin (1 px), medium (1.5 px), heavy (2 px). Architectural convention — heavy for cut edges, medium for visible edges, thin for hidden edges, hairline for dimensions and grids.
- **Grid:** 10 cm spatial grid is the primitive. Every dimension in the system is a multiple of 10 cm. Documentation grid is an 8 px UI grid.
- **Animation:** None in documentation. The Spatial Planner uses 200 ms ease-out for transitions between plan and elevation views, nothing else.
- **Hover states:** A 1 px ink underline appears on interactive elements. No colour shift, no opacity change.
- **Press states:** Background fills to `#1A1A1A` at 6% opacity. No scale, no shadow.
- **Borders & corners:** 0 px (sharp) for documentation cards. Curve radii within the *designed space* are governed by the Curve cards — they range 5 / 20 / 60 / 120 / 240 cm.
- **Shadow:** None in documentation. Real cast shadows appear only in plan/elevation drawings, rendered as 8% black at a 30° offset.
- **Transparency & blur:** Never used. This is a precision system.
- **Imagery (in docs):** None. Where an artwork would appear, a labelled reserve volume appears instead.
- **Cards:** 1 px `#E0DED7` border, 0 radius, no shadow, generous internal padding (24 px on 700 px width).

---

## ICONOGRAPHY

This system uses **architectural symbol conventions**, not product icons.

- **Symbols** are drawn as SVG line-glyphs at 1 px / 1.5 px stroke. They follow architectural drafting convention — north arrows, scale bars, dimension extension lines, datum points, eye-height markers.
- **No emoji.** No Unicode pictographs. Where a directional or measurement glyph is needed, an SVG symbol is used.
- **No icon font** — the symbol set is small (under twenty marks) and lives inline.
- **Symbols inventory:** north arrow, scale bar, eye-level datum, plan-cut line, elevation reference, dimension witness lines, exhibit reserve marker (4 sizes), light source, viewer cone, curve template.

The visual-identity system (separate) supplies any pictograms used *for the visitor* (wayfinding, info icons). Those are out of scope here.

---

## INDEX — root folder

```
README.md                        ← you are here
SKILL.md                         ← agent-skill manifest
colors_and_type.css              ← all design tokens
fonts/                           ← (Google Fonts — see notes below)
preview/                         ← 20+ cards rendered into the Design System tab
  colors-*.html                  ← palette + target-vs-actual material colour
  type-*.html                    ← typographic specimens
  materials-*.html               ← matte / satin / glossy / textured
  space-avatar.html              ← 130 cm avatar reference
  space-viewing-*.html           ← distance / angle / height
  whitespace-*.html              ← inter-exhibit spacing rules
  exhibit-reserve-*.html         ← S / M / L / XL volumes
  curves-radii.html              ← approved curve set
  plan-sample.html               ← sample plan view
  elevation-sample.html          ← sample elevation view
  virtual-light-types.html       ← virtual emission taxonomy
  virtual-emission-budget.html   ← spill caps onto body walls
  virtual-particles.html         ← particle density × behaviour
  virtual-interact-zones.html    ← grab / near / far reach zones
  virtual-float-heights.html     ← low / eye / high float bands
  virtual-info-display.html      ← label / context / ambient ranges
ui_kits/
  spatial-planner/               ← the working tool: plan + elevation, drag exhibits
    index.html
    PlanView.jsx
    ElevationView.jsx
    Avatar.jsx
    ExhibitReserve.jsx
```

---

## Caveats / known substitutions

- **Fonts:** Chinese is 思源黑體 / Noto Sans TC (OFL, loaded from Google Fonts CDN). Latin target is **TASA Orbiter Deck** (justfont, commercial — *not bundled*); the CSS references it by name and falls back to **Sora** (Google Fonts, open-source, geometric proportions close to Orbiter Deck) when no licensed copy is present. **Flagged substitution — drop `TASAOrbiterDeck-Light/Regular/Medium.woff2` into `fonts/` once you have the license and the `@font-face` rules in `colors_and_type.css` will pick them up automatically.**
- The palette colours come **from the brief** (#689F38 / #EEEEEE / #E8EAF6 / #FFF8E1). They are treated as anchors — real installations may need slight calibration once the renderer (Unity / Unreal / WebXR) is chosen, because colour spaces differ.
