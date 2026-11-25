---
title: "Make the modern theme recognisable on the design site"
id: F-100
status: refined
from_idea: I-111
---

# Make the modern theme recognisable on the design site

## Problem

F-099 (release 3.22) made `modern` selectable on the design site, but two independent design checks (2026-11-25) found that it is hard to recognise:

- In the palette picker, the Joy Modern row's three dots still read as navy, gold and cream, the same as Joy Classic. At 8px the First Light gradient dot looks navy (its top half is navy) and the brass seam dot looks plain gold. In dark mode the first dot nearly vanishes into the dropdown (Joy Classic's navy dot and all three Nordic Slate dots fade the same way).
- With `modern` active the site is a faint recolour of Joy Classic: no page uses `--joy-seam-*` or `--joy-gradient-first-light`, so the brass seam and the First Light sky of F-097 never appear.

## Why now

The owner opened the site to see the new theme and found nothing new (2026-11-25).

## Owner's ask (2026-11-25, verbatim)

"ไม่เห็น ทีมใหม่เลย" / "ไม่ใช่ ทีมก่อนหน้าที่ให้เลือกหรอ" and, to the offer "make Joy Modern on the design site show the gradient sky, the gold diamond and the gold seams, like the picture you chose": "เริ่มเลย".

The picture is the F-097 specimen: `.claude/refined_backlog/_archive/3.21/F-097-modern-theme-midnight-brass-base-first-l/specimen/joy-combined-theme.html`.

## Design (controller's decision, reversible)

With `modern` active, the hero of the Overview page (`.joy-hero`) becomes the theme's brand moment, in light and in dark:

- Background: the First Light sky (`--joy-gradient-first-light`, with `--joy-gradient-first-light-srgb` as the fallback). One gradient on the screen; the specimen's rule allows it for a brand moment.
- Words (badge, title, subtitle) and the buttons sit on the night end of the sky and use `--joy-sky-text`; they never sit on the ember end.
- The diamond mark of the specimen's call screen (concentric squares turned 45 degrees, corners square, brass) sits at the horizon.
- A Kintsugi seam (`--joy-seam-gradient`, `--joy-seam-width`, drawn to a point at each end as in the specimen) closes the hero.
- Site-only CSS in `apps/storybook-hub/build.js`. The shared `HeroSection` component, its generated markup and the tokens package are not changed. Every other palette's hero is unchanged.

Picker: Joy Modern's row and the active swatch show the ember end of the sky, the brass seam and the midnight base, so the row differs from Joy Classic and Outdoor; swatch dots get a border that holds in dark mode.

## Acceptance criteria

- [ ] In the open picker, a person can tell Joy Modern from Joy Classic and from Outdoor by the dots alone, in light and in dark.
- [ ] With `modern` active, the Overview hero shows the First Light gradient, the diamond mark and the brass seam, in light and in dark, at 390x844 and 1280x800, from token variables only (no colour literal in the new CSS).
- [ ] Hero text and both buttons keep at least 4.5:1 contrast against the part of the sky behind them.
- [ ] With any other palette active the hero's computed background is unchanged (a Playwright test compares `classic` before and after a round trip through `modern`).
- [ ] An independent design check against the F-097 specimen finds no HIGH defect.
