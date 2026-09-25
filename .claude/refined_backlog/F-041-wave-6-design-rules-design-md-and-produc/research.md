# Research — Wave 6: design rules, DESIGN.md and PRODUCT.md, README, AGENTS.md and enforcement gates

## Deferred items picked up from earlier waves

- **HUB-069 (from F-040): closed by F-041 Task 3.** `packages/icons/test/icon-parity.test.js` renders every icon in Svelte (`svelte/server`) and React (element tree) at defaults, a custom size and colour, and a custom stroke width, and requires the same SVG. It found and fixed: Svelte icons ignored `strokeWidth` (added the prop to all 138); 54 React icons stroked the root SVG, which outlined filled shapes and made `strokeWidth` a no-op (root stroke removed, child widths follow the prop); React `ZoomOut` drew a vertical bar instead of a minus; Svelte `Close` lacked `aria-hidden`/`focusable`.
- Review follow-up (tightened colour assertion): 13 filled icons (26 files) painted their knockout details with `var(--bg-canvas)`, a variable defined nowhere, so the detail rendered unpainted. They now use `var(--joy-surface-canvas)`, and the test allows only the colour prop or that knockout token.
