---
title: "Fix mobile responsive layout and simulator emulation in Storybook Hub"
id: F-053
status: refined
from_idea: I-058
---

# Fix mobile responsive layout and simulator emulation in Storybook Hub

## Problem

When previewing the Storybook Hub Full page simulator (`#view-landing-preview`) in Mobile 375px or Tablet 768px viewports on desktop:
1. Feature cards are squeezed into a 3-column grid with text shredded character by character.
2. The pricing comparison matrix table is horizontally crushed and truncated.
3. The landing header nav shows all 5 desktop text links and buttons squeezed vertically into single-character columns instead of collapsing into the mobile hamburger menu drawer button.

## Why now

Storybook Hub is the primary demonstration artifact for the Joymify Design System and mobile preview looks severely broken.

## Sketch

1. In `apps/storybook-hub/build.js`, update `switchSimulatorViewport(width, btn)` to set `data-viewport="mobile"` for 375px and `data-viewport="tablet"` for 768px on `.simulator-frame`.
2. Add scoped simulator CSS in `apps/storybook-hub/build.js` for `.simulator-frame[data-viewport="mobile"]` and `[data-viewport="tablet"]`:
   - Hide desktop nav and show drawer menu button.
   - Stack feature cards into a 1-column layout with proper spacing and text wrapping.
   - Constrain sticky first column on pricing matrix to fit mobile viewport cleanly.
   - Stack hero and CTA actions vertically at full width.
   - Collapse bento grid and footer columns cleanly.
3. Update simulator status note.
4. Verify all Playwright visual tests and tokens unit tests pass cleanly.

## Acceptance criteria

- [ ] Mobile 375px simulator frame renders single-column feature cards with natural word wrapping.
- [ ] Mobile 375px simulator frame hides desktop navbar and displays mobile drawer menu button.
- [ ] Mobile 375px simulator frame formats pricing matrix table and cards cleanly without text clipping.
- [ ] All 611 Playwright regression tests and tokens unit tests pass with 0 errors.
