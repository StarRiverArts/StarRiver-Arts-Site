# Design Vocabulary

> Where the brand pulls its visual language from. Split into **core
> vocabulary** (can sit in mother-brand door / museum UI) and **scene
> vocabulary** (appears inside works, not on the brand chassis).
>
> Ground rule (user-set): **潛移默化**. For zh-TW audiences, Taiwan is
> never named — a place name does the work. For EN audiences, "Taiwan"
> can be explicit. **Avoid traditional Chinese cultural symbols.** The
> practice is about 本島/本土 — living Taiwanese material, not imperial
> heritage.

---

## Core vocabulary — admitted into the brand door

These two sit in the **StarRiver / 美術館** visual spine. They're also
the two most resolved pieces of Taiwan everyday graphic design: they
solve real problems under weather and time, and their designers thought
hard. We borrow the **system thinking**, not the literal forms.

### CV-01 · 公路標誌系統 — Highway signage

**What we borrow**
- Information hierarchy: the big thing is destination, the small thing
  is everything else. Our heroes follow the same rule.
- Composed shields & shapes — route shields as first-class typographic
  components (not decorations).
- Colour discipline: green / blue / amber / black / white, each with a
  specific meaning (direction / place / caution / chrome / paper).
- Mixed zh-TW / EN stacked labels. This is a TW-native convention;
  English is not an afterthought.

**What we do NOT do**
- Literal highway signs on the brand door (that's Project T's move —
  see SV-01).
- Reflective / vinyl texture — reads as skeuomorphic.
- The actual route numbers on non-work surfaces.

**Where it shows up on the brand door**
- Kickers and file numbers look like short route labels.
- The `by StarRiver Arts` endorsement uses the composed-shield corner
  placement logic.

### CV-02 · 山徑與國家公園標誌系統 — Trail & National Park signage

**What we borrow**
- Earthy palette (route numbers in weathered paint, wooden markers,
  painted stone). Warm cream is a direct descendant of this palette.
- Pictogram discipline — one silhouette, one rule, no decoration.
- Elevation markers, km stones — numbers placed with intent; the
  number IS the design.
- Reading distance > screen reading — fewer elements, bigger gaps.
  This is the core of our "留白彰顯視覺重點" stance.

**What we do NOT do**
- Twee nature ornaments (leaves, pawprints, cartoon trees).
- Adventure-aesthetic gradients or parallax.

**Where it shows up on the brand door**
- Palette: the warm cream ground + graphite ring + amber sun is
  spiritually a 林務局 marker post.
- The `--orbit-dur 14s` patch loop = slow like wind moving through a pass.

---

## Scene vocabulary — appears inside works only

These are TOO Taiwanese to sit on the mother-brand chassis. They'd drag
it into 華國美學 territory. But inside a specific work (a Project T
world, a Formosa-style didactic plate, a special exhibition), they are
the right choice when the work's subject demands them.

### SV-01 · Highway signage, literal — Project T only

- Green / blue gantries, exact route shields, km posts.
- Used diegetically: these are the world's native objects, not UI.
- Do NOT bring these into StarRiver or Museum chrome.

### SV-02 · 台鐵 — theme-locked

- Station enamel, platform numbers, ticket-stub cards.
- Only when a work is about rail or station culture. Otherwise excluded.

### SV-03 · 騎樓招牌 / 違章招牌 — scenes, not brand

- Stacked iron-letter shopfronts, layered banners, late-night neon.
- OK as environment material inside a world. Never as UI.

### SV-04 · 夜市攤 — high risk, high reward

- Plastic stool red, clip-fluorescent glare, taped-up labels.
- Only deploy if the work is specifically about night-market culture.
  Otherwise the brand slides into 華國美學.

### SV-05 · 水泥外牆 / 壓印字 — atmospheric

- Mosaic tile walls, painted address numbers, embossed building plates.
- Good for texture plates and environment backgrounds in story pages.
- Subtle use only — a single wall, not a pattern repeat.

---

## Explicitly excluded

Hard rules. Do not use these at any scale, on any surface.

- **Traditional Chinese ornament**: dragons, lanterns, cloud-scroll,
  wave-fret, cinnabar-and-gold palettes, calligraphic flourish used as
  decoration.
- **Brush-stroke aesthetics** as primary graphic. (A scanned hand-written
  label is OK; brush-style headlines are not.)
- **Lucky motifs** — red-envelope red, 吉祥 ornament, zodiac illustrations.
- **Seal-style logomarks** (紅印章 square ink seals) — too-direct imperial
  reference.
- **Rural-nostalgia tropes**: straw hats, water buffalo, paddy-terrace
  photography used as generic "Taiwan".
- **Public-sector / school-assembly layout**: centred multi-line titles
  with red accents, Ming-dominant bodycopy. Excluded unless a work is
  specifically about that material (see SV-02 / SV-03 logic).

---

## Handling the political line (暗線, not 門面)

The brand has a position. The design must not shout it.

- **zh-TW surfaces**: never print the word 台灣 at brand-chassis level.
  Use 本島 / specific 地名 / specific 路線 / specific 縣市 instead. Readers
  know where they are.
- **EN surfaces**: "Taiwan" is allowed because the audience needs the
  anchor. But still prefer the specific ("Yilan 17.8km" > "Taiwan roads").
- Never use the ROC flag, blue-sky-white-sun-red, or 青天白日 colour
  combinations as graphic motif. Likewise no pan-green party colours.
- No cross-strait political imagery, full stop. The brand's stance comes
  through the LIVING material it chooses to preserve — not through
  opposition to the other side.
- **Traditional Chinese characters (繁體字)**: emphasise. Both in copy
  (always 繁體) and in the choice of 國字字形 — prefer type drawn for
  Taiwan/Hong Kong conventions (Noto Sans TC, not Noto Sans SC).

---

## Checklist before shipping a surface

1. Is there a single dominant accent? (one amber event per viewport)
2. Does it work in `--sr-paper` cream, not pure white?
3. If it names a place — does it name the SPECIFIC place, not "Taiwan"?
4. Does it use 繁體字 (both in copy and the typeface served)?
5. Is there at least one section of real breath (≥96px of empty cream)?
6. Does anything on screen accidentally look like highway signage or
   trail signage? If yes and this isn't a Project T / Park surface →
   pull it back.
7. Any excluded motif present (lanterns, dragons, seals, rural-nostalgia)?
   → remove.
