---
title: "Production-grade design system: token-driven dark mode, mobile-first components, brand color ramps, hero CTA and full state coverage"
id: E-001
status: epic
---

# Production-grade design system

## Why

The owner's verdict on 2.23: "mobile and dark mode are noticeably sloppy; colors are not production grade; the hero button and components lack professional detail." A seven-lane audit (tokens, Svelte forms, Svelte display, Svelte landing, React forms+landing, React display, Storybook hub) confirmed it with file:line evidence. Root causes are systemic, not per-component:

1. **Foreign palette pollution.** 40+ `#7c3aed` purple fallbacks, Tailwind slate neutrals (`#0f172a #334155 #64748b #cbd5e1 #f1f5f9 #f8fafc`) and yellow-500 stars sit inside a navy/gold/cream/ink brand. Inputs flash purple on focus; badges and pricing cards are purple.
2. **Dark mode is patched, not designed.** 112 `[data-theme="dark"] .joy-*` overrides inside a 3,700-line CSS string in `packages/tokens/build.js` instead of remapping semantic tokens; dark border vs canvas is 1.43:1; shadows are black on dark; five landing components have no dark rules at all; `[data-palette="joymify"]` forces a dark canvas in light mode.
3. **Brand gold fails contrast where it is used as text.** `#c49a3a` is 2.36:1 on cream and 2.62:1 on white, yet it is used for links, stat values, outline buttons and the focus ring.
4. **Status colors are untuned Tailwind defaults** that fail as text (1.9–3.4:1) and under white badge text (2.2–3.8:1).
5. **No typography, incomplete spacing, radius-role and z-index scales** produce 113+ magic numbers and arbitrary z-indices; the Tailwind `@theme` export is corrupted by a blind `--joy-` to `--color-joy-` rewrite.
6. **Zero `prefers-reduced-motion` handling** anywhere.
7. **Mobile is not designed.** Fixed 44px/36px/32px headings overflow 375px, the landing header overflows by 188px with no mobile nav, bento spans do not collapse, touch targets are under 44px.
8. **AI-slop patterns baked in:** gradient text, side-stripe accents, decorative glass, tracked uppercase eyebrows, middle-dot meta strings.
9. **Svelte–React parity drift** in props, refs, event casing and CSS values.
10. **No enforcement.** No lint against foreign hex, no contrast test, no svelte-check/tsc gate, so every fix can regress.

Audit reports (issue tables with file:line and fixes) live in each slice's `research/` folder.

## Outcome

Once every slice has shipped:

- `packages/tokens` exposes a semantic layer (`--joy-surface-*`, `--joy-text-*`, `--joy-border-*`, `--joy-accent-*`, `--joy-status-*-{bg,fg,border}`, `--joy-focus-ring`, `--joy-elevation-*`, `--joy-z-*`, `--joy-font-size-*`, `--joy-line-height-*`, `--joy-space-*`, `--joy-radius-{control,card,overlay,pill}`) remapped once per theme under `[data-theme="dark"]`; every text/surface pair in both themes passes WCAG 2.2 AA and a test proves it.
- No `.svelte`, `.tsx`, or hub source contains a hex literal outside `packages/tokens/src/tokens.json`; `var(--x, fallback)` fallbacks are removed or equal the token value. A precheck lint enforces it.
- Every interactive component in both packages has default, hover, focus-visible, active, disabled, loading and error states, sm/md/lg sizes on one type scale, ≥44px touch targets on mobile, and identical props/classes/CSS between Svelte and React.
- The primary Button and hero CTA have production depth: same-hue two-stop gradient with top highlight, hover lift with brand-hue shadow, pressed inset, 3:1 focus ring, loading state, full width on mobile.
- All overlays escape clipping, trap focus where modal, close on Escape, use the semantic z-index scale, and animate with reduced-motion fallbacks.
- Landing suite and Storybook hub render at 375px with no horizontal overflow, fluid `clamp()` headings, a real mobile navigation, and designed dark mode.
- `README.md`, `AGENTS.md`, `PRODUCT.md`, `DESIGN.md` document the token contract, state matrix, mobile rules and bans; `scripts/epic-check.sh` runs the gates against the combined tree.

## Slices

1. Wave 1: semantic token foundation — light/dark remaps, brand-tinted ramps, type/space/z/shadow scales, reduced motion, foreign-hex lint and epic-check gate
2. Wave 2: hero-grade Button and form controls with full state coverage, Svelte + React parity
3. Wave 3: display, feedback, navigation and overlay components — dark mode, mobile, z-index, states, parity
4. Wave 4: landing suite — hero and CTA depth, mobile navigation, fluid headings, slop removal, dark treatment
5. Wave 5: Storybook hub — mobile layout, dark mode, hero, token-only colors, visual contracts
6. Wave 6: design rules, DESIGN.md and PRODUCT.md, README, AGENTS.md and enforcement gates
