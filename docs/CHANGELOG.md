# StarRiverSite Changelog

## 2026-08-04

- Implemented the `noindex` StarRiver Social Hub preview with shared bilingual content, static platform links, optional approved-feature data, and the approved CyberGum6 presentation.
- Promoted the pure CyberGum6 palette to the sole Social Hub presentation and removed the earlier A/D palette study and query-parameter switch.
- Added an intentionally separate `?theme=blueprint` Social Hub study with cold engineering labels, drafting-grid geometry, squared components, and a black / white / deep-blue drawing palette; link destinations and shared site data remain unchanged.
- Reworked Blueprint decorative telemetry as fictional but physically coherent LEO mission data: six classical orbital elements, ECI/J2000 position and epoch, proximity-operations range/rates, a normalized relative-attitude quaternion, and an S-band link budget summary.
- Approved Social Hub for public release: changed the page to `index,follow`, added its canonical and Open Graph URL, added a concise homepage Connect entry, and promoted the page and both approved presentations into the content SSOT.
- Enabled the approved Social Hub draw mechanic: parameter-free visits randomly select the complete CyberGum6 or Blueprint presentation, while `?theme=cybergum` and `?theme=blueprint` remain deterministic preview/share URLs.
- Revised the production-assistance disclosure to identify StarRiver Arts as the planning and production lead while limiting OpenAI GPT and Anthropic Claude to information-architecture and web-development assistance.
- Removed the duplicate AI collaboration annotation from the VR Gallery exhibit header so the disclosure remains in the low-interruption footer location required by the content SSOT.
- Replaced the incomplete Studio and Social Hub footer links with the approved StarRiver Arts / Studio / ProjectT / Museum / Social Hub route set and marked the current page without a self-link.
- Removed the Social Hub descriptive subtitle below the tagline in both presentations and both languages, so the identity block ends at `Ad Astra, to beyond.`; the page description is retained in metadata for search and AI discovery.
- Added the existing analytics tag to the six reachable pages that lacked it, including the newly published Social Hub; `noindex, nofollow` prototype and container pages are deliberately left untracked until they are approved for publication.
- Removed duplicated `canonical`, `description`, and Open Graph tags from thirteen Time Attack pages, keeping the page-specific block; duplicate canonical links can cause search engines to disregard both.

## 2026-07-30

- Added the approved `StarRiver Social Hub` page plan under `docs/site/social-hub-page-plan-v0.1.md`.
- Defined Social Hub as a cross-platform intermediary page rather than a fourth content brand, while preserving Studio / ProjectT / Museum as the three primary entrances.
- Planned homepage support for the new page: a visible downward-scroll cue, partial exposure of the following section, a small recent-content layer, and a concise Connect summary linking to Social Hub.
- Recorded first-version scope, platform roles, information architecture, acceptance criteria, maintenance boundaries, and explicit non-goals. No public page or generated index was modified.

## 2026-07-27

- Rebuilt the ProjectT homepage from the approved copy baseline: updated SEO and Hero identity, established ProjectT Worlds / VRRCTW / Racing / VRChat Racing Toolkit as the four core systems, placed Articles as the knowledge layer, and restored mobile access to the primary navigation.
- Added a Discord submission entry to the Racing Club page without exposing internal command details.

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
