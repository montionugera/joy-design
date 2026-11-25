---
title: "Design site: modern and outdoor in the palette picker"
id: F-099
status: refined
from_idea: I-110
---

# Design site: modern and outdoor in the palette picker

## Problem

Release 3.21 added the `modern` theme (Midnight Brass, F-097) to the token packages only. The design site (`apps/storybook-hub`, design.joymify.com) was not touched, so its palette picker still offers 13 palettes and `modern` cannot be seen anywhere on the site. The owner opened the site after the release and found no new theme (2026-11-25).

The token set has seven presets: `classic`, `bauhaus-primary`, `clay-court`, `nordic-slate`, `verdant-lawn`, `outdoor`, `modern`. The picker lists five of them. The two missing ones are `modern` and its neighbour `outdoor`.

## Why now

Owner, 2026-11-25, verbatim: "เพิ่ม modern เข้าเว็บ Design เลย เอาTheme เพื่อนบ้านด้วย". Reading of "the neighbour theme": `outdoor`, the only other token preset that the picker lacks (the controller's reading, not confirmed by the owner).

## Sketch

Two new entries in the existing palette picker of `apps/storybook-hub/build.js`, built exactly like the entries that are there (`hub-palette-item`, three swatch dots, a name and a one-line subtitle), plus their names in the `PALETTES` map. Choosing one sets `data-palette` on the page as the other presets do; all colours come from `packages/tokens/dist/theme.css`, which already has `[data-palette="modern"]` and `[data-palette="outdoor"]` for light and dark. No token changes, no new component, no change to the 13 existing entries. The existing "Outdoor Sunlight Simulator" page (`data-mode="outdoor"`) is a different thing and stays as it is.

## Acceptance criteria

- [ ] The palette picker on the design site lists `modern` ("Joy Modern") and `outdoor` ("Outdoor") next to the other token presets, each with three swatch dots that show that palette's own colours and a short subtitle.
- [ ] Choosing `modern` sets `data-palette="modern"` on the page, the picker shows it as the active palette, and the choice survives a reload, in light and in dark mode; the same for `outdoor`.
- [ ] With `modern` or `outdoor` active, in light and in dark, at 390x844 and 1280x800: the landing page and one component page have readable text and controls (no text that vanishes into its background, no clipped or wrapped picker rows).
- [ ] The 13 existing palettes look and behave as before; `apps/storybook-hub/tests/palette-switcher.spec.ts` covers the two new palettes and the whole Playwright suite passes.
- [ ] No hand-written colour value is added to the site for these palettes: swatches and pages use token variables only.
