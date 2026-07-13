# StarRiverSite Content SSOT

Date baseline: `2026-07-13`
Status: `v0.1 - working content baseline`

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
- Taiwan landscape and road-world translation
- digital curation and exhibition planning

Avoid using `digital twin` / `數位孿生` as a broad site-level claim. It is too wide unless a specific project has enough data accuracy, verification, and scope to support that wording.

## Primary Entrances

The site has three independent public entrances under the StarRiver Arts brand:

- `Studio`
- `ProjectT`
- `Museum`

This three-entrance relationship is useful as internal SSOT and IA guidance, but the homepage does not need to expose all of that reasoning as visible explanatory copy.

## Studio

Studio is the professional portfolio and capability entrance.

Current preferred capability axes:

- VR 應用設計
- 景觀地景建模
- 數位策展規劃

Studio copy should avoid over-broad claims such as site-wide `digital twin`. Prefer more accurate wording such as landscape modeling, landscape translation, terrain/place-based scene creation, VR application design, and digital curation planning.

Open question: the exact Studio page structure and how much creator biography versus capability framing it should carry is not finalized yet.

## ProjectT

Use `ProjectT` as the integrated public label for the project direction.

Planned first-level ProjectT structure:

- articles
- Taiwan world introductions
- Racing Club

Planned Racing Club substructure:

- Time Attack / timing records
- world introductions
- racing articles
- events
- maps

ProjectT articles are expected to lean toward VRChat columns and Taiwan community introductions. Taiwan world introductions are also expected to become their own content layer.

Current folder and URL names may not fully match this future IA. Renaming folders is deferred because it affects URLs, indexes, sitemap output, internal links, and GitHub Pages history.

## Museum

Museum is a plan intended for a fuller launch next year. It should be presented as a developing online museum / digital curation project, not as a fully mature long-running museum unless the context specifically supports that claim.

Current public material includes two pages that can function as web-based digital exhibits. Their current positioning should be:

- part of digital curation practice
- precursor material for a future permanent exhibition
- early web exhibit / interactive exhibit material

Museum copy should avoid letting tools, modules, or design-system implementation language define the Museum identity. Those details belong under exhibition, research, or second-layer content.

More writing, information architecture, and exhibition content are expected later, but the concrete content is not finalized.

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
