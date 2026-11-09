# @montionugera/joy-sfx — Provenance

## 1. What this is
Shared sound effects library containing 51 short game audio clips as mono 96 kbps MP3 files (peak normalized to -12 dBFS) powering the Joymify ecosystem, with TypeScript manifest and Web Audio player (`createSfxPlayer`).

## 2. Source of the audio clips
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

## 3. Licences and Terms
- **Pixabay Content License**: Permitted for commercial and non-commercial use with no attribution required. See https://pixabay.com/service/license-summary/
- **Mixkit Sound Effects Free License**: Permitted for commercial and non-commercial projects with no attribution required. See https://mixkit.co/license/#sfxFree
- **ElevenLabs**: Generated with the owner's ElevenLabs account. Owner follow-up: confirmed owner decision (2026-11-09) to include these 27 clips with an open action to review plan commercial terms before external distribution.
- **Code & Metadata**: The manifest, TypeScript definitions, and player code are owned by Joymify. All rights reserved.
