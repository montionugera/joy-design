# F-040 HUB issue coverage ledger

Date: 2026-09-25. Branch `feat/F-040`, base `3ec91b2`, checked against committed HEAD `8a34e15`.

Every HUB-001..HUB-070 row from `research/audit-hub.md` was checked again against the current code. The audit's line numbers are stale: Waves 1-4 moved and fixed a lot of this code before F-040 started. The checks were greps of `apps/storybook-hub/build.js` at the base (`git show 3ec91b2:...`) and at HEAD, `git log -S` to find which commit removed each pattern, a read of `apps/storybook-hub/tests/contracts.spec.ts` and `packages/tokens/dist/theme.css`, and `bash scripts/lint-colors.sh --strict apps/storybook-hub/build.js`, which reports `0 violation(s)`. Playwright was not run for this ledger. Where a row cites a contract, that contract guards the fix; the ledger does not claim a fresh run of it.

Another session had uncommitted edits in the worktree when this ledger was written (`README.md`, `build.js`, `contracts.spec.ts`). Counts below come from committed HEAD.

**Statuses**

- **resolved-F040**: fixed by a commit in `3ec91b2..HEAD`. The row cites the short sha and the guarding contract, if there is one.
- **resolved-earlier**: already fixed in the base `3ec91b2`, which includes Waves 1-4. The row says what was checked.
- **not-applicable**: the thing the audit described no longer exists. The row says what replaced it.
- **deferred**: still true, and it belongs to another wave. The row names the owner.
- **open**: still true, and no wave owns it.

The audit suggested hex fallbacks such as `var(--x, #c49a3a)`. The token-only rule supersedes those suggestions. There are 0 six-digit hex literals in `build.js` at base and at HEAD.

## Ledger

