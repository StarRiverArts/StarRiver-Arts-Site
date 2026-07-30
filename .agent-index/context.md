# StarRiver Arts Site ??Agent Context

> Public static site for Studio, ProjectT, VR Racing Club Time Attack, and Museum.

Read only the module needed for the current task. Do not crawl the full repository first.

## Reading order

1. `.agent-index/context.md`
2. `docs/SSOT.md`
3. `docs/CONTENT_SSOT.md`
4. `docs/REQUIREMENTS.md`

## Modules

- **Site shell and Studio** ??`index.html, studio.html, projects/`: Brand entry, portfolio, and project pages.
  - Read first: `docs/CONTENT_SSOT.md`
- **ProjectT** ??`play/`: ProjectT worlds, community, racing, and articles.
  - Read first: `docs/project-t/`
- **Time Attack** ??`play/RacingClub/TimeAttack/`: Racing records, catalog pages, client UI, and generated data.
  - Read first: `play/RacingClub/TimeAttack/data/manifest.json`
- **Museum** ??`museum/`: Museum pages, web exhibitions, and interactive studies.
  - Read first: `docs/CONTENT_SSOT.md`
- **Discovery builders** ??`tools/`: Deterministic builders for Agent, search-engine, and external-LLM indexes.
  - Read first: `docs/INDEXING.md`

## Generated discovery files

- `.agent-index/context.md` ??Repository coding agents; low-token first read.
- `.agent-index/repo-map.json` ??Repository agents and deterministic tooling.
- `site-index.json, search-index.json, sitemap.xml` ??Search engines and public site search.
- `llms.txt, llm-index.json` ??External LLM crawlers and AI search systems.

## Update commands

- Rebuild: `python tools/build_site_index.py && python tools/build_agent_index.py`
- Check: `python tools/build_site_index.py && python tools/build_agent_index.py --check && git diff --exit-code`

Source digest: `ea1c349fbaa6f24acde98f4d630454163391ef79a6453a08aaf7d2a0907887e5`
