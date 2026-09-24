# F-039 rulings, deferrals, backlog ideas and lessons

Human-readable record of the decisions made while building Wave 4: the 14 landing components (HeroSection, CTASection, PricingCard, PricingMatrix, FeatureCard, FeatureGrid, BentoCard, BentoGrid, LogoCloud, FAQSection, StatsSection, TestimonialCard, SiteFooter, LandingPage) in Svelte and React, their single CSS source in `packages/tokens/build.js`, and the two hub landing views. It is derived from the subagent-driven-development ledger, the lane reports and the review rounds. Those scratch files lived outside the repo (`/tmp/f039-sdd/`) and are not kept, so anything worth keeping is written here.

Companions in this folder: `issue-coverage.md` (status of all 168 audit findings, checked by `id-coverage.mjs`), `screens/README.md` (38 screenshots of the two hub views and the component states), and the audits (`audit-landing-svelte.md`, `audit-react-forms-landing.md`, `audit-standards.md`). Commit ids are the first 7 characters of the sha on branch `feat/F-039` (base 85141e1).

Wave shape: two foundation tasks (A1 parity checker Svelte ref/rest check, A2 shared SSR and loader test helpers), six component lanes run one at a time because all of them edit `build.js`, `scripts/parity-check.mjs` and `packages/tokens/test/wave-4.test.js` (L1 hero and CTA, L2 pricing, L3 feature and bento, L4 proof sections, L5a footer, L5b LandingPage), then hub work (C1a simulator, C1b blocks), Playwright contracts (C2), screenshots (C3), strict lint (D1), one taste review with two fix tasks (T1 components, T2 hub) and a second screenshot round. Each twin pair (Svelte file, React file, CSS block) landed in one lane commit so the twins never drifted. Every task went through an independent code review (plus a TypeScript/Svelte language review for code lanes), fix rounds, a scoped re-review and a simplifier pass.

## 1. Rulings and plan amendments

Format: what was decided, why, cost if it turns out wrong.

### Foundations and test helpers (A1, A2)

- **Parity checker gains a Svelte ref/rest check (A1, ff9475a then e96eaa6).** `SVELTE_REF_REST` lists components whose Svelte twin must declare `ref = $bindable(null)` in script and use `{...rest}` and `bind:this={ref}` in markup; HTML and JS comments are stripped first and generic `$bindable<T>(null)` is accepted. Lanes appended their names in the commit that made them clean, so every intermediate commit stayed green. Cost if wrong: none; it only adds a check.
- **The checker does not enforce root placement (A1 ruling).** It matches the React check: Modal and Drawer legitimately bind an inner element. Cost: a misplaced spread or `bind:this` can go undetected by the gate; lanes L2 to L5 covered this with behavioural tests (distinct-node client stand-ins that assert the root receives `bind:this`). Lane L1 (HeroSection, CTASection, LandingAction) did not: the final whole-branch review (final-B I-1) found dropped `ref` and Svelte handler wiring surviving every test, and F1 added the missing ref-placement, handler and LandingAction tests in both twins (each mutation goes red).
- **Shared test helpers (A2, 530480d).** `renderSvelte` / `compileSvelte` (SSR via `module.registerHooks`, a brief-sanctioned alternative to `module.register`), React `load-tsx.js`, token `css-tokens.js`. `compileSvelte(name).warnings` is how lanes assert zero compile warnings. Cost if wrong: none.
- **No DOM environment (plan assumption 11).** The repo has no jsdom/happy-dom and adding one is a lockfile change. Component click behaviour is therefore proven by (a) React element-tree tests with a small hook dispatcher that call the real `onClick`s, (b) Svelte tests that run the compiled client module against a recording stand-in for `svelte/internal/client`, and (c) Playwright against the hub. Cost: the Svelte stand-in depends on Svelte 5.57 compile-output shape and fails loudly on a Svelte bump; header comments name the pinned internals.

### Hero and CTA (L1, T1)

