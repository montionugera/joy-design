# Storybook Hub Audit Report (`apps/storybook-hub`)

## Summary
- Files audited: `apps/storybook-hub/build.js` (5,140 lines), `apps/storybook-hub/src/navigation.manifest.json` (81 lines), `apps/storybook-hub/tests/contracts.spec.ts` (156 lines).
- Issue count: 70 issues total (15 P0, 39 P1, 16 P2).
- Severity breakdown: P0 (blocks production): 15 | P1 (visibly sloppy / defective): 39 | P2 (polish / refinement): 16.

## Systemic patterns
- **Foreign Tailwind Slate & Violet Fallback Contamination**: 316 hardcoded hex colors permeate `build.js`, heavily relying on Tailwind slate (`#64748b`, `#e2e8f0`, `#f8fafc`, `#1e293b`) and violet (`#7c3aed`) instead of canonical Joymify brand tokens (`--navy-500: #14253e`, `--gold-400: #c49a3a`, `--cream-100: #f8f3e8`, `--ink-500: #1f1c13`).
- **Missing Phone-Tier Responsive Architecture (375px/430px)**: The hub stylesheet contains zero mobile media queries below 900px (`@media (max-width: 900px)`). On 375px screens, the topbar controls (~564px min-content) overflow by 221px, tokens tables blow out containers, and horizontal form layouts push inputs off-canvas.
- **Fragile Dark Mode DOM-Hacks Instead of Semantic Tokens**: Dark mode attempts to patch hardcoded light surfaces using string-matching attribute selectors like `div[style*="background: #ffffff"]` and `div[style*="background: #f8fafc"]` rather than semantic tokens (`--joy-surface-card`, `--joy-surface-canvas`), causing unstyled bright white cards in dark mode.
- **Theme-Agnostic Kinetic Canvas with Foreign Colors**: The interactive 3D particle canvas initializes with hardcoded purple (`#a855f7`), cyan (`#38bdf8`), and fuchsia (`#e879f9`) with purple network stroke lines (`rgba(168, 85, 247, ...)`) and white core dots, completely failing to adapt to light vs dark themes or the brand gold/navy palette.
- **Flat, Unrefined Hero Action Primaries**: Hero buttons in both the landing preview and CTA showcase lack depth highlights, 2-stop hue gradients, tactile `translateY(-1px)` hover lifts, active inner shadows, and brand-tinted drop shadows, reducing flagship buttons to flat rectangles.
- **Proliferation of Prohibited AI-Slop Tropes**: Active deployment of banned gradient text via `-webkit-background-clip: text`, decorative glassmorphism via `backdrop-filter: blur()`, tracked uppercase labels, trailing arrows (`&rarr;`, `→`), and middle-dot (`&bull;`) metadata separators.
- **Sub-Standard Mobile Touch Targets (< 44px)**: The mobile drawer trigger (`34px`), sidebar close button (`28px`), and framework switcher tabs (`28px`) fail the mandatory 44×44px touch target standard on mobile viewports.
- **Complete Absence of CSS Reduced-Motion Queries**: Every CSS transition (drawer slide, view switching, button states) runs unconditionally without `@media (prefers-reduced-motion: reduce)`, and the JS particle engine continues running a polling loop instead of halting.
- **Arbitrary Z-Index Scale**: Arbitrary integers (`2`, `10`, `100`, `998`, `999`) are scattered across headers, sidebars, and overlays instead of referencing an intentional semantic z-index token hierarchy.
- **Gapped Quality Contracts Suite**: `contracts.spec.ts` tests horizontal overflow only on the `#overview` view and completely ignores multi-column tables, forms, orderbooks, and mobile drawer viewports across the other 34 manifest views.

