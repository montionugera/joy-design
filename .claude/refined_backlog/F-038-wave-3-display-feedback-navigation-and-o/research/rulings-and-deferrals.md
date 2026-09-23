# F-038 rulings, deferrals, backlog ideas and lessons

Human-readable record of the decisions made while building Wave 3 (39 display, feedback, navigation and overlay components plus chart-core, Svelte and React). It is derived from the subagent-driven-development ledger, the lane reports and the review rounds. Those scratch files (`.superpowers/sdd/`) are git-ignored and are deleted at the end of the wave, so anything worth keeping is written here.

Companions in this folder: `issue-coverage.md` (status of all 203 audit findings, checked by `id-coverage.mjs`), `screens/README.md` (44 screenshots and the two hub views), and the two audits. Commit ids are the first 7 characters of the sha on branch `feat/F-038`.

Wave shape: 16 component lanes (B-L1..B-L8 Svelte, C-L1..C-L8 React) landed one lane at a time because all of them touch `packages/tokens/build.js`; foundations A1 (chart-core token mechanism) and A2 (parity checker) came first; D1 (strict lint), D2 (hub views, Playwright contracts, screenshots, taste review) and D3 (parity finalisation, docs) came last. Every lane and phase went through an independent code review (opus, plus a TypeScript reviewer for React), fix rounds, a re-review and a simplifier pass.

## 1. Rulings and plan amendments

Format: what was decided, why, cost if it turns out wrong.

### Foundations

- **RXD-010 plan gap (A1, ecf3a59 then 36942ff).** The plan's A1 "Closes" line claimed RXD-010 (crosshair pill colours in `chart-core.ts`) but no checklist item addressed it, and four other colour literals in chart-core were not in the audit at all. Ruling: extend `ChartPalette` with additive fields `accent` and `onAccent`, read the pill and the default series colour from the palette, and allowlist the two theme-branching translucent strokes (grid and crosshair lines). Cost if wrong: a slightly larger palette interface; the two strokes still use the `theme` option rather than CSS variables.
- **`lint-colors.allow` scoping (A1 review, 8636743).** The first allowlist entry was broad enough to excuse literals in other files. Narrowed to `chart-core.ts` only. Cost if wrong: none.
- **A1.3 was a no-op.** `.joy-chart__hud` blur and dark hex overrides (RXD-006/007) had already been removed by commit 13d7805 before the wave. Recorded as verify-only.
- **SVD/RXD "Closes" lists that named HUD text (SVD-092..095, RXD-001..003) belonged to the chart lanes, not A1.** They were ticked only when B-L8/C-L8 landed.

### Where CSS lives (standing rulings)

- **build.js is the single source of truth (C-L2 review, cf23e95; standing for every later lane).** Where both twins render the same `joy-*` classes, `packages/tokens/build.js` owns the rules; Svelte scoped `<style>` rules for those classes are deleted, and Svelte-only rules stay only when build.js has no counterpart. Why: B-L2's scoped blocks in StatCard and MetricTile overrode the CSS React used, so the twins rendered differently. Cost if wrong: re-add a scoped rule. Applied to StatCard, MetricTile, Alert, EmptyState, Breadcrumb and Progress; Image/ImagePreview scoped styles were removed once C-L6 ported their rules into build.js (RXD-017).
- **Plan file targets were often stale.** A self-grill-audit before execution found 9 of 12 spot-checked `build.js` selectors already tokenised (commit 13d7805) with the real violation in the component's own `<style>` block (Badge, Alert and others). Rule applied: grep the class in both build.js and the `.svelte` file before editing and edit where the violation actually is. Audit line numbers had drifted 130-330+ lines.
- **MetricTile border and radius (cf23e95).** build.js used `border-subtle` / `radius-control`; changed to `border-default` / `radius-card` (implementer judgement, matches the brief). Cost if wrong: a slightly stronger tile outline.

### Component decisions

