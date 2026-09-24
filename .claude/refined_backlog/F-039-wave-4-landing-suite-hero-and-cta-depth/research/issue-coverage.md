# F-039 issue coverage (SVL-001..090, 78 landing RXF rows)

The spec requires that every SVL- and landing RXF- issue is resolved or deferred with a reason. This table is the machine-checked record: `node .claude/refined_backlog/F-039-wave-4-landing-suite-hero-and-cta-depth/research/id-coverage.mjs` reads `audit-landing-svelte.md` for the SVL rows and `audit-react-forms-landing.md` for the severities of a fixed list of 78 RXF rows embedded in the script, reads this file for the statuses, prints the summary line and exits 1 if an ID is missing, listed twice, outside the universe, has an empty or unknown status, has an empty Where cell, carries a different severity than the audit, or is deferred without a reason.

Totals: 168 issues = 117 closed, 49 verify-only (already clean), 2 deferred, 0 n/a (out of scope).

## Status meanings

| Status | Meaning |
| :--- | :--- |
| closed | The wave changed the code, CSS or markup that the audit row names. Where names the component, the lane and the commit(s) (sha7 on `feat/F-039`). If the audited defect was already gone at base but the lane still rewrote the cited rule, the row is closed and the Note says the audit text was stale. |
| verify-only (already clean) | The defect named by the audit was not present at the start of the wave (commit 13d7805 and Waves 1-3 had already tokenised most of `packages/tokens/build.js`), or the "divergence" is the documented casing convention (React `onPrimaryClick` / `className`, Svelte `onprimaryclick` / `class`). The lane re-checked it against the code, usually pinned it with a test, and left the cited rule alone. |
| deferred | Not done in this wave; the Note gives the reason. Details in `rulings-and-deferrals.md` section 2. |
| n/a (out of scope) | Not used: no audit row in the universe was ruled out of scope. |

## Notes on reading the table

- Universe: 90 SVL rows plus 78 RXF rows = 168. The RXF rows are the 77 landing rows Wave 2 (F-037) deferred to this wave plus RXF-002 (the `.joy-button--glass` CTA contrast row, which the F-037 deferral list skipped). RXF-136/137 (hero button lift and focus ring) were closed by Wave 2 and are not in this universe; the other RXF rows are forms rows owned by Wave 2.
- Lane names: A1 (parity checker ref/rest check), A2 (SSR and loader test helpers), L1 (HeroSection, CTASection, internal LandingAction), L2 (PricingCard, PricingMatrix), L3 (FeatureCard, FeatureGrid, BentoCard, BentoGrid), L4 (LogoCloud, StatsSection, TestimonialCard, FAQSection), L5a (SiteFooter), L5b (LandingPage, typed rest props), C1a (hub full-page simulator), C1b (hub landing blocks, generator), C2 (Playwright contracts), D1 (strict colour lint over the 28 landing files), T1 and T2 (taste review round 1 fixes: components/CSS and hub).
- An RXF row whose text duplicates an SVL row (same `build.js` rule, React twin of a Svelte finding) cites the same commits; the note says "as SVL-nnn". Both twins and the single CSS source in `build.js` changed in the same lane commit.
- Later commits listed after the lane commit are follow-ups that touched the same rule: review fix rounds (96b19d3, 71861de, 5ed2763, 892b4b2, 1b1926a, 7185407, 5044994), the typed rest sweep (74a7a9d) and the taste fixes (c12e08f, 79cf406, b3e19f2, a2b5c5e, 22a0b9d, 80e0a0a, afb4648). The final state is what `feat/F-039` has at the D2 commit. Every sha7 below was checked with `git merge-base --is-ancestor <sha> HEAD`.
- Statuses were taken from the latest state of each lane report (fix-round corrections applied) and then normalised once against the honesty rule used by the reviewers ("closed only if the diff changed the cited rule or code"). One normalisation differs from a lane report: RXF-087..090 were reported `closed` by L4 but are `verify-only` here, because the audit text is only the class/className casing divergence (by design, unchanged), exactly like RXF-082/084/085/091; the ref, rest and typed-attribute work L4 did on those twins is recorded in the note.
- The CTA band described in L1-era notes (navy `--joy-surface-inverse` band with `--joy-text-inverse` text) was replaced in T1 (79cf406) by a raised band in both themes; rows touching the band describe the final state.

