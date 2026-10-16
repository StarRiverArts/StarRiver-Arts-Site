# Responsive visual QA standard

Scope: public entry surfaces and independently published sub-sites. This is a repeatable review protocol, not proof that all platforms render identically.

## Display matrix (CSS pixels)

| Class | Width × height | Purpose |
| --- | --- | --- |
| Small phone | 320×568 | Minimum width, no side overflow |
| Phones | 360×800, 375×667, 390×844, 430×932 | Wrapping, short/tall screens |
| Small tablet / foldable | 600×800 | Intermediate breakpoint |
| Tablets | 768×1024, 820×1180, 1024×768 | Portrait / landscape |
| Laptop | 1280×800 | Limited height |
| Desktop | 1440×900, 1920×1080 | Standard layouts |
| HiDPI / wide | 2560×1440, 3440×1440 | Max width, readability |

**Smoke profile:** 320×568, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080. **Full profile:** all 14 sizes. Run both Traditional Chinese and English at 390×844 and 1440×900; all other cases use Traditional Chinese. Test both Social Hub themes with explicit `?theme=cybergum` and `?theme=blueprint`; never compare randomized theme screenshots. Add actual phone/tablet browser review before publishing significant visual changes.

## Reproducibility

Serve the repo over HTTP, never `file://`. Fix viewport, DPR=1, browser version, language, reduced motion, explicit theme, and animation/caret suppression. Wait for page load and fonts. Do not accept variable remote media as a stable pixel baseline. Save full-page screenshots plus JSON machine report as disposable CI artifacts. Baselines require owner approval; a screenshot by itself is evidence, not approval.

## Mechanical gate versus reviewer gate

**Automatic blocking failures:** local HTTP errors, script exceptions, broken visible images, horizontal overflow >2 CSS px, unexpected visible H1 count, missing three homepage entrances, missing Social Hub home return link, explicit theme ignored, language toggle does not set correct document language.

**Warnings pending calibration:** interactive elements smaller than 44×44 CSS px. Evaluate WCAG 2.2 target-size exceptions before turning into a blocker; never blindly fail small inline links. Also inspect low contrast, clipped text, overlap, giant blank regions, focus visibility, reading order, tap usability, and meaningful content above fold visually. Require human review for imagery, hierarchy, typography and genuine cross-device feel.

## Execute locally / CI

```bash
python -m pip install playwright
python -m playwright install chromium
python -m http.server 4173 --bind 127.0.0.1
# separate terminal:
python tools/visual_qa.py --base-url http://127.0.0.1:4173/ --profile smoke
python tools/visual_qa.py --base-url http://127.0.0.1:4173/ --profile full
```

Output directory: `visual-qa-artifacts/`. Never commit generated screenshots/reports or screenshots containing private content. CI smoke first; full profile on visual releases/manual workflow.

## Subsites & discovery relationship

New Museum exhibition microsites may have independent domains, CSS and page layouts. Their maintainers must test their own pages at this matrix; a Museum parent-site link does not imply the parent can enforce their styling. The canonical exhibition landing URL should be registered with correct public authorship and the Museum relation in the discovery manifest/index, including external domains when authorized and verified. Racing Hub belongs to ProjectT; it is directly linkable without appearing as a homepage peer. Social Hub is a cross-platform shortcut, separate from the three content entrances. The **index** here means crawler and AI discovery data (`sitemap.xml`, `site-index.json`, `search-index.json`, `llms.txt`, `llm-index.json`), NOT a visual directory block. Keep unapproved prototypes and private facts out of index generation.

## Release gate

QA artifacts, failing cases, reviewer initials/date, environment/browser version, exclusions with reasons, and regression result must be attached to the change review. Green smoke does not replace human assessment. No automatic deployment approval is implied.