- **Primary CTA reuses the Wave 2 `joy-button--solid` depth.** No new tokens; L1 adds only hero-specific rules.
- **Hover lift is 1px, scoped (L1, c36b742).** The spec asks for a 1px lift; the Wave 2 base lifts 2px. The 1px override is scoped to `.joy-hero` and `.joy-cta-section` with a matching `:active` reset; the base rule is unchanged. Cost if wrong: a 1px difference between landing and other buttons.
- **`titleGradient` renamed `titleEmphasis` in both twins with no alias (breaking).** It renders `<span class="joy-hero__title-emphasis">` in solid `--joy-accent-text` (4.90 light / 9.16 dark on canvas), never a gradient. Why no alias: an alias would keep the banned gradient API alive. Cost: consumers passing `titleGradient` get no emphasis until they rename (release note).
- **`LandingAction` internal twin (L1).** Not exported. Without `href` it composes Button (size lg, owns loading and spinner); with `href` it renders an anchor with button classes, and a disabled or loading link drops `href`, gets `aria-disabled`, `role="link"`, `tabindex="-1"`, `aria-busy` and one spinner. Why: Button does not render anchors. Cost: LandingAction Props are not attribute-typed and it has no rest spread (backlog).
- **`.joy-button--glass` deleted (L1).** The class and its hover rule are gone; the two existing source-grep assertions were rewritten to assert absence; the four hub sites were switched to `joy-button--outline` in their own commit (56bd239) so the Playwright suite stayed green between commits.
- **Disabled anchors share the disabled look; `pointer-events: none` only on `[aria-disabled="true"]` (L1 fix round, 96b19d3).** The first cut put `pointer-events: none` on the shared `.joy-button:disabled` rule, a library-wide change (review Important). Cost: inert links lose the not-allowed cursor (backlog).
- **CTA band evolution (L1, then T1 79cf406).** L1 built a navy band on `--joy-surface-inverse` with `--joy-text-inverse` text, and a dark edge on the gold button via `border-color: var(--joy-text-on-accent)` because the gold fill on the cream dark band was 1.79:1. The taste review then found that the dark band flips to a full cream slab (inverse surface is cream in dark). Ruling (T1): one token-driven treatment in both themes: `--joy-surface-raised` plus an opaque radial `--joy-accent-subtle` wash, `1px --joy-border-strong`, elevation-3; title `--joy-text-primary`, description `--joy-text-secondary`, outline button transparent with a strong border. **The light band is no longer navy.** Why no `color-scheme`: `theme.css` declares no `color-scheme` (only the `[data-theme="dark"]` block and the `prefers-color-scheme` variable fallback), so `light-dark()` is not reliable, and a navy-in-light band would need either a theme-wide `color-scheme` change or a `[data-theme]` component selector (capped by phase-b and blind to OS-dark visitors). Cost: the light band is a lighter card than the original design intent; backlog item restores it theme-wide.
- **Disabled labels on the band are held to 3:1, live labels to 4.5:1 (T1).** `--joy-text-disabled` on dark raised is 4.23:1. WCAG 1.4.3 exempts inactive controls; the test also requires the disabled label to be dimmer than the live one. Busy (loading) buttons keep their variant look (gold gradient, `cursor: progress`, spinner in the label colour); disabled buttons keep a visible 1px border (measured minimum 2.79:1 in dark; floor 2.5, WCAG 1.4.11 exempt). Cost if wrong: a disabled label that some readers find faint.
- **CTA box-sizing overflow fixed at the root (L5b fix round, 5044994).** `.joy-cta-section` had `width: 100%` plus padding and theme.css has no global reset, so the band overflowed the page by 24-40px; `.joy-landing-page { overflow-x: clip }` had masked it. Now `box-sizing: border-box` on every landing rule with `width: 100%` plus padding or border (scan test); the guard stays as documented belt-and-braces.
- **Copy.** Sentence-case defaults; the audit's trading-specific CTA copy was declined for a generic library; no word over 12 characters in default copy (so audit suggestions such as "high-performance" and "Institutional" were rewritten).

### Pricing (L2, T2)

- **Featured border `--joy-accent-default` at 2.62:1 in light is kept (L2 ruling).** Decorative emphasis on a non-interactive card; WCAG 1.4.11 does not bind; emphasis comes from hue plus `--joy-elevation-2`, the badge and the solid CTA. Dark passes 3:1. A test pins light in [2.5, 3) to catch token drift. Cost: the featured edge reads faint in light (the taste review agreed: backlog "featured plan emphasis"); cheap fix is a `--joy-elevation-accent-1` ring.
- **Period and description use `--joy-text-secondary`, not `--joy-text-muted`.** Muted on raised is 4.23:1 in dark. Standing lane lesson: on raised surfaces use secondary text.
- **Matrix data props (L2).** `PricingMatrix` gains optional `columns`, `rows`, `rowHeaderLabel` (default "Feature") and `label` (default "Pricing plans"). With data it renders a `<table class="joy-table joy-table--scroll">` inside a focusable `role="region"` scroller, row labels are `th scope="row"`, booleans are labelled Check / Minus icons, and the pinned first column is capped (`max-inline-size: min(40vw, 14rem)`, border-box) with a logical `inset-inline-start: 0` override of Wave 3's physical `left: 0`. A lone `columns` or `rows` is ignored (documented, tested). `PricingMatrixRow` is exported from the React index.
- **Card layout: wrapping flex row replaces the under-900px stack (T2 fix round, afb4648).** The card branch of `.joy-pricing-matrix` is a wrapping flex row (children `flex: 1 1 min(100%, 16rem)`, border-box; four cards use a 24rem basis so they are 2 by 2), so a short last row grows to fill it and there is never an empty cell at any width, with no container or media query. It replaced L2's `max-width: 899px` one-column stack and the hub-only container-query wrapper; the wave-4 test was rewritten to the new rule. The 767px/899px media rules elsewhere in the wave keep the "under 768 / under 900" convention.

