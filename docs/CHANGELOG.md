# StarRiverSite Changelog

## 2026-07-17

- Completed the T-1 Phase 0 canonical schema audit with direct local access to `VR_RacingClubTW`, the canonical SQLite store, and the actual UdonSharp consumers.
- Verified the canonical store location, all 9 SQLite tables (DDL, PKs, FKs, row counts), the `rec_NNNN` record ID policy, and the world-local `route_code` scope.
- Confirmed `v = int(verified)` producer semantics and the ✓-rendering Udon consumer behavior; VRChat additive-field tolerance verified via DataDictionary parsing.
- Answered all eight schema-map open questions; marked Phase 0 complete (pending owner review) and unblocked Phase 1 additive migration.
- Documented pipeline pitfalls: the empty decoy `ta_data.sqlite` at the pipeline repo root and stale nested `DB_PATH`s in legacy migration scripts.
- Documentation-only change: no canonical data, generated JSON, contract, ID, or URL was modified.
- Phase 1–3 rehearsal (pipeline repo `migrations/`): m0001 additive migration (14 new tables, events +16 / records +6 columns, user_version=1), retrospective import of the taken-down Events subsystem (git `ecee47d`: 3 events / 22 matches / 56 results), and an additive builder projection for event cards — all verified end-to-end on a DB copy with zero non-expected baseline diff and 9 passing tests. Canonical apply awaits owner approval.
- Recorded the owner-approved T-1 product structure (6 product areas + 1 maintenance area, submission-first thin vertical slice) as `t-1-product-structure.md`.
- Thin-slice rehearsal complete on a DB copy: m0002 submissions layer (receipt query codes, 6-state machine) + workflow CLI; a demo claim was intaken, reviewed, accepted into `rec_0963`, and the same record appeared in website tracks/summary JSON and VRChat `recent.json` (Top-N cutoff behaved correctly). 11 pipeline tests pass.

## 2026-07-16

- Aligned the Project T T-1 specification around a three-layer data architecture: authoring/import, canonical SQLite, and generated contracts.
- Added a gap analysis, evidence-scoped current schema map, non-destructive migration proposal, and Website/VRChat adapter policy.
- Added the D3-B implementation roadmap and a producer contract freeze inventory for Phase 0 handoff.
- Expanded the migration proposal with Event/World/Route, Match/Entry, Evidence, Team membership junctions, and a `record_reviews` companion fallback.
- Recorded that `VR_RacingClubTW`／the actual pipeline repo was unavailable to the connected repository scope, so canonical table details remain explicitly pending verification.
- Preserved all Time Attack generated JSON, VRChat contracts, IDs, routes, query parameters, URLs, and cross-project data links.

## 2026-07-15

- Restored the ProjectT layered color-block mountain hero and clarified that StarSight belongs in the featured-world content layer, not over the brand background.
- Added a consistent public production credit for StarRiver Arts, OpenAI GPT, and Anthropic Claude, scoped to site information architecture and web production.
- Added titles to all 32 VR Gallery embedded previews without changing their source paths.
- Hid the unverified Beyond Gravity VRChat CTA and recorded the duplicated world-ID issue in the content SSOT.
- Updated index parsing to exclude hidden Japanese copy while preserving both `臺灣` and legacy `台灣` discovery terms.
- Kept Time Attack presentation and all cross-project data contracts unchanged.

## 2026-07-14

- Recorded content SSOT v0.3 and the confirmed bilingual public scope.
- Reframed the homepage around `StarRiver Arts` and `VR 數位體驗的地景創作者`.
- Rebuilt Studio as a curated view over canonical project pages.
- Reframed ProjectT around Taiwan landscape VR experiences with StarSight as the initial hero.
- Reframed the Museum homepage as the `季前展` container for two current web exhibitions.
- Corrected confirmed 9 Turns and Beyond Gravity facts; withheld unfinished project pages from indexing without deleting or renaming them.
- Hid Time Attack verification UI in the presentation layer while preserving all generated JSON fields and data paths.
- Preserved existing page URLs, Time Attack endpoints, IDs, query parameters, and cross-project data contracts.
- Updated the index generator source; generated discovery files still require a deliberate regeneration pass.


## 2026-07-04

- Added the repo-local governance skeleton:
  - `docs/SSOT.md`
  - `docs/REQUEST_TRACE.md`
  - `docs/REQUIREMENTS.md`
  - `docs/CHANGELOG.md`
- Closed the onboarding gap flagged by `scripts/check_ssot.py --all-onboarded` (repo was registered as onboarded but had no docs skeleton).
- No site content, pages, or generated indexes were modified.
