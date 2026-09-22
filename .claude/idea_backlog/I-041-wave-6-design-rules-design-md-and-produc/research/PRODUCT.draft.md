# Product

## Register

product

(Default register is **product**: this is a component library whose consumers are task-focused apps. The landing suite (`HeroSection`, `CTASection`, `PricingCard`, `LandingPage`, ...) is audited and designed in the **brand** register.)

## Users
- Joymify frontend engineers consuming `@joy-design/*` in Svelte 5 and React 19 apps. Context: building quickly, expecting Ant-Design-level completeness and zero surprises across frameworks.
- End users of those apps: traders in `quant-fe` (high-density data, long sessions, often dark mode at night), coaches and players in `joy-coach-fe` (mobile-first, outdoors, bright light), investors in `joymify-portal` and the public site (first impression, trust).
- Visitors of the Storybook hub at design.joymify.com (evaluating quality on a phone as often as on a desktop).

## Product Purpose
One token-driven design system that renders identically in Svelte and React, in light and dark, on desktop and phone. Success: a consumer never hardcodes a color, never overrides a component to make it look "finished", and a designer cannot tell which framework rendered a screen.

## Brand Personality
Quiet authority. Precise, warm, financial-grade. Three words: **composed, exact, warm**. The interface should feel like a well-made instrument: dense where data demands it, calm everywhere else. Gold is a signature, not a wash.

## Anti-references
- Tailwind-default SaaS: purple `#7c3aed` primaries, slate-gray neutrals, blue `#3b82f6` links dropped into a navy/gold brand.
- Emoji as icons, glassmorphism cards, gradient text, side-stripe accents, identical icon-card grids, ALL-CAPS tracked eyebrows on every section.
- "Inverted light mode" dark themes: white cards on black, gray shadows on dark, pure `#fff` text.
- Bootstrap/Ant-Design defaults left visible (unstyled focus rings, 32px controls on mobile, spinner-only loading).

## Design Principles
1. **Tokens or nothing.** Every color, radius, spacing, shadow, duration, z-index comes from `packages/tokens`. A hex literal in a component is a bug.
2. **Dark is designed, not derived.** Semantic surface/text/border tokens are remapped per theme with their own contrast-verified ramps.
3. **Every state, every size, every framework.** A component ships with default/hover/focus/active/disabled/loading/error, sm/md/lg, and Svelte–React parity or it does not ship.
4. **Phone is the first viewport.** 375px, 44px targets, 16px gutters, no horizontal scroll, drawers instead of dropdowns where thumbs rule.
5. **Spend boldness once.** One signature moment per surface (the hero CTA, the kinetic hub canvas); everything else recedes.

## Accessibility & Inclusion
WCAG 2.2 AA minimum for all text and UI contrast in both themes; visible `focus-visible` ring everywhere; `prefers-reduced-motion` honored by every animation; keyboard operability for every overlay; touch targets ≥ 44px; no information carried by color alone (status uses icon + text).
