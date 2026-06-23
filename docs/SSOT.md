# StarRiverSite SSOT

Date baseline: `2026-06-07`

This file is the repo-local source of truth for repo-wide scope, document ownership, and governance boundaries inside `StarRiverSite/`.

It does not replace the nested site implementation files under `StarRiver-Arts-Site/`.

## Repo Scope

Current top-level product areas observed in this governed folder:

- `StarRiver-Arts-Site/`: active nested site root and nested git repository
- `StarRiver-Arts-Site/play/`: Project T and Racing Club public entry surfaces
- `StarRiver-Arts-Site/play/RacingClub/TimeAttack/`: Time Attack static-site sub-surface and generated data consumer
- `StarRiver-Arts-Site/museum/` and `downloads_Museum/`: museum and design-system exploration surfaces

## Authority Boundary

Canonical repo-level governance files:

- `docs/SSOT.md`
- `docs/REQUEST_TRACE.md`
- `docs/REQUIREMENTS.md`
- `docs/CHANGELOG.md`

Canonical product references that remain authoritative for the active site direction unless later superseded:

- `AGENTS.md`
- `StarRiver-Arts-Site/README.md`
- `StarRiver-Arts-Site/SITE_ARCHITECTURE.md`
- `StarRiver-Arts-Site/ENTRY_POINTS.md`
- `StarRiver-Arts-Site/DESIGN_VOCABULARY.md`
- `StarRiver-Arts-Site/play/RacingClub/規劃.md`

Input evidence only, not repo-local SSOT:

- root control-plane request artifacts in `Protable/`
- root trace files in `CodeTools/.agent-workflow/REQUEST_TRACE.md` and `CodeTools/docs/INCUBATION_TRACE.md`
- chat transcripts and temporary assessment reports outside `StarRiverSite/`

## Current Repo Mission

At repo scope, `StarRiverSite/` currently owns the public web surface for StarRiver Arts and adjacent public-facing experiences.

This includes:

1. the main StarRiver Arts site chassis
2. Project T / Racing Club public entry surfaces
3. the Time Attack static-site presentation layer
4. museum and design-system presentation experiments that live under the nested site root

## Document Ownership Rules

- Repo-wide governance facts belong in the top-level `docs/` folder.
- `StarRiver-Arts-Site/` remains the canonical nested site root for implementation-facing page structure, design-system references, and static site assets.
- The nested git repo under `StarRiver-Arts-Site/` is a product implementation boundary, not a replacement for repo-level governance docs.
- Generated or uploaded site assets inside `StarRiver-Arts-Site/` remain product data and must not be reinterpreted as governance records.
- Product-code runs must update `docs/CHANGELOG.md` after the bounded run contract is satisfied.

## Known Baseline State

- Top-level repo governance docs were introduced on `2026-06-07` during a bounded `Docs-only Onboarding` run.
- `StarRiverSite/` is a governed top-level folder, while `StarRiver-Arts-Site/` is a nested git repo and active site root.
- The nested site repo already has a pre-existing dirty baseline and untracked content areas; this SSOT does not reinterpret or clean them.
- `Protable/` remains control-plane only and is not part of this repo-local SSOT.

## Next Governance Step

Use the existing repo-local skeleton checker and generated context pack before any future product-code run is proposed for `StarRiverSite/` or its nested site root.