### Feature and bento (L3)

- **Card titles use the step scale, a deliberate deviation from spec item 2 (L3 fix round, 5ed2763).** Spec item 2 says every landing heading uses the display clamps. Feature card titles use `--joy-font-size-2xl`, bento titles `--joy-font-size-xl`; the two-column lead card keeps `--joy-font-size-display-sm` from 900px. Why: display clamps split words mid-word in 152-223px cards and flattened the hierarchy against the 40px section h2. Section headings (hero, CTA, FAQ, features heading) keep the display scale. Cost: none known; the taste review still flagged the bento title vs section heading as close (backlog).
- **`FeatureGrid` default `layout="lead"` (visible change).** From 900px: three columns, first card spans two, general rules (`:nth-child(3n):last-child` spans 3, `:nth-child(3n+1):last-child` spans 2, a single card spans 3) keep every row edge to edge for 1..12 cards; one column below 900px. `columns` applies only with `layout="uniform"` and is a maximum (auto-fit). Cost: consumers who want the old equal-card grid must pass `layout="uniform"` (release note).
- **Raised surfaces for feature and bento cards.** The brief contradicted itself (L3.3 card, L3.4 raised); raised wins because it separates from the canvas in dark and is identical in light.
- **Badge in flow, not absolute (L3 fix round).** An absolutely positioned badge overlapped long titles on icon-less cards.
- **Bento spans.** Every `--col-N` and `--col-span-N` for 1..12 has a rule (seven of BentoCard's own emitted classes had none); one 899px collapse block, no `!important`. `colSpan` sanitised to 1..12, `columns` to 2/3/4.
- **Dark icon disc is 1.02:1 against raised: recorded decorative limit.** The glyph on it is 7.94:1 and carries the meaning. Cheap fix if it matters: `border: 1px solid var(--joy-border-subtle)` on the disc (would also show in light, so left to taste).
- **FeatureCard action semantics.** A handler with no href renders `<button type="button">`; with a real href only a plain primary click (no modifier, button 0, not already prevented) calls `preventDefault()` and the handler, so middle-click and modifier-click stay native.

### Proof sections (L4, T1)

- **Per-instance ids.** FAQ trigger and panel ids and the LogoCloud title id come from `$props.id()` / `React.useId()` (previously a global `faq-answer-N` that collided across two sections); two-instance tests in both twins.
- **FAQ answers stay in the DOM with `hidden`.** `aria-controls` always resolves; the content rule sets no `display`, so `hidden="until-found"` stays adoptable later (SVL-061 deferred, section 2). Open state is `chosen ?? defaultOpen` stored by index (documented and pinned).
- **Stats: container queries (T1 c12e08f, fix round a2b5c5e).** First use in the repo. `.joy-stats-section` is an inline-size container; the grid is mobile-first compact (2 columns, an odd last card spans the row) and steps by stat count and container width (3 and 6 stats to 3 columns from 45rem, 4 to 4 from 60rem, 5 to 5 from 69rem, 7+ auto-fit). Value type steps are container queries too. Why: hub frames and sidebars are narrower than the window, so viewport queries mis-stepped (the review saw 3 columns at 1280). `contain-intrinsic-inline-size: 20rem` keeps it from collapsing in shrink-to-fit parents. Cost: 4 stats at a 900px window are 2 by 2 by design; browser floor is Chrome 105 / Safari 16 / Firefox 110 (`:has()` Firefox 121, `contain-intrinsic-inline-size` Safari 17).
- **Stat values break only when a token cannot fit its cell (L4 fix round 2, 1b1926a).** `overflow-wrap: anywhere` on the value with `min-width: 0` on the item; fitting numbers stay whole. Long trend pills ellipsise on an inner `.joy-stat-item__change-text` span (T1 fix round 2, 22a0b9d: `text-overflow` has no effect on an inline-flex container); no `title` or duplicate `aria-label` because the full words are in the DOM.
- **Decorative borders at 2.79:1 in dark (L4 ruling).** `--joy-border-default` on raised is 2.79:1 in dark (light passes 3:1). Card, stat, testimonial and FAQ-item borders are decorative containment; the one border that signals state (open FAQ item) uses `--joy-border-strong` and is asserted >= 3:1 in both themes.
- **Logos are `currentColor` at `--joy-text-muted`, no invert filter.** The token remap inverts them; a `[data-theme]` filter would be capped and miss OS-dark. Muted is >= 4.5:1 on the canvas in both themes; on a raised surface in dark it is 4.23:1 (logotypes are exempt; consumers can set the container colour).
- **Stat value colour is `--joy-accent-text`** (brief decision) rather than the audit's `--joy-text-primary`; both pass AA. Copy "14% faster vs L1" under an up caret (T1) so the screen-reader text reads coherently.

### Footer (L5a, T1)

- **Explicit `role="contentinfo"` removed (breaking-ish, release note).** The native `<footer>` is the landmark; the explicit role triggered Svelte's `a11y_no_redundant_roles` warning. A footer nested in `main`/`section`/`article` stops being the page landmark, which is correct HTML; consumers can pass `role` through rest props.
- **Footer links are at least 44px tall at every pointer type**, not only `pointer: coarse`, so the 44px target holds in desktop-emulated 375px probes; the list gap was removed because the 44px rows are the spacing.
- **Flex rows replace the grid (L5a fix round, 7185407).** The base desktop track list `2fr repeat(auto-fit, minmax(160px, 1fr))` was invalid, so Chromium dropped it and the desktop footer was one column everywhere (found by a probe, not by the audit). The first fix left an orphan cell; the final layout is a wrapping flex row (brand on its own row below 1024px, one row from 1024px), one column below 768px, link groups paired from 480 to 767px (T1 b3e19f2).
- **767px / 639px media values** instead of the audit's literal 768/640, so 768 and 640 keep the wide layout (wave convention). Hover is primary text plus underline, not gold (gold failed on the light card).
- **Svelte `SocialLink.svgHtml` is a documented Svelte-only field.** React passes an element through `icon`; adding a raw-HTML sink to React would be worse. parity-check compares top-level props only and cannot see it.

### LandingPage (L5b)

- **Mobile nav uses `@media (max-width: 767px)`, not container queries (plan assumption 5).** A container-query root would make the `position: fixed` drawer contain to the landing root.
- **Drawer at <= 480px is the Wave 3 bottom sheet.** Contracts assert a visible `[role="dialog"].joy-drawer`, not a placement.
- **`LandingPage.svelte` compiles again.** At base it threw `js_parse_error` (`{/* Header */}` in markup) and nothing gated it.
- **Skip link and `<main>` (L5b, 5044994).** LandingPage renders a skip link `.joy-landing-skip` (position fixed, off-screen until focused) to its own `<main id="<uid>-main" tabindex="-1">`, and SiteFooter outside `<main>`. Caveat, documented in JSDoc: LandingPage is a full-page template and must be the page body, not nested in another `<main>` (nested landmarks and duplicate `#features/#telemetry/#faq` section anchors otherwise). The page paints its own canvas and text colour.
- **Typed rest props (L5b, 74a7a9d; L3 fix round).** Every landing Svelte `Props` extends the element's `HTMLAttributes` (with `class`, `children`, `title` or own callbacks omitted where redefined); React props already extended the element attributes. LandingAction is the exception (internal, no rest).
- **Feature tags use the real `Badge` (T2, 80e0a0a).** Root cause of the taste finding "tags look like text highlights": LandingPage rendered a bare `.joy-badge` span with no size class, and padding lives in `--sm`/`--md`.

### Hub (C1a, C1b, T2)

- **Generator-owned regions and drift tests (C1b fix round 0f92ab0; T2 7c8638c).** `apps/storybook-hub/scripts/gen-landing-blocks.mjs` renders the real Svelte components by SSR and owns three regions of the hub `build.js`: `landing-blocks`, `landing-simulator` and `landing-simulator-footer`. Regenerate with `--write`, check with `--check`; `packages/svelte/test/hub-landing-blocks.test.js` fails on drift (mutations in a scratch copy turn it red). The generator rewrites `s<digits>` ids only inside attribute values and asserts its splice anchors exist. Why: rule 11, fix the seed not the instance; hand-copied demo markup had drifted into 11 undefined classes. Cost: the generator deep-imports Svelte server internals (backlog).
- **Hand-written header, drawer and skip link, guarded by a class-set parity test (C1a).** The drawer is closed at SSR, so its classes come from the component source; renaming a hub drawer class turns the test red in both packages.
- **Simulator frame-width deviation (C1a).** The frame-width toggle changes only the frame width; media queries follow the real browser window, so "Mobile 375px" in a wide window still shows the desktop header. A one-line note sits in the toolbar; the acceptance contracts and screenshots use a real 375px viewport. Backlog: make the frame an iframe or container (Wave 5 hub chrome).
- **Palette switcher removed (C1a).** No CSS keys off `data-palette` (SVL-085 stale), so the switcher did nothing and the FAQ copy claiming "instant recalibration" was false; both removed. `data-palette` stays as a plain attribute.
- **Hub-only simulator additions are disclosed (T2 fix round).** The simulator adds a features heading and a pricing section around the LandingPage output; the tagline and status bar say so, because LandingPage itself does not render them yet (backlog).
- **Kinetic hero kept, de-slopped (C1b).** Gradient title, `backdrop-filter` and dead `transparent` declarations removed; title on `--joy-text-primary`. The static-frame treatment under reduced motion is deferred (section 2).

### Gates, contracts and process

- **Strict colour lint covers all 28 landing files (D1, 6422ea9).** `strict_file_pattern` gained the 14 names; `lint-colors.allow` untouched; the old "non-listed name only warns" case moved to `Carousel.tsx`.
- **Playwright contracts on a real-component page (C2, b86cd6d, eaa2c4f).** Besides the hub (`#landing-preview` at 375 and 1280, light and dark: overflow with the page guard forced off, button and text contrast on real composited surfaces including both gradient stops, 44px menu, drawer), `landing-component-page.spec.ts` builds a page from the committed `dist/theme.css` only (no hub CSS, no reset) plus the SSR markup of the real React and Svelte LandingPage, so hub CSS cannot mask a component defect. SSR runs in a child process (`render-landing-ssr.mjs`). 44px checks use a 43.5 tolerance (Chromium measured 43.99997px). Contrast helpers refuse translucent gradient stops. Ten mutation checks went red.
- **Dark treatment is token-only.** No new `[data-theme] .joy-*` selector was added (phase-b cap of 15 untouched); dark rendering was proven by computed probes with and without the attribute and by the dark Playwright sweeps.
- **CSS test slices end at line-start comments.** `wave-4.test.js` slices a block from its header comment to the next line-start `/*`; comments inside blocks are indented on purpose. Two lanes hit this once.
- **Known verification limit.** Component-level click tests are element-tree (React) and stand-in (Svelte) tests; real interaction is proven only in Playwright against the hub (same class vocabulary, same script pattern).
- **Taste review rounds.** Round 1 on the C3 screenshots (2085a62): FIX, 0 P0, 7 P1, 16 P2. T1 and T2 closed all seven P1s (orphan stat card, bare tags, cream dark CTA slab, heavy busy/disabled buttons, frame switcher overprint, cramped stats at 375, simulator without pricing) and most P2s; P2-2, P2-4, P2-5, P2-10, P2-13 and P2-14 went to the backlog. Screenshots were regenerated (bff30b9) and round 2 was dispatched in parallel with this record; its verdict is recorded by D3 in `screens/README.md`.

## 2. Deferred and parked items

The two deferred audit issues are in `issue-coverage.md`:

- **SVL-061 FAQ answers not findable with Cmd+F.** Answers stay in the DOM with `hidden`, but a closed one cannot be revealed by in-page search. Needs `hidden="until-found"` plus a `beforematch` listener in both twins; React 19.3 SSR renders `hidden: 'until-found'` as `hidden=""`, so React needs an imperative ref/effect path while Svelte can do it declaratively. Safari support is also partial.
- **SVL-062 FAQ height animation.** Polish outside the brief; a 0fr/1fr grid transition conflicts with `hidden` and needs `inert`/`visibility` handling. The chevron rotation is animated on duration tokens and covered by reduced motion.

Parked (found in review or by lanes, judged not worth blocking; "both" means both twins):

- **`secondaryLoading` not added** to HeroSection/CTASection (audit SVL-008/021, RXF-128/129 asked for it; the brief's prop list did not). The five other action props landed.
- **Taste P2-13 kinetic hero static frame** (hub only): under reduced motion no particles are visible and the hero reads as an empty card; at 375 its two buttons stay side by side.
- **Taste P2-2, P2-4, P2-5, P2-10, P2-14** (see section 3).
- **Hub simulator at a 375 frame in a wide window** shows the desktop header (the frame-width deviation above).
- **Stats at 481-660px** stayed one column in L4; superseded by the T1 container queries (compact two columns in narrow containers), recorded for history.
- **Hub blocks view at a 320px window** leaves a 210px stats grid where "14 chains" wraps to two lines at the smallest type step (hub chrome, not the component).
- **Section anchors** `#telemetry`, `#features`, `#faq` are fixed ids, so two LandingPages on one screen share them (menu and main ids are per-instance).
- **React `toggleIndex` functional updater** (FAQ) not used; safe for discrete clicks.
- **Hub `toggleFaq` does not close siblings** (the showcase demonstrates `allowMultiple`).
- **LogoCloud says "opens in a new tab", SiteFooter says "opens in new tab"** (component copy, harmless but inconsistent).
- **Hub icons lose the icon package's inline `vertical-align`** in generated markup (generator strips inline styles; no visible effect measured).
- **`.joy-landing-page__section-title` duplicates `.joy-faq-section__title`** because a wave-4 test reads the FAQ rule by exact selector.
- **Hub CSS `transparent` box-shadow no-ops** remain in shared hub chrome (`.playground-box`, `.component-card`, sidebar): Wave 5.
- **Hub blocks view has several `h1`s** (hero demos render their real `h1`); hub-only, not a page contract.

## 3. Backlog ideas (file, do not chase)

1. **Svelte Props typing repo-wide.** The landing Svelte `Props` now extend `HTMLAttributes`; most other Svelte components (Button included) do not, so `id`, `aria-*` and `data-*` are type errors there. A scratch `svelte-check` reported 152 pre-existing errors in other files.
2. **`$props.id()` needs Svelte >= 5.20 but the package peer range is `^5.0.0`.** Package-wide debt (about 11 components use it; nine already did before this wave); bump the peer range in a separate change (public contract, R1).
3. **`exactOptionalPropertyTypes`** (TS2375) would reject the repo's optional-prop pattern under that flag; pre-existing and repo-wide, not landing-specific.
4. **Add a repo typecheck** (`@types/react` + `tsc --noEmit`, `svelte-check`). Lanes type-checked only in scratch; a gate would have caught the LandingPage compile error at base.
5. **`.joy-table-container` 2px overflow** (border without border-box; predates the wave).
6. **Wave 2 solid button hover replaces the keyboard focus ring** library-wide (seen while fixing the CTA outline focus ring).
7. **Wave 2 light pressed-state solid button is 4.20:1** (below 4.5).
8. **Inert links have no not-allowed cursor** (`pointer-events: none` on `[aria-disabled="true"]`).
9. **Badge neutral tag dark tone** (taste P2-2): near-black chip with white text in dark, foreign to the navy palette (Wave 3 Badge).
10. **Featured plan emphasis** (taste P2-4): only a thin gold border and a pill; consider an accent elevation ring.
11. **Pricing matrix scroll affordance** (taste P2-10): no edge fade or shadow when the table scrolls at 375.
12. **Kinetic hero static frame** under reduced motion, and full-width CTAs under 480px (taste P2-13).
13. **Lead feature card visual** (taste P2-14): the grid still reads as the template icon-card grid at 375; the bento title versus section heading scale is close (P2-5).
14. **`color-scheme` plus `light-dark()` theme-wide.** Declaring `color-scheme` on the theme would allow a navy light CTA band and a non-cream dark band without `[data-theme]` selectors.
15. **Add the features heading and a pricing section to the LandingPage twins** so consumers get the page the hub simulator shows (needs plan-data props or fixed copy, twin parity, tests).
16. **Hub generator deep-imports `svelte/src/index-server.js`**; `tidy()` strips all inline style attributes; `--root` with a missing value has the wrong exit code; one dead comment line.
17. **Simulator frame as an iframe or container** so the frame-width toggle drives media queries (Wave 5 hub chrome).
18. **Palette: real palette theming or drop the `palette`/`data-palette` hook** (SVL-085 was a no-op).
19. **LandingAction typing and rest** (type Button's Props and wire rest in both twins in one lane).
20. **451 files under `node_modules/.pnpm` are tracked in git** since release 2.22 (pre-existing); check whether `git status` stays clean after `pnpm install`.
21. **Svelte `LogoItem.svgHtml` / `SocialLink.svgHtml` raw-HTML fields** have no React counterpart; Svelte `FooterLink`/`FooterColumn`/`SocialLink` interfaces are not exported (React exports them). parity-check sees only top-level props.
22. **FAQ and footer heading levels are fixed** (`<h6>` testimonial author, `<h4>` footer column titles can skip levels): a `headingLevel` prop later. TestimonialCard initials take the first two letters rather than first and last initials.
23. **PricingMatrix discriminated-union types** for `columns`/`rows`, and an `onSelect(event)` handler shape; both are public-API decisions.
24. **Playwright contrast helper ignores background images** other than gradients on the measured node.

## 4. Process notes and lessons

### Review-loop statistics (from the ledger)

- 15 implementation tasks (A1, A2, L1-L5b, C1a, C1b, C2, C3 twice, D1, T1, T2) plus this record. Every code task got an independent review (opus code-reviewer, plus a TypeScript/Svelte language reviewer for component lanes); every fix round was followed by a scoped re-review or an explicit mutation-proven acceptance, and every task ended APPROVE.
- **13 fix rounds** in total (limit 5 per task; the most any task needed was 2): A1 1, L1 1, L2 1, L3 1, L4 2, L5a 1, L5b 1, C1b 1, C2 1, T1 2, T2 1. Zero fix rounds: A2, C1a, C3, D1.
- Test counts climbed from tokens 85 / svelte 106 / react 111 (A1) to tokens 159 / svelte 209 / react 211; Playwright from 82 passed to 420 passed, 176 skipped (screens and mobile-dark projects skip by design).

### Defects reviewers or probes caught that implementers and tests missed

- **Hub CTA text invisible (L1 review).** The first CTA restyle made the band text inverse everywhere, including the hub simulator's CTA without the band container.
- **Library-wide `pointer-events: none` on disabled buttons (L1 review).**
- **Untested wiring (L2, L3, L4 language reviews).** Mutation runs proved that dropping `onClick`, `onselect`, `ref` or `bind:this` left every test green; the fix rounds added tests that go red for each mutation, and a Svelte `$props.id()` test that passed with a constant id.
- **Card title scale and badge overlap (L3 review).** Display clamps split words in narrow cards.
- **Ledger honesty (L2, L4, L5a reviews).** Rows marked `closed` with no code change behind them were re-marked `verify-only`.
- **CTA overflow masked by the page guard (L5b review).** The implementer's probe measured the page with `overflow-x: clip` active.
- **Invalid footer grid (L5a probe).** The desktop footer had been one column since before the wave.
- **Stats value page overflow (L4 re-review).** `overflow-wrap: normal` let a 14-character value scroll the whole page sideways.
- **Pill ellipsis did not exist (T1 re-review).** `text-overflow` on an inline-flex container is a no-op; the claim was retracted and fixed on an inner span.
- **Hub drift (C1b review).** The generator lived only in `/tmp`; it was committed with a drift test.

### Lessons

1. **Implementer-before-tests happens; mutation checks are the backstop.** Several lanes wrote implementation first (L3 lost its RED run to an API outage, L5b had to rewrite a file that did not compile). Requiring "each wiring mutation turns exactly one test red" caught untested wiring that a green suite hid.
2. **A page-level guard can hide a real defect.** `overflow-x: clip` on `.joy-landing-page` and the hub CSS reset both masked the CTA box-sizing overflow; probes and contracts must run with guards forced off and on a page that loads only `dist/theme.css`.
3. **Screenshots plus an adversarial taste review find what contracts do not.** Every P1 in taste round 1 passed all existing tests (orphan grid cells, cream dark slab, bare tags, overprinted switcher).
4. **Root-cause the component, not the hub.** The "tags look like highlights" finding was a component defect (bare badge), not hub drift; regenerating the hub from the components made that visible and keeps it fixed.
5. **Container queries beat viewport queries for sections that live in frames and sidebars,** but need `contain-intrinsic-inline-size` for shrink-to-fit parents.
6. **Put the rule where the machine reads it.** Generator-owned hub regions with a drift test replaced hand-copied markup; strict lint and the parity lists grew in the same commit that made each file clean.
7. **API outages lose uncommitted work.** L3's first implementer died with nothing committed, and a stalled C3 resume produced nothing; a fresh dispatch was cheaper than resuming. Commit WIP early (the `wip(...)` commits in this branch are that practice).
8. **Load matters for Playwright.** A full run with 7 workers timed out under unrelated machine load; `--workers=3` on port 6120 was stable.

### Lane review verdict digest

| Task | Reviewers | Findings | Fixes | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| A1 | code-reviewer, typescript-reviewer | 0 Critical/Important; 1 Medium, 3 Low; ts 6 Minor | round 1: markup-only checks, generic `$bindable`, comment stripping (e96eaa6) | APPROVE after re-review |
| A2 | code-reviewer | 0 Critical/Important, 5 Minor | none | APPROVE |
| L1 | code-reviewer, typescript-reviewer | 2 Important (hub CTA invisible text, global disabled pointer-events), ts 1 Important | round 1 (96b19d3) | APPROVE after re-review |
| L2 | code-reviewer, typescript-reviewer | code APPROVE with 6 Minor; ts 2 Important (handler and ref untested) | round 1 (71861de, 122bcfd), mutation-proven | APPROVE after re-review |
| L3 | code-reviewer, typescript-reviewer | 2 Important each (title scale, badge overlap; weak Svelte stand-in tests, untyped Svelte Props) | round 1 (5ed2763) | APPROVE after two re-reviews |
| L4 | code-reviewer, typescript-reviewer | 1 Important ledger (SVL-066/069), ts 1 Important (vacuous uid test) | round 1 (892b4b2); round 2 stats overflow (1b1926a) | APPROVE after re-review |
| L5a | code-reviewer, typescript-reviewer | 0 Critical/Important; M1 orphan cell worth fixing | round 1 (7185407) | APPROVE after re-review |
| L5b | code-reviewer, typescript-reviewer | 1 Important (CTA overflow masked by guard); ts APPROVE | round 1 (5044994) | APPROVE after re-review |
| C1a | code-reviewer | 0 Critical/Important, 6 Minor | minors carried into C1b | APPROVE |
| C1b | code-reviewer | 1 Important (generator only in /tmp) | round 1 (0f92ab0): generator + drift test | APPROVE after re-review |
| C2 | code-reviewer, typescript-reviewer | 0 Critical/Important; 6 and 7 Minor | round 1 (eaa2c4f): tolerance, loud helpers, dark sweeps | APPROVE |
| T1 | code-reviewer, typescript-reviewer | 1 Important (stats wrap, two width models); ts APPROVE | round 1 (a2b5c5e), round 2 pill ellipsis (22a0b9d) | APPROVE after re-review (round 2 mutation-proven) |
| T2 | code-reviewer | 0 Critical/Important, 5 Minor | round 1 (afb4648) | APPROVE |
| Taste 1 | opus taste reviewer on 38 screenshots | 0 P0, 7 P1, 16 P2 | T1, T2 | FIX, then round 2 dispatched at bff30b9 |

## 5. Release notes (breaking and visible changes)

- **Breaking: `titleGradient` renamed `titleEmphasis`** on HeroSection (both twins, no alias). The emphasis renders as a solid `--joy-accent-text` span; gradient title text is gone.
- **Breaking: `.joy-button--glass` removed** (class and CSS). Use `joy-button--outline`.
- **FeatureGrid defaults to `layout="lead"`** (three columns from 900px with the first card spanning two, one column below). `columns` applies only with `layout="uniform"` and is a maximum. Pass `layout="uniform"` for the previous equal-card grid.
- **SiteFooter no longer sets an explicit `role="contentinfo"`.** The native `<footer>` is the landmark; pass `role` through rest props if you nest the footer inside `main`, `section` or `article`.
- **Footer links are at least 44px tall at every pointer type;** the footer is now wrapping flex rows (one column below 768px, paired link groups from 480px); its desktop layout was previously an invalid grid that rendered as one column.
- **PricingMatrix gains optional `columns`, `rows`, `rowHeaderLabel` and `label`** (data table in a scrollable, focusable region); PricingCard gains `loading` and `disabled` and renders a Check icon; the featured card no longer scales; cards wrap without empty cells.
- **HeroSection and CTASection gain `primaryHref`, `secondaryHref`, `primaryLoading`, `primaryDisabled`, `secondaryDisabled`;** trailing arrow icons removed; 1px hover lift inside hero and CTA; full-width stacked actions under 480px.
- **CTA band restyle:** the band is a raised surface with an accent wash and a strong border in both themes (it is no longer navy in light or cream in dark).
- **LandingPage renders a skip link and a `<main>` landmark,** a mobile menu button with the Wave 3 Drawer below 768px, and must be the page body (do not nest it inside another `<main>`). It uses the real Badge for feature tags. `LandingPage.svelte` compiles again.
- **Svelte landing components accept `ref` (`bind:ref`) and rest attributes,** and their `Props` extend the element attributes (`id`, `aria-*`, `data-*`, event handlers). React landing components were already `forwardRef`; React BentoGrid is now `forwardRef` too.
- **Other visible component changes:** FeatureCard renders a `<button>` for a handler without href; BentoCard `--col-N` spans 1..12 all have CSS; card titles use the step scale; FAQ ids are per-instance and closed answers stay in the DOM with `hidden`; StatsSection uses container queries and wraps change text in `.joy-stat-item__change-text`; TestimonialCard clamps `rating` to 0..5; LogoCloud logos are `currentColor`.
- **Hub:** the full-page simulator and the landing blocks view are generated from the real components (`node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write`, never hand-edit the regions); the simulator adds a features heading and a pricing section around the LandingPage output; the palette switcher is gone; the frame-width toggle changes frame width only (breakpoints follow the window).
- **Global rule changes:** the disabled-button rule now also covers `.joy-button[aria-disabled="true"]` anchors, with `pointer-events: none` only on the `aria-disabled` form; busy and disabled button styling inside `.joy-hero`, `.joy-cta-section` and `.joy-pricing-card`; strict colour lint now covers the 28 landing files; parity-check covers the 14 landing names plus LandingAction and checks Svelte ref/rest.
