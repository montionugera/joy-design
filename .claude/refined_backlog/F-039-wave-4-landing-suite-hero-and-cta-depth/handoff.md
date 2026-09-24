# Handoff: F-039 Wave 4 (landing suite)

**Goal (verbatim):** All 14 landing components (HeroSection, CTASection, PricingCard, PricingMatrix, FeatureCard, FeatureGrid, BentoCard, BentoGrid, LogoCloud, FAQSection, StatsSection, TestimonialCard, SiteFooter, LandingPage; Svelte and React) read semantic tokens only, have a hero and CTA with real depth and readable secondary buttons, a mobile-collapsing header with a drawer, fluid non-overflowing headings, no banned slop patterns, designed dark rendering, and identical Svelte/React props, classes and CSS; every SVL- and landing RXF- issue is resolved or deferred with a reason.

**Plan:** `.claude/refined_backlog/F-039-wave-4-landing-suite-hero-and-cta-depth/plan.md`
**State:** plan written; self-grill-audit next; then Phase A (parity + test helpers), L1..L5 lanes, C1..C3 hub/Playwright/screens, D1..D3 gates. Branch feat/F-039 base 85141e1. NOT shipped, NOT pushed.
**Rules:** SDD scratch in /tmp/f039-sdd/ (no .superpowers/ in the worktree); new commits only; Gate 1 with `PLAYWRIGHT_PORT=6120 bash scripts/precheck.sh` from a clean tree.
**Next step (owner):** after D3, run Gate 1 from the clean tree, then `psrw ship`. Release notes: `titleGradient` renamed `titleEmphasis` (breaking), `.joy-button--glass` removed.
