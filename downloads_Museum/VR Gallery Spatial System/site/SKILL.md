---
name: vr-gallery-spatial-system
description: Use this skill to design and validate VR museum / gallery spaces using the VR Gallery Spatial System. Provides spatial rules calibrated for a 130 cm VR avatar — materials × light, viewing distance, viewing cone, mounting height, 留白 (whitespace) rules, exhibit reserve volumes (S/M/L/XL), curve radii (5/20/60/120/240 cm), plus a working plan-and-elevation planner. Output is HTML, suitable for prototyping VR scenes, briefing 3D / Unity / Unreal / WebXR teams, or producing architectural-style drawings.
user-invocable: true
---

# VR Gallery Spatial System — agent skill

This skill governs **the space itself** of a virtual museum or gallery — not the on-screen UI, not wayfinding, not exhibition graphics. All rules are calibrated for a **130 cm VR avatar with eye-height at 130 cm**.

It covers nine concerns, in two families:

**Architectural (physical-mimicking):**
1. Materials × light — target / actual / adjustment triplet per surface
2. Spatial ergonomics — viewing distance, cone, mounting height
3. Whitespace 留白 — measurable inter-exhibit spacing rules
4. Exhibit reserve volumes — S / M / L / XL placeholders
5. Curve geometry — 5 / 20 / 60 / 120 / 240 cm radii

**Virtual-native (no physical equivalent):**
6. Virtual light — point / edge / volumetric / emissive / projected emission types, with a spill budget that caps how much an artwork tints its body wall
7. Particles — sparse / medium / dense × float / swirl / fall, with VR-comfort caps
8. Interactives — grab 55 / near 120 / far 300 cm reach zones, plus low / eye / high float bands for objects that can be picked up, orbited, or nudged
9. Information — near label / mid context / far ambient sky-text, with persistence and opacity rules

## How to use

1. **Read `README.html`** first — it is the canonical overview, with palette, scope, content tone, and an index of every other file.
2. **Read `colors_and_type.css`** — it has every design token (the four spatial-role colours, material target / actual pairs, curve radii, type, line weights). When you produce HTML, import this file so the artefact uses the system's typography and palette automatically.
3. **Browse `preview/`** to find the specific card relevant to the user's task — e.g. `space-viewing-angle.html` for cone rules, `exhibit-reserve-validation.html` for the worked-example pattern, `plan-sample.html` for the linear-axis room layout, `elevation-sample.html` for the corresponding 1:50 elevation.
4. **The Spatial Planner** in `ui_kits/spatial-planner/` is the interactive tool. Open `index.html` to validate a layout, or read its components (`PlanView.jsx`, `ElevationView.jsx`, `ValidationPanel.jsx`) when the user wants to extend the tool.

## When making visual artefacts

- **Copy `colors_and_type.css` out** and reference it. Do not invent new colours — use the four role tokens (`--col-env`, `--col-body`, `--col-cool`, `--col-warm`) and the document chrome tokens (`--paper`, `--ink`, `--dim`).
- **Drawings are architectural, not illustrative.** Line weights 0.5 / 1 / 1.5 / 2 px. No gradients, no shadows, no photographs. Plan + elevation are line-on-paper.
- **Every dimension carries a unit.** cm for built scale, ° for angles, K for light temperature, mm for drawing call-outs.
- **Bilingual labels.** Place 中文 alongside the English term when the concept is named in the system (留白, 立面圖, 平面圖, 本體, 周邊).
- **No emoji. No SVG icons that imitate emoji.** Use architectural symbols only — north arrow, scale bar, eye datum, dimension witness lines, viewer cone.

## When working on production code (Unity / Unreal / WebXR)

- Treat the four palette colours as **target albedo**. Run them through the renderer once with the default 5000K key + diffused fill, capture the **actual** rendered colour, and reconcile with the target-vs-actual card before locking the scene.
- Place exhibit reserves first (`S / M / L / XL` volumes), then validate against the viewing cone before placing real assets.
- Enforce the centroid-at-eye rule by computing each exhibit's geometric centre and snapping the plinth height so the centroid lands at `avatarEye = 130 cm`.

## If the user invokes this skill with no other guidance

Ask:
- Is this a single room, a sequence of rooms, or a whole gallery?
- What kind of work is being shown — paintings, sculptures, installations, mixed?
- What is the renderer / platform (Unity, Unreal, WebXR, plain three.js)?
- Is the visual identity / wayfinding system already chosen, or is this purely the architectural shell?

Then either (a) produce HTML mock-ups using the cards in `preview/` as templates, or (b) write production-shape configuration files (JSON scene descriptors, room manifests) that follow the rules in this system.

## What this skill does NOT cover

- Visitor-facing UI, signage, exhibit labels, audio guide UX.
- Branding, logos, marketing material.
- Lighting hardware specification — only colour temperature and behaviour are governed here.
- Accessibility for non-VR visitors. The avatar baseline is 130 cm because the brief specifies VR avatars; physical-world accessibility lives in a separate system.