- **Badge brand tokens (B-L1, 5bdeeb4).** The brief said `--navy-500`; navy-500 is a fixed `#14253e` (1.02:1 on the dark tint). Ruling: brand badge uses `--joy-accent-subtle` / `--joy-accent-text` (4.96:1 light, 7.94:1 dark). Cost if wrong: brand badges are gold-tinted rather than navy.
- **AvatarGroup `max` through `items` only (B-L1, 5ba96bd).** Svelte snippet children cannot be sliced; a MutationObserver that hid overflow nodes was rejected as fragile. Ruling: `max` truncates the declarative `items` prop and adds one `joy-avatar-group__overflow` "+N" avatar; for snippet children `max` is ignored. React implements `items` identically and can also slice a children array. Cost if wrong: Svelte consumers using snippet children get no truncation.
- **StatCard `trend` (B-L2, 6ea0fb5).** Direction was derived from the tone (positive/negative), which is wrong for a rising cost shown as negative. Ruling: optional `trend: 'up' | 'down' | 'flat'`, derived from the delta text through `delta-utils.ts` `deltaDirection` when absent; `deltaTone` only sets colour. `delta-utils.ts` is byte-identical in both packages. Cost if wrong: none beyond the extra prop.
- **Skeleton single wrapper and Alert dismiss model (B-L3, ce083dc).** Svelte Skeleton adopted React's structure (one wrapper carrying ref, class, style and one progressbar) and merges consumer style. Alert is uncontrolled: it hides itself and then calls `onclose` (no `open` prop); focus after dismiss is parked. Cost if wrong: a controlled `open` prop can be added later without breaking.
- **Menu keeps `role="menu"` (B-L5 review I3).** The ARIA practices guide says site navigation should not be `role="menu"`. The brief and audit asked for menu/menuitem with arrow-key roving because Menu is a generic antd-style component, so it was kept. Cost if wrong: screen readers announce "menu" for navigation-style usage; consumers can override `role` through rest props (hub topbar/sidebar may want that).
- **Pagination page-size select (C-L5 review M1).** An inline sizing style in both twins moved to a build.js class (`joy-pagination__size`), done by the pair simplifier in both twins together. Cost if wrong: none.
- **Steps icon fill (B-L5).** The brief's `--joy-accent-active` / on-accent pair measured 2.84:1; used `--joy-accent-text` for the fill. Pagination active states were also raised to at least 4.5:1 in a fix round (5d15177).
- **Progress default fill (B-L4 fix round, 2a483fd).** First pass used `--joy-accent-default` (2.16:1 light); final is `--joy-accent-text` (4.49 light, 9.48 dark). The `role="progressbar"` moved from an inner element to the root so it can carry an accessible name.
- **Notification/Message/Toast z-index (B-L4).** All three moved to `--joy-z-toast` (1100): above Modal (1050) and Popconfirm (1060), below Tooltip (1200). Intended.
- **Pre-existing bugs fixed in both twins (C-L4 review, 7f51b1b).** Notification called `onClose` twice after a dismiss, and React's auto-dismiss timer restarted on every re-render because `onClose` was an effect dependency. Ruling: fix in both frameworks through one byte-identical `auto-dismiss.ts`, plus a latest-callback ref in React and a Progress NaN clamp.
- **Popconfirm (C-L6, 5d253b4; D3.1, f377cf2).** The confirm button used a class that has no CSS (`joy-button--primary`); both twins now use `joy-button--solid` and a test asserts every `joy-button--*` modifier used exists in `theme.css`. React gained optional `onOpenChange`; Svelte's twin is `onopenchange`. Role is `alertdialog`.
- **React icons with invalid JSX (C-L6, 51b3c8f).** 54 files in `packages/icons/src/react/` had unbraced attribute values (`stroke=color`, `fill=color`); the tests transpile permissively so nothing caught it, but any real bundler would fail. Fixed mechanically in its own commit with a test that scans every React icon source. Cost if wrong: none; the regeneration path for these files is a backlog question (see section 3).
- **Modal/Drawer/ImagePreview details (B-L6, C-L6).** Consumer `aria-label` / `aria-labelledby` win over the component defaults in both twins; focus returns to the opener even when content uses `autoFocus` (`useOpener` records the opener during the render in which `open` flips); a shared `useDialog` hook holds the scroll-lock, trap, stack and Escape wiring in React.

