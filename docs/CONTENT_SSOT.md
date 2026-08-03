# StarRiverSite Content SSOT

Date baseline: `2026-07-27`
Status: `v0.5 - confirmed implementation and editorial baseline`

This document records the current content-positioning source of truth for StarRiver Arts. It guides page review, information architecture, editorial work, and later public-page changes. It does not replace page content, generated indexes, or the repository governance SSOT.

## Authority Order

When content sources disagree, use this order:

1. Latest explicit owner decision.
2. This `docs/CONTENT_SSOT.md`.
3. Area-specific approved architecture or editorial documents.
4. Verified operational data and canonical project records.
5. Existing public-page copy.
6. Prototype pages, placeholders, generated copy, design notes, and AI-produced drafts.

An existing page is not automatically authoritative. A visually complete page may still contain placeholder copy, stale IA, speculative categories, or AI-generated wording that has never been approved.

## Review Principle

Content should be reviewed by information role, not by forcing identical wording everywhere.

- `Name / title`: short and identifiable.
- `Subtitle / functional positioning`: explains what the section or page is for.
- `Body copy`: can carry fuller context and nuance.
- `SEO / OG / LLM summary`: concise searchable summaries derived from stable, approved page content.
- `Navigation / buttons`: functional route labels, not full brand explanations.

Design-stage notes, implementation rationale, IA explanations, placeholders, and model-generated filler should not appear as visible public-page copy unless intentionally part of the visitor experience and explicitly approved.

## AI Placeholder and Semantic Contamination Policy

Several existing hidden or prototype pages contain AI-generated placeholders, simulated article copy, speculative categories, and abstract positioning language. These may have been useful for layout testing, but they are not confirmed facts and must not be treated as editorial source material.

Risks include:

- search and generated indexes presenting placeholders as real content;
- later Agents inferring project purpose from speculative prototype language;
- LLM-facing indexes repeating unclear or false positioning;
- placeholder classifications becoming accidental product requirements;
- public perception being shaped by wording the owner never approved.

Rules:

- AI-generated placeholder copy is non-authoritative by default.
- Page existence does not confirm its wording, IA, category system, claims, or publication readiness.
- `noindex` reduces public search exposure but does not prevent repository search, internal indexing, or Agent/LLM reuse.
- Unconfirmed pages must not be added to sitemap, search indexes, LLM indexes, primary navigation, or public recommendations.
- Placeholder text should use unmistakable labels such as `PLACEHOLDER — NOT PUBLIC COPY`, not realistic-looking fake editorial content.
- Agents must compare page content against this SSOT and relevant area-specific documents before reusing it.
- If a page conflicts with this SSOT or a newer owner decision, the page must be treated as stale.

### Public-release content gate

Before a hidden prototype page may be indexed or promoted publicly, confirm all of the following:

1. Positioning and categories are owner-approved.
2. AI placeholders and simulated content are removed.
3. Published text describes real projects, data, events, works, or viewpoints.
4. Ownership, authorship, world, route, exhibition, and exhibit relationships are clear.
5. Links, language coverage, and visual theme have been reviewed.
6. Search, sitemap, and LLM-facing indexes are regenerated from clean source pages.

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

Avoid using `digital twin` / `數位孿生` as a broad site-level claim unless a specific project has enough data accuracy, verification, and scope to support it.

## Terminology and Public Languages

For Chinese public-facing editorial copy, prefer `臺灣` over `台灣`.

Do not treat this as an automatic global replacement rule:

- Editorial prose and new public copy should use `臺灣`.
- Existing titles, URLs, file paths, imported data, quoted text, or project names should be reviewed case by case.
- Generated indexes should inherit wording from stabilized source pages.

Public site language scope is Traditional Chinese and English for now.

- User-facing language label: `繁體中文` / `Traditional Chinese`.
- HTML may use `zh-Hant-TW` or the existing `zh-TW`.
- Internal short code may remain `zh`.
- Do not claim complete Japanese coverage or expose Japanese controls until Japanese content is intentionally restored.

The site's public-language setting must not be confused with VRRCTW membership scope. VRRCTW includes users of both Traditional and Simplified Chinese. Traditional Chinese is the primary official written standard for site copy, rules, announcements, and public documents; it is not an eligibility restriction.

## Primary Entrances

The site has three independent public entrances under the StarRiver Arts brand:

- `Studio`
- `ProjectT`
- `Museum`

They may share data, components, language handling, and infrastructure, but they have different visitor goals, content models, and visual themes. Do not force them into one universal page structure.

