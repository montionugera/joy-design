---
title: "Wave 4: landing suite — hero and CTA depth, mobile navigation, fluid headings, slop removal, dark treatment"
id: I-039
status: idea
epic: E-001
---

# Wave 4: landing suite (brand register)

Parent: E-001. Depends on Wave 1 tokens. Audit evidence: `research/audit-landing-svelte.md` (90 issues, 17 P0) plus the React landing rows in Wave 2's `research/audit-react-forms-landing.md`. Every SVL-/RXF- landing issue must be resolved or deferred with a reason.

## Problem

The landing suite (HeroSection, CTASection, PricingCard, PricingMatrix, FeatureCard, FeatureGrid, BentoCard, BentoGrid, LogoCloud, FAQSection, StatsSection, TestimonialCard, SiteFooter, LandingPage; Svelte and React) has an invisible secondary hero button (1.00:1), purple pricing/bento/badge accents, gradient-text titles, middle-dot badges, glass buttons, fixed 44/36/32px headings that overflow 375px, a header that overflows by 188px with no mobile nav, five components with no dark rules, gold text at 2.6:1, and Svelte/React prop and ref drift.

## Scope (in)

1. **Hero and CTA buttons (the one bold moment).** Primary CTA: two-stop same-hue gradient (`gold-400` to `gold-500`) with a 1px inner top highlight, `--joy-elevation-2` in a gold-tinted shadow, hover lifts 1px and deepens the shadow, active presses with an inset shadow, `--joy-focus-ring`, loading spinner, `--joy-control-height-lg`, full width under 480px. Secondary CTA: `--joy-border-strong` outline with `--joy-text-primary` on light and cream-tinted text on dark, never a copy of the kinetic overlay styles. Delete `.joy-button--glass` and `.joy-hero__title-gradient`; `titleGradient` prop becomes `titleEmphasis` rendering solid text.
2. **Fluid typography.** All landing headings use `--joy-font-size-display-*` clamps; `overflow-wrap: anywhere` on titles; `text-wrap: balance` on h1–h3; audited copy with words longer than 12 characters is rewritten in the default stories.
3. **Mobile navigation.** `LandingPage` header collapses under 768px into a drawer (reuse `Drawer` from Wave 3) with a 44px menu button; nav links ≥ 44px tall; no horizontal overflow at 375px; bento `col-span-*` all collapse to full width under 900px; pricing matrix becomes a horizontally scrollable table with sticky first column; logo cloud wraps.
4. **Dark treatment.** Every landing component reads only semantic tokens; FeatureCard, StatsSection, FAQSection, SiteFooter, LogoCloud gain designed dark rendering (raised surfaces, stronger borders, gold-300 accents); `palette="joymify"` no longer forces dark.
5. **Slop removal.** No `&bull;`, no gradient text, no glass, no tracked uppercase eyebrows, no side stripes, no `→` in link text, no identical icon-card grid: FeatureGrid gets a leading visual (icon at 40px with tinted disc) and varied column spans; stat values use `--joy-accent-text`; rating stars use `--joy-status-warning-fg`.
6. **Parity.** Svelte and React twins expose identical props (Svelte gains `...rest` spreading and `bind:ref` where React has `forwardRef`), identical class names, identical CSS values; event props use one casing rule (`onPrimaryClick` in React, `onprimaryclick` in Svelte, documented).

## Out of scope

Hub page chrome (Wave 5), form controls (Wave 2), token definitions (Wave 1).

## Acceptance

- Playwright contract: landing view at 375px light and dark has zero horizontal overflow, hero primary and secondary buttons both pass 4.5:1 text contrast (computed from `getComputedStyle`), header shows a menu button under 768px that opens a drawer.
- `bash scripts/lint-colors.sh --strict` passes for every landing `.svelte`/`.tsx` file.
- Parity script (Wave 1 `scripts/parity-check.mjs` or added here) reports zero prop/class divergence for the 14 landing components.
- Screenshots at 375px and 1280px, light and dark, of the hub landing view attached to the plan.