### Overlay layer

- **Fallback positioning for panels not placed by the primitive (B-L6 review I1, 4ddad97).** The wave removed hand-rolled positioning from Dropdown and Popconfirm, so React twins and static hub demos rendered in flow. Added `:not(.joy-overlay)` absolute fallbacks in build.js; `openOverlay` adds `.joy-overlay` and inline `position: fixed`, which disables them. Cost if wrong: an extra fallback rule.
- **Dialog stack (B-L6 review I2, 4ddad97).** Escape used to close nested dialogs together. Added `registerDialog()` to the shared `overlay-utils.ts` (byte-identical in both packages); Modal, Drawer and ImagePreview act on Escape only when topmost and `preventDefault()` the key. Both guards are needed because a re-render can unregister the inner dialog before an outer dialog's listener runs.
- **Exit animation deferred (B-L6 review I3).** Modal and Drawer render conditionally, so only an enter animation exists; an exit needs mounted-state orchestration in both frameworks. Spec item 3 asks for enter and exit at 200ms. Reported to the owner as a spec gap. Cost if wrong: dialogs disappear instantly.
- **Scrim token (B-L6).** The spec names `--joy-surface-overlay` at 60%, but that token is white in light mode and the inverse surface turns cream in dark. Used `color-mix(in srgb, var(--joy-color-navy-900) 60%, transparent)` (85% for the ImagePreview mask), theme-invariant and near-black. This is a documented amendment to the spec wording. Cost if wrong: none visible; a dedicated scrim token would be cleaner.
- **`--joy-z-backdrop` unused.** The backdrop is the panel's parent, so the token exists but no rule uses it.
- **Reduced motion.** The plan said animations are not covered by the Wave 1 global reduced-motion block; that was wrong: the block sets `animation-duration: 0.01ms !important` for every `joy-*` element. Lanes still added targeted guards where the plan asked (Skeleton static block, Spin slowed rather than stopped so the loader still signals loading).

### Gates and process

- **Strict lint over listed files, not whole directories (plan amendment at the end of the chart lanes; D1, 3a7c166).** The plan's D1.3/D3.3 ran `lint-colors.sh --strict packages/svelte/src/lib packages/react/src`. Landing sections and Wave 4/5 files still carry violations (38 WARN files at baseline; 6 remain), so a directory-wide strict run cannot pass. The spec's acceptance is "passes for all listed files": `strict_file_pattern` now lists the 21 Wave 2 controls, the 39 Wave 3 components in both packages and the shared helper modules (138 files), all clean. A directory-wide flip belongs to the wave that clears the last file. Cost if wrong: none; the gate is narrower than the plan text and matches the spec.
- **Pair simplifier batching (from B-L3).** One simplifier pass per twin pair (B-Lx plus C-Lx) over the pair's combined range instead of one per lane; the two lanes are the same subsystem. B-L1/B-L2 and C-L1 had their own passes before the rule. The chart pair ran as a single combined batch.
- **No prettier pass (C-L3).** The plan's rule-6 idea (format touched files) was dropped: the repo has no tracked prettier config and 73 of 74 React files already fail `prettier --check`, so formatting would be a whole-file scope-creep diff. Formatting is left to the repo owner.
- **Quality-gate sub-steps in the plan (.7/.8) were superseded** by the SDD skill's own reviewer step; the implementer stops after verify and commit, the orchestrator dispatches the reviewer. Review verdicts were logged in the ledger rather than in `research/review-*.md`; this document is the durable record.
- **Briefs extracted by `sed`.** The task-brief script needs "### Task N" headings; the plan uses "### A1 -" style headings by instruction, so briefs were cut with sed and given the global constraints plus a phase preamble.
- **Implementer force-committed an SDD report (B-L7, bcefcff).** Untracked in the fix round (7679973). `.superpowers/` is git-ignored and must never be committed.

