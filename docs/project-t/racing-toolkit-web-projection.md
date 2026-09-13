# Racing Toolkit Web → VRChat Public Projection

Status: **ACTIVE PIPELINE / RUNTIME PERIODIC REFRESH TODO**

This pipeline owns the website-side data consumed by Project T's VRChat Racing Toolkit installations. It deliberately does **not** own the canonical SQLite database or the canon → web exporter.

## Boundary

```text
canonical / local tools
        ↓  existing local pipeline; out of scope here
website public racing data
        ↓
tools/build_racing_toolkit_public.py
        ↓
play/RacingClub/TimeAttack/vrc/toolkit/**
        ↓
GitHub Pages
        ↓
VRChat Toolkit consumers
```

The VRChat package does not need to be re-uploaded when these JSON files change. Runtime periodic polling inside an already-running VRChat instance is **not implemented yet** and remains a Toolkit TODO.

## Sources

The build combines three classes of website-side input:

1. `content/racing-toolkit/owned-worlds.json`
   - Explicit allowlist/editorial overlay for StarRiver Arts / Project T owned worlds.
   - World name, public status, description, access state, location, and route identities live here.
   - Adding a new owned world requires one registry entry; later leaderboard/event/news changes are picked up automatically.
2. `content/racing-toolkit/information.json`
   - Manual announcements plus resolver policy (`priority`, lifetime windows, output limits).
3. Existing public website outputs
   - `play/RacingClub/TimeAttack/vrc/<world_id>.json`: canonical SR `srvrc-track/1` leaderboard projection and current TR.
   - `play/RacingClub/TimeAttack/data/event-editorial.json`: organizer-maintained event copy/results.

No canonical database file, submission note, review note, proof URL, moderation field, or other operator-only source is required by this build.

## Generated outputs

For every registered owned world `<world_id>`:

```text
vrc/toolkit/worlds/<world_id>.json
vrc/toolkit/news/<world_id>.json
vrc/toolkit/routes/<world_id>__<route_id>.json
```

Shared outputs:

```text
vrc/toolkit/news/global.json
vrc/toolkit/events/<event_id>.json
vrc/toolkit/events/latest.json
vrc/toolkit/events/current.json
vrc/toolkit/worlds.json
vrc/toolkit/manifest.json
vrc/toolkit/index.json
```

`manifest.json` is the machine-readable endpoint inventory for all registered Project T worlds. Existing `WorldBindingProfile` fields still use fixed `VRCUrl` values; the manifest is intended for editor/setup automation and future consumers, not runtime URL concatenation.

## Information resolver

The builder resolves manual information, current/recent event notices, and recent track records into compact News contract files. The default policy is stored in `content/racing-toolkit/information.json`.

The public feed is a **current information projection**, not an archive. Expired items are removed automatically; items are ordered by priority and time and capped before publication.

Current priority defaults:

| Information | Priority |
| --- | ---: |
| Ongoing event | 90 |
| Upcoming event within window | 80 |
| Manual/world announcement | source-defined |
| Completed event result | 55 |
| Recent track record | 50 |

## Privacy gate

Generation is allowlist-oriented. `tools/validate_racing_toolkit_public.py` rejects known operator/private keys including `submission_note`, `proof_text`, verification/review metadata, moderation notes, image hashes, and access tokens anywhere under generated Toolkit JSON.

This is intentionally separate from the full Racing Hub website projection so internal provenance cannot leak into VRChat feeds merely because a source table gained a new column.

## GitHub Actions

`.github/workflows/refresh-racing-toolkit-data.yml` rebuilds when:

- the owned-world registry or manual information changes;
- root `vrc/*.json` leaderboard outputs change;
- `event-editorial.json` changes;
- the builder/validator/workflow changes;
- the scheduled lifecycle check runs twice per hour;
- a maintainer runs `workflow_dispatch` manually.

Generated bot commits only touch `play/RacingClub/TimeAttack/vrc/toolkit/**`. Because that directory is not an input trigger, the bot commit does not recursively trigger the same workflow.

## Runtime refresh TODO

The current Toolkit `RemoteDataClient` fetches at startup or on manual `Refresh()`. Periodic runtime polling is deliberately deferred. When implemented, it should preserve the fixed endpoint model and add per-contract refresh intervals/backoff without changing these public URLs.