| ID | Pri | Status | Evidence | Reason if deferred |
| :--- | :--- | :--- | :--- | :--- |
| HUB-001 | P0 | resolved-F040 | b81ccce: below 767px the topbar holds the menu button, the brand and the theme toggle, and the framework switcher moves into the drawer (`.framework-pill--topbar` hidden, `--drawer` shown). Guarded by Contract 9 (phone chrome) and Contract 6 (every view at 375). | |
| HUB-002 | P0 | resolved-F040 | 922d94e removed the `div[style*=...]` dark hacks: 3 at base, 0 now. `[data-theme="dark"]` rules went from 53 to 5, and the chrome now uses `--hub-*` semantic aliases. Guarded by Contract 7 (theme before first paint) and Contract 8 (chrome contrast). | |
| HUB-003 | P0 | resolved-earlier | No purple at base. `.brand-logo` uses `background: var(--joy-accent-default)`. | |
| HUB-004 | P0 | resolved-earlier | Base already had 0 `background-clip: text`. d819bc8 then replaced `.kinetic-title` with a HeroSection render. Guarded by Contract 6, which fails any element with `textClip`. | |
| HUB-005 | P0 | resolved-F040 | 9473ef3 wraps the token tables in `.hub-scroll-x` scroll regions with a label and `tabindex`. Guarded by Contract 6. | |
| HUB-006 | P0 | resolved-F040 | 9473ef3 wraps all 5 `.joy-props-table` in `.hub-scroll-x`. Guarded by Contract 6. | |
| HUB-007 | P0 | resolved-F040 | d819bc8: `hubKineticPalette()` reads theme tokens and refreshes when the theme changes. No foreign hex or rgba remains. Guarded by Contract 5. | |
| HUB-008 | P0 | resolved-earlier | Component CSS from c0ab4bd (Wave 3, in base) sets the horizontal grid only under `@media (min-width: 640px)` in `theme.css`, so the form stacks at phone widths. Contract 6 passes the forms views at 375. The 640-767 band is covered only by Contract 3's sampled in-between widths. | |
| HUB-009 | P0 | resolved-F040 | ee36ae8 sets `.hub-market-search` to `font-size: var(--joy-font-size-md)` below 767px. Guarded by Contract 9b. | |
| HUB-010 | P0 | resolved-earlier | Base has 0 `#7c3aed` and 0 `--joy-color-brand-primary`, and lint-colors strict passes. | |
| HUB-011 | P0 | resolved-F040 | The base dark sidebar was on tokens but mis-mapped (`border-right-color: var(--joy-surface-raised)`). 922d94e moved it to `--hub-*` chrome aliases. Guarded by Contract 8. | |
| HUB-012 | P0 | resolved-F040 | The base dark body used `color: var(--joy-surface-raised)`, which is surface paint used as text. 922d94e moved it to semantic aliases and resolves the theme in the head before first paint. Guarded by Contracts 7 and 8. | |
| HUB-013 | P0 | resolved-F040 | b81ccce adds the drawer focus trap and `aria-expanded` on the menu toggle. Guarded by Contract 2. | |
| HUB-014 | P0 | not-applicable | The hand-built simulated header with `padding: 18px 28px` is gone: 0 at base and at HEAD. It was replaced by the Wave 4 `joy-landing-header` component, which has its own menu button. Contract 6 passes the landing views at 375. | |
| HUB-015 | P0 | resolved-earlier | `theme.css` `.joy-markdown pre { overflow-x: auto }` is component CSS in base. Guarded by Contract 6 at 375. | |
| HUB-016 | P1 | resolved-F040 | ba2c760 removed the topbar `backdrop-filter: blur(12px)`. `backdrop-filter` now appears 0 times. Guarded by Contract 10. | |
| HUB-017 | P1 | resolved-F040 | ba2c760 removed the `.sidebar-backdrop` blur(4px). Guarded by Contract 10. | |
| HUB-018 | P1 | resolved-earlier | Base had no blur on `.kinetic-badge`: its only `backdrop-filter` uses were the topbar and the backdrop. d819bc8 later removed the badge. | |
| HUB-019 | P1 | not-applicable | The simulated landing header's inline blur is gone. It was replaced by the `joy-landing-header` component. Base already had no `backdrop-filter` outside the chrome. | |
| HUB-020 | P1 | resolved-earlier | Base has 0 `joy-button--glass`. The hero secondary action is `joy-button--outline`. | |
| HUB-021 | P1 | resolved-earlier | "Open Right Sheet (Risk Analytics) &rarr;" is absent at base. The Drawer demo is now a `hubCell("Drawer", ...)`. | |
| HUB-022 | P1 | resolved-earlier | Base had no `&rarr;` in pagination: its only arrows were the date-range separator and a toast. Guarded by Contract 10's arrow sweep. | |
| HUB-023 | P1 | resolved-F040 | ba2c760: the date-range separator is now `aria-hidden` "to". Guarded by Contract 10. | |
| HUB-024 | P1 | resolved-F040 | ba2c760: the toast now reads `start + ' to ' + end`. `→` now appears 0 times in build.js. | |
| HUB-025 | P1 | resolved-earlier | The "&bull; 99.99% Vultr Uptime" copy is absent at base. Base had only 2 bullets, both handled in HUB-026 and HUB-033. | |
| HUB-026 | P1 | resolved-F040 | ba2c760 removed the bullet from the Icon System heading. Guarded by Contract 10's middle-dot sweep. | |
| HUB-027 | P1 | resolved-earlier | The kinetic badge bullet is absent at base. d819bc8 later removed the badge. | |
| HUB-028 | P1 | resolved-earlier | The "perturb constellation &bull;" hint is absent at base: 0 matches for `perturb`. | |
| HUB-029 | P1 | resolved-earlier | "Zero OS Emojis" status bar is absent at base. | |
| HUB-030 | P1 | resolved-earlier | "Sub-5ms Finality" pill is absent at base. | |
| HUB-031 | P1 | resolved-earlier | "Kernel bypass colocation" has no bullet at base. It is now plain text (build.js:4516). | |
| HUB-032 | P1 | resolved-earlier | "Live Execution Ledger" is absent at base. | |
| HUB-033 | P1 | resolved-F040 | ba2c760 removed the bullet from the Splitter heading. Guarded by Contract 10. | |
| HUB-034 | P1 | resolved-earlier | `.simulator-label` was not uppercase at base and is now `font-size: var(--joy-font-size-sm)`. ba2c760 also removed tracked caps from `.nav-section` and `.hub-matrix__cell > h4`. Guarded by Contract 10. | |
| HUB-035 | P1 | resolved-F040 | ba2c760 removed the inline uppercase and tracking from the AvatarGroup title. `text-transform: uppercase` now appears 0 times. | |
| HUB-036 | P1 | resolved-F040 | b81ccce: `.mobile-menu-btn` is 44px (was `padding: 7px 10px`). Guarded by Contract 9's 44px hit areas. | |
| HUB-037 | P1 | resolved-F040 | b81ccce: `.sidebar-close-btn` is 44px (was `padding: 4px 8px`). Guarded by Contract 9. | |
| HUB-038 | P1 | resolved-F040 | b81ccce: in the drawer, `.framework-pill--drawer .framework-btn { min-height: 44px }`. Guarded by Contract 9. | |
| HUB-039 | P1 | resolved-F040 | d819bc8 made the heroes HeroSection renders on `joy-button--solid`. The Wave 2 styles provide the gradient, inset highlight, `translateY` hover, inset active state and accent elevation (`theme.css:422-425`, `2879`). Guarded by Contract 5. | |
| HUB-040 | P1 | resolved-F040 | Same as HUB-039: d819bc8 moved the CTA hero to HeroSection with the Wave 2 solid and outline buttons. No `rgba(0,0,0,...)` shadow remains. | |
| HUB-041 | P1 | resolved-F040 | ba2c760 added `@media (prefers-reduced-motion: reduce)` with no transition on `.sidebar` and the other chrome. Guarded by Contract 10's reduced-motion test. | |
| HUB-042 | P1 | resolved-F040 | ba2c760: `.view-panel.active` has no animation under reduced motion. Guarded by Contract 10's reduced-motion test. | |
| HUB-043 | P1 | resolved-F040 | d819bc8: the particle loop stops under reduced motion (`kineticReduce`), on coarse pointers, off screen (IntersectionObserver) and when the page is hidden. 8a34e15 repaints the still frame after fonts load. Guarded by Contract 5. | |
| HUB-044 | P1 | resolved-F040 | b81ccce replaced `z-index: 10/998/999` with `--joy-z-*` tokens (`sticky`, `backdrop`, `drawer`, `base`). Guarded by Contract 10's z-index token check. | |
| HUB-045 | P1 | resolved-F040 | d819bc8 removed the last numeric `z-index: 2`, on the kinetic overlay. `z-index: <number>` now appears 0 times in build.js. The simulated header's `z-index: 100` was already gone with that header (see HUB-014). | |
| HUB-046 | P1 | resolved-F040 | 922d94e: `.sidebar.open` uses `box-shadow: var(--hub-drawer-edge)`, which is elevation-3 in light and a 1px `--joy-border-strong` edge in dark. | |
| HUB-047 | P1 | resolved-F040 | 7a8d556 removed the placeholder shadows. `.playground-box` has `box-shadow: none` and a `--joy-border-default` border. | |
| HUB-048 | P1 | resolved-earlier | Base has no `#64748b` fallbacks and no hex at all. lint-colors strict passes. | |
| HUB-049 | P1 | resolved-earlier | Base has no `#f8fafc` fallbacks. | |
| HUB-050 | P1 | resolved-earlier | Base has no `#e2e8f0` fallbacks. | |
| HUB-051 | P1 | resolved-earlier | Base has no `#0f172a` fallbacks. | |
| HUB-052 | P1 | resolved-earlier | Base has no `#10b981` fallbacks. | |
| HUB-053 | P1 | resolved-F040 | The base dark `.tokens-table` was on tokens but mis-mapped: `th` text on `--joy-surface-raised`, `td` text on `--joy-border-default`. 922d94e removed those overrides, and tables use semantic aliases. | |
| HUB-054 | P1 | resolved-F040 | 922d94e removed the base dark `.component-card` override with its `box-shadow: 0 4px 12px transparent` placeholder. The card now follows semantic surface tokens. | |
| HUB-055 | P1 | resolved-earlier | The base sidebar already used `border-right: 1px solid var(--joy-border-default)`. | |
| HUB-056 | P1 | resolved-earlier | The base brand divider already used `border-bottom: 1px solid var(--joy-border-subtle)`. | |
| HUB-057 | P1 | resolved-earlier | The base `.playground-box` already used `var(--joy-surface-card)` and `var(--joy-border-default)`. | |
| HUB-058 | P1 | resolved-earlier | The base `.controls-table` was on `--joy-surface-card` and `--joy-border-default`. | |
| HUB-059 | P1 | resolved-earlier | The base `.segmented-control` was on `--joy-surface-sunken`. | |
| HUB-060 | P1 | resolved-earlier | The base `.tokens-table` was on `--joy-surface-card`. | |
| HUB-061 | P1 | resolved-F040 | b81ccce added the breakpoint ladder: 480, 767 (phone tier) and 899/900 (drawer). | |
| HUB-062 | P2 | resolved-F040 | Chrome text is on font-size tokens (ba2c760), guarded by Contract 10 over `HUB_CHROME`; the remaining hub-authored demo captions moved from 0.8125rem to `var(--joy-font-size-sm)` in 7985c43, and `grep -c 0.8125rem apps/storybook-hub/build.js` is 0. | |
| HUB-063 | P2 | not-applicable | The simulated landing nav with inline `0.875rem` and `rgba(255,255,255,0.7)` is gone. `rgba(255,255,255` appears 0 times at base and at HEAD. It was replaced by the `joy-landing-header` component. | |
| HUB-064 | P2 | resolved-F040 | b81ccce: `#mobile-menu-toggle` has `aria-expanded="false"`, and `toggleMobileMenu()` sets it. Guarded by Contract 2. | |
| HUB-065 | P2 | resolved-F040 | 922d94e: `aria-label="Switch to dark theme"`, updated to "Switch to <next> theme" on toggle. | |
| HUB-066 | P2 | resolved-F040 | 922d94e changed the label copy to "Dark theme" / "Light theme" (was "Dark Mode" / "Light Mode"). | |
| HUB-067 | P2 | resolved-earlier | The "Open Right Sheet (Risk Analytics)" copy is absent at base (see HUB-021). | |
| HUB-068 | P2 | resolved-F040 | b81ccce added a `.framework-btn:focus-visible` ring, shared with the menu and close buttons. | |
| HUB-069 | P2 | deferred | `packages/icons/test/icons.test.js` checks the dual Svelte and React exports and JSX syntax, but it has no test of size or colour prop parity across icons. | Icon package parity is outside the hub. The spec puts parity and docs in Wave 6, so the owner is Wave 6. |
| HUB-070 | P2 | resolved-F040 | 9473ef3 added Contract 6: every manifest view at 375 and 1280, in light and dark, with no overflow and no text clip. Contract 3 keeps the in-between widths. | |

