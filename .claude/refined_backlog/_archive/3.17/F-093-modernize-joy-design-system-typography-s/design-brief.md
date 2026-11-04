# F-093 Design Brief (impeccable shape)

> Written retroactively on 2026-11-04 by the resuming agent. The implementation (commit `461f2da`) was already in place; this brief records the direction the spec and PRODUCT.md set, and is what `critique.md` judges against. Discovery answers come from `spec.md`, `PRODUCT.md` and the owner's relayed complaint ("the font is not user-friendly, the colours feel old"); no separate interview round was held.

## 1. Feature summary

Refresh the joy-design type system and add two opt-in genres (`honey` for joy-quest, `studio` for asset-studio), an SFX/audio component suite (`SoundController`, `SoundTile`, `AudioPlayer`) and three console primitives (`CommandPalette`, `FilterChips`, `InspectorPane`) as Svelte 5 + React 19 twins. Consumers are Joymify frontend engineers; their end users are players (joy-quest, play-joymify, often on phones) and creators (asset-studio, desktop, long sessions).

## 2. Primary user action

- Type: read UI text comfortably in Latin and Thai, without the app looking like a 2020 Inter default.
- Audio: find, preview and mute sound without hunting; the mute control is always one tap away.
- Console: jump anywhere with the command palette; narrow a long asset list with chips.

## 3. Design direction

- **Colour strategy:** Restrained for the base system and `studio` (tinted neutrals, one accent at most ~10% of the surface). `honey` is Committed: amber carries the primary actions and headings' accent word.
- **Scene sentences.**
  - studio: a creator at a desk in a dim room, an hour into sorting SFX clips on a 27" monitor, wants dense and calm. Dark is the working default; light must be equally finished.
  - honey: a child or parent on a phone in a bright living room, short sessions, wants friendly and readable. Light is the default.
- **Anchors.** studio: Linear's command palette density, Ableton's browser panel, Figma's inspector. honey: Duolingo's rounded button weight, Nintendo menu typography, a jar of honey on a wooden table (warmth from accent, not a beige canvas).
- **Typography.** Plus Jakarta Sans (a humanist-geometric sans with open apertures and a larger x-height than Inter) for Latin UI, Anuphan for Thai (loopless modern Thai that matches Jakarta's weight), JetBrains Mono unchanged for code and numbers. `honey` swaps to Baloo 2 headings + Nunito body; `--joy-font-family-rounded` exposes that pair to any genre. One family in several weights; no near-duplicate pairing.
- **Fonts must actually load.** A stack that names a font the page never downloads silently renders the fallback. The hub loads every named family, and README tells consumers which families to load.

## 4. Scope

Production-ready shipped components and tokens, all frameworks, both themes, every state in the DESIGN.md state matrix. Breadth: tokens + 2 genres + 6 component twins + 4 icons + Modal/Tabs/Button parity props. The hub showcase of the six new components is NOT in this feature's acceptance criteria (see Open questions).

## 5. Layout strategy

- SoundController: one icon button (mute state carried by icon + label, never colour alone) that opens a popover with three labelled sliders (SFX, BGM, Voice). A "ducked" badge and an autoplay-blocked prompt sit inside the popover, not as floating toasts.
- SoundTile: tile with title, category badge and duration pill; the equalizer bars are the only motion and become static under `prefers-reduced-motion`.
- AudioPlayer: one row on desktop (play, scrubber, timecode, loop, speed); on 390px the scrubber takes its own full-width row.
- CommandPalette: modal dialog, input on top, grouped results, keyboard hints right-aligned in mono.
- InspectorPane: a side panel on desktop, a bottom sheet on phones; key/value rows, not nested cards.

## 6. Key states

- SoundController: default, muted, ducked, autoplay-blocked (needs a user gesture), popover open, slider focus-visible.
- SoundTile: idle, hover-preview playing, pinned, focus-visible, disabled (asset missing).
- AudioPlayer: idle, playing, paused, loading (buffering), ended, error (decode failed), looping, each speed.
- CommandPalette: empty query, results, no results, keyboard-selected row.
- FilterChips: none selected (`empty`), some selected, overflow wrapping on phone.
- InspectorPane: open, closed, empty selection.

## 7. Interaction model

Keyboard first on console components (Escape closes, arrows move, Enter activates, focus returns to the opener). Hover-to-play on SoundTile must also work by focus + Space, never only on hover, and must not play on touch scroll. Sliders are native range inputs with visible values.

## 8. Content requirements

Labels: "Mute all", "Sound effects", "Music", "Voice", "Tap to enable sound" (autoplay-blocked), "No commands match", "No filters applied". Durations as `m:ss`; timecode in tabular mono. Thai strings run about 1.3x longer than English: chips and buttons must wrap or truncate with a title, never clip.

## 9. Recommended references

`typeset.md` (font stacks, Thai pairing), `colorize.md` (genre palettes), `interaction-design.md` (sliders, palette), `adapt.md` (bottom sheets at 390px), `animate.md` (equalizer bars, reduced motion).

## 10. Open questions

- The six new components are not yet shown in the Storybook hub, so the owner cannot look at them at design.joymify.com. Default: a follow-up feature adds a hub "Audio & Studio" section.
