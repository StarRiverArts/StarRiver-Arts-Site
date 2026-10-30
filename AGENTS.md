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
python tools/build_site_index.py
python tools/build_agent_index.py
```

Before committing, run:

```bash
python tools/build_site_index.py
python tools/build_agent_index.py --check
git diff --check
```

Generated indexes must be regenerated, not manually edited. If a public page is a prototype, placeholder, private draft, or `noindex`, confirm its exclusion against `docs/CONTENT_SSOT.md`.

## Local browser QA and repository hygiene (mandatory)

- Browser user-data directories, temporary Edge/Chrome/Chromium profiles, cookies, login databases, session state, and browser-generated QA reports are **local ephemeral output**, never repository content. Write them to OS temporary storage **outside this Git checkout**. Never launch QA with a user’s everyday browser profile.
- `content-review-artifacts/`, `local-review/`, `playwright-report/`, and `test-results/` are ignored. Local rendered review snapshots (`local-review/`) must stay outside the Git checkout. Save any audit evidence that needs retaining in a separate local/private artifact store; do not force-add those directories to Git.
- Before committing or pushing, inspect staged paths with `git diff --cached --name-only` and run `python tools/check_repo_artifacts.py`. Avoid blanket `git add -A` when test runs have created local files.
- Ignore rules do **not** untrack previously committed content. If a prohibited artifact appears in Git history, stop publishing, remove it from the current tree, evaluate credential/session rotation, and use a separately reviewed history-redaction process if necessary.
- The CI guard checks tracked *paths*, not secret values; it must not read browser login databases or treat successful scanning as proof that no secret exposure occurred.

