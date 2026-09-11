# Racing Hub Taxonomy

- Status: owner-approved terminology note
- Date: 2026-09-11
- Scope: Racing Hub public IA, browser titles, discovery labels, and canonical interpretation

## Site identity

- `Racing Hub 賽事中心` is the data/application site identity.
- `Time Attack` is a competition/records domain and a historical path name, not the whole site brand.
- Browser titles are site-first: `Racing Hub | Category | Name`.

## Track / World identity

Racing Hub intentionally does **not** create a separate abstract real-world `Track` entity above `track_worlds`.

A canonical `track_world_code` is simultaneously:

1. one specific VRChat World implementation, and
2. one independently indexed / counted Racing Hub Track.

Different authors or different VRChat World implementations of the same real-world or fictional course remain separate Tracks. They are not merged merely because they reference the same place, road, or course.

Public taxonomy therefore uses:

- `Tracks` for the primary index/category;
- `track_world` / `Track World` for technical or explanatory language when the VRChat container nature must be explicit;
- no separate top-level Racing Hub `Worlds` index is required at this stage.

Optional future grouping by place, cultural reference, aliases, or source course is discovery metadata only. It must not merge canonical Track counts or leaderboards.

## Track directory state

The public `Tracks` index is the common inventory for Racing Hub Track entities, but timing capability should be visually separated so free-driving worlds do not visually mix with Time Attack entries.

Use these states:

1. **Timed Track** — timing capability is confirmed. It belongs in the primary Time Attack section.
   - `record_count > 0`: recorded Track.
   - `record_count = 0`: keep the Track as an **Empty Card**; this means the Track supports timing but has no indexed submitted record yet.
2. **Driveable / No Timing** — the Track is explicitly confirmed not to use a timing system. Keep it in a separate lower section for free driving / exploration.
3. **Timing Unknown** — the current source does not contain enough evidence to classify timing capability. Keep this separate / low-weight until classified.

Important inference rule:

- `route_count = 0` **must not** be interpreted as `No Timing`.
- Missing records **must not** be interpreted as missing timing support.
- Existing registered routes are acceptable evidence that timing exists, but the long-term canonical model should use an explicit timing-capability field such as `timing_support` / equivalent.

This keeps the three concepts distinct:

`Driveable → Timed → Recorded`

where each step adds a capability / observed state rather than replacing the previous identity.

## Route identity

A `Route` is a drivable/timed course inside one Track World.

Routes may represent:

- opposite directions;
- clockwise / counter-clockwise layouts;
- full / short layouts;
- alternate branches;
- or substantially different courses contained in the same VRChat World scene.

The canonical route identity is world-local:

`(track_world_code, route_code)`

Records are compared within that Track World + Route scope. Same-named routes in different Track Worlds are not automatically comparable or merged.

## Vehicle terminology

Use `Vehicles`, not `Cars`, for the Racing Hub category.

Racing Hub vehicle data may include non-car or otherwise atypical drivable vehicle types, so `Cars` is too narrow for the domain.

Recommended browser-title forms:

- `Racing Hub | Tracks`
- `Racing Hub | Tracks | {track name}`
- `Racing Hub | Vehicles`
- `Racing Hub | Vehicles | {vehicle name}`
- `Racing Hub | Racers | {racer name}`
- `Racing Hub | Teams | {team name}`
- `Racing Hub | Events | {event name}`
- `Racing Hub | Map`

## ProjectT distinction

ProjectT may still use `Worlds` as its primary creative/curation concept.

The same VRChat world can therefore appear as:

- `ProjectT | Worlds | {name}` — creative / destination / project view;
- `Racing Hub | Tracks | {name}` — racing index / routes / records view.

This is a domain-view difference over a shared canonical identity, not duplicate ownership of the underlying fact.
