# StarRiverSite SSOT

Date baseline: `2026-07-04`

This file is the repo-local source of truth for repo-wide scope, document ownership, and governance boundaries inside `StarRiverSite/`.

It does not replace page content, generated indexes, or the published site itself.

## Repo Scope

`StarRiverSite/` is the StarRiver Arts public static site, published to GitHub Pages at `https://starriverarts.github.io/StarRiver-Arts-Site/`.

Current top-level areas observed in this governed folder:

- `index.html`, `studio.html`, `museum.html`, `play.html`, `store.html`, `404.html`: top-level entry pages
- `museum/`: exhibitions, web exhibitions, and interactive museum design-system tools
- `play/`: Project T mountain-road world hub, including `play/RacingClub/TimeAttack/` records station and its `data/*.json` endpoints
- `projects/`, `screenshots/`, `Images/`, `assets/`, `fonts/`, `uploads/`, `downloads_Museum/`: content and media
- `tools/`: site-local build/maintenance helpers
- `site-index.json`, `search-index.json`, `llm-index.json`, `sitemap.xml`, `llms.txt`: generated machine-readable indexes

## Authority Boundary

Canonical repo-level governance files:

- `docs/SSOT.md`
- `docs/REQUEST_TRACE.md`
- `docs/REQUIREMENTS.md`
- `docs/CHANGELOG.md`

Generated artifacts (`site-index.json`, `search-index.json`, `llm-index.json`, `sitemap.xml`, `llms.txt`) are derived outputs, not governance sources.

Input evidence only, not repo-local SSOT:

- root control-plane request artifacts in `Protable/`
- root trace files in `CodeTools/.agent-workflow/REQUEST_TRACE.md` and `CodeTools/docs/INCUBATION_TRACE.md`
- chat transcripts and assessment reports outside `StarRiverSite/`

## Data Boundary

- The Time Attack data files under `play/RacingClub/TimeAttack/data/` originate from the `VR_RacingClubTW` pipeline. Importing or refreshing them is a cross-project data transfer and requires the root cross-project approval gate.
- Publishing (push to GitHub Pages) is a publish/deploy action and requires explicit user approval per root rules.

## Document Ownership Rules

- Repo-wide governance facts belong in the top-level `docs/` folder.
- Page content is owned by the pages themselves; the generated indexes must be regenerated, never hand-edited.
- Root governance controls routing and process boundaries; this repo-local `docs/` layer owns repo-local facts from its Date baseline onward.
- Local site edits default to `Fast Path` per `WORKFLOW_LITE.md`; publish and cross-project data refresh escalate per the Data Boundary above.

## Known Baseline State

- Top-level repo governance docs were introduced on `2026-07-04` to close the onboarding gap found by `scripts/check_ssot.py --all-onboarded`.
- Earlier registry entries referenced a `StarRiverSite/README.md`, `AGENTS.md`, and a nested `StarRiver-Arts-Site/` folder; the folder has since been restructured so the site content lives at the repo top level, and those files do not currently exist.
