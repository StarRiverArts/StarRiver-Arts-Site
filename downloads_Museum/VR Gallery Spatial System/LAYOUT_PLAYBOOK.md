# Layout & Typography Playbook

> For StarRiver Arts (mother) and 美術館 (shared chassis). Project T,
> Formosa, and Racing Club have their own playbooks — this file is the
> editorial ground they all deviate from.
>
> **Stance**: basic ground first, seasoning later. 留白彰顯視覺重點 (Anton &
> Irene direction). 不追求純白。資訊節制，版面有呼吸。

---

## A. The basic ground — commit to these first

These are non-negotiable. They're what makes a page feel "StarRiver" before
any advanced move kicks in. If the basic ground is sloppy the seasoning
just amplifies the mess.

### A.1 Ground colour

- Body surface is **`--sr-paper #F3EEE3`** (warm cream) — never pure white.
- Body ink is **`--sr-ink #14140E`** (warm near-black) — never pure black.
- Stacked surfaces go to `--sr-bone #EAE4D6`; inline wells (notes, code,
  quotes) go to the LIGHTER `--sr-chalk #F8F5EC`. Wells tint UP toward
  white, they do not darken toward grey. This keeps the page feeling
  like paper with marks on it, not a dashboard.

### A.2 Type scale — Editorial, not UI-generic

Only these sizes ship. No in-between values.

| token | px | role |
|---|---|---|
| `--fs-xs` | 12 | meta, mono, eyebrow |
| `--fs-sm` | 14 | fine print, captions |
| `--fs-md` | 16 | body |
| `--fs-lg` | 18 | lead / intro paragraph |
| `--fs-xl` | 22 | subhead |
| `--fs-2xl` | 28 | h3 |
| `--fs-3xl` | 36 | h2 |
| `--fs-4xl` | 48 | h1 (default) |
| `--fs-5xl` | 64 | h1 (display) |
| `--fs-6xl` | 84 | poster / hero-only |

**Scale jumps are intentionally wide.** An h2 at 36 next to body at 16
is ~2.25× — loud. Don't compress. The contrast IS the hierarchy.

### A.3 Line height (non-obvious rule)

- Display & h1–h2: **1.05–1.22** tight.
- Body: **1.5** for EN runs, **1.7** for mixed zh-TW/EN paragraphs —
  繁體字需要多一點行距才能呼吸.
- Lists, captions: **1.4** — denser than body, by design.

### A.4 Measure (line length)

- Reading column: **56–68 Chinese characters** per line, or **65–75 Latin
  characters**. Past 75 and it reads like a wall.
- Wide pages (hero, tables) can go to 90ch. Body cannot.

### A.5 Rhythm — 4px spacing, but committed jumps

Use `--s-*` tokens. **Don't** write `margin: 20px`. **Don't** invent
intermediate values.

- Tight group (related fields): **8 / 12**
- Default group: **16 / 24**
- Section gap: **48 / 64**
- Major page gap: **96 / 128**

The jumps between groups are the whole point. Go LARGE between sections
— that's where the breath lives.

### A.6 Alignment

- **Default: left-aligned** for text, left-anchored for headlines.
- **Centered** is reserved for:
  - the single marquee line of a hero
  - patch-form brand marks
  - data labels inside circles/shields
- **Right-aligned** is for numbers in tables (align decimals) and for the
  amber corner endorsement `by StarRiver Arts`.
- **Mixed alignment** is a seasoning move (see §B). Do not default to it.

### A.7 Family pairing

- **Latin**: TASA Orbiter (Display / Deck / Text — use the right optical
  size for the size).
- **CJK**: Noto Sans TC by default. Noto Serif TC for curatorial /
  long-form 美術館 surfaces only — never for UI.
- **Never mix** two CJK companions on a single page.

### A.8 Colour discipline on the ground

- The page is 95% cream + ink + one neutral grey.
- Amber (`--sr-amber`) is rationed: **one amber event per viewport**.
  If you have two amber things competing, one of them is wrong.
- Accent colours from sub-brands (sign-green, signal-blue, etc) never
  appear on mother-brand surfaces except inside inline route shields or
  brand endorsements.

---

## B. Seasonings — advanced moves, use sparingly

These are the tools we talked about. Each one, on its own, can make a
page sing. Two at once is usually a mistake. Three at once is always.

### B.1 Directional whitespace

