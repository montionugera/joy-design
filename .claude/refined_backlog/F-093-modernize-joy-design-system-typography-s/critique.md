# F-093 Design Critique (impeccable critique)

Date: 2026-11-04. Judged against `design-brief.md` and `PRODUCT.md`. Evidence: Storybook hub built from this branch, shot at 390x844 and 1280x800 in the default, `studio` and `honey` genres (`/tmp/f093-shots/`), `ui-visual-verify` layout lint (0 findings), plus a read of the component source.

**Overall: 6.5 / 10.** Plus Jakarta Sans is a real readability and freshness win over Inter. The genres and components are sound underneath. But the work as first committed did not actually load its new fonts, and the Studio palette lands on the exact look PRODUCT.md calls an anti-reference.

## What works

- **Plus Jakarta Sans reads friendlier than Inter.** Larger x-height and open apertures; the hub hero and buttons look current at both sizes. Thai falls through to Anuphan per glyph, which matches Jakarta's weight better than the old system Thai fallback.
- **Honey Quest has a clear voice.** Baloo 2 headings over Nunito body, pill buttons, and the amber primary with navy ink is warm without shouting. Navy ink on amber passes AA (contrast tests green).
- **No layout regressions.** Lint found no header wrapping, no horizontal scroll and no tap targets under 44px at 390px in any of the three genres.
- **Governance holds.** Zero hex literals and zero emoji in the six new twins (`lint-colors.sh` and the emoji check pass), parity check 0 violations, mute state is carried by icon + `aria-label`, not colour.

## Findings

### P0 (fixed in this branch)

1. **The new fonts never loaded.** The token stacks named Plus Jakarta Sans, Anuphan, Baloo 2 and Nunito, but the hub's Google Fonts link only fetched Inter, so every page silently rendered the old Inter look. The owner's main complaint (the font) would have shipped unaddressed. Fixed: hub link now loads all four (verified with `document.fonts.check` = true for Plus Jakarta Sans), and README tells consumers which families to load.
2. **Studio light ink used banned slate `#0f172a`.** The hub contract test failed on it. Fixed: `#141a33` (a navy ink tinted toward the brand, same contrast band).

### P1 (owner decision, filed, not changed here)

3. **Studio Prism is the Tailwind-default SaaS look.** Its accent is Tailwind `indigo-700` (`#4338ca`) and its neutrals are Tailwind `slate-200/400/600` (`#e2e8f0`, `#94a3b8`, `#475569`). PRODUCT.md names "purple primaries, slate-grey neutrals" as anti-reference #1. It is opt-in and meets AA, so it does not block, but it does not fix "colours feel old"; it swaps one default for another. Suggested direction: keep the density, retint neutrals toward the brand navy and use the brand gold or a single teal as the accent.
4. **Honey's light canvas is the cream/parchment band** (`#fbf6ea`, card `#fffdf7`). Cards barely separate from the page in the desktop shot. Warmth should come from the amber accent and rounded type; a near-white neutral (or a slightly deeper card) would read cleaner.
5. **The six new components are not in the Storybook hub.** Nobody can see SoundController, SoundTile, AudioPlayer, CommandPalette, FilterChips or InspectorPane at design.joymify.com, so they have never been looked at in pixels. Their visual quality is unverified.
6. **AudioPlayer has no loading or error state.** The brief lists buffering and decode-failed; the component has neither, so a slow or broken clip looks identical to a paused one.

### P2

7. **SoundTile hover-preview relies on `mouseenter`.** Mobile browsers fire it on tap, which starts the preview with no matching `mouseleave`, so the clip keeps playing. Gate the preview on `pointerType === 'mouse'`.
8. **Hero CTA stack at 390px has three different button widths** (default/studio shots). Pre-existing hub layout, not F-093.

## Verdict for ship

P0s are fixed and verified. P1/P2 are recorded as follow-ups; none breaks a gate or an acceptance criterion in `spec.md`.