### Hub, tokens and evidence (D2)

- **Tag close hit area stays 34x44 (D2b code review ruling).** The spec says 44px hit; widening the hit box to 44 wide would overlap neighbouring tags (tag lists use an 8px gap). The hit area grows toward the right and vertically only. Alert and Toast close buttons get the full 44x44. The acceptance bullet itself names only pagination, tab and menu controls. Documented in the contract test comment and `screens/README.md`. Cost if wrong: a slightly smaller horizontal target for the tag close icon.
- **Taste review fixes were measured, not asserted (D2b fix round 1, 871a81d).** Seven visual findings were addressed with measured contrast: dark table separators 1.05 to 1.34:1, Popconfirm sheet radius and elevation (a cascade bug), primary tag text 2.62 to 5.43:1 by using `--joy-accent-text`, lifted dark chips and alerts. One finding was wrong and skipped: the claim that the dark modal scrim is weaker than the drawer's (both use the same rule). The reviewer also suggested tokens (`--joy-surface-hover`, `--joy-scrim`) that do not exist; fixes used existing tokens only. The tracked ALL-CAPS demo labels in the hub predate this wave and were filed, not fixed.
- **tokens.json hand-edit incident and correction (D2b fix rounds 1 and 2, 21a69aa).** In round 1 the implementer edited the generated `packages/tokens/tokens.json` (dark `border-subtle` and four dark status fills) without changing the generator `packages/tokens/scripts/ramps.mjs`, so the next regeneration would have silently reverted the change. Found in review. Round 2 moved the values into `ramps.mjs` (literals in the semantic dark layer, following the existing `accent.subtle` convention), regenerated to an identical `tokens.json`, added guard tests (`tokens.json` deep-equals `generateAllTokens()` output; `theme.css` contains the values), and produced a global dark contrast report. Because the tokens are global, every consumer of dark `--joy-border-subtle` and `--joy-status-*-bg` changes. Cost if wrong: revert the five literals in `ramps.mjs`.
- **Whole-view screenshots grow the viewport to content height** so nothing is cut off; overlay shots use a plain viewport. The overflow contract measures elements and scroll containers, not `document.scrollWidth`, because the hub sets `overflow-x: hidden` on the body (that metric alone can never fail). Allow-list of real scroll regions: the scroll Table container, the tabs list, the breadcrumb under 768px.
- **Hub tooltip fix (2acad52).** The always-open static Tooltip demo covered dialogs; hidden while a hub dialog is open, restored after, with a regression test.

### Parity finalisation (D3.1)

- **Svelte `ImagePreview` handler rename is a BREAKING change (3feae32).** `onClose` / `onChange` became `onclose` / `onchange` to satisfy the spec's casing rule (Svelte lowercase, React camelCase). The component shipped in release 2.16 with the camelCase names, so external Svelte consumers break. The internal consumer (`Image.svelte`) was updated; the hub demo is static. Needs a release note. Cost if wrong: keep the old names as aliases (not done).
- **Twin fixes.** Svelte Popconfirm gained `onopenchange`; Svelte Divider gained `aria-orientation="vertical"`; Svelte ImagePreview navigation now advances and clamps like React (root cause: `current = 0` default made the preview always "controlled" at index 0); React `Image` lost its dead `placeholder` prop; React `Form` emits `joy-form--<layout>` like Svelte (additive).
- **Checker regression caught and restored (3feae32).** The first D3.1 checker version dropped CSS custom properties and dynamic class prefixes from the class diff entirely, so one-twin drift on them was invisible (the old checker caught it). Restored in the twin diff (exempt only from the undefined-class check) with tests; five new mutations are caught, and the previous checker missed all five. Handler casing is now enforced per side with an empty exceptions set.
- **Benchmark flake stabilised (293e6b2).** The `findVisibleRange < 5ms` test failed sporadically (a 0.003ms call once measured 9.7ms after a scheduler stall). Timing tests now warm up and use the median of 9 runs with unchanged budgets. The weakness of the benchmark itself is parked (section 2).
- **`precheck.sh` and the SDD workspace.** `scripts/precheck.sh` exits 1 only because its emoji scan flags git-ignored SDD scratch under `.superpowers/`; a copy that skips it exits 0. Run precheck from a clean tree after the SDD workspace is deleted.