## Table

| ID | Sev | Status | Where | Note |
| :--- | :--- | :--- | :--- | :--- |
| SVL-001 | P0 | verify-only (already clean) | HeroSection hero outline rule, L1 c36b742 | No `#f8f3e8` leak at base: the hero outline already read `--joy-text-primary`. L1 tightened the border to `--joy-border-strong` and added a contrast test; the audited defect itself was absent |
| SVL-002 | P0 | closed | HeroSection, L1 c36b742 | `titleGradient`, the gradient span and its CSS removed; `titleEmphasis` renders a solid `--joy-accent-text` span (breaking rename, release note) |
| SVL-003 | P0 | closed | HeroSection, L1 c36b742 | Title on `--joy-font-size-display-md` clamp + `overflow-wrap: anywhere` + `text-wrap: balance` |
| SVL-004 | P1 | closed | HeroSection badge, L1 c36b742 | `--joy-accent-text` on `--joy-accent-subtle` (4.96 light / 7.94 dark) |
| SVL-005 | P1 | verify-only (already clean) | HeroSection CSS, L1 c36b742 | No `backdrop-filter` existed in the hero block at base; wave-4 contract test forbids it |
| SVL-006 | P1 | closed | HeroSection, L1 c36b742 | Trailing arrow SVG removed from the primary CTA |
| SVL-007 | P1 | closed | HeroSection CSS, L1 c36b742 | Actions stack full width at `max-width: 479px` |
| SVL-008 | P1 | closed | HeroSection + LandingAction, L1 c36b742; busy/disabled styling T1 79cf406 | `primaryHref`, `secondaryHref`, `primaryLoading`, `primaryDisabled`, `secondaryDisabled` added; `secondaryLoading` deliberately not added (brief prop list; see rulings section 2) |
| SVL-009 | P1 | verify-only (already clean) | `.joy-button:focus-visible` (Wave 2) | Wave 2 already draws a 2px `--joy-focus-ring` style ring; no rgba ring remains |
| SVL-010 | P1 | verify-only (already clean) | HeroSection CSS, L1 c36b742 | No `[data-theme="dark"] .joy-hero__preview` slate rule at base; preview uses surface and border tokens |
| SVL-011 | P1 | closed | HeroSection, L1 c36b742; typed rest L5b 74a7a9d | `ref = $bindable(null)` + `bind:this` + `{...rest}`; Props extend HTMLAttributes |
| SVL-012 | P2 | closed | HeroSection CSS, L1 c36b742 | 1px hover lift scoped to `.joy-hero` / `.joy-cta-section` with an `:active` reset (Wave 2 base keeps its 2px lift and pressed inset) |
| SVL-013 | P2 | closed | HeroSection, L1 c36b742 | Sentence-case defaults "Get started free", "Explore documentation" |
| SVL-014 | P2 | closed | HeroSection, L1 c36b742 | Badge SVG `aria-hidden="true"` + `focusable="false"` |
| SVL-015 | P0 | closed | CTASection, L1 c36b742, 96b19d3; band T1 79cf406 | `.joy-button--glass` and its CSS deleted; secondary is `joy-button--outline`. Final band is `--joy-surface-raised` with `--joy-text-primary` / `--joy-text-secondary` text in both themes (13.9+ / 17.0) |
| SVL-016 | P0 | closed | CTASection, L1 c36b742 | Title on `--joy-font-size-display-sm` clamp + `overflow-wrap: anywhere` + balance |
| SVL-017 | P1 | closed | CTASection, L1 c36b742 | Secondary button is the solid tokenised outline variant; no glass |
| SVL-018 | P1 | closed | CTASection, L1 c36b742 | Trailing arrow SVG removed |
| SVL-019 | P1 | closed | CTASection CSS, L1 c36b742 | At `max-width: 479px` section 32/16 and container 40/20 padding |
| SVL-020 | P1 | closed | CTASection CSS, L1 c36b742 | Actions stack full width under 480px |
| SVL-021 | P1 | closed | CTASection + LandingAction, L1 c36b742; busy/disabled styling T1 79cf406 | Same action props as the hero (no `secondaryLoading`, as SVL-008) |
| SVL-022 | P1 | closed | CTASection container, L1 c36b742; T1 79cf406 | Band border `--joy-border-strong`, asserted >= 3:1 against the canvas in both themes |
| SVL-023 | P1 | closed | CTASection, L1 c36b742; typed rest L5b 74a7a9d | ref + rest in Svelte; parity lists gate it |
| SVL-024 | P2 | closed | CTASection, L1 c36b742 | Sentence case "Get started today", "Contact sales"; the audit's trading-specific copy declined for a generic library |
| SVL-025 | P2 | closed | CTASection, L1 c36b742, 96b19d3 | `aria-labelledby` to a per-instance title id (`$props.id()` / `useId`); omitted when the caller passes `aria-label` |
| SVL-026 | P0 | closed | PricingCard featured rule, L2 c5b7e8b | Audit stale: base border was already `--joy-accent-default` (no purple). L2 rewrote the rule: 1px accent border + `--joy-elevation-2`, no scale (2.62:1 light border is a recorded decorative ruling) |
| SVL-027 | P0 | verify-only (already clean) | PricingCard badge, L2 c5b7e8b | No purple gradient at base (badge was solid accent). The L2 restyle to `--joy-accent-subtle` + `--joy-accent-text` is spec work, not this defect |
| SVL-028 | P0 | closed | PricingCard, L2 c5b7e8b | Inline `#10b981` removed; `@joymify/icons` Check in `.joy-pricing-card__check` on `--joy-status-success-fg` (>= 3:1 both themes) |
| SVL-029 | P1 | closed | PricingCard CSS, L2 c5b7e8b | `transform: scale(1.02)` removed entirely |
| SVL-030 | P1 | verify-only (already clean) | PricingCard CSS, L2 c5b7e8b | No `[data-theme]` pricing rule or slate hex at base; contract test forbids `[data-theme` in the block |
| SVL-031 | P1 | verify-only (already clean) | PricingCard CSS, L2 c5b7e8b | Text already on semantic tokens at base; period and description moved to `--joy-text-secondary` for 4.5:1 on raised in dark |
| SVL-032 | P1 | closed | PricingCard badge, L2 c5b7e8b | `text-transform` and letter-spacing removed; test bans uppercase in the block |
| SVL-033 | P1 | verify-only (already clean) | PricingCard CSS, L2 c5b7e8b | Rule already read `--joy-text-secondary` (defined in theme.css), no fallback |
| SVL-034 | P1 | closed | PricingCard, L2 c5b7e8b, 71861de; typed rest L5b 74a7a9d | ref bindable + `bind:this` + rest; mutation-checked ref and handler tests |
| SVL-035 | P2 | closed | PricingCard, L2 c5b7e8b | Inline style gone; `.joy-pricing-card__cta` + `joy-button--block` |
| SVL-036 | P2 | closed | PricingMatrix, L2 c5b7e8b | `role="region"` + `aria-label` (default "Pricing plans", `label` prop) |
| SVL-037 | P2 | closed | PricingCard, L2 c5b7e8b | Default CTA "Get started" |
| SVL-038 | P0 | closed | FeatureCard link, L3 2704fe5 | Link colour `--joy-text-link`, >= 4.5:1 both themes |
| SVL-039 | P1 | closed | FeatureCard icon, L3 2704fe5 | Glyph `--joy-accent-text` on a `--joy-accent-subtle` disc |
| SVL-040 | P1 | closed | FeatureCard, L3 2704fe5 | Link arrow SVG removed; test bans arrow glyphs and svg in the link |
| SVL-041 | P1 | closed | FeatureCard link, L3 2704fe5 | `:focus-visible` ring via `--joy-focus-ring` (rule was missing) |
| SVL-042 | P1 | closed | FeatureCard, L3 2704fe5, 5ed2763 | Handler without href renders `<button type="button">`; with href only plain primary clicks are intercepted |
| SVL-043 | P1 | closed | FeatureGrid CSS, L3 2704fe5 | `minmax(min(Npx, 100%), 1fr)`; lead layout is one column under 900px |
| SVL-044 | P1 | verify-only (already clean) | FeatureCard CSS, L3 2704fe5 | No dark rule or hex at base (dark is the token remap); restyled to raised + `--joy-text-secondary`, probed in dark with and without the attribute |
| SVL-045 | P1 | closed | FeatureCard, L3 2704fe5, 5ed2763 | Rest spread + ref; Props extend HTMLAttributes |
| SVL-046 | P2 | closed | FeatureCard, L3 2704fe5 | Closed by removing the arrow SVG, not by adding `aria-hidden` |
| SVL-047 | P0 | verify-only (already clean) | BentoCard hover, L3 2704fe5 | No purple at base (hover used `--joy-border-default`); block tested free of purple, gradient and glass |
| SVL-048 | P0 | verify-only (already clean) | BentoCard badge, L3 2704fe5 | No purple fallback at base; moved to `--joy-accent-text` for text contrast |
| SVL-049 | P0 | closed | BentoCard CSS, L3 2704fe5 | Collapse block (899px) covers spans 1..11 of both `--col-N` and `--col-span-N`; `--col-1/2/5/7/9/10/11` had no span rule at all and now do |
| SVL-050 | P1 | verify-only (already clean) | BentoCard CSS, L3 2704fe5 | No slate hex or `[data-theme]` rule at base; test forbids them |
| SVL-051 | P1 | verify-only (already clean) | BentoCard CSS, L3 2704fe5 | No phantom `--joy-color-*` read at base; test forbids it |
| SVL-052 | P2 | verify-only (already clean) | Wave 1 global reduced-motion block | The global block covers transitions and animations (F-038 ruling) |
| SVL-053 | P1 | closed | BentoCard, L3 2704fe5, 5ed2763 | Rest + `ref = $bindable(null)` + `bind:this`; mutation-checked |
| SVL-054 | P1 | verify-only (already clean) | LogoCloud title, L4 f506683 | No uppercase or letter-spacing at base (phase-b guards it); wave-4 test pins it |
| SVL-055 | P1 | closed | LogoCloud title, L4 f506683 | Audit stale (base was a muted token at 5.19:1); moved to `--joy-text-secondary`, asserted >= 4.5 in both themes |
| SVL-056 | P1 | closed | LogoCloud CSS, L4 f506683 | Logos are `currentColor` at `--joy-text-muted`, so the token remap handles dark; no `invert()` filter (would need a `[data-theme]` selector and miss OS dark) |
| SVL-057 | P1 | closed | LogoCloud, L4 f506683 | Links `aria-label="<name> (opens in a new tab)"`; non-link logos `role="img"` with a name |
| SVL-058 | P2 | closed | LogoCloud CSS, L4 f506683 | `gap: 24px 28px` at <= 480px |
| SVL-059 | P0 | closed | FAQSection trigger hover, L4 f506683 | Hover is an `--joy-accent-subtle` tint with ink text, no gold text |
| SVL-060 | P1 | closed | FAQSection open item, L4 f506683 | Open border `--joy-border-strong`, >= 3:1 both themes |
| SVL-061 | P1 | deferred | FAQSection, L4 f506683, 892b4b2 | Reason: answers now stay in the DOM with `hidden` (so `aria-controls` resolves) but Cmd+F cannot reveal a closed answer. The fix is `hidden="until-found"` plus `beforematch`; React 19.3 SSR renders that value as `hidden=""`, so the React twin needs an imperative ref/effect path while Svelte can do it declaratively. The content rule sets no `display`, so the attribute stays adoptable |
| SVL-062 | P1 | deferred | FAQSection, L4 f506683 | Reason: polish outside the brief. A 0fr/1fr grid height transition needs `inert`/`visibility` handling alongside `hidden`; the chevron rotation is animated on duration tokens and covered by reduced motion |
| SVL-063 | P1 | closed | FAQSection CSS, L4 f506683 | Raised surface, default/strong borders, secondary text; dark contrast asserted |
| SVL-064 | P2 | closed | FAQSection, L4 f506683 | Default title "Frequently asked questions" in both twins |
| SVL-065 | P0 | closed | StatsSection value, L4 f506683 | Value on `--joy-accent-text` (brief decision, not the audit's text-primary), >= 4.5 both themes |
| SVL-066 | P0 | verify-only (already clean) | StatsSection, L4 f506683 | Base already on `--joy-status-success-fg` / `--joy-status-danger-fg` (audit hex stale); L4 added the both-theme contrast assertion |
| SVL-067 | P1 | closed | StatsSection, L4 f506683; T1 22a0b9d | Visually hidden "Trend up:" / "Trend down:" words, arrows `aria-hidden`; change text in an inner span since T1 |
| SVL-068 | P1 | closed | StatsSection CSS, L4 f506683; T1 c12e08f, a2b5c5e | Compact two-column grid on small containers; since T1 every step is a container query on `.joy-stats-section` (odd last card spans the row, 3/4/5-across by count and width) |
| SVL-069 | P1 | verify-only (already clean) | StatsSection, L4 f506683 | Base already used `--joy-status-danger-fg`, which remaps in dark; asserted computed in dark |
| SVL-070 | P0 | closed | TestimonialCard, L4 f506683 | Inline purple fallback removed; `.joy-testimonial-card .joy-avatar` uses accent-subtle + accent-text |
| SVL-071 | P0 | verify-only (already clean) | TestimonialCard stars, L4 f506683 | Base already `--joy-status-warning-fg` (no `#eab308`); asserted in the CSS test and computed |
| SVL-072 | P1 | closed | TestimonialCard, L4 f506683 | Star row `role="img" aria-label="Rated N out of 5"`, star SVGs `aria-hidden`, rating clamped to a whole 0..5 |
| SVL-073 | P1 | closed | TestimonialCard, L4 f506683 | Avatar `alt=""` (name is adjacent text); initials `aria-hidden` |
| SVL-074 | P1 | verify-only (already clean) | TestimonialCard CSS, L4 f506683 | Base already on surface/border tokens (no slate literals); moved to raised + default border |
| SVL-075 | P1 | closed | TestimonialCard role text, L4 f506683 | Audit stale (base muted token at 4.74 dark); moved to `--joy-text-secondary`, asserted |
| SVL-076 | P1 | verify-only (already clean) | SiteFooter CSS, L5a cf57db8 | Uppercase and tracking already gone at base; test now covers every footer rule |
| SVL-077 | P1 | closed | SiteFooter CSS, L5a cf57db8, 7185407; T1 b3e19f2 | One column below 768px (`max-width: 767px`); the base desktop track list `2fr repeat(auto-fit, ...)` was invalid and dropped by Chromium (one column everywhere), replaced by wrapping flex rows; link groups pair up from 480 to 767px |
| SVL-078 | P1 | closed | SiteFooter CSS, L5a cf57db8 | Bottom bar `column-reverse` + `flex-start` at `max-width: 639px` |
| SVL-079 | P1 | closed | SiteFooter CSS, L5a cf57db8 | Audit hex stale (base muted on card passed AA); the real failure was the gold hover (2.62:1), now primary text + underline; text on `--joy-text-secondary` (11.36 light / 8.63 dark) |
| SVL-080 | P1 | closed | SiteFooter, L5a cf57db8, 7185407 | Social and external column links carry "(opens in new tab)" labels and `rel="noopener noreferrer"`; icon-less social links show their name |
| SVL-081 | P2 | closed | SiteFooter, L5a cf57db8 | Plain default description "A design system for building clear, fast financial apps." (audit wording has a word over 12 characters) |
| SVL-082 | P0 | closed | LandingPage, L5b 8397f37; hub C1a b8f0855 | Nav collapses below 768px (`max-width: 767px`) into a 44px menu button that opens the Wave 3 Drawer; no overflow at 320/375/767 |
| SVL-083 | P0 | closed | LandingPage, L5b 8397f37 | `&bull;` removed; badge "Sub-5μs execution engine" |
| SVL-084 | P0 | closed | LandingPage, L1 c36b742 (rename); L5b 8397f37 copy | `titleGradient=` renamed to `titleEmphasis=` in both LandingPage twins by L1; L5b rewrote the copy; test asserts no `title-gradient` |
| SVL-085 | P0 | verify-only (already clean) | LandingPage, L5b 8397f37; hub C1a cdbf5a9 | Stale row: no CSS keys off `data-palette` anywhere, so the palette never forced dark. C1a removed the hub's no-op palette switcher and its false "recalibrating" copy |
| SVL-086 | P1 | closed | LandingPage, L5b 8397f37; T2 80e0a0a | Three different icons (Cpu, Layers, Smartphone), distinct link labels and copy, three badge variants rendered through the real Badge (`size="sm"`) |
| SVL-087 | P1 | closed | LandingPage, L5b 8397f37 | Header inline styles replaced by `.joy-landing-header*` classes in `build.js` |
| SVL-088 | P1 | closed | LandingPage, L5b 8397f37 | Slate fallbacks and phantom `--joy-color-*` removed; `--joy-text-primary/secondary`, `--joy-accent-text` |
| SVL-089 | P2 | closed | LandingPage, L5b 8397f37 | CTA headline "Build fast, exact trading interfaces" (audit wording has words over 12 characters) |
| SVL-090 | P2 | closed | LandingPage, L5b 8397f37, 5044994 | Skip link `.joy-landing-skip` to a per-instance `<main tabindex="-1">`; class differs from the audit's undefined `joy-skip-link` |
| RXF-001 | P0 | verify-only (already clean) | HeroSection hero outline rule, L1 c36b742 | As SVL-001 |
| RXF-002 | P0 | closed | CTASection, L1 c36b742, 96b19d3; band T1 79cf406 | As SVL-015: glass class deleted, band text readable in both themes |
| RXF-003 | P0 | closed | PricingCard featured rule, L2 c5b7e8b | As SVL-026 (audit stale, rule rewritten) |
| RXF-004 | P0 | verify-only (already clean) | PricingCard badge, L2 c5b7e8b | As SVL-027 |
| RXF-005 | P0 | closed | PricingCard.tsx, L2 c5b7e8b | As SVL-028; React inline colour removed |
| RXF-006 | P0 | closed | FeatureCard link, L3 2704fe5 | As SVL-038 |
| RXF-007 | P0 | closed | StatsSection value, L4 f506683 | As SVL-065 |
| RXF-010 | P1 | closed | HeroSection badge, L1 c36b742 | As SVL-004 |
| RXF-011 | P1 | closed | FeatureCard icon, L3 2704fe5 | As SVL-039 |
| RXF-013 | P1 | closed | TestimonialCard.tsx, L4 f506683 | As SVL-070; React twin has no inline style (tested) |
| RXF-014 | P1 | verify-only (already clean) | TestimonialCard stars, L4 f506683 | As SVL-071 |
| RXF-018 | P0 | closed | HeroSection.tsx, L1 c36b742 | As SVL-002 |
| RXF-019 | P1 | closed | HeroSection.tsx, L1 c36b742 | As SVL-006 |
| RXF-020 | P1 | verify-only (already clean) | HeroSection CSS, L1 c36b742 | As SVL-005 |
| RXF-021 | P1 | closed | CTASection.tsx, L1 c36b742 | As SVL-018 |
| RXF-022 | P1 | closed | CTASection.tsx, L1 c36b742 | As SVL-017 |
| RXF-023 | P1 | closed | FeatureCard.tsx, L3 2704fe5 | As SVL-040 |
| RXF-025 | P1 | closed | PricingCard badge, L2 c5b7e8b | As SVL-032 |
| RXF-026 | P1 | verify-only (already clean) | LogoCloud title, L4 f506683 | As SVL-054 |
| RXF-027 | P1 | verify-only (already clean) | FAQSection, L4 f506683 | No `&bull;` or middle dot in either FAQ twin at base; asserted absent |
| RXF-028 | P1 | closed | LandingPage.tsx, L5b 8397f37 | As SVL-083 |
| RXF-029 | P1 | verify-only (already clean) | LandingPage.tsx, L5b 8397f37 | Stale row: no emoji in `LandingPage.tsx` at base; a test asserts no pictograph in source or markup |
| RXF-035 | P0 | closed | HeroSection title, L1 c36b742 | As SVL-003 |
| RXF-036 | P0 | closed | CTASection title, L1 c36b742 | As SVL-016 |
| RXF-037 | P0 | closed | FAQSection title, L4 f506683 | `--joy-font-size-display-sm` clamp + wrap + balance; 32px at 375, no overflow |
| RXF-038 | P0 | closed | LandingPage.tsx, L5b 8397f37 | As SVL-082 (same collapse and Drawer menu in the React twin) |
| RXF-039 | P1 | closed | HeroSection CSS, L1 c36b742 | As SVL-007 |
| RXF-040 | P1 | closed | CTASection CSS, L1 c36b742 | As SVL-019 |
| RXF-041 | P1 | closed | CTASection CSS, L1 c36b742 | As SVL-020 |
| RXF-042 | P1 | closed | PricingCard CSS, L2 c5b7e8b | As SVL-029 |
| RXF-043 | P1 | closed | PricingMatrix, L2 c5b7e8b, 71861de; T2 afb4648 | Data variant scrolls inside a focusable `role="region"` with a sticky capped first column; card variant is a wrapping flex row with no empty cell at any width (T2 replaced L2's under-900px stack) |
| RXF-044 | P1 | closed | BentoCard CSS, L3 2704fe5 | One 899px collapse block, no `!important` (audit suggested 640px and `!important`) |
| RXF-045 | P1 | closed | StatsSection CSS, L4 f506683; T1 c12e08f, a2b5c5e | As SVL-068 |
| RXF-078 | P1 | verify-only (already clean) | HeroSection twins, parity-check L1 c36b742 | `onPrimaryClick` / `onprimaryclick` is the documented casing convention (spec item 6), unchanged; parity-check now gates the hero |
| RXF-079 | P1 | closed | HeroSection twins, L1 c36b742 | Svelte twin now forwards rest and binds ref; class/className casing kept by convention |
| RXF-080 | P1 | verify-only (already clean) | CTASection twins, parity-check L1 c36b742 | As RXF-078 |
| RXF-081 | P1 | verify-only (already clean) | PricingCard twins, parity-check L2 c5b7e8b | `onSelect` / `onselect` casing convention; now gated |
| RXF-082 | P1 | verify-only (already clean) | PricingMatrix twins, L2 c5b7e8b | class/className casing convention; forwarded and tested in both twins and both matrix modes |
| RXF-083 | P1 | verify-only (already clean) | FeatureCard twins, parity-check L3 2704fe5 | `onLinkClick` / `onlinkclick` casing convention; both wired and mutation-tested |
| RXF-084 | P1 | verify-only (already clean) | FeatureGrid twins, L3 2704fe5 | class/className already forwarded at base; now tested in both twins |
| RXF-085 | P1 | verify-only (already clean) | BentoCard twins, L3 2704fe5 | As RXF-084 |
| RXF-086 | P1 | closed | BentoGrid.tsx, L3 2704fe5 | React BentoGrid is now `forwardRef` (ref lands on the root, mutation-checked) |
| RXF-087 | P1 | verify-only (already clean) | LogoCloud twins, L4 f506683 | Casing convention, unchanged (lane report said closed; normalised, see notes). L4 did add Svelte ref/rest and typed attributes, gated by the parity lists. Svelte-only `LogoItem.svgHtml` has no React counterpart (backlog) |
| RXF-088 | P1 | verify-only (already clean) | FAQSection twins, L4 f506683 | As RXF-087 (Svelte ref/rest added by L4) |
| RXF-089 | P1 | verify-only (already clean) | StatsSection twins, L4 f506683 | As RXF-087 (Svelte ref/rest added by L4) |
| RXF-090 | P1 | verify-only (already clean) | TestimonialCard twins, L4 f506683 | As RXF-087 (Svelte ref/rest added by L4) |
| RXF-091 | P1 | verify-only (already clean) | SiteFooter twins, L5a cf57db8 | Casing convention; the one real prop diff (React `SocialLink.icon` required, Svelte optional) was aligned; Svelte-only `svgHtml` recorded as a ruling |
| RXF-092 | P1 | verify-only (already clean) | LandingPage twins, L5b 8397f37 | `onDeployClick` / `ondeployclick` casing convention; parity-check now gates LandingPage |
| RXF-093 | P1 | closed | LandingPage twins, L5b 8397f37; T2 80e0a0a | Svelte twin renders the same brand/success/warning badges; since T2 both render the real Badge with `joy-badge--sm` |
| RXF-107 | P1 | closed | HeroSection CSS, L1 c36b742 | `.joy-hero__secondary-cta` now has a rule (shared outline selector) |
| RXF-108 | P1 | closed | PricingCard.tsx, L2 c5b7e8b | Phantom `var(--joy-color-status-success, ...)` removed |
| RXF-109 | P1 | closed | FeatureGrid twins, L3 2704fe5 | `columns` sanitised to 2/3/4, never an empty modifier |
| RXF-110 | P1 | closed | BentoCard twins, L3 2704fe5 | `colSpan` sanitised to an integer 1..12, else 4 |
| RXF-111 | P1 | closed | TestimonialCard CSS, L4 f506683 | Audit stale (`.joy-avatar__fallback` existed); the card's avatar had no fallback colours, `.joy-testimonial-card .joy-avatar` now styles it |
| RXF-112 | P1 | closed | SiteFooter CSS, L5a cf57db8 | `.joy-site-footer__brand` and `__column` rules added; test asserts every rendered footer class has a rule |
| RXF-113 | P1 | closed | LandingPage CSS, L5b 8397f37 | `.joy-landing-page`, `.joy-landing-header*`, drawer and skip-link rules defined; `joy-surface-` is not a class either twin uses |
| RXF-114 | P1 | verify-only (already clean) | HeroSection CSS, L1 c36b742 | As SVL-010 |
| RXF-115 | P1 | verify-only (already clean) | PricingCard CSS, L2 c5b7e8b | As SVL-030 |
| RXF-116 | P1 | verify-only (already clean) | PricingCard CSS, L2 c5b7e8b | As SVL-031 |
| RXF-117 | P1 | closed | CTASection container, L1 c36b742; T1 79cf406 | As SVL-022 |
| RXF-118 | P1 | verify-only (already clean) | FeatureCard CSS, L3 2704fe5 | Base card was already `--joy-surface-card` (navy in dark, not white); now raised, probed in dark with and without the attribute |
| RXF-119 | P1 | closed | LogoCloud CSS, L4 f506683 | Audit stale (base already token-driven); logos now `currentColor` at muted with a secondary title |
| RXF-120 | P1 | closed | StatsSection CSS, L4 f506683 | Audit stale (base used card tokens, no white literal); moved to raised + default border |
| RXF-121 | P1 | closed | FAQSection CSS, L4 f506683 | Section and items on tokens whose dark values are right; computed dark borders and text asserted |
| RXF-122 | P1 | verify-only (already clean) | SiteFooter CSS, L5a cf57db8 | Base background `--joy-surface-card` already remapped to navy in dark (no white footer); L5a only added the root text colour and probed dark |
| RXF-128 | P1 | closed | HeroSection.tsx, L1 c36b742; T1 79cf406 | As SVL-008 (no `secondaryLoading`) |
| RXF-129 | P1 | closed | CTASection.tsx, L1 c36b742; T1 79cf406 | As SVL-021 (no `secondaryLoading`) |
| RXF-130 | P1 | closed | PricingCard.tsx, L2 c5b7e8b; T1 79cf406 | `loading` + `disabled` props through Button (spinner, `aria-busy`); busy keeps the variant look since T1 |
| RXF-148 | P1 | closed | HeroSection.tsx, L1 c36b742 | As SVL-014 |
| RXF-149 | P1 | closed | CTASection.tsx, L1 c36b742, 96b19d3 | As SVL-025 (`React.useId`) |
| RXF-150 | P1 | closed | PricingMatrix.tsx, L2 c5b7e8b | As SVL-036 |
| RXF-151 | P1 | closed | LogoCloud twins, L4 f506683, 892b4b2 | Section labelled by its title (per-instance id); caller `aria-label` wins |
| RXF-152 | P1 | verify-only (already clean) | StatsSection twins, L4 f506683 (typing only) | The React twin already spread `...props` onto the root `<section>` at the wave base 85141e1, so a caller `aria-label` was forwarded before this wave; f506683 only changed the trend markup and the list key, and the Svelte Props typing. The audit's default label was deliberately not added (no fixed English label). Reclassified from closed in F1 (final review C M-2) |
| RXF-154 | P1 | verify-only (already clean) | PricingCard CSS, L2 c5b7e8b | As SVL-033 |
| RXF-160 | P2 | closed | HeroSection.tsx, L1 c36b742 | As SVL-013 |
| RXF-161 | P2 | closed | CTASection.tsx, L1 c36b742 | As SVL-024 |
| RXF-162 | P2 | closed | PricingCard.tsx, L2 c5b7e8b | As SVL-037 |
| RXF-163 | P2 | verify-only (already clean) | HeroSection CSS | The badge has no hover transition; button transitions are covered by the Wave 1 global reduced-motion block |