## Issues
| ID | Sev | Category | File:line | Issue | Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| HUB-001 | P0 | mobile | `apps/storybook-hub/build.js:225` | .topbar has fixed height 60px with display: flex; justify-content: space-between; and no wrap; its child controls require ~564px width, causing 221px horizontal overflow on 375px mobile viewports | Add mobile media query at max-width: 640px to wrap topbar controls, hide secondary text labels, and compact framework toggle to icon-only |
| HUB-002 | P0 | dark | `apps/storybook-hub/build.js:630` | Dark mode overrides light inline backgrounds via fragile attribute selector [data-theme="dark"] .content-area div[style*="background: #ffffff"], which fails on whitespace variations and leaves hardcoded white cards glowing on dark canvas | Refactor component containers to use semantic token var(--joy-surface-card) and var(--joy-border) directly instead of inline hex styles |
| HUB-003 | P0 | color | `apps/storybook-hub/build.js:156` | Hub brand logo uses purple gradient linear-gradient(135deg, #7c3aed 0%, #a855f7 100%), contaminating the Joymify brand anchor with foreign Tailwind purple | Replace with Joymify brand anchors: linear-gradient(135deg, var(--navy-500, #14253e) 0%, var(--gold-400, #c49a3a) 100%) |
| HUB-004 | P0 | taste | `apps/storybook-hub/build.js:802` | .kinetic-title employs -webkit-background-clip: text with linear-gradient(#a855f7, #38bdf8, #c49a3a), directly violating the absolute ban on gradient text | Remove -webkit-background-clip: text and gradient; render hero title in solid var(--joy-text-primary, #1f1c13) / #f8f3e8 in dark |
| HUB-005 | P0 | mobile | `apps/storybook-hub/build.js:1103` | .tokens-table at line 1103 and line 1135 are placed directly in .view-panel without an overflow-x: auto wrapper, blowing out layout to >620px width on 375px screens | Wrap all token tables in <div class="joy-table-responsive-wrapper" style="overflow-x: auto; -webkit-overflow-scrolling: touch;"> |
| HUB-006 | P0 | mobile | `apps/storybook-hub/build.js:1189` | .joy-props-table across Button, Table, Form, Overlay, and Pagination specs (lines 1189, 1241, 1299, 1339, 1379) lack scroll wrappers and responsive stacking | Wrap props tables in responsive horizontal scroll containers and add stacked card layout on @media (max-width: 600px) |
| HUB-007 | P0 | dark | `apps/storybook-hub/build.js:4856` | Kinetic 3D canvas particle system hardcodes foreign palette ['#a855f7', '#38bdf8', '#c49a3a', '#e879f9'] with purple strokes rgba(168, 85, 247, ...) and white core dots, ignoring light/dark theme toggle | Bind particle colors and constellation lines dynamically to CSS variables --joy-brand-accent, --joy-border-subtle, and --joy-surface-card based on active theme |
| HUB-008 | P0 | mobile | `apps/storybook-hub/build.js:3568` | Horizontal form demo in Form Suite uses fixed width: 180px; text-align: right; labels, which compress form inputs to < 100px and overflow 375px screens | Add @media (max-width: 640px) { .joy-form--horizontal .joy-form-item { flex-direction: column; align-items: stretch; } .joy-form-item__label { width: 100% !important; text-align: left !important; } } |
| HUB-009 | P0 | mobile | `apps/storybook-hub/build.js:1924` | Market search input #market-search-input sets font-size: 0.8125rem (13px), triggering iOS Mobile Safari auto-zoom on focus and breaking mobile layout | Change font-size to 1rem (16px) on mobile viewports (max-width: 768px) to prevent iOS viewport zoom |
| HUB-010 | P0 | color | `apps/storybook-hub/build.js:175` | Default CSS variable fallback for --joy-color-brand-primary is hardcoded to foreign purple #7c3aed across 13 occurrences (lines 175, 211, 258, 2247, 2585, 3407, 3466, 3531, 3570, 3802, 3862, 3870) | Update all variable fallbacks to brand gold var(--joy-brand-primary, #c49a3a) |
| HUB-011 | P0 | dark | `apps/storybook-hub/build.js:510` | [data-theme="dark"] .sidebar hardcodes background to Tailwind slate #0f172a and border #1e293b instead of brand navy tokens | Replace with background: var(--joy-surface-card, #14253e); border-right: 1px solid var(--joy-border, rgba(255,255,255,0.08)); |
| HUB-012 | P0 | dark | `apps/storybook-hub/build.js:506` | [data-theme="dark"] body hardcodes canvas background to #090d16 with text #f8fafc, diverging from canonical brand token --joy-surface-canvas (#0b1320) | Remap to var(--joy-surface-canvas) and var(--joy-text-primary) |
| HUB-013 | P0 | a11y | `apps/storybook-hub/build.js:840` | Mobile drawer toggle lacks keyboard trap; when sidebar opens on mobile (< 900px), tab focus leaks to background page content | Implement a focus trap utility that restricts Tab / Shift+Tab cycling to .sidebar while .sidebar.open is true |
| HUB-014 | P0 | mobile | `apps/storybook-hub/build.js:2961` | Landing simulator preview header has fixed padding 18px 28px and non-wrapping flex row (~580px min width), causing severe overflow on 375px mobile screens | Add responsive collapse with mobile hamburger or stacked navigation for the simulated landing page |
| HUB-015 | P0 | mobile | `apps/storybook-hub/build.js:2343` | Code preview block <pre class="joy-markdown__pre"> has no CSS definition in build.js and lacks overflow-x: auto, forcing code lines to blow out page width | Add CSS: .joy-markdown__pre { overflow-x: auto; max-width: 100%; -webkit-overflow-scrolling: touch; padding: 16px; border-radius: 8px; } |
| HUB-016 | P1 | taste | `apps/storybook-hub/build.js:229` | .topbar applies backdrop-filter: var(--joy-backdrop-blur, blur(12px)), violating the absolute ban on decorative glassmorphism | Remove backdrop-filter and -webkit-backdrop-filter; use solid opaque tokenized surface var(--joy-surface-card) |
| HUB-017 | P1 | taste | `apps/storybook-hub/build.js:669` | .sidebar-backdrop applies backdrop-filter: blur(4px), violating the decorative glassmorphism ban | Remove backdrop-filter; rely on solid alpha dimming background: rgba(15, 23, 42, 0.6) |
| HUB-018 | P1 | taste | `apps/storybook-hub/build.js:782` | .kinetic-badge applies backdrop-filter: blur(8px), violating the decorative glassmorphism ban | Remove blur filter; use solid tokenized background rgba(20, 37, 62, 0.85) |
| HUB-019 | P1 | taste | `apps/storybook-hub/build.js:2961` | Simulated landing page header applies backdrop-filter: blur(12px), violating the decorative glassmorphism ban | Remove inline backdrop-filter; set solid background var(--joy-surface-card, #14253e) |
| HUB-020 | P1 | taste | `apps/storybook-hub/build.js:2994` | Secondary hero action uses joy-button--glass, violating the glassmorphism ban and delivering flat unstyled glass on dark canvas | Replace with tokenized outline button variant joy-button--outline with 1px border in var(--joy-border) |
| HUB-021 | P1 | taste | `apps/storybook-hub/build.js:1876` | Drawer action button text contains appended arrow &rarr; ("Open Right Sheet (Risk Analytics) &rarr;"), violating the ban on trailing link/button arrows | Remove &rarr;; use action-oriented copy "Open Risk Analytics Sheet" |
| HUB-022 | P1 | taste | `apps/storybook-hub/build.js:1978` | Pagination next button uses raw &rarr; instead of scalable vector icon | Replace &rarr; with Lucide chevron-right SVG asset |
| HUB-023 | P1 | taste | `apps/storybook-hub/build.js:2073` | Date range separator uses raw &rarr; entity instead of semantic divider or SVG | Replace &rarr; with an unstyled "-" or scalable SVG arrow with aria-hidden="true" |
| HUB-024 | P1 | taste | `apps/storybook-hub/build.js:4340` | Toast notification text appends arrow in string: Backtest window set: ... → ..., violating the trailing arrow ban | Change toast message to use clean preposition: start + " to " + end |
| HUB-025 | P1 | taste | `apps/storybook-hub/build.js:2126` | StatCard delta contains middle dot &bull; ("&bull; 99.99% Vultr Uptime"), violating the ban on middle-dot meta strings | Remove &bull;; use a subtle status badge or SVG indicator dot |
| HUB-026 | P1 | taste | `apps/storybook-hub/build.js:2392` | Icon Gallery header uses middle dot &bull; ("138 Vector Assets &bull; Dual Svelte 5 + React 19") | Replace with clean sentence case subtitle or separate badges |
| HUB-027 | P1 | taste | `apps/storybook-hub/build.js:2414` | Kinetic field badge uses middle dot &bull; ("Interactive 3D Kinetic Field &bull; 60 FPS") | Replace with separate metadata tags or clean spacing |
| HUB-028 | P1 | taste | `apps/storybook-hub/build.js:2422` | Kinetic interaction hint uses middle dot &bull; ("perturb constellation &bull; Click to pulse") | Split into two readable sentences with proper punctuation |
| HUB-029 | P1 | taste | `apps/storybook-hub/build.js:2950` | Simulator status bar uses middle dot &bull; ("Applied Palette: ... &bull; Zero OS Emojis &bull; Fully Adaptive") | Format as a structured horizontal metadata list or flex tags |
| HUB-030 | P1 | taste | `apps/storybook-hub/build.js:2981` | Hero pill badge uses middle dot &bull; ("Stack 2.23 &bull; Sub-5ms Finality") | Separate into badge text and optional secondary metric chip |
| HUB-031 | P1 | taste | `apps/storybook-hub/build.js:3030` | Stat item description uses middle dot &bull; ("Kernel bypass colocation &bull; 0 GC pauses") | Split into separate bulleted lines or clean sentence |
| HUB-032 | P1 | taste | `apps/storybook-hub/build.js:3093` | Adaptive table title uses middle dot &bull; ("Live Execution Ledger &bull; Adaptive Table") | Remove middle dot; use clean header "Live Execution Ledger" |
| HUB-033 | P1 | taste | `apps/storybook-hub/build.js:3426` | Splitter header uses middle dot &bull; ("Resizable Split Panes &bull; Drag Divider") | Use clean header with subtitle |
| HUB-034 | P1 | taste | `apps/storybook-hub/build.js:914` | .simulator-label uses text-transform: uppercase; letter-spacing: 0.05em;, violating tracked ALL-CAPS eyebrow ban | Change to sentence case with normal letter-spacing: font-weight: 600; text-transform: none; letter-spacing: normal; |
| HUB-035 | P1 | taste | `apps/storybook-hub/build.js:2285` | Avatar group title uses text-transform: uppercase; letter-spacing: 0.05em;, violating tracked eyebrow ban | Change to sentence case: Avatar group (overlapping team stack) |
| HUB-036 | P1 | a11y | `apps/storybook-hub/build.js:686` | .mobile-menu-btn has padding: 7px 10px (rendered target 34×40px), failing mandatory 44×44px mobile tap target standard | Update CSS: .mobile-menu-btn { min-width: 44px; min-height: 44px; padding: 10px; } |
| HUB-037 | P1 | a11y | `apps/storybook-hub/build.js:698` | .sidebar-close-btn has padding: 4px 8px (rendered target ~28×28px), failing 44×44px touch target | Update CSS: .sidebar-close-btn { min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; } |
| HUB-038 | P1 | a11y | `apps/storybook-hub/build.js:251` | .framework-btn has padding: 6px 14px; font-size: 0.8125rem (rendered target 28px height), failing 44×44px touch target | On mobile (@media (max-width: 768px)), increase touch target: min-height: 44px; padding: 10px 16px; |
| HUB-039 | P1 | state | `apps/storybook-hub/build.js:2990` | Landing preview hero button lacks tactile depth, top highlight gradient, hover lift, active press state, and brand shadow | Apply 2-stop brand gradient, hover: translateY(-1px), active inner shadow, and gold-tinted glow box-shadow: 0 4px 14px rgba(196, 154, 58, 0.35) |
| HUB-040 | P1 | state | `apps/storybook-hub/build.js:2828` | CTA showcase hero button has flat styling with black shadow rgba(0,0,0,0.25), lacking loading and focus-visible indicators | Add focus-visible 2px ring, tactile press state, and brand shadow tint |
| HUB-041 | P1 | motion | `apps/storybook-hub/build.js:847` | Sidebar slide drawer animation transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) lacks prefers-reduced-motion handling in CSS | Add @media (prefers-reduced-motion: reduce) { .sidebar { transition: none !important; } } |
| HUB-042 | P1 | motion | `apps/storybook-hub/build.js:270` | View panel activation animation animation: joy-fade-in var(--joy-motion-duration-fast, 150ms) ease-out has no reduced-motion override | Add @media (prefers-reduced-motion: reduce) { .view-panel.active { animation: none !important; } } |
| HUB-043 | P1 | motion | `apps/storybook-hub/build.js:5000` | Kinetic particle canvas animation loop continues firing 300ms setTimeout polling when reduced motion is preferred | Cancel animation frame and pause loop completely when prefersReducedMotion is detected, listening to change event to resume |
| HUB-044 | P1 | a11y | `apps/storybook-hub/build.js:237` | Topbar and mobile drawer use arbitrary z-index numbers (z-index: 10, z-index: 998, z-index: 999) without semantic tokens | Standardize to semantic token scale: var(--joy-z-sticky, 100), var(--joy-z-modal-backdrop, 900), var(--joy-z-drawer, 1000) |
| HUB-045 | P1 | a11y | `apps/storybook-hub/build.js:2961` | Simulated landing page header uses z-index: 100 and hero content uses z-index: 2, creating competing stacking contexts | Replace arbitrary values with semantic z-index tokens |
| HUB-046 | P1 | dark | `apps/storybook-hub/build.js:853` | .sidebar.open uses dark shadow box-shadow: 6px 0 28px rgba(0, 0, 0, 0.25), which is completely invisible against dark backgrounds | In dark mode, replace shadow with subtle border highlight border-right: 1px solid rgba(255, 255, 255, 0.15) |
| HUB-047 | P1 | dark | `apps/storybook-hub/build.js:283` | .playground-box has hardcoded box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) with light border #e2e8f0 that vanishes or looks murky in dark mode | Add [data-theme="dark"] .playground-box { box-shadow: none; border: 1px solid var(--joy-border); } |
| HUB-048 | P1 | color | `apps/storybook-hub/build.js:188` | Fallback for --joy-color-text-muted hardcodes Tailwind slate-500 #64748b across 24 occurrences | Update fallback to brand ink muted token: var(--joy-text-muted, #736b5e) |
| HUB-049 | P1 | color | `apps/storybook-hub/build.js:126` | Fallback for --joy-color-surface-subtle hardcodes Tailwind slate-50 #f8fafc across 9 occurrences | Update fallback to brand cream/subtle token: var(--joy-surface-subtle, #f3ece0) |
| HUB-050 | P1 | color | `apps/storybook-hub/build.js:227` | Fallback for --joy-border-hairline and --joy-color-border-subtle hardcodes Tailwind slate-200 #e2e8f0 across 10 occurrences | Update fallback to brand border token: var(--joy-border, #e2d9c8) |
| HUB-051 | P1 | color | `apps/storybook-hub/build.js:127` | Fallback for --joy-color-text-primary hardcodes Tailwind slate-900 #0f172a across 6 occurrences | Update fallback to brand ink token: var(--joy-text-primary, #1f1c13) |
| HUB-052 | P1 | color | `apps/storybook-hub/build.js:2498` | Fallback for --joy-color-status-success hardcodes un-tuned Tailwind emerald #10b981 across 10 occurrences | Update fallback to brand-tuned success token: var(--joy-color-status-success, #15803d) |
| HUB-053 | P1 | dark | `apps/storybook-hub/build.js:560` | [data-theme="dark"] .tokens-table hardcodes Tailwind slate ramp (#1e293b, #0f172a, #334155, #cbd5e1) instead of brand surface tokens | Remap table, header, and cells to var(--joy-surface-card), var(--joy-border), and var(--joy-text-secondary) |
| HUB-054 | P1 | dark | `apps/storybook-hub/build.js:638` | [data-theme="dark"] .component-card uses hardcoded background: #1e293b; border-color: #334155; | Remap to var(--joy-surface-card) and var(--joy-border) |
| HUB-055 | P1 | consistency | `apps/storybook-hub/build.js:140` | Sidebar right border uses raw hex border-right: 1px solid #e2e8f0 instead of token | Replace with border-right: 1px solid var(--joy-border, #e2d9c8) |
| HUB-056 | P1 | consistency | `apps/storybook-hub/build.js:148` | Brand divider uses raw hex border-bottom: 1px solid #f1f5f9 instead of token | Replace with border-bottom: 1px solid var(--joy-border-subtle, #ebe3d5) |
| HUB-057 | P1 | consistency | `apps/storybook-hub/build.js:284` | .playground-box uses raw hex background: #ffffff; border: 1px solid #e2e8f0; | Replace with background: var(--joy-surface-card, #ffffff); border: 1px solid var(--joy-border, #e2d9c8); |
| HUB-058 | P1 | consistency | `apps/storybook-hub/build.js:379` | .controls-table uses raw hex background: #ffffff; border: 1px solid #e2e8f0; | Replace with semantic tokens var(--joy-surface-card) and var(--joy-border) |
| HUB-059 | P1 | consistency | `apps/storybook-hub/build.js:435` | .segmented-control uses raw hex background: #f1f5f9; border: 1px solid #e2e8f0; | Replace with var(--joy-surface-subtle) and var(--joy-border) |
| HUB-060 | P1 | consistency | `apps/storybook-hub/build.js:463` | .tokens-table uses raw hex background: #ffffff; border: 1px solid #e2e8f0; | Replace with var(--joy-surface-card) and var(--joy-border) |
| HUB-061 | P1 | mobile | `apps/storybook-hub/build.js:832` | Media query uses max-width: 900px with no intermediate tablet (768px) or mobile phone (375px/430px) breakpoints | Introduce standard breakpoint ladder: @media (max-width: 768px) and @media (max-width: 480px) |
| HUB-062 | P2 | typography | `apps/storybook-hub/build.js:251` | Magic font size 0.8125rem (13px) used across 14 elements (buttons, tables, badges) without token mapping | Replace with token var(--joy-font-size-xs, 0.75rem) or var(--joy-font-size-sm, 0.875rem) |
| HUB-063 | P2 | typography | `apps/storybook-hub/build.js:2972` | Simulated landing nav item has ad-hoc inline font size 0.875rem with hardcoded alpha rgba(255, 255, 255, 0.7) | Replace with tokenized class or semantic text token |
| HUB-064 | P2 | a11y | `apps/storybook-hub/build.js:1012` | Mobile menu toggle button #mobile-menu-toggle lacks dynamic aria-expanded attribute update | Add aria-expanded="false" initially and toggle to true/false in toggleMobileMenu() |
| HUB-065 | P2 | a11y | `apps/storybook-hub/build.js:1018` | Theme toggle button #btn-theme-toggle lacks aria-label describing state change | Add aria-label="Switch to dark theme" and dynamically update text upon toggle |
| HUB-066 | P2 | copy | `apps/storybook-hub/build.js:1022` | Theme toggle button text uses Title Case ("Dark Mode" / "Light Mode") instead of active sentence case | Update text to sentence case: "Dark theme" / "Light theme" |
| HUB-067 | P2 | copy | `apps/storybook-hub/build.js:1876` | Button copy "Open Right Sheet (Risk Analytics)" is developer-centric jargon | Update to user-facing action copy: "View risk analytics" |
| HUB-068 | P2 | state | `apps/storybook-hub/build.js:254` | .framework-btn hover state changes only color without background affordance or focus ring | Add visible focus ring: outline: 2px solid var(--joy-brand-primary); outline-offset: 2px; |
| HUB-069 | P2 | parity | `apps/storybook-hub/build.js:24` | Icon SVGs dynamically extracted from Svelte files hardcode width="24" height="24" without exposing React icon parity test | Ensure icon test suite verifies both Svelte and React icon component size/color prop parity |
| HUB-070 | P2 | tests | `apps/storybook-hub/tests/contracts.spec.ts:71` | Contract 3 (horizontal overflow) tests only /#overview, leaving all other 34 views untested against 320px/375px/768px viewports | Parameterize Contract 3 to iterate across all 35 manifest view routes and assert zero overflow on each view |

## Contrast table
| Element Pair | Theme | Role | Measured Ratio | WCAG AA Threshold | Status | Defect Note |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `#64748b` (slate-500 text) on `#f8f3e8` (cream canvas) | Light | Text / Surface | 4.30:1 | ≥ 4.5:1 | **FAIL** | Sub-AA body contrast; text is washed out on warm cream |
| `#c49a3a` (brand gold) on `#ffffff` (card surface) | Light | Text / Surface | 2.62:1 | ≥ 4.5:1 | **FAIL** | Gold text on white fails WCAG AA; requires darker gold ramp (#8c6517) |
| `#c49a3a` (brand gold) on `#f8f3e8` (cream canvas) | Light | Text / Surface | 2.36:1 | ≥ 4.5:1 | **FAIL** | Gold text on warm canvas is completely illegible for small text |
| `#e2e8f0` (slate-200 border) on `#ffffff` (card surface) | Light | Border / Surface | 1.40:1 | ≥ 3.0:1 | **FAIL** | Border fails essential UI component contrast requirement |
| `#e2d9c8` (brand border) on `#f8f3e8` (cream canvas) | Light | Border / Surface | 1.27:1 | ≥ 3.0:1 | **FAIL** | Subtle border fails 3:1 boundary contrast against cream canvas |
| `#1f1c13` (brand ink) on `#f8f3e8` (cream canvas) | Light | Body Text | 15.38:1 | ≥ 4.5:1 | PASS | Primary text meets AAA contrast |
| `#1f1c13` (brand ink) on `#ffffff` (card surface) | Light | Body Text | 17.02:1 | ≥ 4.5:1 | PASS | Primary text meets AAA contrast |
| `#94a3b8` (slate-400 text) on `#0f172a` (dark sidebar) | Dark | Text / Surface | 5.82:1 | ≥ 4.5:1 | PASS | Adequate contrast but foreign slate neutral |
| `#cbd5e1` (slate-300 text) on `#1e293b` (dark card) | Dark | Text / Surface | 7.91:1 | ≥ 4.5:1 | PASS | Adequate contrast but foreign slate neutral |
| `#334155` (slate-700 border) on `#090d16` (dark body) | Dark | Border / Surface | 1.83:1 | ≥ 3.0:1 | **FAIL** | Dark mode card borders fail 3:1 UI boundary contrast |

## Hardcoded Hex Inventory

Total color hex occurrences in `apps/storybook-hub/build.js`: **316** (across 37 distinct color values).

### Color Frequency Breakdown
| Hex Value | Count | Role in Storybook Hub | Brand Alignment |
| :--- | :--- | :--- | :--- |
| `#64748b` | 50 | Tailwind slate-500 (muted text, icons, borders) | **Foreign** (un-tinted slate neutral) |
| `#e2e8f0` | 32 | Tailwind slate-200 (card borders, table borders) | **Foreign** (cool gray border) |
| `#ffffff` | 29 | Pure white (sidebar, cards, text, buttons) | **Defect in dark mode** (leaks white) |
| `#10b981` | 25 | Tailwind emerald-500 (success status badges) | **Foreign** (un-tuned status green) |
| `#f8fafc` | 24 | Tailwind slate-50 (canvas, table headers) | **Foreign** (cool white neutral) |
| `#1e293b` | 23 | Tailwind slate-800 (dark cards, dark tables) | **Foreign** (cool slate dark surface) |
| `#7c3aed` | 22 | Tailwind violet-600 (primary brand fallback) | **Foreign** (Tailwind purple primary) |
| `#0f172a` | 20 | Tailwind slate-900 (primary text, dark sidebar) | **Foreign** (cool slate dark anchor) |
| `#334155` | 17 | Tailwind slate-700 (dark borders, muted text) | **Foreign** (cool slate neutral) |
| `#c49a3a` | 10 | Joymify brand gold (accent highlights, links) | **Canonical brand anchor** |
| `#f1f5f9` | 9 | Tailwind slate-100 (pill backgrounds, borders) | **Foreign** (cool gray neutral) |
| `#94a3b8` | 9 | Tailwind slate-400 (secondary text in dark mode) | **Foreign** (cool gray neutral) |
| `#ef4444` | 6 | Tailwind red-500 (danger status, error text) | **Foreign** (un-tuned status red) |
| `#a855f7` | 5 | Tailwind purple-500 (brand logo, kinetic canvas) | **Foreign** (Tailwind purple accent) |
| `#cbd5e1` | 5 | Tailwind slate-300 (borders, dark mode text) | **Foreign** (cool gray neutral) |
| `#c084fc` | 3 | Tailwind purple-400 (hover states) | **Foreign** (Tailwind purple accent) |
| `#090d16` | 2 | Dark body canvas background | **Foreign** (arbitrary black hex) |
| `#0b0f19` | 2 | Dark kinetic canvas container background | **Foreign** (arbitrary black hex) |
| `#14253e` | 2 | Joymify brand navy anchor | **Canonical brand anchor** |
| `#38bdf8` | 2 | Tailwind sky-400 (kinetic canvas particles) | **Foreign** (un-tuned cyan) |
| `#ede9fe` | 2 | Tailwind violet-100 (badge backgrounds) | **Foreign** (Tailwind purple tint) |
| `#f59e0b` | 2 | Tailwind amber-500 (warning status) | **Foreign** (un-tuned amber) |
| `#00d8ff` | 1 | React cyan badge | Framework badge |
| `#020617` | 1 | Tailwind slate-950 | **Foreign** |
| `#0284c7` | 1 | Tailwind sky-600 | **Foreign** |
| `#059669` | 1 | Tailwind emerald-600 | **Foreign** |
| `#0ea5e9` | 1 | Tailwind sky-500 | **Foreign** |
| `#2e1065` | 1 | Tailwind violet-950 | **Foreign** |
| `#3b82f6` | 1 | Tailwind blue-500 | **Foreign** |
| `#475569` | 1 | Tailwind slate-600 | **Foreign** |
| `#6d28d9` | 1 | Tailwind violet-700 | **Foreign** |
| `#d97706` | 1 | Tailwind amber-600 | **Foreign** |
| `#e879f9` | 1 | Tailwind fuchsia-400 (kinetic canvas particles) | **Foreign** |
| `#f8f3e8` | 1 | Joymify brand cream canvas | **Canonical brand anchor** |
| `#fafafa` | 1 | Neutral-50 | **Foreign** |
| `#ff3e00` | 1 | Svelte orange badge | Framework badge |
| `#fff` | 1 | Short hex white | **Foreign** |

### Complete Line-by-Line Hex Catalog in `build.js`
- Line 126: `#f8fafc` (`background-color: var(--joy-color-surface-subtle, #f8fafc);`)
- Line 127: `#0f172a` (`color: var(--joy-color-text-primary, #0f172a);`)
- Line 139: `#ffffff` (`background: #ffffff;`)
- Line 140: `#e2e8f0` (`border-right: 1px solid #e2e8f0;`)
- Line 148: `#f1f5f9` (`border-bottom: 1px solid #f1f5f9;`)
- Line 156: `#7c3aed` (`background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);`)
- Line 156: `#a855f7` (`background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);`)
- Line 161: `#ffffff` (`color: #ffffff;`)
- Line 170: `#0f172a` (`color: var(--joy-color-text-primary, #0f172a);`)
- Line 175: `#7c3aed` (`color: var(--joy-color-brand-primary, #7c3aed);`)
- Line 188: `#64748b` (`color: var(--joy-color-text-muted, #64748b);`)
- Line 200: `#334155` (`color: #334155;`)
- Line 206: `#f1f5f9` (`background: #f1f5f9;`)
- Line 207: `#0f172a` (`color: var(--joy-color-text-primary, #0f172a);`)
- Line 210: `#ede9fe` (`background: #ede9fe;`)
- Line 211: `#7c3aed` (`color: var(--joy-color-brand-primary, #7c3aed);`)
- Line 227: `#e2e8f0` (`border-bottom: var(--joy-border-hairline, 1px solid #e2e8f0);`)
- Line 241: `#f1f5f9` (`background: #f1f5f9;`)
- Line 253: `#64748b` (`color: #64748b;`)
- Line 257: `#ffffff` (`background: #ffffff;`)
- Line 258: `#7c3aed` (`color: var(--joy-color-brand-primary, #7c3aed);`)
- Line 278: `#64748b` (`color: var(--joy-color-text-muted, #64748b);`)
- Line 283: `#ffffff` (`background: #ffffff;`)
- Line 284: `#e2e8f0` (`border: 1px solid #e2e8f0;`)
- Line 292: `#f8fafc` (`background: #f8fafc;`)
- Line 293: `#e2e8f0` (`border-bottom: 1px solid #e2e8f0;`)
- Line 305: `#0f172a` (`color: var(--joy-color-text-primary, #0f172a);`)
- Line 316: `#ffffff` (`background: #ffffff;`)
- Line 317: `#e2e8f0` (`border: 1px solid #e2e8f0;`)
- Line 325: `#f8fafc` (`background: #f8fafc;`)
- Line 326: `#e2e8f0` (`border-bottom: 1px solid #e2e8f0;`)
- Line 341: `#0f172a` (`color: var(--joy-color-text-primary, #0f172a);`)
- Line 347: `#64748b` (`color: var(--joy-color-text-muted, #64748b);`)
- Line 356: `#ffffff` (`background: #ffffff;`)
- Line 367: `#fafafa` (`background: #fafafa;`)
- Line 368: `#cbd5e1` (`background-image: radial-gradient(#cbd5e1 1.2px, transparent 0);`)
- Line 374: `#090d16` (`background: #090d16;`)
- Line 375: `#1e293b` (`background-image: radial-gradient(#1e293b 1.2px, transparent 0);`)
- Line 379: `#e2e8f0` (`border-top: 1px solid #e2e8f0;`)
- Line 380: `#ffffff` (`background: #ffffff;`)
- Line 385: `#0f172a` (`background: #0f172a;`)
- Line 386: `#334155` (`border-top-color: #334155;`)
- Line 390: `#f1f5f9` (`border-bottom: 1px solid #f1f5f9;`)
- Line 394: `#1e293b` (`border-bottom-color: #1e293b;`)
- Line 398: `#334155` (`color: #334155;`)
- Line 402: `#94a3b8` (`color: #94a3b8;`)
- Line 406: `#f1f5f9` (`background: #f1f5f9;`)
- Line 407: `#e2e8f0` (`border: 1px solid #e2e8f0;`)
- Line 420: `#64748b` (`color: #64748b;`)
- Line 427: `#0f172a` (`color: #0f172a;`)
- Line 430: `#ffffff` (`background: #ffffff;`)
- Line 431: `#0f172a` (`color: #0f172a;`)
- Line 436: `#020617` (`background: #020617;`)
- Line 437: `#334155` (`border-color: #334155;`)
- Line 440: `#94a3b8` (`color: #94a3b8;`)
- Line 443: `#f8fafc` (`color: #f8fafc;`)
- Line 446: `#1e293b` (`background: #1e293b;`)
- Line 447: `#f8fafc` (`color: #f8fafc;`)
- Line 451: `#0f172a` (`background: #0f172a;`)
- Line 452: `#f8fafc` (`color: #f8fafc;`)
- Line 464: `#ffffff` (`background: #ffffff;`)
- Line 466: `#e2e8f0` (`border: 1px solid #e2e8f0;`)
- Line 472: `#f1f5f9` (`border-bottom: 1px solid #f1f5f9;`)
- Line 476: `#f8fafc` (`background: #f8fafc;`)
- Line 489: `#ff3e00` (`background: #ff3e00;`)
- Line 490: `#ffffff` (`color: #ffffff;`)
- Line 497: `#00d8ff` (`background: #00d8ff;`)
- Line 498: `#0f172a` (`color: #0f172a;`)
- Line 507: `#0b0f19` (`background-color: #0b0f19;`)
- Line 508: `#f8fafc` (`color: #f8fafc;`)
- Line 511: `#0f172a` (`background: #0f172a;`)
- Line 512: `#1e293b` (`border-right-color: #1e293b;`)
- Line 515: `#1e293b` (`border-bottom-color: #1e293b;`)
- Line 518: `#f8fafc` (`color: #f8fafc;`)
- Line 521: `#64748b` (`color: #64748b;`)
- Line 524: `#94a3b8` (`color: #94a3b8;`)
- Line 527: `#1e293b` (`background: #1e293b;`)
- Line 528: `#f8fafc` (`color: #f8fafc;`)
- Line 531: `#2e1065` (`background: #2e1065;`)
- Line 532: `#c084fc` (`color: #c084fc;`)
- Line 536: `#1e293b` (`border-bottom-color: #1e293b;`)
- Line 539: `#1e293b` (`background: #1e293b;`)
- Line 542: `#94a3b8` (`color: #94a3b8;`)
- Line 545: `#0f172a` (`background: #0f172a;`)
- Line 546: `#c084fc` (`color: #c084fc;`)
- Line 549: `#0f172a` (`background: #0f172a;`)
- Line 550: `#1e293b` (`border-color: #1e293b;`)
- Line 554: `#1e293b` (`background: #1e293b;`)
- Line 555: `#334155` (`border-bottom-color: #334155;`)
- Line 558: `#f8fafc` (`color: #f8fafc;`)
- Line 561: `#0f172a` (`background: #0f172a;`)
- Line 562: `#1e293b` (`border-color: #1e293b;`)
- Line 565: `#1e293b` (`background: #1e293b;`)
- Line 566: `#334155` (`border-bottom-color: #334155;`)
- Line 567: `#f8fafc` (`color: #f8fafc;`)
- Line 570: `#1e293b` (`border-bottom-color: #1e293b;`)
- Line 571: `#cbd5e1` (`color: #cbd5e1;`)
- Line 581: `#ffffff` (`background: #ffffff;`)
- Line 582: `#e2e8f0` (`border: 1px solid #e2e8f0;`)
- Line 594: `#7c3aed` (`border-color: #7c3aed;`)
- Line 602: `#334155` (`color: #334155;`)
- Line 607: `#64748b` (`color: #64748b;`)
- Line 612: `#0f172a` (`background: #0f172a;`)
- Line 613: `#1e293b` (`border-color: #1e293b;`)
- Line 616: `#a855f7` (`border-color: #a855f7;`)
- Line 620: `#f8fafc` (`color: #f8fafc;`)
- Line 623: `#94a3b8` (`color: #94a3b8;`)
- Line 628: `#94a3b8` (`color: #94a3b8;`)
- Line 630: `#ffffff` (`[data-theme="dark"] .content-area div[style*="background: #ffffff"] {`)
- Line 631: `#0f172a` (`background: #0f172a !important;`)
- Line 632: `#1e293b` (`border-color: #1e293b !important;`)
- Line 634: `#f8fafc` (`[data-theme="dark"] .content-area div[style*="background: #f8fafc"] {`)
- Line 635: `#1e293b` (`background: #1e293b !important;`)
- Line 636: `#334155` (`border-color: #334155 !important;`)
- Line 639: `#0f172a` (`background: #0f172a;`)
- Line 640: `#1e293b` (`border-color: #1e293b;`)
- Line 644: `#1e293b` (`background: #1e293b;`)
- Line 645: `#334155` (`border-bottom-color: #334155;`)
- Line 648: `#f8fafc` (`color: #f8fafc;`)
- Line 651: `#94a3b8` (`color: #94a3b8;`)
- Line 654: `#0b0f19` (`background: #0b0f19;`)
- Line 657: `#0f172a` (`background: #0f172a !important;`)
- Line 658: `#f8fafc` (`color: #f8fafc !important;`)
- Line 659: `#1e293b` (`border-color: #1e293b !important;`)
- Line 683: `#f1f5f9` (`background: #f1f5f9;`)
- Line 684: `#cbd5e1` (`border: 1px solid #cbd5e1;`)
- Line 688: `#334155` (`color: #334155;`)
- Line 695: `#e2e8f0` (`background: #e2e8f0;`)
- Line 696: `#0f172a` (`color: #0f172a;`)
- Line 706: `#64748b` (`color: #64748b;`)
- Line 712: `#f1f5f9` (`background: #f1f5f9;`)
- Line 713: `#0f172a` (`color: #0f172a;`)
- Line 719: `#1e293b` (`background: #1e293b;`)
- Line 720: `#334155` (`border-color: #334155;`)
- Line 721: `#cbd5e1` (`color: #cbd5e1;`)
- Line 724: `#334155` (`background: #334155;`)
- Line 725: `#ffffff` (`color: #ffffff;`)
- Line 728: `#94a3b8` (`color: #94a3b8;`)
- Line 731: `#1e293b` (`background: #1e293b;`)
- Line 732: `#ffffff` (`color: #ffffff;`)
- Line 742: `#e2e8f0` (`border: 1px solid #e2e8f0;`)
- Line 743: `#090d16` (`background: #090d16;`)
- Line 778: `#c084fc` (`color: #c084fc;`)
- Line 789: `#10b981` (`background: #10b981;`)
- Line 790: `#10b981` (`box-shadow: 0 0 8px #10b981;`)
- Line 797: `#ffffff` (`color: #ffffff;`)
- Line 802: `#a855f7` (`background: linear-gradient(135deg, #a855f7 0%, #38bdf8 50%, #c49a3a 100%);`)
- Line 802: `#38bdf8` (`background: linear-gradient(135deg, #a855f7 0%, #38bdf8 50%, #c49a3a 100%);`)
- Line 802: `#c49a3a` (`background: linear-gradient(135deg, #a855f7 0%, #38bdf8 50%, #c49a3a 100%);`)
- Line 808: `#94a3b8` (`color: #94a3b8;`)
- Line 823: `#64748b` (`color: #64748b;`)
- Line 827: `#1e293b` (`border-color: #1e293b;`)
- Line 900: `#ffffff` (`background: var(--joy-surface-card, #ffffff);`)
- Line 901: `#e2e8f0` (`border: 1px solid var(--joy-border, #e2e8f0);`)
- Line 915: `#64748b` (`color: var(--joy-text-secondary, #64748b);`)
- Line 925: `#f1f5f9` (`background: var(--joy-surface-subtle, #f1f5f9);`)
- Line 926: `#e2e8f0` (`border: 1px solid var(--joy-border, #e2e8f0);`)
- Line 929: `#64748b` (`color: var(--joy-text-secondary, #64748b);`)
- Line 948: `#f8f3e8` (`background: var(--joy-surface-canvas, #f8f3e8);`)
- Line 950: `#e2e8f0` (`border: 1px solid var(--joy-border, #e2e8f0);`)
- Line 963: `#e2e8f0` (`border: 1px solid var(--joy-border, #e2e8f0);`)
- Line 964: `#ffffff` (`background: var(--joy-surface-card, #ffffff);`)
- Line 965: `#1e293b` (`color: var(--joy-text-primary, #1e293b);`)
- Line 973: `#c49a3a` (`border-color: var(--joy-brand-primary, #c49a3a);`)
- Line 976: `#c49a3a` (`border-color: var(--joy-brand-primary, #c49a3a);`)
- Line 1019: `#cbd5e1` (`<button class="joy-button joy-button--ghost joy-button--sm" id="btn-theme-toggle" onclick="toggleTheme()" style="gap: 6px; border: 1px solid #cbd5e1;">`)
- Line 1048: `#ffffff` (`<div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('tokens')">`)
- Line 1048: `#e2e8f0` (`<div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('tokens')">`)
- Line 1053: `#64748b` (`<p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">`)
- Line 1058: `#ffffff` (`<div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('button'); setFramework('svelte');">`)
- Line 1058: `#e2e8f0` (`<div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('button'); setFramework('svelte');">`)
- Line 1063: `#64748b` (`<p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">`)
- Line 1068: `#ffffff` (`<div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('button'); setFramework('react');">`)
- Line 1068: `#e2e8f0` (`<div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('button'); setFramework('react');">`)
- Line 1073: `#64748b` (`<p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">`)
- Line 1078: `#ffffff` (`<div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('tokens')">`)
- Line 1078: `#e2e8f0` (`<div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('tokens')">`)
- Line 1083: `#64748b` (`<p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">`)
- Line 1149: `#7c3aed` (`<td><code>#7c3aed</code></td>`)
- Line 1155: `#6d28d9` (`<td><code>#6d28d9</code></td>`)
- Line 1161: `#10b981` (`<td><code>#10b981</code></td>`)
- Line 1167: `#ef4444` (`<td><code>#ef4444</code></td>`)
- Line 1419: `#64748b` (`<div style="font-size: 0.8125rem; color: #64748b;">Click button or test controls below</div>`)
- Line 1458: `#64748b` (`<span id="btn-loading-status" style="font-size: 0.8125rem; font-weight: 500; color: #64748b;">Idle</span>`)
- Line 1507: `#64748b` (`<div style="font-size: 0.875rem; color: #64748b; margin-top: 8px;">`)
- Line 1508: `#7c3aed` (`Live value: <strong id="input-mirror" style="color: #7c3aed;">(empty)</strong>`)
- Line 1519: `#64748b` (`<span id="input-error-status" style="font-size: 0.8125rem; font-weight: 500; color: #64748b;">Normal (No Error)</span>`)
- Line 1630: `#10b981` (`<td data-label="SIDE"><span style="color: #10b981; font-weight: 600;">BUY</span></td>`)
- Line 1638: `#ef4444` (`<td data-label="SIDE"><span style="color: #ef4444; font-weight: 600;">SELL</span></td>`)
- Line 1711: `#ef4444` (`<button class="joy-dropdown__item joy-dropdown__item--danger" style="color: #ef4444;" onclick="selectDropdownAction('Archive')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Archive Strategy</button>`)
- Line 1715: `#f8fafc` (`<div style="padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 0.875rem;">`)
- Line 1715: `#e2e8f0` (`<div style="padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 0.875rem;">`)
- Line 1716: `#7c3aed` (`Selected action: <strong id="dropdown-selection-text" style="color: #7c3aed;">None</strong>`)
- Line 1737: `#334155` (`<p style="margin: 0; color: #334155;">Showing 3 active live limit orders awaiting counter-party match.</p>`)
- Line 1740: `#334155` (`<p style="margin: 0; color: #334155;">12 fills executed in the last 24 hours with zero rejected packets.</p>`)
- Line 1743: `#334155` (`<p style="margin: 0; color: #334155;">Value at Risk (VaR 99%): 1.42 BTC across delta-neutral positions.</p>`)
- Line 1794: `#64748b` (`<div style="font-size: 0.875rem; color: #64748b; margin-top: 8px;">`)
- Line 1903: `#e2e8f0` (`<button class="joy-button joy-button--ghost joy-button--md" onclick="showDemoToast('Order latency warning: p99 spiked to 4.2ms', 'warning')" style="border: 1px solid #e2e8f0;">`)
- Line 1964: `#ffffff` (`<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;" id="paged-content-box">`)
- Line 1964: `#e2e8f0` (`<div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;" id="paged-content-box">`)
- Line 1965: `#334155` (`<div style="font-weight: 600; color: #334155; margin-bottom: 8px;" id="paged-range-text">Showing Orders 1 to 10 of 50</div>`)
- Line 1966: `#64748b` (`<ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 0.875rem;" id="paged-records-list">`)
- Line 2005: `#ffffff` (`<div id="skeleton-card-loading" style="width: 320px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">`)
- Line 2005: `#e2e8f0` (`<div id="skeleton-card-loading" style="width: 320px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">`)
- Line 2018: `#ffffff` (`<div id="skeleton-card-loaded" style="display: none; width: 320px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">`)
- Line 2018: `#e2e8f0` (`<div id="skeleton-card-loaded" style="display: none; width: 320px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">`)
- Line 2020: `#ede9fe` (`<div style="width: 40px; height: 40px; border-radius: 50%; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-weight: 700;">JOY</div>`)
- Line 2020: `#7c3aed` (`<div style="width: 40px; height: 40px; border-radius: 50%; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-weight: 700;">JOY</div>`)
- Line 2023: `#64748b` (`<span style="font-size: 0.75rem; color: #64748b;">Arbitrage High-Freq Vault</span>`)
- Line 2026: `#334155` (`<p style="margin: 0 0 12px; font-size: 0.875rem; color: #334155; line-height: 1.5;">`)
- Line 2029: `#f8fafc` (`<div style="background: #f8fafc; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">`)
- Line 2030: `#64748b` (`<span style="font-size: 0.8125rem; color: #64748b;">Annualized APY</span>`)
- Line 2031: `#10b981` (`<strong style="color: #10b981; font-size: 1.1rem; font-family: var(--joy-font-family-mono, monospace);">+28.4%</strong>`)
- Line 2061: `#64748b` (`<div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">Selected Date: <strong id="single-date-feedback" style="color: #7c3aed;">2026-09-19</strong></div>`)
- Line 2061: `#7c3aed` (`<div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">Selected Date: <strong id="single-date-feedback" style="color: #7c3aed;">2026-09-19</strong></div>`)
- Line 2081: `#64748b` (`<div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">Active Interval: <strong id="range-date-feedback" style="color: #7c3aed;">2026-01-01 to 2026-09-19</strong></div>`)
- Line 2081: `#7c3aed` (`<div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">Active Interval: <strong id="range-date-feedback" style="color: #7c3aed;">2026-01-01 to 2026-09-19</strong></div>`)
- Line 2247: `#7c3aed` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-brand-primary, #7c3aed); flex-shrink: 0;">`)
- Line 2252: `#64748b` (`<span style="color: var(--joy-color-text-muted, #64748b); font-size: 0.75rem;">(42.8 KB)</span>`)
- Line 2281: `#0284c7` (`<div class="joy-avatar joy-avatar--square joy-avatar--lg" style="background-color: #0284c7;"><span class="joy-avatar__fallback">VT</span></div>`)
- Line 2285: `#64748b` (`<h5 style="margin: 0 0 8px 0; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--joy-color-text-muted, #64748b);">AvatarGroup (Overlapping Team Stack)</h5>`)
- Line 2287: `#7c3aed` (`<div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: #7c3aed;"><span class="joy-avatar__fallback">AM</span></div>`)
- Line 2288: `#059669` (`<div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: #059669;"><span class="joy-avatar__fallback">BL</span></div>`)
- Line 2289: `#d97706` (`<div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: #d97706;"><span class="joy-avatar__fallback">CR</span></div>`)
- Line 2290: `#475569` (`<div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: #475569;"><span class="joy-avatar__fallback">+4</span></div>`)
- Line 2318: `#64748b` (`<div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--joy-color-text-muted, #64748b); margin-top: 8px;">`)
- Line 2393: `#10b981` (`<div id="copy-toast-banner" style="font-size: 0.8125rem; color: #10b981; font-weight: 600; display: none;">Copied to clipboard!</div>`)
- Line 2498: `#10b981` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
- Line 2502: `#10b981` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
- Line 2506: `#10b981` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
- Line 2523: `#10b981` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
- Line 2527: `#10b981` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
- Line 2531: `#10b981` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
- Line 2535: `#10b981` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
- Line 2551: `#10b981` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
- Line 2555: `#10b981` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
- Line 2559: `#10b981` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-status-success, #10b981); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>`)
- Line 2585: `#7c3aed` (`<div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: var(--joy-color-brand-primary, #7c3aed);">`)
- Line 2605: `#0ea5e9` (`<div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: #0ea5e9;">`)
- Line 2846: `#c49a3a` (`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-400, #c49a3a);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`)
- Line 2882: `#64748b` (`<span style="font-size: 0.75rem; color: var(--joy-color-text-muted, #64748b);">Institutional Grade Telemetry</span>`)
- Line 2921: `#c49a3a` (`<span class="palette-dot" style="background: #c49a3a;"></span>`)
- Line 2925: `#10b981` (`<span class="palette-dot" style="background: #10b981;"></span>`)
- Line 2929: `#3b82f6` (`<span class="palette-dot" style="background: #3b82f6;"></span>`)
- Line 2933: `#a855f7` (`<span class="palette-dot" style="background: #a855f7;"></span>`)
- Line 2937: `#f59e0b` (`<span class="palette-dot" style="background: #f59e0b;"></span>`)
- Line 2963: `#c49a3a` (`<div style="width: 32px; height: 32px; border-radius: 8px; background: var(--joy-brand-primary, #c49a3a); display: flex; align-items: center; justify-content: center; color: #14253e;">`)
- Line 2963: `#14253e` (`<div style="width: 32px; height: 32px; border-radius: 8px; background: var(--joy-brand-primary, #c49a3a); display: flex; align-items: center; justify-content: center; color: #14253e;">`)
- Line 2966: `#ffffff` (`<span style="font-weight: 700; font-size: 1.05rem; letter-spacing: 0.05em; color: #ffffff;">JOYMIFY PROTOCOL</span>`)
- Line 2977: `#14253e` (`<section class="joy-hero" style="position: relative; overflow: hidden; padding: 72px 24px; text-align: center; background: radial-gradient(circle at 50% 20%, rgba(196, 154, 58, 0.15), transparent 70%), var(--joy-surface-canvas, #14253e); color: #ffffff;">`)
- Line 2977: `#ffffff` (`<section class="joy-hero" style="position: relative; overflow: hidden; padding: 72px 24px; text-align: center; background: radial-gradient(circle at 50% 20%, rgba(196, 154, 58, 0.15), transparent 70%), var(--joy-surface-canvas, #14253e); color: #ffffff;">`)
- Line 2980: `#c49a3a` (`<span style="width: 8px; height: 8px; border-radius: 50%; background: var(--joy-brand-primary, #c49a3a);"></span>`)
- Line 2983: `#ffffff` (`<h1 class="joy-hero__title" style="font-size: clamp(2rem, 5vw, 3.4rem); font-weight: 800; line-height: 1.15; margin: 0 0 20px 0; color: #ffffff;">`)
- Line 3054: `#64748b` (`<p style="color: var(--joy-text-secondary, #64748b); font-size: 0.95rem; margin: 0;">Combining high-performance execution primitives with unyielding design consistency.</p>`)
- Line 3090: `#ffffff` (`<div style="background: var(--joy-surface-card, #ffffff); border: 1px solid var(--joy-border, #e2e8f0); border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">`)
- Line 3090: `#e2e8f0` (`<div style="background: var(--joy-surface-card, #ffffff); border: 1px solid var(--joy-border, #e2e8f0); border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">`)
- Line 3094: `#64748b` (`<p style="margin: 0; font-size: 0.8125rem; color: var(--joy-text-secondary, #64748b);">Automatically stacks into individual cards below 768px with full WCAG 2.2 AA contrast.</p>`)
- Line 3096: `#10b981` (`<div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; padding: 4px 10px; border-radius: 9999px; background: rgba(16, 185, 129, 0.1); color: #10b981; font-weight: 600;">`)
- Line 3118: `#10b981` (`<td data-label="Status"><span style="color: #10b981; font-weight: 600;">CONFIRMED</span></td>`)
- Line 3125: `#10b981` (`<td data-label="Status"><span style="color: #10b981; font-weight: 600;">CONFIRMED</span></td>`)
- Line 3132: `#10b981` (`<td data-label="Status"><span style="color: #10b981; font-weight: 600;">CONFIRMED</span></td>`)
- Line 3144: `#64748b` (`<p style="color: var(--joy-text-secondary, #64748b); font-size: 0.95rem; margin: 0;">Everything engineering teams need to know about our deterministic architecture.</p>`)
- Line 3196: `#c49a3a` (`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-brand-primary, #c49a3a);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`)
- Line 3229: `#64748b` (`<span style="font-size: 0.75rem; color: var(--joy-color-text-muted, #64748b);">Institutional Grade Telemetry</span>`)
- Line 3294: `#64748b` (`<div style="color: var(--joy-color-text-muted, #64748b); font-size: 0.8125rem; margin-top: 2px;">Executed 250.00 SOL at average fill price $184.20 via Phoenix Gateway.</div>`)
- Line 3302: `#64748b` (`<div style="color: var(--joy-color-text-muted, #64748b); font-size: 0.8125rem; margin-top: 2px;">Portfolio beta remains within target limit (0.28 vs max 0.40).</div>`)
- Line 3310: `#64748b` (`<div style="color: var(--joy-color-text-muted, #64748b); font-size: 0.8125rem; margin-top: 2px;">Elevated market volatility triggered auto-adjustment from 5 bps to 12 bps.</div>`)
- Line 3318: `#64748b` (`<div style="color: var(--joy-color-text-muted, #64748b); font-size: 0.8125rem; margin-top: 2px;">API Key authorization from Singapore gateway worker.</div>`)
- Line 3382: `#10b981` (`<div class="joy-chart__hud-item"><span class="joy-chart__hud-label">C:</span><span class="joy-chart__hud-value" id="hud-c" style="color: #10b981;">68,720.00</span></div>`)
- Line 3390: `#64748b` (`<div style="margin-top: 12px; font-size: 0.75rem; color: var(--joy-color-text-muted, #64748b); display: flex; justify-content: space-between;">`)
- Line 3407: `#7c3aed` (`<div class="joy-chart__hud-item"><span class="joy-chart__hud-label">Value:</span><span class="joy-chart__hud-value" id="line-hud-val" style="color: var(--joy-color-brand-primary, #7c3aed);">3,420 TPS</span></div>`)
- Line 3430: `#f8fafc` (`<div class="joy-splitter__pane" id="split-left" style="width: 40%; background: var(--joy-color-surface-subtle, #f8fafc); padding: 16px;">`)
- Line 3432: `#64748b` (`<p style="font-size: 0.8125rem; color: var(--joy-color-text-muted, #64748b); margin: 0;">Arbitrage engine parameters, exchange API keys, and latency tolerances.</p>`)
- Line 3437: `#64748b` (`<p style="font-size: 0.8125rem; color: var(--joy-color-text-muted, #64748b); margin: 0;">Live order matching logs, routing fills, and execution slip statistics.</p>`)
- Line 3464: `#f8fafc` (`<div class="joy-flex" style="justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--joy-color-surface-subtle, #f8fafc); border-radius: 6px;">`)
- Line 3466: `#7c3aed` (`<span style="font-weight: 700; color: var(--joy-color-brand-primary, #7c3aed);">$4,892,120.00</span>`)
- Line 3490: `#64748b` (`<div style="font-size: 0.8125rem; color: var(--joy-color-text-muted, #64748b); margin-bottom: 8px;">Segmented Time Horizon:</div>`)
- Line 3501: `#64748b` (`<div style="font-size: 0.8125rem; color: var(--joy-color-text-muted, #64748b); margin-bottom: 8px;">Checkable Tags:</div>`)
- Line 3530: `#f8fafc` (`<div class="joy-form joy-form--vertical" style="background: var(--joy-color-surface-subtle, #f8fafc); padding: 20px; border-radius: 8px; border: 1px solid var(--joy-color-border-subtle, #e2e8f0);">`)
- Line 3530: `#e2e8f0` (`<div class="joy-form joy-form--vertical" style="background: var(--joy-color-surface-subtle, #f8fafc); padding: 20px; border-radius: 8px; border: 1px solid var(--joy-color-border-subtle, #e2e8f0);">`)
- Line 3531: `#7c3aed` (`<div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 14px; color: var(--joy-color-brand-primary, #7c3aed);">Vertical Layout with Validation Rules</div>`)
- Line 3569: `#f8fafc` (`<div class="joy-form joy-form--horizontal" style="background: var(--joy-color-surface-subtle, #f8fafc); padding: 24px; border-radius: 8px; border: 1px solid var(--joy-color-border-subtle, #e2e8f0); --joy-form-label-width: 160px;">`)
- Line 3569: `#e2e8f0` (`<div class="joy-form joy-form--horizontal" style="background: var(--joy-color-surface-subtle, #f8fafc); padding: 24px; border-radius: 8px; border: 1px solid var(--joy-color-border-subtle, #e2e8f0); --joy-form-label-width: 160px;">`)
- Line 3570: `#7c3aed` (`<div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 18px; color: var(--joy-color-brand-primary, #7c3aed);">Horizontal Layout Alignment (Right-Aligned Baselines)</div>`)
- Line 3621: `#64748b` (`<div style="font-size: 0.75rem; color: var(--joy-color-text-muted, #64748b); margin-bottom: 6px;">Leverage Multiplier (1x - 100x):</div>`)
- Line 3636: `#64748b` (`<div style="font-size: 0.75rem; color: var(--joy-color-text-muted, #64748b); margin-bottom: 6px;">Precision Sizing (step 0.05):</div>`)
- Line 3662: `#64748b` (`<div style="font-size: 0.75rem; color: var(--joy-color-text-muted, #64748b); margin-bottom: 6px;">Execution Quality Rating:</div>`)
- Line 3664: `#c49a3a` (`<div id="rate-feedback" style="font-size: 0.8125rem; font-weight: 500; color: var(--joy-color-brand-accent, #c49a3a); margin-top: 6px;">4.5 Stars</div>`)
- Line 3701: `#64748b` (`<span style="padding-right: 10px; display: flex; align-items: center; color: var(--joy-color-text-muted, #64748b);">`)
- Line 3775: `#64748b` (`<div style="font-size: 0.8125rem; font-weight: 600; color: var(--joy-color-text-muted, #64748b); margin-bottom: 8px;">Horizontal Menu:</div>`)
- Line 3801: `#f8fafc` (`<div style="background: var(--joy-color-surface-subtle, #f8fafc); border: 1px solid var(--joy-color-border-subtle, #e2e8f0); border-radius: 8px; overflow: hidden;">`)
- Line 3801: `#e2e8f0` (`<div style="background: var(--joy-color-surface-subtle, #f8fafc); border: 1px solid var(--joy-color-border-subtle, #e2e8f0); border-radius: 8px; overflow: hidden;">`)
- Line 3802: `#7c3aed` (`<div style="padding: 10px 16px; font-weight: 600; font-size: 0.8125rem; color: var(--joy-color-brand-primary, #7c3aed); border-bottom: 1px solid var(--joy-color-border-subtle, #e2e8f0);">Sidebar Subscriptions</div>`)
- Line 3802: `#e2e8f0` (`<div style="padding: 10px 16px; font-weight: 600; font-size: 0.8125rem; color: var(--joy-color-brand-primary, #7c3aed); border-bottom: 1px solid var(--joy-color-border-subtle, #e2e8f0);">Sidebar Subscriptions</div>`)
- Line 3835: `#f59e0b` (`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-warning, #f59e0b)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`)
- Line 3844: `#64748b` (`<span style="font-size: 0.8125rem; color: var(--joy-color-text-muted, #64748b);">Prevents accidental destructive operations</span>`)
- Line 3856: `#fff` (`<div class="joy-spin__container" id="demo-spin-container" style="background: var(--joy-color-surface-elevated, #fff); border: 1px solid var(--joy-color-border-subtle, #e2e8f0); border-radius: 8px; padding: 16px; margin-top: 8px;">`)
- Line 3856: `#e2e8f0` (`<div class="joy-spin__container" id="demo-spin-container" style="background: var(--joy-color-surface-elevated, #fff); border: 1px solid var(--joy-color-border-subtle, #e2e8f0); border-radius: 8px; padding: 16px; margin-top: 8px;">`)
- Line 3858: `#64748b` (`<div style="font-size: 0.8125rem; color: var(--joy-color-text-muted, #64748b);">Real-time aggregated L2 order depth feed from 6 venues.</div>`)
- Line 3862: `#7c3aed` (`<span style="font-size: 0.8125rem; color: var(--joy-color-brand-primary, #7c3aed); font-weight: 500;">Rebalancing book...</span>`)
- Line 3869: `#f8fafc` (`<div style="background: var(--joy-color-surface-subtle, #f8fafc); border: 1px solid var(--joy-color-border-subtle, #e2e8f0); border-radius: 8px; padding: 16px;">`)
- Line 3869: `#e2e8f0` (`<div style="background: var(--joy-color-surface-subtle, #f8fafc); border: 1px solid var(--joy-color-border-subtle, #e2e8f0); border-radius: 8px; padding: 16px;">`)
- Line 3870: `#7c3aed` (`<div style="font-weight: 600; font-size: 0.8125rem; color: var(--joy-color-brand-primary, #7c3aed); margin-bottom: 10px;">Anchor Navigator</div>`)
- Line 4208: `#10b981` (`let changeColor = r.change >= 0 ? 'var(--joy-color-status-success, #10b981)' : 'var(--joy-color-status-danger, #ef4444)';`)
- Line 4208: `#ef4444` (`let changeColor = r.change >= 0 ? 'var(--joy-color-status-success, #10b981)' : 'var(--joy-color-status-danger, #ef4444)';`)
- Line 4218: `#64748b` (`'<td data-label="24h Vol (USDT)" style="text-align: right; font-family: var(--joy-font-family-mono, monospace); color: #64748b;">' +`)
- Line 4467: `#10b981` (`const color = isBull ? '#10b981' : '#ef4444';`)
- Line 4467: `#ef4444` (`const color = isBull ? '#10b981' : '#ef4444';`)
- Line 4492: `#10b981` (`cEl.style.color = last.close >= last.open ? '#10b981' : '#ef4444';`)
- Line 4492: `#ef4444` (`cEl.style.color = last.close >= last.open ? '#10b981' : '#ef4444';`)
- Line 4525: `#7c3aed` (`ctx.strokeStyle = '#7c3aed';`)
- Line 4856: `#a855f7` (`const colors = ['#a855f7', '#38bdf8', '#c49a3a', '#e879f9'];`)
- Line 4856: `#38bdf8` (`const colors = ['#a855f7', '#38bdf8', '#c49a3a', '#e879f9'];`)
- Line 4856: `#c49a3a` (`const colors = ['#a855f7', '#38bdf8', '#c49a3a', '#e879f9'];`)
- Line 4856: `#e879f9` (`const colors = ['#a855f7', '#38bdf8', '#c49a3a', '#e879f9'];`)
- Line 5060: `#ffffff` (`kineticCtx.fillStyle = '#ffffff';`)