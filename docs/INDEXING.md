Exit code: 0
Wall time: 0.3 seconds
Output:
# Index architecture and maintenance

The project maintains three separate discovery planes from approved repository sources. They share deterministic builders but do not share the same disclosure boundary.

## 1. Repository Agent index

Audience: Codex, Claude Code, Copilot, reviewers, and other agents working from a local checkout or GitHub repository.

Files:

- `.agent-index/context.md`: smallest human-readable first context.
- `.agent-index/repo-map.json`: machine-readable modules, authority, commands, and source digest.
- `AGENTS.md`: durable rules and mandatory update commands.

The Agent index is designed to prevent a full-repository crawl. Read `context.md`, select one module, then open only its `read_first` file and relevant source paths.

## 2. Search-engine discovery

Audience: conventional web crawlers and the site's browser search.

Files:

- `sitemap.xml`
- `site-index.json`
- `search-index.json`
- page-level title, description, canonical URL, language, and indexing directives

Only public, canonical, owner-approved pages belong here. Hidden prototypes and realistic AI placeholder text must remain excluded.

## 3. External LLM discovery

Audience: external LLM crawlers, answer engines, AI search products, and tools that read the deployed website without repository access.

Files:

- `llms.txt`: compact public orientation and authoritative entry points.
- `llm-index.json`: structured public summaries, topics, pages, and data endpoints.
- `robots.txt`: discovery hints; it is not an access-control mechanism.

These files must expose public facts only. They must not include repository-only instructions, internal documents, unpublished plans, local paths, or private data. `llms.txt` is a discovery aid, not a guarantee that every crawler will consume it.

## Update contract

Run both builders after changes to:

- public HTML, titles, descriptions, canonical URLs, headings, or language metadata;
- public routes, navigation, structured JSON data, or approved data endpoints;
- SSOT, requirements, module boundaries, Agent commands, or authoritative documents;
- inclusion/exclusion policy for prototypes and unpublished pages.

Commands:

```bash
python tools/build_agent_index.py
python tools/build_site_index.py
```

Pull requests must fail when committed generated files are stale. Pushes to the default branch may rebuild and commit deterministic outputs automatically.

## Reuse in other projects

`tools/build_agent_index.py` is generic. Reuse it with a project-specific `agent-index.config.json`.

What can be automatic:

- tracked-file inventory and content digest;
- compact module and reading-order output;
- authoritative Markdown heading extraction;
- stale-index detection.

What requires project judgment:

- authoritative documents;
- module boundaries and `read_first` files;
- public versus private content;
- canonical URLs and data endpoints;
- pages excluded from search and external LLM discovery.

Therefore, a universal zero-configuration index is unsafe. The supported pattern is a universal deterministic builder plus a small reviewed configuration file.

