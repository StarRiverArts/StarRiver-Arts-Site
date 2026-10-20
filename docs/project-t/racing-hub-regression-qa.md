# Racing Hub regression QA

The existing Racing Hub is a static public data/application site at
`play/RacingClub/TimeAttack/`. This document describes **testing** of the
existing site; it does not authorize editing the upstream timing database or
changing external JSON consumers.

## Automated tests

- Data integrity (read-only): `python tools/racing_data_audit.py`
- Browser smoke: `python tools/racing_visual_qa.py --profile smoke`
- Browser full: `python tools/racing_visual_qa.py --profile full`
- CI: `.github/workflows/racing-regression-qa.yml` runs on relevant PRs,
  and supports a manual full-profile run.

For browser checks, install Playwright and Chromium, and serve the repository
root with `python -m http.server 4173 --bind 127.0.0.1`.
The output under `racing-qa-artifacts/` is **disposable test evidence**:
JSON reports and screenshots. Do not publish user data or check these files
into the site.

## Covered invariants

- World and route identities: `track_world_code` and the world-local
  `route_code`, without merging different VRChat world implementations.
- Public map / recorded leaderboard / VRC consumer directory scopes remain
  distinct and are compared explicitly.
- Record counts, unique IDs, route ordering, public profile links, invalid
  IDs, selected route isolation, and data loading.
- Overview, Tracks, Map, Racers, Vehicles, Teams, Events, Index and Info,
  plus representative entity details at multiple display sizes.
- Historical event vehicle-variant references link only to known vehicle
  models; unknown references must not generate guessed links.

## Warnings are not evidence of absence

An unclassified timing capability is **unknown**, not confirmed untimed.
Missing public VRChat links may reflect publication choices. A historical
event participant without timed runs does not necessarily lack a VRChat
identity. A passed event date is not proof of a completed event; editorial
completion and results are different facts. Publication status must come from
the event's authorized editorial source.

The current canonical database and generator live outside the public website
repository. Fix stale generated-data descriptions in that original producer,
not by hand-editing generated leaderboard JSON. The UI may use a safe
manifest-based description until the source generator is corrected.

## Release review

CI success does not replace a reviewer checking map behavior, typography,
readability, small-screen tables, and changed interface meaning. Preserve
existing data URLs, VRChat consumer contracts and route query parameters.
See `docs/site/responsive-visual-qa.md` for the shared viewport matrix.

## Track detail source and navigation (2026-10-20)

- The Racing Hub browser renders its Track detail and leaderboard routes solely from the website `data/tracks.json` projection; do not append Toolkit `vrc/*.json` or `vrc/toolkit/**` world/route contracts to HTML.
- `track.html?id=<track_world_code>` is the same world detail, showing all generated route boards expanded.
- `track.html?id=<track_world_code>&route=<route_code>` is a route-focused view of the same page, with an explicit link to all routes.
- An unknown route code must show a not-found message; it must not silently display all routes.
- Missing tracks or route definitions belong in the upstream canonical website exporter, not a client-side Toolkit-to-web supplemental adapter.
- The separate Project T creative world pages remain a distinct editorial view, not a duplicate Racing Hub leaderboard.
- QA includes a multi-route world overview, a single selected route, and an invalid route. Do not change Toolkit data contracts in a website-detail repair.