## 2. Deferred and parked items

The two deferred audit issues (SVD-032 Flex responsive direction, SVD-097 iOS scroll lock) are in `issue-coverage.md`. Everything below was found in review, judged not worth blocking the lane, and recorded. "Both" means both twins.

### chart-core and charts
- Palette re-read through `getComputedStyle` on every mousemove and wheel; cache it in `render()`.
- Grid and crosshair strokes still use the `theme` option rather than CSS variables (allowlisted); no typed `CustomEvent` declaration for `joy-theme-change`.
- Multi-series charts without explicit colours draw every series in the accent colour (pre-existing).
- Crosshair overlay keeps its old colours until the next mouse move after a theme change; only the root `data-theme` attribute is observed.
- Empty candlestick data renders an empty summary table; `open === 0` shows `+0.00%` in the up colour; duplicate series ids throw in Svelte; the canvas image and summary table are not linked with `aria-describedby`; hover HUD classes are tested by source text only.

### Parity checker and gates
- Comment stripper is regex-based (`//` inside non-URL strings); the rest-spread regex also matches plain object spreads; `wave-3.test.js` needs a built `dist/theme.css` like four older tests; no `tsc` or eslint runs over `scripts/*.mjs`.
- Handler-casing pattern would misfire on props like `once`, `online`, `only`, `one` on the React side; dynamic-prefix separator collapse; `classes()` reads comments.
- Benchmark budgets (25/5/25/30ms) are 14x-1800x above actual timings, so a 300x slowdown would still pass (pre-existing; not this wave).
- `test-lint-colors.sh` PricingCard case asserts exit 0 only, not that a WARN line appears.

### Avatar, AvatarGroup, Badge, Tag, Divider
- AvatarGroup `max` test is source-string only (no Svelte SSR render helper exists); `max=NaN` drops all avatars; overflow size follows `items[0]`; text and Fragment children count toward `max` in React.
- Tag close hit area is 34x44 and needs at least `--joy-space-2` between tags; Tag spreads `{...props}` last so a user `onClick` overrides the checkable toggle (pre-existing); `TagProps.onChange` type conflict; duplicate Badge styles and default avatar contrast (review mediums); Avatar `imgError` is not reset when `src` changes (both).
- `.joy-avatar__fallback { line-height: 1 }` added in build.js also reaches TestimonialCard (Wave 4 file); eyeballed in D2 screenshots.

### MetricTile, StatCard, Statistic, Space
- StatCard/MetricTile label size differs between the old Svelte scoped style and build.js (resolved by the single-source ruling); tests were source-text based; add `clip-path: inset(50%)` to the screen-reader-only text; hub demo arrows use `&uarr;` / `&darr;` (fixed in D2).
- `joy-statistic__value` has no CSS rule in either twin (structural hook, allowlisted); `.joy-space` layout has no build.js rule (Space sets its gap inline).

### Alert, EmptyState, Result, Skeleton
- Alert focus drops to the body after dismiss; Alert border is about 1.7:1 against its fill (decorative); dismiss test is source-order based.
- Skeleton progressbar has no accessible name in either twin; Svelte Close icon lacks `aria-hidden`.
- Possible flaky benchmark (fixed, see above); 451 `node_modules` files are tracked in git (pre-existing).

