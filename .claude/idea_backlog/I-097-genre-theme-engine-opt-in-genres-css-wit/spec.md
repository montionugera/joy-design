---
title: "Genre theme engine: opt-in genres.css with 5-axis game palettes (button/card decoration)"
id: I-097
status: idea
---

# Genre theme engine (opt-in `genres.css`)

## Goal
An app can `import '@montionugera/joy-tokens/genres.css'` and set `data-palette="cyberpunk|obsidian|astral|quantum|titanium"` to get a game-website look (decorated buttons, cards and badges, genre fonts, Thai/JA/ZH-safe typography) with zero change to apps that do not opt in.

## Non-goals
Changing `theme.css` or any default palette. New components. Publishing to npm/GitHub Packages (separate publish flow). Flutter/Swift twins.

## Rule for every change
Opt-in and additive: without `genres.css` imported, rendered output and `theme.css` bytes are identical to today. Tokens or nothing: no colour literals outside the token generator; button/badge ornaments are token-coloured (CSS mask + `color-mix`).

## Acceptance criteria (EARS requirements, each with Given/When/Then)
- [ ] 1. **Generated + exported.** `pnpm --filter @montionugera/joy-tokens build` shall emit `dist/genres.css` and `package.json` shall export `./genres.css`. Given a clean build, the file exists and `theme.css` does not contain any genre selector.
- [ ] 2. **Five presets on five axes.** Each preset shall override typography, silhouette, frame, atmosphere and a secondary accent (the vars in `GENRES.md` section 2). Given each `data-palette`, all axis vars resolve in light and dark.
- [ ] 3. **Button decoration.** `obsidian` and `astral` solid/outline/secondary buttons shall render as star-capped capsules (finials, lattice pattern, no overflow); `cyberpunk`/`titanium` use chamfer `clip-path`; `quantum` uses hard block shadows. Given a real browser render, no button text is clipped and finials stay inside the button.
- [ ] 4. **WCAG 2.2 AA.** Body/secondary/muted/link/secondary-accent text >= 4.5:1 on canvas/card/raised, button text on accent/hover/active >= 4.5:1, strong border >= 3:1, for all 5 presets in light and dark. Enforced by `packages/tokens/test/genres.test.js`.
- [ ] 5. **Multi-script.** Given `:lang(th)`, heading letter-spacing is `0em` and line-height >= 1.45 so chamfered buttons never clip tone marks; `:lang(ja|zh)` set `line-break: strict`.
- [ ] 6. **Parity + hub.** `LandingPage` in Svelte and React shall accept `palette: 'astral'`; the Storybook hub palette switcher lists the genres. `scripts/parity-check.mjs` stays green.
- [ ] 7. **Mobile.** Given a 390x844 viewport, genre buttons keep a >= 44px touch target and the page has no horizontal overflow.

## Failure twins
Without `genres.css` imported, `data-palette="cyberpunk"` falls back to the existing colour-only preset. Under `prefers-reduced-motion`/forced-colors, ornaments degrade to plain borders (no information carried by ornament alone).

## End-to-end verification
`pnpm check`, `pnpm -r test`, `node scripts/parity-check.mjs`, `scripts/lint-colors.sh`, hub build + Playwright palette-switcher spec green; phone + desktop screenshots of a button, card and badge in each genre (light+dark) read by a human reviewer.

## Interfaces & files
`packages/tokens/scripts/genres.mjs`, `packages/tokens/build.js`, `packages/tokens/package.json`, `packages/tokens/test/genres.test.js`, `GENRES.md`, `research/contrast-table-after.md`, `packages/{react,svelte}/src/**/LandingPage.*`, `apps/storybook-hub/build.js` + `tests/palette-switcher.spec.ts`.

## Alternatives considered
Fold genres into `theme.css` (rejected: bloats every corporate app). Per-component genre variants (rejected: breaks Svelte/React parity surface). Do nothing.

## Assumptions
- ASSUMED: work already written in WIP stash `genre-engine-wip-20261030`; this feature verifies, fixes and ships it — reversible: Y.
- ASSUMED: user request "do it via ps workflow and full promote" (2026-10-30) approves this spec; no separate approval gate.
