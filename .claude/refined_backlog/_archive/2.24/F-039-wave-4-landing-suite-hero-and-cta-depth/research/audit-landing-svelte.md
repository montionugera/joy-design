## Summary
Files audited: 14 Svelte components in packages/svelte/src/lib (HeroSection, CTASection, PricingCard, PricingMatrix, FeatureCard, FeatureGrid, BentoCard, BentoGrid, LogoCloud, FAQSection, StatsSection, TestimonialCard, SiteFooter, LandingPage), corresponding CSS in packages/tokens/build.js and dist/theme.css, and twin implementations in packages/react/src.
Issue count by severity: 90 issues total (P0: 17 blocks production / P1: 53 visibly sloppy / P2: 20 polish).
Verdict: Fails production grade in the brand register due to critical light-mode contrast failures (invisible secondary hero CTA at 1.00:1), hardcoded Tailwind slate and purple palettes across dark mode and badges, 188px mobile viewport overflow at 375px in the landing header, un-clamped heading overflows, and pervasive violations of explicit AI-slop bans.

## Systemic patterns
- **Kinetic dark-theme styles misapplied to light HeroSection**: `.joy-hero .joy-button--outline` copy-pastes dark canvas styles from `.kinetic-overlay` (`color: #f8f3e8; background: rgba(255,255,255,0.08)`), making secondary hero button text completely invisible (1.00:1 contrast) on default cream/white surfaces.
- **Unauthorized Tailwind slate and purple palette pollution**: Instead of token-driven brand anchors (`--navy-500: #14253e`, `--gold-400: #c49a3a`, `--ink-500: #1f1c13`), dark mode rules hardcode Tailwind cool slate (`#1e293b`, `#334155`, `#f8fafc`, `#64748b`), and badges/hovers inject purple (`#7c3aed`, `#8b5cf6`, `#a855f7`).
- **Complete dark mode omission for Wave 13B landing components**: `.joy-feature-card`, `.joy-stats-section`, `.joy-faq-section`, `.joy-site-footer`, and `.joy-logo-cloud` define zero `[data-theme="dark"]` selectors in `build.js`, leading to low-contrast muted text (3.24:1) and missing dark borders on dark surfaces.
- **Fixed typography causing heading overflow at 375px**: Headings in Hero (`2.75rem` / 44px), CTA (`2.25rem` / 36px), and FAQ (`2rem` / 32px) use fixed rem values without CSS `clamp()` or word breaks; institutional vocabulary ("Deterministic", "Institutional") exceeds 327px mobile container widths and clips horizontally.
- **Missing mobile viewport architecture for header navigation**: `LandingPage` renders a flex header row containing 5 non-wrapping elements (~515px wide) that overflows a 375px screen by 188px, completely lacking mobile navigation, drawer, or responsive collapse.
- **Violations of explicit AI-slop bans**: Components incorporate strictly banned patterns: gradient text (`-webkit-background-clip: text` purple-to-gold), middle-dot meta strings (`&bull;`), decorative glassmorphism (`backdrop-filter: blur(8px)`), tracked uppercase eyebrows, trailing arrow decorators, and identical card grids.
- **Phantom token references**: Components rely on `var(--joy-color-surface-elevated, #ffffff)` and `var(--joy-color-text-secondary, #334155)`, neither of which exists in `tokens.json`, causing uncalibrated fallbacks to leak into production builds.
- **Unverified, low-contrast focus rings**: `.joy-button:focus-visible` applies a 35% opacity gold box shadow (`rgba(196, 154, 58, 0.35)`) with ~1.1:1 contrast on light backgrounds, failing WCAG 2.2 AA visible focus indicators (≥ 3:1).
- **Gold used on light surfaces violating WCAG AA**: Brand gold `#c49a3a` has 2.36:1 contrast on cream canvas and 2.62:1 on white card, yet is deployed for body links, badges, stat values, and icons without necessary darkening.
- **Svelte-to-React parity divergence**: All 14 Svelte landing components swallow rest props and do not expose or bind DOM references (`ref`), whereas React twins implement `React.forwardRef` and spread `{...props}`. Event callback casing also diverges (`onprimaryclick` vs `onPrimaryClick`).

