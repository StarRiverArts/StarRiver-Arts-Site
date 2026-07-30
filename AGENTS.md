Exit code: 0
Wall time: 0.3 seconds
Output:
# Repository guidance

Start with `.agent-index/context.md`. Read only the module and authoritative document needed for the current task; do not crawl the full repository by default.

## Authority

- `docs/SSOT.md`: implementation decisions.
- `docs/CONTENT_SSOT.md`: public content, positioning, publication gates, and indexing exclusions.
- `docs/REQUIREMENTS.md`: product requirements.
- A generated index never overrides these sources.

## Three index audiences

1. `.agent-index/` is internal repository navigation for coding agents. It may name source paths and development commands, but must not contain secrets or personal data.
2. `site-index.json`, `search-index.json`, and `sitemap.xml` are public search-discovery outputs.
3. `llms.txt` and `llm-index.json` are public entry points for external LLM crawlers and AI search. They must contain only approved public facts and URLs.

Do not expose internal plans, drafts, hidden prototypes, credentials, local paths, or unpublished data through public discovery files.

## Required update

After changing tracked source, documentation, public HTML, metadata, routes, or structured data, run:

```bash
python tools/build_agent_index.py
python tools/build_site_index.py
```

Before committing, run:

```bash
python tools/build_agent_index.py --check
python tools/build_site_index.py
git diff --check
```

Generated indexes must be regenerated, not manually edited. If a public page is a prototype, placeholder, private draft, or `noindex`, confirm its exclusion against `docs/CONTENT_SSOT.md`.