### Message, Notification, Toast, Progress, Spin
- Spin has no text alternative without a `tip`, and `aria-busy` silences the status; spinner is 2.5:1 on light (pre-existing); Progress exception status is not exposed to screen readers.
- Message and Notification set both `role="alert"` and `aria-live="polite"`; Toast `||` should be `??`; Spin now puts `className` on the root (public change, unused in the repo); `useMemo([])` holding the auto-dismiss helper should be `useRef`; `Infinity` duration fires immediately (pre-existing); no DOM harness for these.

### Anchor, Breadcrumb, Menu, Pagination, Steps, Tabs
- Breadcrumb 4px padding on phones shifts the text (compensating margin suggested); dark active-hover shadow is faint; redundant `role="navigation"` on `<nav>` (Anchor and Pagination, both twins, existing tests assert it).
- React Menu and Pagination uncontrolled state does not self-update while Svelte's does (behavioural gap between twins, pre-existing); the Pagination `matchMedia` effect is untested; Anchor controlled-to-uncontrolled stale key; the `.joy-anchor__ink-ball` is not rendered by either twin (CSS only).
- Hub Pagination demo arrows (`&larr;`/`&rarr;`) were replaced in D2.

### Modal, Drawer, Popconfirm, Dropdown, Tooltip, ImagePreview
- Modal-in-Drawer registered in the same render can get the wrong stack order in `registerDialog` (both twins, shared primitive; parked backlog).
- Focus-trap gap after a click on non-focusable content; safe-area strip colour on notched iPhones; Dropdown ArrowUp on an open trigger no longer jumps to the last item; `maskClosable` not added (backdrop click always closes).
- `dialog-hooks` merged ref ignores React 19 callback-ref cleanup; concurrent-render edge cases; `theme.css` class check uses a prefix substring.
- Hub overlay icon stroke is 1.5 rather than 2; hover-then-blur hides the hub image overlay while still hovered; Svelte ImagePreview uncontrolled navigation parity was fixed in D3.1.

### MarkdownViewer, Splitter, Table, Timeline
- Bold and code nesting render differently in the two MarkdownViewer twins; `aria-sort="none"` is set on every unsorted header; `setPointerCapture` is not in try/catch; the copy button name stays "Copy code..." while its visible text says "Copied".
- Pinned-column separator on a hovered row in dark is 2.85:1 and untested; splitter `min-height: 12rem` when stacked; hub copy button label fixed in D2.

### Hub, tokens and tests
- Hub-wide tracked ALL-CAPS demo labels (banned pattern, older than this wave); hub tests have no typecheck script and use `as any`; popconfirm sheet fill could be `surface-raised`; dark danger alert fill is heavy; hub card-header rule is near-white.
- Muted text on a dark status fill is 4.12-4.33:1 (latent: no shipped rule does it); dark alert border is 1.5:1 (decorative); the documented dark-fill contrast ranges differ between `screens/README.md`, the `ramps.mjs` comment and measurements.
- Playwright config defaults to port 6116, so two worktrees running Playwright at once silently reuse each other's server (this wave used 6117); the contract suite passes `--repeat-each=3` on both projects with no flake.
- The tracked `screens/README.md` originally said taste and code review "pending"; the verdicts are recorded in section 4.

## 3. Backlog ideas (file, do not chase)

