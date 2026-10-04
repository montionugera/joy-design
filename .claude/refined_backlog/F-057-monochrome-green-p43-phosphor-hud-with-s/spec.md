---
title: "Monochrome Green P43 Phosphor HUD with Symbolic State Matrix"
id: F-057
status: refined
from_idea: I-062
---

# Monochrome Green P43 Phosphor HUD with Symbolic State Matrix

## Problem

Optical See-Through (OST) MicroLED smart glasses operate with monochrome single-color green waveguides (~530nm P43 phosphor) where 0-emission true black is completely transparent glass. Multi-color styling is physically impossible on single-wavelength emitters, and light background cards destroy ambient see-through vision. Furthermore, because color variance is unavailable, all interactive states (selection, playing/talking, paused, completed, priority, deletion) must be strictly communicated through high-contrast symbolic iconography (`▶`, `[x]`, `[ ]`, `×`, `●`, `⏸`, `▲`, `▼`, `◄`, `►`), reverse-video typographic fills, and geometric glyph matrices rather than color ramps.

## Why now

Smart glasses hardware in production (such as Vuzix, Even Realities G1, military aviation HUDs) is strictly monochromatic green. Adding authentic single-color green phosphor styling and explicit symbolic state matrices directly answers hardware engineering constraints and completes the HUD design system standard.

## Sketch

1. **All-Case Optical Dark Background & P43 Monochrome Green Phosphor**:
   - HUD visor frame stays true deep dark/black in both light and dark system themes (simulating zero-emission transparent glass against ambient environments).
   - All optical elements render in single-color phosphor green tokens (`--joy-status-success-fg` / `--joy-color-green-400` for high nits, `--joy-color-green-600` for mid tones, and dim 20% alpha for subtle grids).
   - Dedicated Optical Phosphor switcher: `Monochrome Green (P43 MicroLED)` vs `Additive Amber/Gold` vs `Full Polychrome`.

2. **Symbolic Selection & State Matrix**:
   - Active cursor: `▶` or `►` with reverse-video highlighting (solid phosphor green background bar with dark text).
   - Checklist items: `[x]` (completed) vs `[ ]` (pending) vs `×` (deleted/rejected).
   - Audio & Communication states: `▶ TALKING` (with phosphor audio wave bars), `[~ LISTEN]` (listening), `⏸ PAUSED` (suspended), `● REC` (voice recording memo).
   - Navigation cues: `▲ / ▼` (swipe scroll up/down), `◄ BACK` (double tap return).

3. **Guideline & Spec Expansion**:
   - Update `docs/superpowers/specs/glasses-hud-design.md` with dedicated sections on Monochromatic MicroLED optics, photopic luminosity curve $V(\lambda)$ peaking at 555nm, and the full single-color symbolic state matrix.

## Acceptance criteria

- [ ] Visor viewport in `#view-glasses-hud` maintains dark optical see-through background in all cases (both light and dark theme).
- [ ] Monochrome Green P43 Phosphor mode is available and fully functional in `#view-glasses-hud`.
- [ ] All interactive selection and state feedback use high-contrast geometric symbols (`▶`, `[x]`, `[ ]`, `×`, `⏸`, `●`, `▲`, `▼`, `◄`, `►`) and reverse-video typographic highlights.
- [ ] Zero OS emoji violations in codebase: all symbols are standard valid typographic characters or SVGs from `@joymify/icons`.
- [ ] Playwright tests and Gate 1 precheck pass 100%.