## Studio

Studio is a curated professional gallery, portfolio, and capability view.

Canonical project data may belong in a shared project area, while Studio selects and presents that data rather than maintaining duplicate project records.

Studio is not an Article system. Its content should remain:

- selective;
- short;
- visually led;
- limited to necessary information;
- not dependent on related-reading networks.

Preferred content models:

- Projects / Works
- Case Studies when a project requires more explanation
- Capabilities
- Creator / professional identity
- Contact

Current preferred capability axes:

- VR 應用設計
- 景觀地景建模
- 數位策展規劃

Studio copy should avoid over-broad claims such as site-wide `digital twin`. Prefer accurate wording such as landscape modeling, landscape translation, terrain/place-based scene creation, VR application design, and digital curation planning.

The current shared `projects/*.html` pages primarily use Studio portfolio presentation. They must not automatically be treated as complete ProjectT World Pages merely because ProjectT links to them.

Open question: the exact Studio page structure and how much creator biography versus capability framing it should carry is not finalized yet.

## ProjectT

### Positioning

ProjectT is a VRChat racing community project that starts from 臺灣.

It connects:

- ProjectT Worlds
- VRRCTW
- Racing
- VRChat Racing Toolkit
- ProjectT Articles as the content and knowledge layer

ProjectT is not only a landscape-world collection, Racing Club page, or Time Attack leaderboard. Public copy should explain the integrated ecosystem without overstating unfinished components.

Preferred public definition:

> ProjectT 是一項以臺灣為出發點的 VRChat 賽車社群計畫，連結 ProjectT Worlds、VRRCTW、Racing 與 VRChat Racing Toolkit，建立可持續運作的世界、活動、資料與工具生態。

Approved ProjectT homepage copy is maintained in:

- `docs/project-t/project-t-homepage-copy-v0.1.md`

### Brand name and Hero identity

Approved ProjectT Hero naming:

```text
ProjectT
Taiwan Touge Project
臺灣山道計畫
```

`Taiwan Touge Project` and `臺灣山道計畫` are brand subtitles linked to touge and the mountain-road driving culture associated with works such as Initial D. They do not restrict ProjectT content to mountain-road worlds only.

The older subtitle `臺灣地景 VR 體驗` may still be used as a limited visual or card-level phrase, but it is not sufficient as the full ProjectT definition.

The layered color-block mountain scene (`.hero-ranges`) is a persistent ProjectT brand element. It must remain visible as the ProjectT hero background and must not be covered or replaced by a bitmap, project screenshot, or photographic banner.

`StarSight` is the confirmed first featured world and first project image. Use its image in the featured-world content layer or card, not as a replacement for the ProjectT color-block hero.

### ProjectT first-level structure

- Overview
- ProjectT Worlds
- VRRCTW
- Racing
- VRChat Racing Toolkit
- Articles

Time Attack belongs under Racing, even if its existing physical path remains under `/play/RacingClub/TimeAttack/` for compatibility.

### ProjectT Worlds

ProjectT Worlds are VRChat worlds created by StarRiver and formally included in ProjectT.

They are not equivalent to every world stored in Racing.

- `ProjectT Worlds`: owned/created by StarRiver and included in ProjectT.
- `Racing Worlds`: database records that may include external creators' worlds, community-used worlds, historic worlds, and worlds with Time Attack or event data.

External worlds do not become ProjectT Worlds merely because ProjectT publishes an article about them or VRRCTW has used them.

ProjectT does not require an independent Track Page. Route and track information belongs inside the relevant World Page. Articles should clearly identify which route, direction, or configuration they discuss.

A ProjectT World Page may contain:

- world identity and creator;
- current status and platform support;
- route list and route descriptions;
- Time Attack / Racing entry points;
- community and event relationship;
- related ProjectT Articles.

### VRRCTW

VRRCTW is ProjectT's Chinese-language VRChat racing community and activity layer.

Approved Chinese positioning:

> 中文圈主要的 VRChat 賽車社群

Preferred English descriptor:

> A leading Chinese-language VRChat racing community

VRRCTW connects players, world creators, vehicle creators, and event organizers, and continues to hold driving meetups, Time Attack challenges, and races.

Language and membership rules:

- The community includes both Traditional and Simplified Chinese users.
- Traditional Chinese is the primary official written standard for rules, announcements, site content, and public documents.
- Do not present `Traditional Chinese VRChat Racing Community` as a membership-boundary name.
- Do not treat script, nationality, or place of origin as an automatic participation restriction.

