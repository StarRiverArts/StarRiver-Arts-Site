# VR Gallery Spatial System — Downloads

Two self-contained HTML tools, runnable offline. Open either file in any modern browser — no install, no internet required after first load.

## Spatial Planner · 空間規劃工具
`spatial-planner.html`

Plan + elevation view of a gallery. Place exhibit reserves (S/M/L/XL), draw walls (solid / voile / glass), place lights (8 mount types, 5 CCTs, 3 intensities). Lights cast shadow polygons and single-bounce reflections respecting wall opacity. Drag any object in either view. Validation panel reports centroid height, clearance, viewing cone, and light coverage for the selected reserve.

**Room shapes:** rectangle, L, T, hexagon, oval, corridor, circle, half-fan.

**Persistence:** the scene auto-saves to your browser's localStorage. Use the toolbar's `↧ export scene` / `↥ import` to save a `.json` snapshot or share with someone else.

## Falloff Predictor · 光衰減預估
`falloff-predictor.html`

Predict how a surface will render under a given light, before you bake. Pick light preset (CCT), surface (target albedo), falloff model (inverse-square / smooth / linear / constant), and tune I₀, range, viewing distance, target lux. Outputs:
- Rendered colour swatch
- ΔE drift from target
- Verdict + step-by-step recommendations (apply with one click)
- Curve plot comparing all four falloff models

## Notes

- TASA Orbiter Deck (the Latin display font) is commercial and not bundled. If you have it installed locally the tools will use it; otherwise they fall back to Sora (geometric, similar character).
- Both bundles are ~7 MB each because they inline React 18 + Babel standalone. They run in any modern browser without a build step.
