# Provenance

## Display font

- **Name:** Cormorant Garamond
- **Weights used:** 500 (medium, normal) for the wordmark; 400 (regular, italic) for the tagline
- **Package:** `@fontsource/cormorant-garamond` version `5.3.0` (per `pnpm-lock.yaml`; devDependency here, outlining only — never shipped as a runtime font asset by this package)
- **Licence:** SIL Open Font License 1.1
- **Upstream:** https://github.com/CatharsisFonts/Cormorant
- **Outlining tool:** `opentype.js` version `2.0.0` (per `pnpm-lock.yaml`; see the NaN workaround note in `scripts/outline-text.mjs`)

The wordmark and tagline are outlined to static SVG path data at build time
(see `scripts/outline-text.mjs`), so no font file or `@font-face` is needed
at runtime — the shipped assets are plain vector paths.

## Mark geometry

The diamond mark (viewBox `0 0 32 32`, tile `rx=6`, outline
`M16 4 28 16 16 28 4 16Z`, inner `M16 9 23 16 16 23 9 16Z`, centre dot
`cx=16 cy=16 r=1.6`) is the canonical Joymify mark, sourced from
`user-svc`'s `user-fe/src/lib/assets/favicon.svg`. It is reproduced here as
a literal in `src/geometry.js` per the F-043 plan's Global Constraints.

## Regenerating

- Outlines (wordmark + tagline path data): `pnpm --filter @montionugera/joy-brand outline`
  — regenerates `src/outlines.generated.js` from the Cormorant Garamond
  `.woff` files bundled by `@fontsource/cormorant-garamond`. Commit the
  result; it is a generated file (do not hand-edit).
- Assets (SVG + PNG in `assets/`): `pnpm --filter @montionugera/joy-brand build`
  (`node build.js`) — reads the resolved `--joy-brand-*` token values from
  `@montionugera/joy-tokens`' `dist/theme.css` (building it first if missing) and
  writes every asset deterministically. Commit the result.

## Licences

The package code and the Joymify mark geometry carry no open-source licence (this package was previously marked UNLICENSED); nothing in this file grants rights to them beyond what the package owner has granted you.

The outlined wordmark and tagline paths in `src/outlines.generated.js` are derived from Cormorant Garamond. Its licence notice follows verbatim, as shipped in `@fontsource/cormorant-garamond` 5.3.0 (`LICENSE`), as the SIL Open Font License 1.1 requires for derivatives.

````text
Copyright 2015 The Cormorant Project Authors (github.com/CatharsisFonts/Cormorant) CormorantGaramond-Italic[wght].ttf: Copyright 2015 The Cormorant Project Authors (github.com/CatharsisFonts/Cormorant)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.

````

## Sound effects

Shared sound effects library containing 51 short game audio clips as mono 96 kbps MP3 files (peak normalized to -12 dBFS) powering the Joymify ecosystem, with TypeScript manifest and Web Audio player (`createSfxPlayer`) exported via `@montionugera/joy-brand/sfx`.

### Source of the audio clips
The clips originate from three sources:
1. **Pixabay** (13 clips): Free library sound effects under the Pixabay Content License, trimmed to the first pulse (≤2 s; `wwDawnChime` keeps bell tail), mono 96 kbps.
2. **Mixkit** (11 clips): Free library sound effects under the Mixkit Sound Effects Free License, trimmed and normalized.
3. **ElevenLabs** (27 clips: 7 game cues + 20 reaction emote cues): Generated with ElevenLabs Sound Effects (model v3, mono 96 kbps via `lame -m m -b 96`).

### Full Inventory (51 Clips)

| Cue | Source | Title / Prompt | Licence |
|---|---|---|---|
| `bombBlast` | Pixabay | Animated Cartoon Explosion Impact | Pixabay Content License |
| `buyPower` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `damageHit` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `dawnBreak` | Pixabay | Chime sound | Pixabay Content License |
| `diceRoll` | Pixabay | rolling dice 2 | Pixabay Content License |
| `draw` | Pixabay | flipCard | Pixabay Content License |
| `emotePop` | Pixabay | Bubble Pop 06 | Pixabay Content License |
| `emote_anger` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_bulb` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_clap` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_cockroach` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_cry` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_dots` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_exclamation` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_fire` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_gg` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_heart` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_laugh` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_music` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_paper` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_question` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_rock` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_scissors` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_shock` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_sleepy` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_sweat` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `emote_thanks` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `gameEnd` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `join` | Mixkit | Kids cartoon close bells | Mixkit Sound Effects Free License |
| `kaijuDiceRoll3D` | Pixabay | rolling dice 2 | Pixabay Content License |
| `kaijuLaserBlast` | Mixkit | Sci-fi battle laser shots | Mixkit Sound Effects Free License |
| `kaijuRoar` | Mixkit | Giant monster roar | Mixkit Sound Effects Free License |
| `kaijuShopBuy` | Pixabay | Power Up 01A | Pixabay Content License |
| `laserHit` | Mixkit | Laser weapon shot | Mixkit Sound Effects Free License |
| `loss` | Mixkit | Losing drums | Mixkit Sound Effects Free License |
| `nightFall` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `powerBurst` | Mixkit | Sci fi plasma gun power up | Mixkit Sound Effects Free License |
| `reveal` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `roar` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `shieldBlock` | Pixabay | Shield Block Shortsword | Pixabay Content License |
| `unlockChime` | Pixabay | Achievement Unlocked | Pixabay Content License |
| `voteLock` | Mixkit | Gaming lock | Mixkit Sound Effects Free License |
| `warn` | Pixabay | Warning Notification | Pixabay Content License |
| `win` | Mixkit | Video game win | Mixkit Sound Effects Free License |
| `wireCut` | Pixabay | Scissors Snip 1 | Pixabay Content License |
| `wwDawnChime` | Pixabay | Single Church Bell 2 | Pixabay Content License |
| `wwExecutionDrum` | Mixkit | Cinematic mystery trailer drum hit | Mixkit Sound Effects Free License |
| `wwNightWind` | ElevenLabs | ElevenLabs Sound Effects take #1 | ElevenLabs (commercial terms follow-up) |
| `wwWolfHowl` | Mixkit | Lone wolf howling | Mixkit Sound Effects Free License |
| `yieldAlert` | Mixkit | Digital quick tone | Mixkit Sound Effects Free License |
| `yourTurn` | Pixabay | New Notification - 3 | Pixabay Content License |

### SFX Licences and Terms
- **Pixabay Content License**: Permitted for commercial and non-commercial use with no attribution required. See https://pixabay.com/service/license-summary/
- **Mixkit Sound Effects Free License**: Permitted for commercial and non-commercial projects with no attribution required. See https://mixkit.co/license/#sfxFree
- **ElevenLabs**: Generated with the owner's ElevenLabs account. Owner follow-up: confirmed owner decision (2026-11-09) to include these 27 clips with an open action to review plan commercial terms before external distribution.
- **Code & Metadata**: The manifest, TypeScript definitions, and player code are owned by Joymify. All rights reserved.
