# StarRiverSite Requirements

Date baseline: `2026-07-04`

This file records repo-level requirements and document dependencies for `StarRiverSite/`.

## Repo-Level Product Requirements

1. Keep the site fully static and publishable to GitHub Pages with no build-time network dependencies beyond the repository content.
2. Preserve the three primary entrances (Studio, Project T, Museum) and the Time Attack records station as the core information architecture.
3. Keep the machine-readable indexes (`site-index.json`, `search-index.json`, `llm-index.json`, `sitemap.xml`, `llms.txt`) regenerated from page content, never hand-edited.
4. Keep Traditional Chinese / English / Japanese content aligned when pages carry multilingual copy.

## Governance Requirements

1. Publishing to GitHub Pages requires explicit user approval (root publish/deploy gate).
2. Refreshing `play/RacingClub/TimeAttack/data/*.json` from `VR_RacingClubTW` is a cross-project data transfer and follows the root cross-project approval gate.
3. Local content and style edits default to `Fast Path`; multi-page or data-touching work escalates per `WORKFLOW_LITE.md`.
4. Repo-level governance docs must stay consistent with the actual folder structure; when the structure changes, update `docs/SSOT.md` in the same change.

## Current Authoritative Inputs

- `llms.txt` (generated site overview)
- `site-index.json` / `site-index.schema.json`
- `docs/SSOT.md`
- `docs/REQUEST_TRACE.md`
- root `WORKFLOW_LITE.md` (mode selection) and root `AGENTS.md` (safety boundary)

## Current Gaps

- No repo-local `README.md` or `AGENTS.md` exists after the folder restructure; root rules apply directly until repo-local ones are authored.
- The `VR_RacingClubTW -> StarRiverSite` data sync pilot is not yet contracted (`FRICTION-VRRCTW-001`).
- `PROJECT_INDEX.json` landmarks for this repo were stale until regenerated on `2026-07-04`.