## Issues
| ID | Sev | Category | File:line | Issue | Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| SVL-001 | P0 | color | `packages/tokens/build.js:1950` | .joy-hero .joy-button--outline sets color: #f8f3e8 on light canvas #f8f3e8 (1.00:1 contrast), rendering secondary hero button text completely invisible in light mode | Remove .kinetic-overlay style leakage; use semantic tokens var(--joy-text-primary) and var(--joy-border) for light mode outline buttons |
| SVL-002 | P0 | taste | `packages/svelte/src/lib/HeroSection.svelte:45` | .joy-hero__title-gradient uses -webkit-background-clip: text with linear-gradient(#7c3aed, #c49a3a), violating the absolute ban on gradient text and introducing purple | Remove titleGradient prop and gradient CSS; render hero title as unified solid text using var(--joy-text-primary) |
| SVL-003 | P0 | mobile | `packages/tokens/build.js:1919` | .joy-hero__title has fixed font-size: 2.75rem (44px) without clamp; 13-character word "Deterministic" (354px) overflows 375px screen (327px container) | Apply font-size: clamp(1.875rem, 5vw + 1rem, 2.75rem) and overflow-wrap: break-word |
| SVL-004 | P1 | color | `packages/tokens/build.js:1912` | .joy-hero__badge uses gold text #c49a3a on cream canvas #f8f3e8 (2.36:1 contrast), failing WCAG 2.2 AA (>= 4.5:1 for small text) | Use high-contrast text color #785306 or var(--joy-text-primary), reserving gold for border or indicator dot |
| SVL-005 | P1 | taste | `packages/tokens/build.js:1954` | Secondary hero CTA applies backdrop-filter: blur(8px) (decorative glassmorphism), explicitly banned in standards | Remove backdrop-filter and -webkit-backdrop-filter; use solid tokenized background |
| SVL-006 | P1 | taste | `packages/svelte/src/lib/HeroSection.svelte:62` | Primary CTA button appends trailing arrow SVG icon, violating the ban on trailing arrows appended to link/button text | Remove trailing arrow SVG; rely on clear action-oriented button copy |
| SVL-007 | P1 | mobile | `packages/tokens/build.js:1942` | .joy-hero__ctas lacks mobile media query; buttons do not expand to full width on viewports <= 430px, leaving misaligned centered pill buttons | Add @media (max-width: 480px) { .joy-hero__ctas { flex-direction: column; width: 100%; } .joy-hero__ctas .joy-button { width: 100%; } } |
| SVL-008 | P1 | state | `packages/svelte/src/lib/HeroSection.svelte:4` | HeroSection props lack loading, disabled, and href properties for primary and secondary actions | Add primaryLoading, primaryDisabled, secondaryLoading, secondaryDisabled, primaryHref, secondaryHref props |
| SVL-009 | P1 | a11y | `packages/tokens/build.js:80` | Hero button focus ring relies on box-shadow: 0 0 0 3px rgba(196, 154, 58, 0.35) (~1.1:1 contrast on light canvas), failing WCAG 2.2 focus appearance | Replace with 2px solid outline: 2px solid var(--navy-500); outline-offset: 2px; |
| SVL-010 | P1 | dark | `packages/tokens/build.js:1973` | [data-theme="dark"] .joy-hero__preview hardcodes Tailwind slate-800 (#1e293b) and slate-700 (#334155) instead of brand tokens | Replace hardcoded hex with var(--joy-surface-card) and var(--joy-border) |
| SVL-011 | P1 | parity | `packages/svelte/src/lib/HeroSection.svelte:28` | HeroSection does not forward rest props or accept/bind a ref, whereas React twin supports forwardRef and {...props} | Capture ...restProps in $props() and spread onto root <section class="joy-hero {className}" {...restProps}> |
| SVL-012 | P2 | state | `packages/tokens/build.js:77` | Hero solid button lacks hover lift (translateY(-1px)) and active pressed inner shadow, failing tactile production-grade button bar | Add hover translateY(-1px) and active box-shadow: inset 0 2px 4px rgba(0,0,0,0.2) |
| SVL-013 | P2 | copy | `packages/svelte/src/lib/HeroSection.svelte:22` | Default CTA props use Title Case ("Get Started Free", "Explore Documentation") instead of sentence case | Change defaults to sentence case: "Get started free" and "Explore documentation" |
| SVL-014 | P2 | a11y | `packages/svelte/src/lib/HeroSection.svelte:34` | Hero badge SVG polygon icon lacks aria-hidden="true" | Add aria-hidden="true" and focusable="false" to badge SVG |
| SVL-015 | P0 | color | `packages/tokens/build.js:154` | .joy-button--glass inherits color: var(--joy-text-primary, #f8f3e8) (#1f1c13 in light mode) on dark navy CTA container (1.2:1 contrast), rendering text illegible | Set color-scheme: dark and rebind --joy-text-primary: #f8f3e8 locally on .joy-cta-section__container |
| SVL-016 | P0 | mobile | `packages/tokens/build.js:3475` | .joy-cta-section__title has fixed font-size: 2.25rem (36px) without clamp; inside 263px mobile container, "Institutional" (290px) overflows | Apply font-size: clamp(1.5rem, 4vw + 0.5rem, 2.25rem) and reduce container mobile padding to 20px |
| SVL-017 | P1 | taste | `packages/svelte/src/lib/CTASection.svelte:46` | Secondary button uses joy-button--glass with backdrop-filter: blur(8px), violating the decorative glassmorphism ban | Replace joy-button--glass with solid tokenized outline button variant |
| SVL-018 | P1 | taste | `packages/svelte/src/lib/CTASection.svelte:37` | CTA primary button appends trailing arrow SVG icon, violating the ban on trailing button arrows | Remove trailing arrow SVG; rely on clear action copy |
| SVL-019 | P1 | mobile | `packages/tokens/build.js:3469` | .joy-cta-section__container has 32px side padding nested inside 24px section padding, wasting 112px on 375px screens | Reduce padding on mobile: @media (max-width: 480px) { .joy-cta-section { padding: 32px 16px; } .joy-cta-section__container { padding: 40px 20px; } } |
| SVL-020 | P1 | mobile | `packages/tokens/build.js:3489` | .joy-cta-section__actions buttons do not expand to 100% width on viewports <= 430px | Add mobile media query stacking buttons vertically with width: 100% |
| SVL-021 | P1 | state | `packages/svelte/src/lib/CTASection.svelte:2` | Missing loading, disabled, and href props for CTASection primary and secondary actions | Add primaryLoading, primaryDisabled, secondaryLoading, secondaryDisabled, primaryHref, secondaryHref props |
| SVL-022 | P1 | dark | `packages/tokens/build.js:3468` | .joy-cta-section__container border #2d4566 on dark canvas #0d1829 has 1.83:1 contrast, failing WCAG 3:1 UI border contrast | Tune border color in dark mode to at least 3:1 (e.g. #3b567d or var(--joy-border)) |
| SVL-023 | P1 | parity | `packages/svelte/src/lib/CTASection.svelte:20` | CTASection in Svelte does not forward rest props or expose/bind a ref, diverging from React twin | Forward ...restProps and bind ref in Svelte component |
| SVL-024 | P2 | copy | `packages/svelte/src/lib/CTASection.svelte:15` | Default CTA texts use generic SaaS Title Case: "Get Started Today", "Contact Sales" | Change to specific active sentence-case copy: "Start trading today", "Talk to an institutional specialist" |
| SVL-025 | P2 | a11y | `packages/svelte/src/lib/CTASection.svelte:23` | <section> element lacks an aria-labelledby linking to the section title | Add id="cta-title" to <h2> and aria-labelledby="cta-title" to <section> |
| SVL-026 | P0 | color | `packages/tokens/build.js:2002` | .joy-pricing-card--featured sets border-color: var(--joy-color-brand-primary, #7c3aed) and purple box-shadow rgba(124, 58, 237, 0.15) | Replace purple #7c3aed and shadow with brand gold var(--gold-400, #c49a3a) and rgba(196, 154, 58, 0.2) |
| SVL-027 | P0 | color | `packages/tokens/build.js:2007` | .joy-pricing-card__badge uses purple gradient background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%) | Replace purple gradient with solid brand gold #c49a3a or navy #14253e badge |
| SVL-028 | P0 | color | `packages/svelte/src/lib/PricingCard.svelte:48` | Pricing feature checkmark icon uses foreign fallback #10b981 with 2.54:1 contrast on white card, failing WCAG AA (>= 3:1 UI) | Use brand-tuned success token #047857 meeting >= 3:1 contrast; remove inline style |
| SVL-029 | P1 | mobile | `packages/tokens/build.js:2005` | Featured pricing card has transform: scale(1.02); which extends beyond grid bounds, causing horizontal clipping on 375px screens | Disable transform: scale(1.02) inside mobile media queries (@media (max-width: 768px) { transform: none; }) |
| SVL-030 | P1 | dark | `packages/tokens/build.js:1998` | [data-theme="dark"] .joy-pricing-card hardcodes slate-800 (#1e293b) and slate-700 (#334155) instead of token-driven surfaces | Bind to var(--joy-surface-card) and var(--joy-border) |
| SVL-031 | P1 | dark | `packages/tokens/build.js:2027` | Dark mode pricing title, price, and feature text hardcode slate ramp (#f8fafc, #cbd5e1) instead of semantic tokens | Use var(--joy-text-primary) and var(--joy-color-text-muted) |
| SVL-032 | P1 | taste | `packages/tokens/build.js:2018` | Pricing badge uses text-transform: uppercase; letter-spacing: 0.05em; (tracked ALL-CAPS eyebrow style), violating AI-slop bans | Use sentence case with normal tracking: text-transform: none; letter-spacing: normal; |
| SVL-033 | P1 | consistency | `packages/tokens/build.js:2066` | .joy-pricing-card__feature references --joy-color-text-secondary with fallback #334155, a token that does not exist in tokens.json | Declare --joy-color-text-secondary in tokens.json or use --joy-color-text-muted |
| SVL-034 | P1 | parity | `packages/svelte/src/lib/PricingCard.svelte:26` | PricingCard in Svelte does not forward rest props or ref, unlike React twin | Forward ...restProps and bind ref in PricingCard.svelte |
| SVL-035 | P2 | consistency | `packages/svelte/src/lib/PricingCard.svelte:60` | Button width and margin applied via inline style style="width: 100%; margin-top: auto;" instead of CSS class | Move inline styles to .joy-pricing-card__button CSS class |
| SVL-036 | P2 | a11y | `packages/svelte/src/lib/PricingMatrix.svelte:15` | PricingMatrix is an unsemantic <div> lacking landmark/region role or accessible label | Add role="region" aria-label="Pricing plans" to matrix container |
| SVL-037 | P2 | copy | `packages/svelte/src/lib/PricingCard.svelte:21` | Default CTA label "Get Started" uses generic Title Case | Change default to sentence case "Get started" or "Select plan" |
| SVL-038 | P0 | color | `packages/tokens/build.js:3345` | .joy-feature-card__link uses gold text #c49a3a on white card, producing 2.62:1 contrast (fails WCAG AA 4.5:1 text requirement) | Use high-contrast brand link color (e.g. var(--navy-500) with gold underline, or dark amber #825a00 >= 4.5:1) |
| SVL-039 | P1 | color | `packages/tokens/build.js:3315` | .joy-feature-card__icon uses gold #c49a3a on rgba(196, 154, 58, 0.12), failing WCAG 3:1 UI icon contrast | Deepen icon color to #825a00 or increase container contrast |
| SVL-040 | P1 | taste | `packages/svelte/src/lib/FeatureCard.svelte:52` | Feature link element appends trailing arrow SVG icon, violating the ban on trailing link arrows | Remove arrow icon from link markup |
| SVL-041 | P1 | state | `packages/tokens/build.js:3345` | .joy-feature-card__link lacks :focus-visible styling, leaving keyboard users with no focus indicator | Add .joy-feature-card__link:focus-visible { outline: 2px solid var(--navy-500); outline-offset: 2px; } |
| SVL-042 | P1 | a11y | `packages/svelte/src/lib/FeatureCard.svelte:42` | Link defaults to href="#" when using onlinkclick, breaking middle-click and page scrolling | Render a semantic <button type="button"> when acting as an action handler without a valid URL |
| SVL-043 | P1 | mobile | `packages/tokens/build.js:3291` | .joy-feature-grid--cols-2 uses minmax(320px, 1fr) which leaves only 7px tolerance on 375px screens with 24px gutters | Adjust mobile breakpoint to minmax(100%, 1fr) under 768px |
| SVL-044 | P1 | dark | `packages/tokens/build.js:3300` | No dark mode rules for .joy-feature-card; text-muted fallback #64748b on dark card #14253e yields 3.24:1 contrast (fails 4.5:1) | Add explicit dark-mode text mapping (--joy-color-text-muted: #94a3b8 calibrated to >= 4.5:1) |
| SVL-045 | P1 | parity | `packages/svelte/src/lib/FeatureCard.svelte:24` | Svelte FeatureCard does not forward rest props, diverging from React twin | Capture ...restProps and spread onto root card |
| SVL-046 | P2 | a11y | `packages/svelte/src/lib/FeatureCard.svelte:52` | Arrow SVG inside link lacks aria-hidden="true" | Add aria-hidden="true" to SVG |
| SVL-047 | P0 | color | `packages/tokens/build.js:1836` | Hover states on BentoCard set border-color: rgba(124, 58, 237, 0.4) (light) and rgba(168, 85, 247, 0.4) (dark) using foreign purple | Replace purple borders with brand gold var(--gold-400, #c49a3a) (rgba(196, 154, 58, 0.4)) |
| SVL-048 | P0 | color | `packages/tokens/build.js:1872` | .joy-bento-card__badge has foreign fallback color: var(--joy-color-brand-primary, #7c3aed) (purple) | Change fallback to brand gold #c49a3a or ink #1f1c13 |
| SVL-049 | P0 | mobile | `packages/tokens/build.js:1859` | @media (max-width: 900px) in BentoGrid fails to collapse .joy-bento-card--col-span-1, --col-span-11, and --col-span-12 to span 12, breaking mobile 1-column layout | Include --col-span-1, --col-span-11, and --col-span-12 in the 900px collapse media query |
| SVL-050 | P1 | dark | `packages/tokens/build.js:1838` | Dark mode BentoCard hardcodes slate-800 (#1e293b) and slate-700 (#334155) instead of tokens --joy-surface-card and --joy-border | Use var(--joy-surface-card) and var(--joy-border) |
| SVL-051 | P1 | consistency | `packages/tokens/build.js:1824` | BentoCard uses --joy-color-surface-elevated which is not declared in tokens.json | Declare --joy-color-surface-elevated in tokens.json |
| SVL-052 | P2 | motion | `packages/tokens/build.js:1829` | BentoCard hover transitions lack prefers-reduced-motion override | Add @media (prefers-reduced-motion: reduce) { .joy-bento-card { transition: none; transform: none; } } |
| SVL-053 | P1 | parity | `packages/svelte/src/lib/BentoCard.svelte:22` | Svelte BentoCard lacks rest props forwarding and ref support | Capture ...restProps and bind ref |
| SVL-054 | P1 | taste | `packages/tokens/build.js:3367` | .joy-logo-cloud__title has text-transform: uppercase; letter-spacing: 0.08em; (tracked ALL-CAPS eyebrow), violating AI-slop ban | Use sentence case with normal tracking: text-transform: none; letter-spacing: normal; |
| SVL-055 | P1 | color | `packages/tokens/build.js:3372` | .joy-logo-cloud__title uses #64748b on cream canvas #f8f3e8, giving 4.30:1 contrast (fails WCAG AA 4.5:1) | Use calibrated darker muted token #526071 (>= 4.5:1) |
| SVL-056 | P1 | dark | `packages/tokens/build.js:3382` | Logos lack dark-mode inversion filter (filter: invert(1)), causing dark logo SVGs to vanish against dark background | Add [data-theme="dark"] .joy-logo-cloud__item { filter: grayscale(100%) invert(1); opacity: 0.75; } |
| SVL-057 | P1 | a11y | `packages/svelte/src/lib/LogoCloud.svelte:31` | External logo links lack aria-label="${item.name} (opens in new tab)" | Add aria-label with new-tab disclosure to logo links |
| SVL-058 | P2 | mobile | `packages/tokens/build.js:3379` | Large 48px horizontal gap between logos causes awkward sparse wrapping on 375px screens | Reduce gap on mobile via @media (max-width: 480px) { .joy-logo-cloud__logos { gap: 20px 24px; } } |
| SVL-059 | P0 | color | `packages/tokens/build.js:3550` | Trigger hover sets color: var(--gold-400, #c49a3a) with 2.62:1 contrast on white card (fails 4.5:1) | Keep text ink var(--joy-text-primary) on hover; use subtle background tint or accent dot |
| SVL-060 | P1 | color | `packages/tokens/build.js:3531` | Active accordion item sets border-color: var(--gold-400, #c49a3a) with 2.62:1 contrast on white (fails UI 3:1) | Use high-contrast border token var(--navy-500) or calibrated dark gold border |
| SVL-061 | P1 | a11y | `packages/svelte/src/lib/FAQSection.svelte:76` | Unmounting closed items ({#if isOpen}) prevents in-page search (Cmd+F) from finding answers | Keep content in DOM with hidden attribute or zero grid-template-rows height |
| SVL-062 | P1 | motion | `packages/svelte/src/lib/FAQSection.svelte:76` | Accordion expand/collapse has no height animation, snapping abruptly | Implement smooth CSS grid-template-rows animation (0fr to 1fr) with prefers-reduced-motion override |
| SVL-063 | P1 | dark | `packages/tokens/build.js:3519` | Zero dark mode rules for FAQ items; answer text #64748b on #14253e yields 3.24:1 contrast (fails 4.5:1) | Add dark-mode rules for FAQ cards and text ensuring >= 4.5:1 contrast |
| SVL-064 | P2 | copy | `packages/svelte/src/lib/FAQSection.svelte:17` | Title defaults to Title Case ("Frequently Asked Questions") | Use sentence case "Frequently asked questions" |
| SVL-065 | P0 | color | `packages/tokens/build.js:3425` | .joy-stat-item__value uses gold #c49a3a on white card, giving 2.62:1 contrast (fails 4.5:1) | Render numeric values in var(--joy-text-primary, #1f1c13) and reserve gold for accent badges |
| SVL-066 | P0 | color | `packages/tokens/build.js:3450` | Positive change uses #10b981 (2.54:1 on white) and negative change uses #ef4444 (3.76:1 on white), both failing WCAG AA (4.5:1) | Use calibrated status text tokens #047857 green and #b91c1c red (each >= 4.5:1 on light card) |
| SVL-067 | P1 | a11y | `packages/svelte/src/lib/StatsSection.svelte:30` | Trend badge conveys meaning by color without accessible text for screen readers | Add aria-label providing explicit trend direction (e.g. aria-label="Positive trend: -14% vs L1") |
| SVL-068 | P1 | mobile | `packages/tokens/build.js:3405` | minmax(220px, 1fr) creates 4 tall full-width cards on 375px screens instead of a compact 2x2 grid | Provide 2-column compact layout on mobile: @media (max-width: 480px) { .joy-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } } |
| SVL-069 | P1 | dark | `packages/tokens/build.js:3454` | Negative change #ef4444 on dark card #14253e has 4.09:1 contrast (fails 4.5:1) | Remap dark mode negative change to #f87171 (>= 4.5:1 on dark card) |
| SVL-070 | P0 | color | `packages/svelte/src/lib/TestimonialCard.svelte:35` | Avatar fallback background uses style="background-color: var(--joy-color-brand-primary, #7c3aed);" (foreign purple fallback) | Change fallback to brand gold #c49a3a or navy #14253e |
| SVL-071 | P0 | color | `packages/tokens/build.js:2092` | Rating stars use #eab308 (Tailwind yellow-500) with 1.92:1 contrast on white card (fails UI 3:1) | Use brand gold var(--gold-400, #c49a3a) with contrasting outline or calibrated amber |
| SVL-072 | P1 | a11y | `packages/svelte/src/lib/TestimonialCard.svelte:24` | Star SVGs lack aria-hidden="true" and rating container lacks an accessible aria-label description | Add role="img" aria-label="Rated {rating} out of 5 stars" and aria-hidden="true" to SVGs |
| SVL-073 | P1 | a11y | `packages/svelte/src/lib/TestimonialCard.svelte:37` | Avatar image alt={authorName} duplicates adjacent <h6>{authorName}</h6> in screen reader announcements | Set alt="" on decorative avatar image when name is rendered in text |
| SVL-074 | P1 | dark | `packages/tokens/build.js:2084` | Dark mode testimonial card hardcodes slate #1e293b and #334155 instead of semantic card tokens | Use var(--joy-surface-card) and var(--joy-border) |
| SVL-075 | P1 | dark | `packages/tokens/build.js:2118` | Author role in dark mode on #1e293b has 3.07:1 contrast (fails 4.5:1) | Add dark mode override for author role text meeting >= 4.5:1 |
| SVL-076 | P1 | taste | `packages/tokens/build.js:3604` | Column title uses text-transform: uppercase; letter-spacing: 0.06em; (tracked ALL-CAPS eyebrow) | Use sentence case and normal tracking: text-transform: none; letter-spacing: normal; font-weight: 700; |
| SVL-077 | P1 | mobile | `packages/tokens/build.js:3580` | grid-template-columns: 2fr repeat(auto-fit, minmax(160px, 1fr)) lacks single-column collapse on mobile viewports | Add @media (max-width: 768px) { .joy-site-footer__inner { grid-template-columns: 1fr; gap: 32px; } } |
| SVL-078 | P1 | mobile | `packages/tokens/build.js:3625` | Bottom copyright and social links wrap unevenly without vertical alignment on 375px screens | Add mobile column stacking: @media (max-width: 640px) { .joy-site-footer__bottom { flex-direction: column-reverse; align-items: flex-start; } } |
| SVL-079 | P1 | dark | `packages/tokens/build.js:3571` | No dark mode rules for SiteFooter; footer links and copyright #64748b on #14253e yield 3.24:1 contrast (fails 4.5:1) | Add dark mode text color rules guaranteeing >= 4.5:1 contrast |
| SVL-080 | P1 | a11y | `packages/svelte/src/lib/SiteFooter.svelte:83` | Social links opening new windows lack aria-label with "(opens in new tab)" disclosure | Add descriptive aria-label to social links |
| SVL-081 | P2 | copy | `packages/svelte/src/lib/SiteFooter.svelte:34` | Brand description defaults to buzzword-dense jargon ("High-velocity institutional quantitative design system...") | Replace with composed brand copy: "Enterprise design system for high-performance financial interfaces." |
| SVL-082 | P0 | mobile | `packages/svelte/src/lib/LandingPage.svelte:100` | Header nav row has 5 non-wrapping items (~515px) overflowing 375px screens by 188px with no mobile navigation | Implement responsive mobile navigation drawer/hamburger toggle under 768px and eliminate horizontal scroll |
| SVL-083 | P0 | taste | `packages/svelte/src/lib/LandingPage.svelte:122` | badgeText="Institutional Engine &bull; Sub-5μs Execution" contains middle-dot &bull;, explicitly banned by standards | Remove &bull;; use clean single-concept badge copy "Sub-5μs execution engine" |
| SVL-084 | P0 | taste | `packages/svelte/src/lib/LandingPage.svelte:123` | Uses titleGradient="Quantitative UI Systems", violating the explicit ban on gradient text | Remove titleGradient and render title as solid compose text |
| SVL-085 | P0 | dark | `packages/svelte/src/lib/LandingPage.svelte:98` | Default palette="joymify" forces dark navy canvas #0d1829 even when light mode is expected | Palette engine must scope dark tokens to [data-palette="joymify"][data-theme="dark"] rather than overriding canvas unconditionally |
| SVL-086 | P1 | taste | `packages/svelte/src/lib/LandingPage.svelte:148` | Feature grid renders 3 identical cards with no visual variation and repetitive link labels ("Learn more", "Inspect tokens", "View demo") | Differentiate cards with unique graphical slots, metrics, and bespoke action copy |
| SVL-087 | P1 | consistency | `packages/svelte/src/lib/LandingPage.svelte:100` | Header is styled using inline CSS properties instead of design tokens, violating Design Principle #1 | Move header styling into dedicated .joy-landing-header CSS class using tokens |
| SVL-088 | P1 | color | `packages/svelte/src/lib/LandingPage.svelte:101` | Header text and links use foreign slate fallbacks #0f172a and #64748b | Use brand tokens --joy-text-primary and brand-tuned muted token |
| SVL-089 | P2 | copy | `packages/svelte/src/lib/LandingPage.svelte:181` | CTA headline uses generic SaaS question trope ("Ready to Transform Your Institutional Trading Platform?") | Change to active declarative statement: "Build institutional trading interfaces with deterministic precision" |
| SVL-090 | P2 | a11y | `packages/svelte/src/lib/LandingPage.svelte:98` | LandingPage lacks a skip navigation link for keyboard screen reader users | Add <a href="#main-content" class="joy-skip-link">Skip to main content</a> at the top of LandingPage |

## Contrast table
| Pair | Theme | Foreground | Background | Ratio | Target | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Gold on White Canvas | Light | `#c49a3a` | `#ffffff` | 2.62:1 | 4.5:1 | **FAIL** |
| Gold on Cream Canvas (#f8f3e8) | Light | `#c49a3a` | `#f8f3e8` | 2.36:1 | 4.5:1 | **FAIL** |
| Ink on Cream Canvas (#f8f3e8) | Light | `#1f1c13` | `#f8f3e8` | 15.38:1 | 4.5:1 | PASS |
| Ink on White Card | Light | `#1f1c13` | `#ffffff` | 17.02:1 | 4.5:1 | PASS |
| Navy surface (#14253e) on Cream Canvas | Light | `#14253e` | `#f8f3e8` | 13.91:1 | 3.0:1 | PASS |
| Hero badge gold (#c49a3a) on white card | Light | `#c49a3a` | `#ffffff` | 2.62:1 | 4.5:1 | **FAIL** |
| Hero badge gold (#c49a3a) on cream canvas | Light | `#c49a3a` | `#f8f3e8` | 2.36:1 | 4.5:1 | **FAIL** |
| Hero title (#0f172a fallback) on cream (#f8f3e8) | Light | `#0f172a` | `#f8f3e8` | 16.13:1 | 4.5:1 | PASS |
| Hero subtitle slate (#64748b) on cream (#f8f3e8) | Light | `#64748b` | `#f8f3e8` | 4.30:1 | 4.5:1 | **FAIL** |
| Hero subtitle slate (#64748b) on white (#ffffff) | Light | `#64748b` | `#ffffff` | 4.76:1 | 4.5:1 | PASS |
| Hero button solid text (#14253e navy) on gold (#c49a3a) | Dark | `#14253e` | `#c49a3a` | 5.89:1 | 4.5:1 | PASS |
| Hero button outline text (#f8f3e8 cream) on light hero canvas (#f8f3e8) | Light | `#f8f3e8` | `#f8f3e8` | 1.00:1 | 4.5:1 | **FAIL** |
| Hero button outline text (#f8f3e8 cream) on white (#ffffff) | Light | `#f8f3e8` | `#ffffff` | 1.11:1 | 4.5:1 | **FAIL** |
| Hero title dark (#f8fafc) on dark canvas (#0d1829) | Dark | `#f8fafc` | `#0d1829` | 17.01:1 | 4.5:1 | PASS |
| Hero preview border (#334155) on dark canvas (#0d1829) | Dark | `#334155` | `#0d1829` | 1.72:1 | 3.0:1 | **FAIL** |
| CTA title (#f8f3e8 cream) on CTA navy gradient (#14253e) | Dark | `#f8f3e8` | `#14253e` | 13.91:1 | 4.5:1 | PASS |
| CTA title (#f8f3e8 cream) on CTA dark navy (#0d1a2d) | Dark | `#f8f3e8` | `#0d1a2d` | 15.78:1 | 4.5:1 | PASS |
| CTA desc (rgba(248,243,232,0.8) ~ #e6e2d9) on #14253e | Dark | `#e6e2d9` | `#14253e` | 11.91:1 | 4.5:1 | PASS |
| CTA secondary glass text (#f8f3e8) on #14253e | Dark | `#f8f3e8` | `#14253e` | 13.91:1 | 4.5:1 | PASS |
| CTA border (#2d4566) on #14253e | Dark | `#2d4566` | `#14253e` | 1.58:1 | 3.0:1 | **FAIL** |
| Pricing title (#0f172a) on white card | Light | `#0f172a` | `#ffffff` | 17.85:1 | 4.5:1 | PASS |
| Pricing desc (#64748b) on white card | Light | `#64748b` | `#ffffff` | 4.76:1 | 4.5:1 | PASS |
| Pricing feature text (#334155) on white card | Light | `#334155` | `#ffffff` | 10.35:1 | 4.5:1 | PASS |
| Pricing check icon (#10b981) on white card | Light | `#10b981` | `#ffffff` | 2.54:1 | 3.0:1 | **FAIL** |
| Pricing badge text (#ffffff) on purple (#7c3aed) | Light | `#ffffff` | `#7c3aed` | 5.70:1 | 4.5:1 | PASS |
| Pricing dark title (#f8fafc) on slate card (#1e293b) | Dark | `#f8fafc` | `#1e293b` | 13.98:1 | 4.5:1 | PASS |
| Pricing dark feature (#cbd5e1) on slate card (#1e293b) | Dark | `#cbd5e1` | `#1e293b` | 9.85:1 | 4.5:1 | PASS |
| Pricing dark border (#334155) on slate card (#1e293b) | Dark | `#334155` | `#1e293b` | 1.41:1 | 3.0:1 | **FAIL** |
| Feature icon gold (#c49a3a) on white card | Light | `#c49a3a` | `#ffffff` | 2.62:1 | 3.0:1 | **FAIL** |
| Feature link gold (#c49a3a) on white card | Light | `#c49a3a` | `#ffffff` | 2.62:1 | 4.5:1 | **FAIL** |
| Feature border (#e2e8f0 fallback) on white card | Light | `#e2e8f0` | `#ffffff` | 1.23:1 | 3.0:1 | **FAIL** |
| Testimonial stars (#eab308 yellow) on white card | Light | `#eab308` | `#ffffff` | 1.92:1 | 3.0:1 | **FAIL** |
| Testimonial quote (#0f172a) on white card | Light | `#0f172a` | `#ffffff` | 17.85:1 | 4.5:1 | PASS |
| Testimonial role (#64748b) on white card | Light | `#64748b` | `#ffffff` | 4.76:1 | 4.5:1 | PASS |
| Testimonial dark quote (#f1f5f9) on slate card (#1e293b) | Dark | `#f1f5f9` | `#1e293b` | 13.35:1 | 4.5:1 | PASS |
| Testimonial dark role (#64748b) on slate card (#1e293b) | Dark | `#64748b` | `#1e293b` | 3.07:1 | 4.5:1 | **FAIL** |
| Stats value gold (#c49a3a) on white card | Light | `#c49a3a` | `#ffffff` | 2.62:1 | 4.5:1 | **FAIL** |
| Stats change positive (#10b981) on white card | Light | `#10b981` | `#ffffff` | 2.54:1 | 4.5:1 | **FAIL** |
| Stats change negative (#ef4444) on white card | Light | `#ef4444` | `#ffffff` | 3.76:1 | 4.5:1 | **FAIL** |
| Stats desc (#64748b) on white card | Light | `#64748b` | `#ffffff` | 4.76:1 | 4.5:1 | PASS |
| FAQ question (#0f172a) on white card | Light | `#0f172a` | `#ffffff` | 17.85:1 | 4.5:1 | PASS |
| FAQ icon gold (#c49a3a) on white card | Light | `#c49a3a` | `#ffffff` | 2.62:1 | 3.0:1 | **FAIL** |
| FAQ answer (#64748b) on white card | Light | `#64748b` | `#ffffff` | 4.76:1 | 4.5:1 | PASS |
| Logo cloud title (#64748b) on cream (#f8f3e8) | Light | `#64748b` | `#f8f3e8` | 4.30:1 | 4.5:1 | **FAIL** |
| Logo cloud title (#64748b) on white (#ffffff) | Light | `#64748b` | `#ffffff` | 4.76:1 | 4.5:1 | PASS |
| Footer brand title (#0f172a) on white (#ffffff) | Light | `#0f172a` | `#ffffff` | 17.85:1 | 4.5:1 | PASS |
| Footer desc (#64748b) on white (#ffffff) | Light | `#64748b` | `#ffffff` | 4.76:1 | 4.5:1 | PASS |
| Footer link (#64748b) on white (#ffffff) | Light | `#64748b` | `#ffffff` | 4.76:1 | 4.5:1 | PASS |
| Footer bottom copyright (#64748b) on white (#ffffff) | Light | `#64748b` | `#ffffff` | 4.76:1 | 4.5:1 | PASS |
| Footer border (#e2e8f0) on white (#ffffff) | Light | `#e2e8f0` | `#ffffff` | 1.23:1 | 3.0:1 | **FAIL** |
| Footer link (#64748b fallback) on navy card (#14253e) | Dark | `#64748b` | `#14253e` | 3.24:1 | 4.5:1 | **FAIL** |
| Footer bottom copyright (#64748b) on navy card (#14253e) | Dark | `#64748b` | `#14253e` | 3.24:1 | 4.5:1 | **FAIL** |
| Footer border (#e2e8f0 fallback) on navy card (#14253e) | Dark | `#e2e8f0` | `#14253e` | 12.49:1 | 3.0:1 | PASS |
| FAQ answer (#64748b fallback) on navy card (#14253e) | Dark | `#64748b` | `#14253e` | 3.24:1 | 4.5:1 | **FAIL** |
| Feature desc (#64748b fallback) on navy card (#14253e) | Dark | `#64748b` | `#14253e` | 3.24:1 | 4.5:1 | **FAIL** |
| Feature link gold (#c49a3a) on navy card (#14253e) | Dark | `#c49a3a` | `#14253e` | 5.89:1 | 4.5:1 | PASS |
| Stats desc (#64748b fallback) on navy card (#14253e) | Dark | `#64748b` | `#14253e` | 3.24:1 | 4.5:1 | **FAIL** |
| Stats change positive (#10b981) on navy card (#14253e) | Dark | `#10b981` | `#14253e` | 6.07:1 | 4.5:1 | PASS |
| Stats change negative (#ef4444) on navy card (#14253e) | Dark | `#ef4444` | `#14253e` | 4.09:1 | 4.5:1 | **FAIL** |
