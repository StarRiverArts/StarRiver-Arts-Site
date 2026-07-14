# StarRiverSite Content SSOT

Date baseline: `2026-07-14`
Status: `v0.3 - confirmed implementation baseline`

This document records the current content-positioning source of truth for StarRiver Arts. It is meant to guide page review and later content edits. It does not replace page content, generated indexes, or the existing repo governance SSOT.

## Review Principle

Content should be reviewed by information role, not by forcing identical wording everywhere.

- `Name / title`: short and identifiable.
- `Subtitle / functional positioning`: explains what the section or page is for.
- `Body copy`: can carry fuller context and nuance.
- `SEO / OG / LLM summary`: concise searchable summaries derived from stable page content.
- `Navigation / buttons`: functional route labels, not full brand explanations.

Design-stage notes, implementation rationale, and IA explanations should not appear as visible public-page copy unless they are intentionally part of the visitor experience.

## Site Positioning

StarRiver Arts is centered on the idea:

> VR 數位體驗的地景創作者

Use this as the primary positioning direction for the public site.

Supported concepts:

- VR digital experiences
- landscape / terrain / place-based creation
- VRChat worlds and applications
- 臺灣 landscape and road-world translation
- digital curation and exhibition planning

Avoid using `digital twin` / `數位孿生` as a broad site-level claim. It is too wide unless a specific project has enough data accuracy, verification, and scope to support that wording.

## Terminology

For Chinese public-facing editorial copy, prefer `臺灣` over `台灣`.

Do not treat this as an automatic global replacement rule. Review usage by context:

- Editorial prose and new public copy should use `臺灣`.
- Existing titles, URLs, file paths, imported data, quoted text, or project names should be reviewed case by case.
- Generated indexes should inherit the wording from source pages after content is stabilized and regenerated.

## Primary Entrances

The site has three independent public entrances under the StarRiver Arts brand:

- `Studio`
- `ProjectT`
- `Museum`

This three-entrance relationship is useful as internal SSOT and IA guidance, but the homepage does not need to expose all of that reasoning as visible explanatory copy.

## Studio

Studio is a curated professional portfolio and capability view. Canonical project data belongs in the shared project area; Studio selects and presents that data rather than maintaining duplicate project records.

Current preferred capability axes:

- VR 應用設計
- 景觀地景建模
- 數位策展規劃

Studio copy should avoid over-broad claims such as site-wide `digital twin`. Prefer more accurate wording such as landscape modeling, landscape translation, terrain/place-based scene creation, VR application design, and digital curation planning.

Open question: the exact Studio page structure and how much creator biography versus capability framing it should carry is not finalized yet.

## ProjectT

Use `ProjectT` as the integrated public label for the project direction.

Homepage/card-level subtitle direction:

- `臺灣地景 VR 體驗`

This subtitle fits the current outward-facing story. ProjectT may later function as a broader content site, but the public umbrella should remain grounded in 臺灣地景創作 rather than exposing internal IA too early.

ProjectT contains or is expected to contain both Racing Club and article content. Its deeper purpose is to promote 臺灣 local culture, but the outward-facing narrative should frame this through 臺灣 landscape creation, VR worlds, and place-based experiences.

Planned first-level ProjectT structure:

- articles
- 臺灣 world introductions
- Racing Club

Planned Racing Club substructure:

- Time Attack / timing records
- world introductions
- racing articles
- events
- maps

ProjectT articles are expected to lean toward VRChat columns and 臺灣 community introductions. 臺灣 world introductions are also expected to become their own content layer.

Current folder and URL names may not fully match this future IA. Renaming folders is deferred because it affects URLs, indexes, sitemap output, internal links, and GitHub Pages history.

Use an existing completed ProjectT world as the first public hero image. `StarSight` is the confirmed initial choice. Studio and ProjectT may link to the same canonical project page from different curated views.

## Museum

Museum is a plan intended for a fuller launch next year. It should be presented as a developing online museum / digital curation project, not as a fully mature long-running museum unless the context specifically supports that claim.

Current Museum-facing material should be packaged as `季前展`: an off-season and preview positioning at the same time. The season-preview container remains under the Museum homepage and may temporarily function as the Museum homepage experience until the fuller Museum launches.

Current public material includes two pages that can function as web-based digital exhibits. Their current positioning should be:

- part of digital curation practice
- `季前展` / pre-season preview material
- precursor material for a future permanent exhibition
- early web exhibit / interactive exhibit material

Museum copy should avoid letting tools, modules, or design-system implementation language define the Museum identity. Those details belong under exhibition, research, or second-layer content.

More writing, information architecture, and exhibition content are expected later, but the concrete content is not finalized.


## Confirmed Implementation Decisions

The following decisions were confirmed on `2026-07-14`:

- Homepage H1: `StarRiver Arts`; use `VR 數位體驗的地景創作者` as supporting positioning.
- ProjectT initial hero: `StarSight`.
- Canonical project records live in the shared project area. Studio is a curated view over those records.
- Incomplete editorial/project detail pages with visible placeholders should be withheld from public navigation and indexing. This rule does not apply wholesale to Time Attack, which is a stable operating database and may contain incomplete individual data fields.
- Museum `季前展` remains under the Museum homepage and may temporarily serve as its primary public experience.
- Confirmed project facts:
  - `9 Turns / 九彎十八拐`: 臺 9 線石牌至頭城段.
  - `Beyond Gravity`: released in April 2026; VRChat project.
- Project year fields use release year. In-progress work may use a clearly marked range or status.
- Time Attack verification indicators and verification-facing copy should remain hidden until a real verification workflow is operating.
- Racing Club remains public because it is the next planned implementation area; do not remove it as abandoned scaffolding.
- Spatial tools require a future responsive rebuild. Temporary content work should not imply that mobile support is complete.
- Content-only work must preserve existing page URLs and external data contracts, including Time Attack data paths, IDs, query parameters, JSON fields, and the cross-project generation pipeline.
- Public language scope is Traditional Chinese and English for now. Do not claim complete Japanese coverage or expose Japanese controls until Japanese content is intentionally restored.

## Generated Indexes

Generated files are important later for search and AI accessibility, but they should not be manually edited during content SSOT review.

Generated outputs include:

- `site-index.json`
- `search-index.json`
- `llm-index.json`
- `sitemap.xml`
- `llms.txt`

After human-facing page content stabilizes, these should be regenerated from source content rather than rewritten directly.

## Review Labels

Use these labels during page review:

- `keep`: aligns with this SSOT and can be retained or reused.
- `rewrite`: concept is useful, but wording, placement, or claim strength should change.
- `remove/defer`: claim is too broad, belongs to design notes, or depends on future IA/content that is not finalized.
