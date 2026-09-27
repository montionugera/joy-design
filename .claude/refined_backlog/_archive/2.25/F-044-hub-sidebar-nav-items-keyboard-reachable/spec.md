---
title: "Hub sidebar nav items keyboard reachable via href"
id: F-044
status: refined
from_idea: I-049
---

# Hub sidebar nav items keyboard reachable via href

## Problem

`navigationHtml` in `apps/storybook-hub/build.js` renders the 38 sidebar nav items as
`<a class="nav-item" onclick="switchView('<id>')">` with no `href`. An `<a>` without `href`
is not focusable, so keyboard users cannot reach any view from the sidebar, and the mobile
drawer focus trap (which collects `a[href], button, ...`) cycles only the close and
framework buttons. Found in F-040 (`research/issue-coverage.md`, P1 a11y).

## Why now

Last open P1 accessibility gap from the E-001 audit; small and user-facing.

## Sketch

- Render `<a class="nav-item" href="#<id>" data-view="<id>">` and drop the inline `onclick`.
  Following the link changes `location.hash`; the existing `hashchange` listener
  (`syncViewFromHash`) switches the view, so no new routing is added. Browser history
  keeps working as before (hash navigation pushes an entry).
- `switchView` finds the active item by `data-view` instead of parsing `onclick`, and sets
  `aria-current="page"` on it (removed from the others).
- No change to the hash-routing contract: URLs stay `#<view-id>`.

## Acceptance criteria

- [ ] Every `.nav-item` in the built hub has `href="#<view-id>"` matching an existing `#view-<view-id>` panel, and no `onclick`.
- [ ] Pressing Tab from the page start reaches the sidebar nav items; pressing Enter on one shows that view and updates `location.hash`.
- [ ] Clicking a nav item still switches the view, marks it `.active` and `aria-current="page"`, and only one item carries either.
- [ ] With the mobile drawer open, the Tab focus trap cycles through the nav items (not only the close and framework buttons).
- [ ] Existing storybook-hub Playwright suite passes.