1. **Add a `tsc --noEmit` gate for `packages/react`** and install `@types/react`; fix `packages/react/package.json` `types` (it points at a missing `src/index.d.ts`). Today there is no tsconfig, so implementer claims of "tsc passes" are meaningless and strict TypeScript errors in tests go unseen.
2. **Hub-wide ALL-CAPS demo labels** (tracked uppercase text, a banned pattern) predate this wave; fix in the hub-chrome wave.
3. **Modal-in-Drawer same-render registration order** in `registerDialog` (shared primitive, both packages).
4. **Exit animations for Modal and Drawer** (needs mounted-state orchestration in both frameworks; spec item 3 gap).
5. **iOS scroll lock (SVD-097)**: save and restore `scrollY` with `position: fixed` in `lockBodyScroll`, both copies.
6. **Playwright config default port**: derive the port from the worktree path or fail when the port is already serving another worktree.
7. **Audit authoring**: compute summary counts mechanically. The React audit's summary said 24 P0 while its table has 33 (`grep -c '| P0 |'`); in total the two audits hold 60 P0, 137 P1 and 6 P2.
8. **Benchmark thresholds are too loose** (14x-1800x above measured) to catch regressions; tighten or use relative baselines.
9. **Icon package regeneration path**: the 54 invalid JSX files were fixed by hand; find out how `packages/icons/src/react/*.tsx` are generated and fix the generator so it cannot reintroduce unbraced attributes.
10. **Parity checker readability**: `scripts/parity-check.mjs` is about 700 lines of regex heuristics; consider splitting extraction, rules and reporting, and moving to a real parser (Svelte compiler AST, TypeScript AST) if it keeps growing.
11. **Flex responsive direction** (SVD-032) as a feature for a later wave.
12. **A dedicated scrim token** (for example `--joy-surface-scrim`) instead of mixing `--joy-color-navy-900` in each rule, and a decision on the unused `--joy-z-backdrop`.
13. **Split `packages/tokens/build.js`** (about 5,000 lines across three waves) into per-category files before it becomes unreviewable.
14. **Dark alert/badge fills and text roles**: add a token-doc note or test that only `status-*-fg`, `text-primary` or `text-secondary` belong on `status-*-bg`.
15. **Remove tracked `node_modules`** (451 files are committed) and add a Svelte SSR render helper so behaviour such as AvatarGroup `max` can be render-tested instead of source-string tested.

## 4. Process notes and lessons

### Review-loop statistics (from the ledger)

- 16 component lanes, 2 foundation tasks, 3 phase-D batches (D2 split into D2a and D2b). Every task got an independent review; every fix round was followed by a re-review, and every re-review ended in APPROVE.
- **17 fix rounds** in total (limit was 5 per task; the most any task needed was 2). By task: A1 1, A2 1, B-L1 1, B-L2 2 (one round plus a follow-up), B-L3 1, B-L4 1, C-L4 1, B-L5 1, B-L6 1, C-L6 1, B-L7 1, D2a 2, D2b 2, D3.1 1. Zero fix rounds: C-L1, C-L3, C-L5, C-L7, the combined chart batch (B-L8 plus C-L8) and D1.
- Pair simplifier passes ran after each B/C pair; the B-L6/C-L6 simplifier output was re-reviewed on a real react-dom plus jsdom StrictMode harness and judged byte-identical in behaviour.
- Final test counts at D3.1: icons 2, tokens 77, svelte 95, react 105 tests, all green; Playwright 82 passed 0 failed after D2b round 2 (`--repeat-each=3`: 144 passed, 0 flaky); strict lint clean over 138 files; parity clean over 60 components with 10 of 10 mutations failing the default mode.
- Review verdicts: D2b taste review first FIX (0 P0, 7 P1) then PASS after the fix rounds (P2s only); D2b code review first spec pass / quality fail, then APPROVE with 12 mutation tests failing as they should; D3.1 first spec fail then APPROVE; wave-level review of the spec's acceptance list and the final precheck are performed in D3.3/D3.4.

### Defects reviewers caught that implementers and tests missed

