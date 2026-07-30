# Public discovery audit ??2026-07-30

Target: `https://starriverarts.github.io/StarRiver-Arts-Site/`  
Scope: all 27 canonical URLs currently listed in `sitemap.xml`.

## Result

- HTTP 200: 27/27
- Clean against the current audit rules: 1/27
- Pages with at least one issue: 26/27

## Issue totals

| Count | Issue |
| ---: | --- |
| 26 | Missing JSON-LD |
| 25 | Missing `og:image` |
| 24 | Missing `og:title` |
| 24 | Missing `og:description` |
| 17 | Missing meta description |
| 17 | Missing or non-unique canonical declaration |
| 2 | Missing document language |
| 2 | Missing H1 |
| 2 | Public placeholder text |

## Page groups

### Clean

- `/`

### Museum and Studio pages missing Open Graph and JSON-LD

- `/museum/about.html`
- `/museum/contact.html`
- `/studio.html`
- `/projects/9turns.html`
- `/projects/beyond-gravity.html`
- `/projects/starsight-mt.html`

The Museum homepage has Open Graph title and description but still lacks `og:image` and JSON-LD.

### Time Attack pages

The Time Attack landing page has a meta description but lacks Open Graph and JSON-LD. Most other Time Attack URLs also lack a meta description and canonical declaration:

- `/play/RacingClub/TimeAttack/TrackMap/`
- `/play/RacingClub/TimeAttack/catalog.html`
- `/play/RacingClub/TimeAttack/event.html`
- `/play/RacingClub/TimeAttack/events.html`
- `/play/RacingClub/TimeAttack/info.html`
- `/play/RacingClub/TimeAttack/player.html`
- `/play/RacingClub/TimeAttack/players.html`
- `/play/RacingClub/TimeAttack/team.html`
- `/play/RacingClub/TimeAttack/teams.html`
- `/play/RacingClub/TimeAttack/track.html`
- `/play/RacingClub/TimeAttack/tracks.html`
- `/play/RacingClub/TimeAttack/vehicle.html`
- `/play/RacingClub/TimeAttack/vehicles.html`

### Interactive Museum pages

The following two pages expose loader placeholders as their crawlable page content and also lack language, H1, description, canonical, Open Graph, and JSON-LD:

- `/museum/interactive/design-system-visualize/falloff-predictor.html`
- `/museum/interactive/design-system-visualize/spatial-planner.html`

The crawler-visible placeholder is `Unpacking...`.

### Other interactive pages

These pages return HTTP 200 but lack description, canonical, Open Graph, and JSON-LD:

- `/museum/interactive/design-system-visualize/`
- `/museum/interactive/vr-gallery-spatial-system/`

## Recommended correction order

1. Remove crawler-visible placeholders and provide static fallback titles, descriptions, H1, and explanatory text for the two interactive tools.
2. Add canonical and unique descriptions to Time Attack pages.
3. Add page-specific Open Graph metadata, especially a stable absolute `og:image`.
4. Add JSON-LD by page type:
   - site entry: `WebSite` plus creator identity;
   - Studio project: `CreativeWork`;
   - Museum exhibition or tool: `ExhibitionEvent`, `CreativeWork`, or `SoftwareApplication` as appropriate;
   - Time Attack collection pages: `CollectionPage`;
   - profile/detail pages: `ProfilePage` or `WebPage` with the relevant entity.
5. Rebuild `sitemap.xml`, `site-index.json`, `search-index.json`, `llms.txt`, and `llm-index.json`.
6. Re-run `python tools/audit_public_discovery.py`; do not treat the work as complete until every intended public page either passes or has a documented exception.

## Interpretation

This audit checks discoverability and semantic completeness. Passing does not guarantee search ranking, AI citation, or crawler adoption. Page content quality, external links, authority, freshness, and user engagement remain separate factors.

