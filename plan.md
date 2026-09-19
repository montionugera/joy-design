# [F-017] Landing Page Architecture & Ant Design Enterprise Workflow Suite

> **For agentic workers:** Autonomous execution mode. Zero mid-turn interruptions. Verify evidence before assertions.

**Goal:** Deliver modern high-converting Landing Page Architecture (`BentoGrid`, `HeroSection`, `PricingMatrix`, `TestimonialCard`) alongside Ant Design Enterprise Workflow Components (`Steps`, `Timeline`, `Result`) in both Svelte 5 (Runes) and React 19 (`forwardRef`), with live interactive showcases on Storybook Hub and zero OS emojis.

**Tech Stack:** Svelte 5 (Runes), React 19, TypeScript, CSS Custom Properties (DTCG), Node.js Test Runner, Docker, Kubernetes.

---

## Phase 1: Tokens & Styling Engine Expansion
- [x] Add CSS classes in `packages/tokens/build.js`:
  - Bento Grid & Card (`.joy-bento-grid`, `.joy-bento-card`, glowing hover borders)
  - Hero Section (`.joy-hero`, `.joy-hero__badge`, `.joy-hero__title`, `.joy-hero__ctas`, `.joy-hero__preview`)
  - Pricing Matrix (`.joy-pricing-matrix`, `.joy-pricing-card`, `.joy-pricing-card--featured`)
  - Testimonial Card (`.joy-testimonial-card`, `.joy-testimonial-card__stars`)
  - Steps Component (`.joy-steps`, `.joy-steps__item`, `.joy-steps__icon`, `.joy-steps__tail`)
  - Timeline Component (`.joy-timeline`, `.joy-timeline__item`, `.joy-timeline__dot`, `.joy-timeline__tail`)
  - Result Component (`.joy-result`, `.joy-result__icon`, `.joy-result__title`, `.joy-result__subtitle`, `.joy-result__actions`)
- [x] Compile tokens and verify `packages/tokens/test/tokens.test.js`

## Phase 2: Svelte 5 Runes Components
- [x] Implement Landing Blocks:
  - `BentoGrid.svelte` & `BentoCard.svelte`
  - `HeroSection.svelte`
  - `PricingCard.svelte` & `PricingMatrix.svelte`
  - `TestimonialCard.svelte`
- [x] Implement Workflow Components:
  - `Steps.svelte` (horizontal/vertical, active/finish/error states)
  - `Timeline.svelte` (chronological audit logs with status nodes)
  - `Result.svelte` (feedback screens: success, error, warning, 404, 403)
- [x] Export in `packages/svelte/src/lib/index.ts`
- [x] Test in `packages/svelte/test/components.test.js`

## Phase 3: React 19 ForwardRef Components
- [x] Implement Landing Blocks:
  - `BentoGrid.tsx` & `BentoCard.tsx`
  - `HeroSection.tsx`
  - `PricingCard.tsx` & `PricingMatrix.tsx`
  - `TestimonialCard.tsx`
- [x] Implement Workflow Components:
  - `Steps.tsx`
  - `Timeline.tsx`
  - `Result.tsx`
- [x] Export in `packages/react/src/index.ts`
- [x] Test in `packages/react/test/components.test.js`

## Phase 4: Storybook Hub Integration & Zero-Emoji Enforcement
- [x] Add `Landing Page Blocks` preview tab with Bento Grid, Hero Section, Pricing Switcher, and Testimonials
- [x] Add `Workflow & Audit Suite` preview tab with Steps Wizard, Timeline, and Result screens
- [x] Update sidebar nav items with vector SVGs
- [x] Verify zero raw OS emojis across entire distribution

## Phase 5: Build, Test, Ship & Live Verification
- [x] Run full test suite: `pnpm -r test`
- [x] Run `./scripts/integration.sh`
- [ ] Ship via `psrw ship`
- [ ] Promote release via `psrw promote --babysit`
- [ ] Verify HTTP 200 and updated content on `https://design.joymify.com`