- **chart-core TDZ bug (A1 review).** The bar-series `color` was used before its declaration, a pre-existing ReferenceError that B-L8/C-L8 would have hit.
- **Notification double `onClose` and timer restart (C-L4 review).** Present in both twins for a long time; tests did not exercise dismissal-then-timer.
- **Focus return with `autoFocus` content (C-L6 review).** The opener was captured after focus had already moved; a mutation of the fix fails the regression test.
- **Dead `joy-button--primary` class (C-L6 review).** Popconfirm and 7 hub call sites used a class with no CSS, so the confirm button was unstyled; found by checking classes against `theme.css`.
- **54 invalid JSX icon files (C-L6 implementer and review).** Real bundlers would fail; test transpilation tolerated them.
- **Rest-spread regex false-fails (A2 review).** The `forwardRef` check rejected Rate, Switch and Tag; fixed with a behaviour-tested, comment-safe detector.
- **Checker weakening (D3.1 review).** A "cleaner" checker silently stopped seeing custom properties and dynamic prefixes; caught by mutation testing against the old checker. Also A2's `wave-2.test.js` had been relaxed to make a test pass, and was restored.
- **Scoped Svelte styles overriding shared CSS (C-L2 review).** Led to the single-source-of-truth ruling.
- **Hand-edited generated file (D2b).** `tokens.json` edited without its generator; reviewers checked generator output equality.
- **Overlay defects (B-L6 review).** Escape closing nested dialogs together, panels losing positioning after primitive migration, no exit animation.
- **Table scroll region not keyboard-scrollable, sticky z-index escaping (B-L7 review).** Fixed with `tabindex`, `role="region"` and `isolation: isolate`.
- **Purple scan missed semi-transparent purple (D2b code review).** Replaced by a hue-based test proven by mutation.
- **Progress role on an inner element (B-L4 review)**, and contrast regressions from token swaps (default fill 2.16:1, pagination active 2.62:1, hover 4.20:1).
- **Taste review found real visual defects tests could not:** flat dark table, popconfirm sheet covering the modal footer, gold tag text at 2.6:1, near-invisible dark chips and alert fills.

### Lessons

1. **Trust the code, not the audit's line numbers.** Audit targets had drifted by hundreds of lines and about half of the `build.js` colour findings were already fixed by an earlier commit; grep before editing and record verify-only honestly.
2. **A plan "Closes" list is a claim, not an action item.** RXD-010 was claimed by A1 with nothing in the checklist to do it. Check each claimed ID has a step.
3. **Single source of truth beats parity by discipline.** Once build.js alone owned shared classes, whole classes of twin drift disappeared.
4. **Mutation-check the gates.** Every checker and contract test in this wave was proven by breaking the code and watching the test fail (purple scan, parity checker, lint fixtures, token guard). Three checker weaknesses were only found that way.
5. **Generated files have generators.** Edit `ramps.mjs`, regenerate, assert equality.
6. **Real-runtime checks find what source-text tests cannot.** The reviewers' jsdom StrictMode and real-chromium harnesses found focus, Escape-stack and HUD-overflow issues that string-matching tests passed. Several lane tests remain source-text based (listed in section 2); a Svelte SSR helper would help.
7. **Measure taste claims before acting on them.** One taste finding was factually wrong (modal versus drawer scrim) and two suggested tokens did not exist; measuring first avoided churn.
8. **Global token changes need a global contrast report.** The dark `border-subtle` and status-fill change touches every consumer; the report and guard tests are what make it safe.
9. **Keep evidence in tracked files.** The SDD ledger is deleted at wave end; the coverage table, this document, the plan's execution notes and `screens/README.md` are the durable record.
10. **Do not run two Playwright suites on the default port.** Servers are silently reused across worktrees.
11. **Breaking renames need a release note.** The ImagePreview handler rename fixes a casing rule violation but breaks Svelte consumers of a component shipped in 2.16.
12. **Self-grill-audit before execution paid off.** It caught a 21-versus-19 `REF_FORWARDING` list (Notification and Popconfirm already had `forwardRef`, which would have made the baseline gate a false positive), the wrong P0 count in the audit prose, two spec items with no task (Progress `role="progressbar"`, Menu 44px), a stale Badge target, and the need to serialise every lane's `build.js` edit.

### Verdict record (the placeholders in `screens/README.md` are replaced by these)

- Taste review of the screenshots: FIX (0 P0, 7 P1, plus one hub-wide older finding) after D2b; PASS (0 P0/P1, P2s only) after fix rounds 1 and 2.
- Code review of the hub specs and tokens: quality gaps found (hue-based purple scan, tag close hit-area deviation, hand-edited tokens.json), all fixed and re-reviewed APPROVE.
