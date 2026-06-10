# StarRiver Arts — Entry Points & Visual Identity

> This document defines the four landing surfaces for StarRiver Arts.
> Each serves a different visitor task, sharing a common navigation and
> footer DNA, but with a distinct first-screen visual language.
> They live as paths on a single site, not separate products.

---

## Architecture: one site, four entries

| Path | Audience | Visitor task |
|---|---|---|
| `/studio` | Clients / recruiters | "Can this person deliver? What have they built?" |
| `/play` | VRChat players / community | "What worlds exist? How do I join?" |
| `/museum` | Exhibition visitors / artists | "What's showing? Can I submit work?" |
| `/works` | Art audience / personal expression | "Who is this creator? What is their universe?" |

All four share: the same `<nav>`, footer, TASA Orbiter type spine,
and `by StarRiver Arts` endorsement. Everything else diverges.

---

## Entry A — `/studio` · Professional / Portfolio

**Visitor task**: assess capability and deliverability. Clients, recruiters,
collaborators.

**Visual language**:
- Ground: warm cream `--sr-paper`, density higher than default — more
  information, less open sky.
- Colour: almost entirely ink + paper + one amber rule. No decorative colour.
- Typography: TASA Orbiter **Deck** (not Display) — closer to a work brief
  than a poster.
- Layout: two-column record format — left column meta (skills, dates, role),
  right column description. Like a well-typeset CV.
- No animation, no scroll parallax.
- Radius: 4 px (technical).
- Tone: third person, precise. "本計畫 / This project…" — never "I made this".

**Amber usage**: one amber rule or one amber kicker label per viewport.
No amber fills.

---

## Entry B — `/play` · Players / Community

**Visitor task**: find worlds, join events, link to Discord.
Speed of access over depth of information.

**Visual language**:
- One family, two registers — 山道日夜. The landing (`play.html`) is the
  DAY register: 天青 sky `--pt-sky`, layered 山藍/山綠 ridges, text always
  in the `--pt-ink` ramp (scenery colours never carry type).
- The racing cluster (Time Attack / Events / Driver Records) is the NIGHT
  register: `--pt-night` deep green-black grounds, `--pt-night-fg` warm-white
  text ramp, **車燈黃 `--pt-lamp`** as the accent — headlights on a dark
  mountain road. Same hue family as day; the clock just moved.
- Type on boards follows the `--ta-fs-*` scale; 11px is the hard floor.
- The dashed centre-line strip (asphalt + `--pt-line` yellow) is the shared
  chrome motif across all Play pages.
- Information density: high, but grouped visually. The eye scans, not reads.
- Radius: 4–6 px panels (highway-sign flatness inherited from Project T).
- Tone: second person, inviting. "Come race with us." "World's open."

**Amber usage**: none — Play runs on the Project T palette. Yellow here is
標線/車燈 (`--pt-line` / `--pt-lamp`), a different semantic than studio amber.

---

## Entry C — `/museum` · Museum / Gallery

**Visitor task**: read exhibition information, find open call details,
understand the programme.

**Visual language**:
- Ground: near-pure warm white — closer to a physical gallery wall than the
  editorial cream of Studio. `--sr-chalk #F8F5EC` or a step lighter.
  The difference from Studio is intentional: the Museum is a presentation
  space, not a studio.
- Accent: **graphite** `--sr-graphite #282829` replaces amber as the
  primary accent. Amber would compete with artwork; graphite defers to it.
- Typography: TASA Orbiter Display + **Noto Serif TC** for long-form reading
  bodies. The serif adds curatorial weight.
- Layout: generous margins, single reading column (max 640 px), artwork
  images at full column width.
- Radius: 0 (gallery square — no rounded corners anywhere).
- No decorative elements. The artwork is the decoration.
- Tone: curatorial, third person. Concept-led descriptions.
  "The exhibition asks…" not "Check out…"

**Amber usage**: none on this surface. Amber is a StarRiver studio colour,
not a gallery colour.

---

## Entry D — `/works` · Art / Personal Expression

**Visitor task**: enter the creator's universe. Feel the world before
reading about it.

**Visual language**:
- Ground: **`--sr-void #0E0E10`** — the only entry that uses dark background
  as default. This is where the starfield patch lives at full power.
- Amber on dark: `--sr-amber` in dark-background context becomes a **light
  source**, not just an accent colour. This is where amber earns its place.
- Comet trail animation: slow cyan-to-slate diagonal sweep across the hero.
  `--orbit-dur 14s`, the signature loop.
- Typography: TASA Orbiter **Display Black** — maximum scale, poster energy.
  Like an exhibition placard at 3 metres.
- Layout: immersive, asymmetric. Large negative space is intentional.
  Information comes after atmosphere.
- Radius: 4 px for UI elements; circular (999 px) for all patch marks.
- Tone: concept-led, first-person allowed here only. "I've been thinking
  about what it means for a place to survive into a new medium."

**Amber usage**: full use — amber fills, amber rules, amber type on void.
This surface is the one place amber can be used at volume.

---

## Why NOT four separate sites

One site with four paths has lower maintenance cost, enables lateral
navigation (a player can drift into the portfolio), and maintains brand
coherence through the shared nav/footer layer.

The shared layer:
- Fixed 64 px header, 1 px bottom border, cream background, StarRiver patch
  top-left, four nav links (`Studio · Play · Museum · Works`).
- Footer: void black, amber-ring logo, bilingual nav, version + date.
- Both surfaces ignore sub-brand rules — they are always StarRiver-chassis.

---

## Colour summary by entry

| Entry | Ground | Primary accent | Secondary | Radius |
|---|---|---|---|---|
| `/studio` | Cream `#F3EEE3` | Amber (rules only) | Ink | 4 px |
| `/play` | Day: 天青 `#E3ECEA` · Night: 山夜 `#141B19` | 車燈黃 `--pt-lamp` (night) / 山綠 (day) | 省道綠藍 | 4–6 px |
| `/museum` | Near-white `#F8F5EC` | Graphite `#282829` | None | 0 |
| `/works` | Void `#0E0E10` | Amber (full use) | Cyan (comet) | 4 px / 999 px |
