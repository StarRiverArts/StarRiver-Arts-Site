# Falloff Predictor — 光衰減預估器

A live calculator for how light intensity, falloff model, and distance combine to produce the rendered illuminance and colour you'll actually see in the engine — **before** you bake. The intent is to catch over-exposed / under-exposed surfaces while still in the planning view, not after a 40-minute lightmap bake.

## What it predicts

For a chosen light (CCT, intensity, falloff model) and surface (albedo target, viewing distance), the tool computes:

1. **Illuminance at the surface** (lux equivalent) using one of four falloff models.
2. **Rendered colour** (hex) = surface albedo × light spectrum × illuminance contribution.
3. **ΔE drift** from the target albedo — how much the surface has shifted in perception.
4. **Verdict** — under-lit / target / over-lit / clipped, with the band thresholds shown.
5. **A curve plot** comparing all four falloff models so you can pick which model to bake with.

## Falloff models

| model | formula | matches | use when |
|---|---|---|---|
| **inverse-square** | I = I₀ / d² | Unity HDRP, URP physical | photo-real spaces |
| **linear** | I = I₀ · max(0, 1 − d/r) | Unity Built-in, lilToon point-light | stylised, fast |
| **smooth** | I = I₀ · (1 − (d/r)⁴)² / d² | Unreal / URP smooth | best compromise |
| **constant** | I = I₀ for d < r, 0 outside | lilToon emission baked | flat fills only |

`d` is distance from light to surface in metres; `r` is the configured range.

## Caveats

- This is a **predictor**, not a baker. Indirect bounces are not simulated — for those you still need the engine's own bake.
- The render-preview swatch assumes a Lambertian (matte) surface with full normal-facing geometry. Specular highlights and angle effects are not included.
- ΔE is computed in Lab using a 76-distance approximation — close enough to spot drift, not certified for printing.

## Files

```
index.html          ← entry — controls + preview + curve plot
```
