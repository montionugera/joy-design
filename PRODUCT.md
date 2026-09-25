# Product

What `joy-design` is for, who it serves and the bar it holds. Visual values live in `DESIGN.md` (generated from the tokens); the rules agents follow live in `AGENTS.md`.

## Register

**Product.** This is a component library whose consumers are task-focused apps: forms, data display, overlays, navigation, charts.

The landing suite (`HeroSection`, `CTASection`, `PricingCard`, `PricingMatrix`, `FeatureGrid`, `BentoGrid`, `LandingPage` and the rest) is designed in the **brand** register: it can be expressive, but only within the same tokens.

## Users

- **Joymify frontend engineers** who install `@joymify/tokens`, `@joymify/icons` and either `@joymify/svelte` (Svelte 5) or `@joymify/react` (React 19). They build quickly and expect Ant Design-level completeness with no surprises between frameworks.
- **End users of those apps.** Traders in `quant-fe` work in dense data for long sessions, often in dark mode at night. Coaches and players in `joy-coach-fe` are on phones, outdoors, in bright light. Investors in `joymify-portal` and visitors to the public site are forming a first impression, so the design has to earn trust.
- **Visitors to the Storybook hub** at design.joymify.com, who judge quality on a phone as often as on a desktop.

## Product Purpose

One token-driven design system that renders identically in Svelte and React, in light and dark, on desktop and phone.

Success means a consumer never hardcodes a colour and never overrides a component to make it look finished. A designer should not be able to tell which framework rendered a screen.

## Brand Personality

Quiet authority: precise, warm, financial-grade. In three words: **composed, exact, warm**.

The interface should feel like a well-made instrument, dense where the data demands it and calm everywhere else. Gold is a signature, not a wash.

## Anti-references

- **Tailwind-default SaaS.** Purple primaries, slate-grey neutrals and stock blue links dropped into a navy and gold brand.
- **AI-slop defaults.** Emoji as icons, glassmorphism cards, gradient text, side-stripe accents, identical icon-card grids, and a tracked all-caps eyebrow on every section.
- **Dark mode made by inverting light mode.** White cards on black, grey shadows on dark, pure white body text.
- **Library defaults left visible.** Missing focus rings, 32px controls on a phone, and a spinner as the only loading state.

## Design Principles

1. **Tokens or nothing.** Every colour, radius, space, shadow, duration and z-index comes from `@joymify/tokens`. A colour literal in a component is a bug, and `scripts/lint-colors.sh` fails the build on one.
2. **Dark is designed, not derived.** The semantic surface, text, border, accent and status roles have their own dark values, and contrast is checked in both themes.
3. **Every state, every size, every framework.** An interactive component is styled for each state it can reach: default, hover, focus-visible, active, disabled, and loading, error or selected where they apply. It ships at every size it offers, with a Svelte and a React twin held together by `scripts/parity-check.mjs`. The per-component states and sizes are in the `DESIGN.md` state matrix.
4. **The phone is the first viewport.** Design at 375px with 44px touch targets, 16px gutters and no horizontal scroll. Select-family overlays become bottom sheets on small screens.
5. **Spend boldness once.** Each surface gets one signature moment, such as the hero CTA or the kinetic hub canvas. Everything else recedes.

## Accessibility & Inclusion

- WCAG 2.2 AA contrast for all text and UI in both themes. It is computed, not eyeballed: `packages/tokens/test/contrast.test.js` enforces it.
- Every focusable element shows a visible `focus-visible` ring.
- Every animation honours `prefers-reduced-motion`.
- Every overlay is keyboard operable and closes on Escape. Modal overlays trap focus and return it to the opener.
- Touch targets are at least 44px on coarse pointers.
- Status is never carried by colour alone; it always comes with an icon and text.