### Racing

Racing is ProjectT's structured racing information and data system.

It may organize:

- worlds and routes within worlds;
- players;
- vehicles;
- teams;
- events and races;
- Time Attack records;
- future submissions, verification, profiles, and statistics.

Time Attack is an active Racing module. Do not present it as a peer of Racing or as the full definition of VRRCTW.

### VRChat Racing Toolkit

VRChat Racing Toolkit is the planned and partially implemented competition toolset intended to assist event setup, result collection, data processing, verification, and connection to Racing.

Do not use a fixed completion percentage in public copy. Approved status direction:

> 協助活動組織者設定賽事、整理結果並串接 Racing 的工具組。計時榜資料串接等部分核心流程已投入內部使用，完整的公開操作介面、發布板與資料整合仍在開發中。

### ProjectT Articles

ProjectT Articles are a comprehensive content and knowledge layer, not only a development blog.

Approved top-level content directions:

- `Guides`: world use, route learning, driving rhythm, common mistakes, participation, and submission instructions.
- `Reviews & Community`: player viewpoints, world/community relationships, shared history, and version or vehicle experience.
- `Events`: event introduction, race record, rules, results, and post-event commentary.
- `ProjectT Development`: world development, route research, Racing, Toolkit, governance, technical experiments, and version updates.

Development records are optional. Do not imply every development action must become a public post.

Player reviews and subjective commentary must identify the author, viewpoint source, and publication date. They must not be presented as neutral ProjectT fact without attribution.

ProjectT Articles may cover external worlds. This does not imply ownership or ProjectT World status.

Article metadata should support:

- world relationship;
- route or direction within that world;
- article type;
- author / viewpoint source;
- date;
- Racing / Time Attack / event links when applicable.

## Museum

Museum is a developing online museum and digital-curation project, not a fully mature long-running institution unless a specific context supports that claim.

Current Museum-facing material should be packaged as `季前展`: an off-season and preview positioning at the same time. The season-preview container remains under the Museum homepage and may temporarily function as the Museum homepage experience until the fuller Museum launches.

Current public material includes pages that can function as web-based digital exhibits. Their positioning may include:

- digital curation practice;
- `季前展` / pre-season preview material;
- precursor material for a future permanent exhibition;
- early web exhibit / interactive exhibit material;
- world-building and site-construction research.

Museum copy should avoid letting tools, modules, or design-system implementation language define the Museum identity. Those details belong under exhibition, research, or second-layer content.

### Museum content model

Museum primarily uses:

- Exhibitions
- Gallery / exhibit listings
- Columns / Essays

A Gallery Page may carry the necessary exhibit basics:

- title;
- artist/creator;
- year and medium when useful;
- image or preview;
- short description;
- exhibition or section;
- related essay links.

Not every exhibit needs an independent detail page or essay.

### Museum Essays and Columns

Approved content directions:

- `Exhibit Essays`: interpretation, curatorial context, interviews, and viewing guidance.
- `Current Commentary`: VRChat platform events, digital art, virtual exhibitions, AI creation/display, policy, and governance.
- `VRC Community & Culture`: creator ecosystems, exhibitions, world-author communities, viewing culture, and social use of virtual space.

An Essay may correspond to:

- one exhibit;
- multiple exhibits;
- a group of works;
- one exhibition section;
- an entire exhibition theme;
- no individual exhibit when the article is commentary or cultural analysis.

Therefore, Essay-to-Exhibit is a many-to-many relationship. Do not force every Museum article into the current single-work template.

The existing `museum/article.html` is suitable as a prototype for a single-work or exhibit-focused essay, but it is not the universal Museum article template.

More writing, information architecture, and exhibition content are expected later, but concrete content must be owner-confirmed before publication.

## Shared and Separate Article Infrastructure

Current direction:

- Studio does not need an Article system.
- ProjectT and Museum may share base article fields, author/date handling, language infrastructure, search, and reusable components.
- ProjectT and Museum retain distinct categories, navigation shells, visual themes, and page-opening structures.
- Museum Essays must support multiple exhibit and exhibition relationships.
- ProjectT Articles must support world and route-within-world relationships.

The final decision on shared data storage, URL structure, editor workflow, and templates remains open.

## Confirmed Implementation Decisions

The following decisions remain active unless superseded by a newer owner decision:

- Homepage H1: `StarRiver Arts`; use `VR 數位體驗的地景創作者` as supporting positioning.
- ProjectT hero identity: preserve the layered color-block mountain scene; `StarSight` is the initial featured-world image below the hero.
- ProjectT Hero naming may use `ProjectT / Taiwan Touge Project / 臺灣山道計畫`.
- Canonical project records may live in a shared project area. Studio is a curated portfolio view over those records.
- Incomplete editorial/project detail pages with visible placeholders must be withheld from public navigation and indexing.
- This rule does not apply wholesale to Time Attack, which is a stable operating database and may contain incomplete individual data fields.
- Museum `季前展` remains under the Museum homepage and may temporarily serve as its primary public experience.
- Confirmed project facts:
  - `9 Turns / 九彎十八拐`: 臺 9 線石牌至頭城段.
  - `Beyond Gravity`: released in April 2026; VRChat project.
- Project year fields use release year. In-progress work may use a clearly marked range or status.
- Time Attack verification indicators and verification-facing copy should remain hidden until a real verification workflow is operating.
- VRRCTW / Racing Club remains public because it is an active or planned implementation area; do not remove it as abandoned scaffolding.
- Spatial tools require a future responsive rebuild. Temporary content work should not imply that mobile support is complete.
- Content-only work must preserve existing page URLs and external data contracts, including Time Attack data paths, IDs, query parameters, JSON fields, and the cross-project generation pipeline.
- The Beyond Gravity VRChat CTA is temporarily hidden because its stored world ID duplicated the StarSight world ID. Restore it only after the correct Beyond Gravity world ID is verified.
- Museum Articles and ProjectT Worlds / Articles remain `noindex` prototype or CMS containers until real content and IA are approved.
- Time Attack implementation labels and data-facing presentation remain unchanged unless a separate contract review approves cleanup.
- Generated search and AI indexes must exclude hidden Japanese copy while retaining both `臺灣` and legacy `台灣` as equivalent discovery terms.

## Social Hub

`social.html` is the approved public cross-platform intermediary for StarRiver Arts. It is not a fourth content brand and does not replace the primary Studio, ProjectT, or Museum entrances.

Approved public identity and behavior:

- Page identity: `StarRiver Arts`.
- Tagline: `Ad Astra, to beyond.`
- The identity block ends at the tagline. No descriptive subtitle line follows it in either presentation or either language; the page description remains in page metadata only.
- Canonical route: `/social.html`.
- A parameter-free visit randomly selects one complete presentation: `cybergum` or `blueprint`. The selection changes presentation-specific labels and interface language together with the visual system; it is not a color-only skin.
- `?theme=cybergum` and `?theme=blueprint` provide stable preview/share URLs for the two approved presentations. Both use the same link destinations and authoritative content.
- Social platform links, site-area links, and community links remain static and usable when optional featured data is absent.
- Decorative Blueprint telemetry is fictional StarRiver Space System interface copy; physical quantities and aerospace terminology should remain internally coherent and must not be presented as real flight data.

## Production Attribution

Public pages should disclose the role of AI assistance in site production while keeping StarRiver Arts clearly identified as the planning and production lead. The tools must not be assigned project authorship, exhibit authorship, creative ownership, or independent decision-making authority.

Preferred footer wording:

- zh-Hant: `網站由 StarRiver Arts 主導規劃與製作，並使用 OpenAI GPT 與 Anthropic Claude 協助資訊架構與網頁開發。`
- en: `Planned and produced by StarRiver Arts, with OpenAI GPT and Anthropic Claude used to assist information architecture and web development.`

Use this as a production-assistance disclosure at the page footer or equivalent low-interruption location. Do not label it as a license, do not present it as a project creator or artwork credit, and do not repeat it as a design-stage annotation.

## Generated Indexes

Generated files are important for search and AI accessibility, but they must not be manually edited during content review.

Generated outputs include:

- `site-index.json`
- `search-index.json`
- `llm-index.json`
- `sitemap.xml`
- `llms.txt`

After human-facing source content stabilizes and contaminated placeholder copy is removed, regenerate these files from approved sources.

Do not regenerate public or LLM-facing indexes from prototype pages merely because the build tools can parse them.

## Review Labels

Use these labels during page review:

- `keep`: aligns with this SSOT and can be retained or reused.
- `rewrite`: concept is useful, but wording, placement, category, or claim strength should change.
- `remove/defer`: claim is too broad, is placeholder content, belongs to design notes, or depends on future IA/content that is not finalized.
- `contaminated-placeholder`: realistic-looking generated copy that must not be reused or indexed as real content.
