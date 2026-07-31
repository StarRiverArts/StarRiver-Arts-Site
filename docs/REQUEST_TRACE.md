# StarRiverSite Request Trace

Date baseline: `2026-07-04`

This file tracks repo-owned request promotion and local governance ownership for `StarRiverSite/`.

## Rules

- Repo-owned facts should be promoted here once they belong to `StarRiverSite/`.
- Root control-plane requests and chat logs may remain input evidence, but they do not replace repo-local trace once onboarding exists.
- This file can reference external evidence when the initiating request was not authored as a repo-local request file.

## Trace Table

| Local Trace ID | Source Evidence | Scope | Status | Notes |
| --- | --- | --- | --- | --- |
| `SRS-DOO-20260704-001` | current CodeTools chat request (Agent Control Plane P0 follow-up) | repo-local governance bootstrap | landed | Created the top-level docs skeleton to close the onboarding gap flagged by `check_ssot --all-onboarded`; no site content changed. |
| `SRS-SOCIAL-20260730-001` | owner-approved ChatGPT planning discussion | Social Hub page and homepage vertical-navigation planning | planned | Added `docs/site/social-hub-page-plan-v0.1.md` as the approved planning baseline. The plan preserves Studio / ProjectT / Museum as the three primary content entrances, defines Social Hub as a cross-platform intermediary page, and requires a homepage scroll cue plus partial exposure of the following section. No public page or generated index was changed. |

## Current Interpretation

- The repo is now locally onboarded for governance at the top-level `docs/` layer.
- The published site and generated indexes remain product artifacts, not substitutes for this repo-local trace.
- Future repo-local bounded runs should reference or extend this file instead of relying only on root trace.
- The planned `VR_RacingClubTW -> StarRiverSite` data sync pilot (`FRICTION-VRRCTW-001`) should land its contract evidence here when it becomes repo-local work.
- Social Hub implementation should follow `docs/site/social-hub-page-plan-v0.1.md`; public navigation and generated indexes should only change after the page is implemented and approved.
