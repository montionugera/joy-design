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

## Sketch

- Picker: show only the warm end of the First Light gradient in Modern's first dot (for example the gradient token with `background-size`/`background-position`, or a new token for the ember stop), and give swatch dots a border that holds in dark mode.
- Site: one place that shows the theme's signature when `modern` is active (masthead or a theme page with the First Light sky and the seam). Needs a design pass (`impeccable`) and an independent design check against the F-097 specimen.

## Acceptance criteria

- [ ] In the open picker, a person can tell Joy Modern from Joy Classic and from Outdoor by the dots alone, in light and in dark.
- [ ] With `modern` active, at least one page of the design site shows the First Light gradient and the brass seam, from token variables only.
