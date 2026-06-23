# StarRiverSite Requirements

Date baseline: `2026-06-07`

This file records repo-level requirements and document dependencies for `StarRiverSite/`.

## Repo-Level Product Requirements

1. Preserve `StarRiver-Arts-Site/` as the active nested site root and implementation boundary.
2. Keep the main StarRiver Arts site chassis, Project T / Racing Club surfaces, and Time Attack public static surface readable as one governed repo scope.
3. Keep repo-level governance separate from nested implementation detail, generated site data, and uploaded media assets.
4. Do not treat root control-plane artifacts as repo-local SSOT once repo-local docs exist.

## Governance Requirements

1. Repo-local work should use bounded run packets and run reports before product-code implementation is attempted.
2. Product-code implementation stays gated until the repo-local governance baseline and checker support are mature enough.
3. The nested git repo dirty baseline under `StarRiver-Arts-Site/` must remain separated from any future bounded write run.
4. Repo-level governance docs must stay consistent with nested site architecture and planning references.

## Current Authoritative Inputs

- `AGENTS.md`
- `docs/SSOT.md`
- `docs/REQUEST_TRACE.md`
- `StarRiver-Arts-Site/README.md`
- `StarRiver-Arts-Site/SITE_ARCHITECTURE.md`
- `StarRiver-Arts-Site/ENTRY_POINTS.md`
- `StarRiver-Arts-Site/DESIGN_VOCABULARY.md`
- `StarRiver-Arts-Site/play/RacingClub/規劃.md`

## Current Gaps

- No repo-local product-code run packet has been approved yet.
- The relationship between wrapper-folder governance and the nested git site root is documented, but not yet automatically cross-checked.
- The nested site repo already has a pre-existing dirty baseline that must remain separated from future bounded change sets.

## Next Requirement Hardening Step

Use `scripts/check_ssot.py`, generated context packs, and nested-site dirty-baseline reporting before any StarRiverSite product-code run is proposed.
