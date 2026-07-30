# Public discovery audit — 2026-07-30

Target: `https://starriverarts.github.io/StarRiver-Arts-Site/`  
Scope: all 27 canonical URLs currently listed in `sitemap.xml`.

## Baseline (deployed main)

- HTTP 200: 27/27
- Clean against the audit rules: 1/27
- Pages with at least one issue: 26/27
- Missing JSON-LD: 26
- Missing `og:image`: 25
- Missing `og:title` / `og:description`: 24 each
- Missing meta description: 17
- Missing or non-unique canonical declaration: 17
- Missing document language / H1: 2 each
- Public loader placeholder text: 2

## PR branch result

A static readback of every HTML file on `agent/optimize-discovery-indexes` now passes all current rules:

- Pages checked: 27
- Clean: 27/27
- Remaining findings: 0
- Canonical URLs: exactly one per page and unique across the set
- Required Open Graph fields: present on every page
- JSON-LD: present on every page
- Document language and H1: present on every page
- `Unpacking...` crawler placeholder: absent

The two self-contained interactive bundles exceeded the GitHub Contents API inline-content limit, so they were read by blob SHA and updated without unpacking, replacing, or deleting their embedded assets.

## Implemented corrections

1. Added page-specific descriptions and canonical URLs.
2. Added `og:title`, `og:description`, `og:type`, `og:url`, and an absolute `og:image`.
3. Added `WebPage` JSON-LD connected to the StarRiver Arts `WebSite`.
4. Added static language, H1, and meaningful loader fallback text to the two bundled interactive tools.
5. Preserved all public routes and application behavior.

## Verification boundary

This branch result is a source-level verification. After merge and GitHub Pages deployment, run:

```bash
python tools/audit_public_discovery.py
```

The deployed-site audit must also report 27/27 clean before the correction is considered production-verified. Passing these checks improves machine readability but does not guarantee search ranking, indexing, AI citation, or crawler adoption.
