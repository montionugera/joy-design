# F-039 visual evidence (Wave 4: landing suite, hero and CTA depth)

Regenerate: `F039_SCREENS=1 PLAYWRIGHT_PORT=6120 pnpm --filter storybook-hub exec playwright test tests/screens-f039.spec.ts --project=desktop-chrome`
(spec: `apps/storybook-hub/tests/screens-f039.spec.ts`; skipped unless `F039_SCREENS=1`, and only runs on the `desktop-chrome`
project, so a normal Playwright run never rewrites these files). File names are `{name}-{theme}-{width}x{height}.png` with
theme `light` or `dark` and nominal viewport `375x812` (phone) or `1280x800` (desktop). Every shot runs with
`prefers-reduced-motion: reduce` emulated, web fonts loaded (`document.fonts.ready`), animations settled, and no toast open.
Whole-view shots grow the viewport to the content height so nothing is cut off. Every PNG is capped at 8000px tall: a taller
shot is split into `-part1`, `-part2`, ... files that abut top to bottom (the hub's own scroller is stepped one page at a time
when the view is taller than Chromium's 16384px screenshot limit, as `landing-blocks` is at 375px).

| Name | What it shows |
| --- | --- |
| `landing-preview-*` | Full "Landing Page Simulator" hub view (`#landing-preview`): simulator toolbar plus the whole simulated page, generated from the real components (header, hero, features heading, bento, pricing section, FAQ, CTA band, footer); the features heading and pricing section are added by the simulator around `LandingPage` output |
| `landing-blocks-*` | Full "Landing Blocks" hub view (`#landing-blocks`), split into parts (2 at 1280, 3 at 375) |
| `landing-page-simulator-*` | Only the `#simulator-page-container` element: the simulated page itself without the hub toolbar |
| `drawer-open-*` | Landing header menu opened on the preview at 375px (the Wave 3 Drawer as a bottom sheet with the navigation links) |
| `hero-states-*` | "Hero states (HeroSection)" block: default with title emphasis, primary loading, primary disabled, both buttons as links |
| `bento-matrix-*` | "Bento grid (BentoGrid, BentoCard)" block: the showcase bento with 6/8/4/12-column cards |
| `pricing-cards-*` | "Pricing cards (PricingCard)" block: default and featured plans, then the loading and disabled button states |
| `pricing-comparison-*` | "Plan comparison table" block |

Every name exists at both widths in both themes except `drawer-open` (see below): 8 names x 4 = 32 states, minus the two
`drawer-open-*-1280x800` states = 30 states; `landing-blocks` adds `-partN` files, so the folder holds 36 PNGs.
Element shots (`landing-page-simulator`, blocks) are the element's own box, so their width is the hub content column minus
padding (for example 347 or 936 px), not the nominal viewport width.

Refreshed after the taste-review fixes (simulator now has a features heading and pricing section): the same 8 names at the same
widths and themes as before, 36 PNGs, stale ones removed (the two 375px `landing-blocks-*-part4` strips no longer exist because the
view now fits in 3 parts); every file is under 1 MB (largest `landing-blocks-dark-1280x800-part1`, 0.95 MB).

## Known deviations

- **Simulator frame width (assumption 5).** Layout breakpoints (the 767px mobile-nav rule, the 899px and 479px rules) are
  `@media` rules, which follow the real browser window, not the simulator frame. The "Mobile (375px)" frame in a wide window
  therefore narrows the frame but keeps the desktop layout rules, so the header can squeeze. The hub says so in the toolbar
  note ("The frame changes width only. Layout breakpoints follow the browser window"); this limitation is unchanged by the
  taste-review fixes. The screenshots and the contract use a real 375px viewport instead. Filed as a backlog idea (Wave 5 owns the hub chrome).
- **`drawer-open` is 375-only.** The header menu button (and the drawer it opens) exists only below 768px; at 1280 the
  navigation is inline and `.joy-landing-header__menu` is hidden, so there is no drawer state to capture. There is no
  `drawer-open-*-1280x800.png`.
- **Reduced motion is emulated for every shot.** The kinetic particle hero at the top of `#landing-blocks` is a canvas that
  stands still under `prefers-reduced-motion`, so its particle field in `landing-blocks-*` is a static frame, not the live effect.
- **Element shots are narrower than the viewport.** They are captured from the hub content column, so widths are 936/934 at
  1280 and 345/347 at 375, not 1280/375.
- **Not bit-for-bit reproducible.** Regenerating can change a few PNG bytes (for example `hero-states-light-1280x800`, which has
  a loading button) without any visible change; the dimensions are stable.

## Verdicts

Taste review (final record):

- Round 1: FIX (P0 0, P1 7, P2 16). T1 and T2 addressed all seven P1s (stats grid orphan, tag chips, dark CTA band, loading and disabled states, frame switcher, mobile stats, pricing in the simulator); round 2 confirmed six as fixed and the mobile stats one as partly fixed.
- Round 2: FIX (P0 0, P1 1, P2 about 9 open). The one P1 was the stats change pill cut off with an ellipsis at 375px and a cramped two-column grid in the hub blocks view. F1 fixed it: the pill wraps (balanced, at most two lines, never clipped), the hub demo wrapper no longer double-pads the stats on phones, and the grid drops to one column under 15rem of container. The screenshots in this folder pre-date that fix; the re-check is pending until they are regenerated.
- Round 3 (targeted re-check of the stats block and the 375/1280 acceptance views, both themes): PASS (P0 0, P1 0). P1-A is fixed in the simulator and in the hub blocks view; two new P2 polish items were recorded (see rulings-and-deferrals.md backlog).
- Accepted or known deviations (not fixed in this wave; see rulings-and-deferrals.md): disabled outline is close to the enabled outline in light; the featured plan has no lift; the pricing showcase rows use different card widths; the neutral trend is bare text, not a pill; the comparison matrix has no scroll affordance at 375px; the footer is one long column at 375px (two columns from 480px); features heading and pricing exist only in the hub simulator; the drawer link that renders underlined may be hover or focus rather than a state, not judgeable from a still.