Break symmetry on purpose. Instead of 64px gap top / 64px bottom,
do 24 top / 120 bottom. The giant bottom gap becomes a **pause before the
next section**. Use on section starters, never on body.

### B.2 Dramatic scale jump

Skip two tokens on the scale. A caption at 12 followed by a headline at
64 is a legitimate sr move. It only works if everything else on the
page is quiet.

### B.3 Optical over mathematical alignment

Hang punctuation, pull bullet points left of the column, let a large
quote mark sit outside the text column. Use the `--ls-display` negative
tracking on display-size text only.

### B.4 Single-colour accent

Amber is the brand's 1%. In a page of cream + ink + grey, one amber
rule, one amber word, one amber dot — that's the whole colour budget.
Don't distribute amber, concentrate it.

### B.5 Concrete object as accent

Instead of decorative shapes, drop in a small REAL object:
- A 48×48 photo of a stone
- A 1:1 crop of a route-sign shield
- A scanned paper card with a handwritten tag

Scale small. Treat as punctuation, not illustration. **Never** generated
art — always real materials.

### B.6 Density contrast

One section: extreme density (a 20-row archive table).
Next section: one sentence on 40% of the viewport.
The contrast is the design — neither zone needs decoration.

### B.7 Oversized marginalia

Footnotes, file numbers, timestamps in `--font-mono --fs-xs`, set in the
margin of a body column. Reads as scholarly, not cluttered.

---

## C. Layout patterns — by surface

### C.1 Hero (mother brand / museum)

- Cream ground.
- **Left-anchored** display line at fs-5xl / 64px. zh-TW + EN stacked.
- Kicker above (mono, fs-xs, uppercase, amber).
- One amber rule or one amber dot.
- Negative space below is LARGE — at least `--s-9 (96px)`, ideally 160px.
- Optional: small concrete object placed asymmetrically (see B.5).

```
┌─────────────────────────────────────────────────┐
│ · STARRIVER ARTS / 2026                          │
│                                                  │
│ 星河 StarRiver Arts                               │
│ On preservation, accessibility,                  │
│ and the way places survive                       │
│ into new media.                                  │
│                                                  │
│ ——                                               │
│                                                  │
│ [160px of breath]                                │
│                                                  │
└─────────────────────────────────────────────────┘
```

No full-bleed landscape photo here. That's a Project T move.

### C.2 Work index

- Two-column: 280px left (meta) · rest (title + description).
- Items separated by `--border-hair` only. No cards, no shadows.
- Meta column is mono, fs-xs, gray-500: project code, year, role,
  medium, length.
- Title is fs-xl / 22 in Deck SemiBold.
- One-line description at fs-md in body.
- Hover: left-bar meta turns ink, title becomes amber.

### C.3 Work detail

- Full-width hero PLATE (cream, no image) with the title treatment.
- Below: two-track — wide reading column on the left (56ch), narrow
  meta column on the right (same meta as C.2).
- Imagery sits inside the reading column, never full-bleed at mother
  brand level (full-bleed is Project T's move).
- Footnote row at bottom in monospace.

### C.4 Changelog / announcements

- Dense stacked list. Each entry: 80–120px tall max.
- Left: mono timestamp + version code.
- Middle: one-line title + optional paragraph.
- Right: a single tag pill (NEW · FIX · NOTE).
- No cards. No shadows. No icons. Just ruled lines.

### C.5 Store listing (later)

- Grid of 3 or 4 columns on wide screens.
- Cell = paper card, 1px graphite border, 4px radius.
- Top: 1:1 preview plate (image or solid colour placeholder).
- Below: title / one-line description / price right-aligned in mono.
- No star ratings, no "bestseller" badges, no gradient overlays.

---

## D. Things that are off the table (mother brand)

- Pure white `#FFFFFF` on body surfaces. Always cream.
- Pure black `#000000` on body text. Always `--sr-ink`.
- Drop shadows on cards. Borders do this job.
- Gradients outside the starfield comet trail.
- Rounded pill buttons at >8px radius (racing club only).
- Multiple accent colours on one viewport.
- Emoji.
- Icon-only buttons without text labels in primary flows.
- "Read more ▸" filler — if more exists, link the title.
- Hero photography on mother-brand surfaces. Photography appears on
  Project T and Formosa work-detail surfaces, not on the studio face.