## Totals

- resolved-F040: 37
- resolved-earlier: 29
- not-applicable: 3
- deferred: 1
- open: 0
- Total: 70

## Deferred items

- **HUB-069 (deferred, owner Wave 6).** There is no icon size or colour parity test between the Svelte and React packages. It belongs with the Wave 6 parity and docs work, not the hub.

## Follow-ups found during F-040 (outside the HUB audit, not fixed here)

- **P1 a11y, pre-existing:** the 38 sidebar nav items are rendered without an `href` (`navigationHtml` in `apps/storybook-hub/build.js`), so keyboard users cannot reach any view from the sidebar, and the drawer focus trap cycles only the close and framework buttons. File as its own idea; it changes navigation markup and the hash-routing contract.
- **Minor, from the final review:** a 640px rule still styles `.controls-table` / `.segmented-control` off the 900/767/480 ladder; two scrim recipes exist (the hub drawer and the landing simulator drawer); Contract 7 proves the OS-preference and saved-choice behaviour but not the script's position before the stylesheets.
- **Bug, pre-existing:** `handleDemoUpload` is called from the demo upload input's `onchange` and its dragger's `ondrop` (`apps/storybook-hub/build.js` ~2737/2744) but is never defined anywhere in the file - both calls throw `ReferenceError` if a user actually exercises the upload demo. File as its own bug fix.
- **Unverified at current line numbers:** a duplicate `id="demo-upload-input"` was reported at ~2737 and ~2801; only a single occurrence of that id exists in `apps/storybook-hub/build.js` as of this review round (grep count 1). Worth re-checking against the exact commit the finding was made on before filing, rather than assuming it still applies.
- **Remaining inline font-sizes, out of scope for this round:** ~20 other `font-size: 0.___rem` inline styles remain in `apps/storybook-hub/build.js` beyond the 4 overview hub-card descriptions fixed here (moved to `.hub-card__desc` / `var(--joy-font-size-sm)`). File as a follow-up sweep to move them to `--joy-font-size-*` tokens.
- **Release notes:** `packages/tokens` (RadioGroup) gained `flex-wrap` on `.joy-radio-group` during this feature's 375px content-cut-off fix (commit 9473ef3), so a horizontal RadioGroup with many options now wraps instead of overflowing. This is a shared-package behaviour change (not hub-only) and should be called out in the next `@joymify/tokens` release notes.
