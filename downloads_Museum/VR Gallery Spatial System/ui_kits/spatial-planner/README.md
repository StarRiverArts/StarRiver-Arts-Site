# Spatial Planner — 空間規劃工具

The single working tool of this design system. Plan view (top-down) + elevation view (side) of a gallery, with placeable exhibit reserve volumes (S / M / L / XL), the 130 cm avatar, viewing cones, and clearance zones.

## What it does

- **Plan view** — a 10 × 7 m room on a 10 cm grid. Click a reserve size in the toolbar, then click in the room to place. Reserves snap to the grid. Drag to move; click to select.
- **Elevation view** — switches to show whichever wall the selected reserve is closest to (or the north wall by default). Shows exhibits, the avatar at standard viewing distance, the eye-height datum, the focus cone.
- **Validation** — for each reserve, the panel reports whether (a) the centroid sits at 130 cm, (b) the clearance is met, (c) the work falls in the ±15° focus cone from standard viewing distance.

## Files

```
index.html             ← entry, loads React + Babel + all jsx
App.jsx                ← root, holds shared state (reserves, selection, wall)
Toolbar.jsx            ← reserve-size picker + wall switcher + clear
PlanView.jsx           ← top-down SVG canvas
ElevationView.jsx      ← side-view SVG canvas
ValidationPanel.jsx    ← pass/fail checklist for selected reserve
constants.jsx          ← reserve volumes, viewing bands, palette
```

## How to read the drawing

| Element | Meaning |
|---|---|
| `#1A1A1A` 2 px line | Wall (cut edge in plan, visible edge in elevation) |
| Hairline grey | 10 cm grid |
| Dashed ochre `#B47B2E` | Dimension lines, centroid datum, viewing rays |
| `#EEEEEE` fill | Body / built architecture |
| `#689F38` 18% | Env / nature visible from inside |
| Empty box, ink border | Exhibit reserve placeholder |

## Not yet covered (next iterations)

- Multi-room layouts (current limit: one rectangular room).
- Curved partitions placeable from the toolbar (currently fixed sample partitions on the canvas).
- Export to GLTF / Unity scene file.
