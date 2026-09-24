# Handoff: F-039 Wave 4 (landing suite)

**Goal (verbatim):** All 14 landing components (HeroSection, CTASection, PricingCard, PricingMatrix, FeatureCard, FeatureGrid, BentoCard, BentoGrid, LogoCloud, FAQSection, StatsSection, TestimonialCard, SiteFooter, LandingPage; Svelte and React) read semantic tokens only, have a hero and CTA with real depth and readable secondary buttons, a mobile-collapsing header with a drawer, fluid non-overflowing headings, no banned slop patterns, designed dark rendering, and identical Svelte/React props, classes and CSS; every SVL- and landing RXF- issue is resolved or deferred with a reason.

**Plan:** `.claude/refined_backlog/F-039-wave-4-landing-suite-hero-and-cta-depth/plan.md`
**State:** implementation complete: phases A, L1 to L5, C1 to C3, T1 and T2 (taste fixes), D and the consolidated final fixes (F1) are committed on feat/F-039 (base 85141e1). Three whole-branch reviews (components, CSS and hub, docs and Playwright) and two taste reviews are done. The taste re-check of the F1 stats fix and the screenshot refresh are pending (orchestrator). Gate 1 (`PLAYWRIGHT_PORT=6120 bash scripts/precheck.sh` from a clean tree) is pending. NOT shipped, NOT pushed.
**Rules:** SDD scratch in /tmp/f039-sdd/ (no .superpowers/ in the worktree); new commits only; Gate 1 from a clean tree.
**Next step (owner):** run Gate 1 from the clean tree, then `psrw ship`.
**Release notes (consumer-visible, all listed in README "Breaking and visible changes (Wave 4)"):**
- `titleGradient` is removed from `HeroSection` (use `titleEmphasis`, no alias; an old prop is spread onto the root element as an unknown attribute).
- `.joy-button--glass` is removed (use `joy-button--outline`).
- Any `.joy-button` with `aria-disabled="true"` now looks disabled and has `pointer-events: none` library-wide.
- `FeatureGrid` defaults to `layout="lead"`; `SiteFooter` no longer sets `role="contentinfo"`; `LandingPage` renders its own `<main>` and skip link; the CTA band is a raised surface in both themes.
- Additive: `PricingMatrix` data props (`columns`, `rows`), `BentoColSpan` and `PricingMatrixRow` type exports, React `children` no longer accepted by the 10 landing components whose Svelte twin rejects them.
