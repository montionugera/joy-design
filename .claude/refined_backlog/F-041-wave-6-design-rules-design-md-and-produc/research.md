# Research — Wave 6: design rules, DESIGN.md and PRODUCT.md, README, AGENTS.md and enforcement gates

## Deferred items picked up from earlier waves

- **HUB-069 (from F-040): closed by F-041 Task 3.** `packages/icons/test/icon-parity.test.js` renders every icon in Svelte (`svelte/server`) and React (element tree) at defaults, a custom size and colour, and a custom stroke width, and requires the same SVG. It found and fixed: Svelte icons ignored `strokeWidth` (added the prop to all 138); 54 React icons stroked the root SVG, which outlined filled shapes and made `strokeWidth` a no-op (root stroke removed, child widths follow the prop); React `ZoomOut` drew a vertical bar instead of a minus; Svelte `Close` lacked `aria-hidden`/`focusable`.
