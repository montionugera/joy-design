---
title: "Modernize Joy Design System: Typography, Studio & Honey Genres, SFX Audio Suite, and Console Parity"
id: F-093
status: refined
from_idea: I-103
---

# Modernize Joy Design System: Typography, Studio & Honey Genres, SFX Audio Suite, and Console Parity

## Problem

1. **Dated / AI-Slop Aesthetics & Typography**:
   - The core font stack lacks friendly modern geometric/humanist UI typography and multi-script (Thai/CJK) fallbacks in `theme.css` (`Plus Jakarta Sans`, `Anuphan`, `Noto Sans Thai`, rounded game display tokens `--joy-font-family-rounded`, `--joy-font-family-ui`).
   - Consumers like `joy-quest` and `asset-studio` need modern palette/genre options: `honey` (Honey Quest cozy learning / game genre with rounded pill geometry and warm amber/teal chromatic tension) and `prism` / `studio` (crisp modern studio neutral alabaster & deep slate-indigo without yellowed parchment cream).
2. **SFX, Audio & Media Component Gap**:
   - `asset-studio`, `play-joymify`, and `joy-quest` are audio-rich (31+ Web Audio/MP3 SFX cues, BGM mood loops, voiceovers, narrator ducking, hover-to-play SFX cards, animation-synced clip SFX), yet `joy-design` has zero audio/SFX components. Each app duplicates `BgmToggle`, `MuteButton`, `SoundPreviewer`, and hover-to-play `CardTile`.
3. **Console & Gameplay Parity Gaps (`I-102` + `asset-studio` local fork)**:
   - `play-joymify` needs `Modal` `titleLevel` (`2 | 3 | 4`), `Tabs` panel `tabindex` (`0` by default for keyboard reachability), and `Button` `loading` keeping label visible alongside the spinner.
   - `asset-studio` carries 3 high-value studio/console components (`CommandPalette`, `FilterChips`, `InspectorPane`) in a stale local fork with hardcoded hex colors and OS emojis (`✕`, `▸`) that violate `joy-design` governance.

## Why now

Unblocks unified modern UI across `asset-studio`, `joy-quest`, and `play-joymify` on `release/3.17` with full Svelte 5 + React 19 parity and WCAG 2.2 AA compliance.

## Sketch

- **Phase 1 (Tokens & Genres)**:
  - Upgrade `packages/tokens/scripts/ramps.mjs` & `build.js` with modernized multi-script font stacks (`Plus Jakarta Sans`, `Inter`, `Anuphan`, `Noto Sans Thai`), `--joy-font-family-ui`, `--joy-font-family-rounded`, and crisp modern control/card surface tokens.
  - Add `honey` (Honey Quest) and `studio` (Studio Prism — crisp modern creator console) to `packages/tokens/scripts/genres.mjs` and `GENRES.md`, verified against WCAG 2.2 AA across all 45 contrast pairs per mode.
- **Phase 2 (Icons & SFX / Audio Component Suite)**:
  - Add `Music`, `Volume1`, `Headphones`, `Waveform` vector icons to `@montionugera/joy-icons` (Svelte + React + types).
  - Add 3 first-class SFX/Audio components in `@montionugera/joy-svelte` and `@montionugera/joy-react` + `theme.css`:
    1. `SoundController`: Unified SFX/BGM/Voice mixer & mute control with popover sliders, ducking badge, and autoplay-blocked unlock prompt.
    2. `SoundTile`: Interactive SFX/audio library card with hover-to-play, click-to-pin, animated equalizer bars (with `prefers-reduced-motion` static fallback), category badge, and duration pill.
    3. `AudioPlayer`: Waveform scrubber & clip player with play/pause, seek bar, timecode, loop toggle, playback speed (`0.5x`/`1x`/`1.5x`/`2x`), and frame-synced cue markers.
- **Phase 3 (Console Primitives & `play-joymify` Parity)**:
  - Upgrade `Modal` (`titleLevel`), `Tabs` (`panelTabIndex`), and `Button` (`loading` keeps label text visible).
  - Add `FilterChips`, `InspectorPane`, and `CommandPalette` as zero-hex, zero-emoji Svelte 5 + React 19 twins.
- **Phase 4 (Storybook Hub, Docs & Gate 1)**:
  - Showcase the new genres (`honey`, `studio`) and Audio/SFX + Studio components in `apps/storybook-hub`.
  - Regenerate `DESIGN.md` and pass `scripts/precheck.sh`.

## Acceptance criteria

- [ ] `packages/tokens` emits modernized multi-script font tokens (`--joy-font-family-sans` with `Plus Jakarta Sans` + `Anuphan` + `Noto Sans Thai`, `--joy-font-family-rounded`, `--joy-font-family-ui`) and passes `ramps.test.js`, `tokens.test.js`, `brand.test.js`, and `contrast.test.js`.
- [ ] `packages/tokens/dist/genres.css` and `GENRES.md` include `honey` (Honey Quest) and `studio` (Studio Prism) 5-axis genres and pass 100% of `genres.test.js` WCAG 2.2 AA contrast assertions.
- [ ] `@montionugera/joy-icons` exports `Music`, `Volume1`, `Headphones`, and `Waveform` in both Svelte 5 and React 19 with 100% parity test pass.
- [ ] `SoundController`, `SoundTile`, `AudioPlayer`, `FilterChips`, `InspectorPane`, and `CommandPalette` exist in both `@montionugera/joy-svelte` and `@montionugera/joy-react` with full `theme.css` styling and pass `node scripts/parity-check.mjs`.
- [ ] `Modal` supports `titleLevel`, `Tabs` sets `tabindex` on tabpanel, and `Button` keeps label visible when `loading={true}` in both Svelte and React.
- [ ] `bash scripts/precheck.sh` passes with zero violations (colors, emojis, contrast, unit tests, parity, and `DESIGN.md` sync).
