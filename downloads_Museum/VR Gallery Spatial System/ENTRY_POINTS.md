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
- Ground: slightly darker — deep cream or dark grey. Players are accustomed
  to dark interfaces; a light page feels foreign.
- Cards: rounded corners (8–12 px), larger than Studio default.
  Screenshot-led — images do the work, not text.
- Secondary accent: **comet cyan** `--sr-comet #B9E4E8` replaces amber as
  the primary interactive colour here. Cyan reads as "tech / VR" where amber
  reads as "craft / studio".
- Information density: high, but grouped visually. The eye scans, not reads.
- CTA: large, clear, world-launch buttons. Discord link prominent in hero.
- Animation: faster (dur-base → 160 ms); card hover lifts more noticeably.
- Radius: 8–12 px (friendlier).
- Tone: second person, inviting. "Come race with us." "World's open."

**Amber usage**: reserved for notifications and changelog only.
Cyan is the action colour on this surface.

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
| `/play` | Dark cream / dark grey | Cyan `#B9E4E8` | Amber (alerts) | 8–12 px |
| `/museum` | Near-white `#F8F5EC` | Graphite `#282829` | None | 0 |
| `/works` | Void `#0E0E10` | Amber (full use) | Cyan (comet) | 4 px / 999 px |
