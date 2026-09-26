# LANE TOK: Design System Token Architecture & Accessibility Audit

## Summary
Files audited: `packages/tokens/src/tokens.json`, `packages/tokens/build.js`, `packages/tokens/dist/theme.css`, `packages/tokens/dist/tailwind-theme.css`.
Issue count by severity: P0: 20 (blocks production) / P1: 57 (visibly sloppy) / P2: 17 (polish) — Total: 94 issues.
Verdict: Token architecture suffers from severe foreign fallback pollution (40+ purple `#7c3aed` instances, slate neutrals), corrupted Tailwind v4 `@theme` generation, missing typography and scale layers, un-tokenized per-component dark overrides, and extensive WCAG 2.2 AA contrast failures across gold accents, status badges, and dark borders.

## Systemic patterns
- **Corrupted Tailwind `@theme` Generation in `build.js`**: A blind string replacement (`v.replace('--joy-', '--color-joy-')`) prepends `--color-` to every token, turning spacing, radii, font families, motion durations, shadows, and z-indices into invalid color definitions in `tailwind-theme.css`.
- **Foreign Purple & Slate Fallbacks**: Ubiquitous hardcoded fallbacks to Tailwind purple `#7c3aed` (40 occurrences) and slate neutrals (`#0f172a`, `#334155`, `#64748b`, `#cbd5e1`, `#f1f5f9`, `#f8fafc`) directly contradict the committed navy/gold/cream/ink brand invariants.
- **Per-Component Dark Overrides Instead of Semantic Remapping**: Dark mode is implemented via 112 individual `[data-theme="dark"] .joy-...` selector overrides scattered throughout a 3,700-line monolithic CSS string, rather than remapping semantic CSS variables (`--joy-surface-card`, `--joy-border`, `--joy-text-primary`) under `[data-theme="dark"]`.
- **Gold `#c49a3a` Luminance Mismatch on Light Surfaces**: Brand gold `#c49a3a` achieves only 2.36:1 contrast against canvas `#f8f3e8` and 2.62:1 against card `#ffffff`, failing both WCAG AA 4.5:1 text and 3.0:1 UI element requirements. Outline buttons and focus rings on light surfaces fail accessibility gates.
- **Untuned Status Tokens with Broken Text Contrast**: Status tokens (`#10b981`, `#f59e0b`, `#ef4444`, `#3b82f6`) are generic Tailwind defaults that fail WCAG AA when used as text on light surfaces (1.94:1–3.40:1) and fail with white badge text (2.15:1–3.76:1); light background tints are missing from `tokens.json` and hardcoded in CSS.
- **Complete Absence of Typography Scale**: `tokens.json` contains zero font sizes, font weights, line heights, or letter spacings, forcing 113+ magic numbers (`0.8125rem`, `0.9375rem`, `1.75rem`, etc.) into `build.js`.
- **Incomplete Dimension Scales (Spacing, Radius, Z-Index)**: Spacing tops out at 32px; radius lacks role tokens (`control`, `card`, `overlay`, `pill`); z-index lacks sticky, backdrop, drawer, toast, popover, and mask, spawning arbitrary z-indices (20, 50, 100, 1010, 1200) that cause clipping.
- **Vanishing Contrast and Shadows in Dark Mode**: Dark borders (`#23354e`) against dark canvas (`#0d1829`) yield only 1.43:1 contrast (failing 3:1); black shadows (`rgba(0,0,0,...)`) become invisible on dark surfaces due to the absence of dark elevation tints or ambient glow tokens.
- **Zero `prefers-reduced-motion` Handling**: Not a single `@media (prefers-reduced-motion)` query exists across all 3,768 lines of token CSS, causing all animations to run unconditionally and violating WCAG 2.2 AA SC 2.3.3.
- **Banned Design Slop Baked into Tokens**: Token stylesheets contain banned patterns: gradient text (`-webkit-background-clip: text`), 4px side-stripe accents, decorative glassmorphism (`backdrop-filter: blur()`), and tracked uppercase eyebrows.

## Issues

| ID | Sev | Category | File:line | Issue | Fix |
|---|---|---|---|---|---|
| TOK-001 | P0 | consistency | `packages/tokens/build.js:3748` | Blind string replacement replaces --joy- with --color-joy- for ALL tokens, corrupting spacing, radius, typography, motion, shadow, and z-index tokens into invalid Tailwind colors in tailwind-theme.css. | Parse token types and map variables to proper Tailwind v4 @theme namespaces (--spacing-*, --radius-*, --font-*, --duration-*, --ease-*, --shadow-*, --z-index-*). |
| TOK-002 | P0 | a11y | `packages/tokens/build.js:1074` | Global :focus-visible rule uses foreign purple fallback outline: 2px solid var(--joy-color-brand-primary, #7c3aed), injecting an anti-reference color into the primary accessibility affordance. | Replace fallback with brand gold #c49a3a or define a dedicated --joy-focus-ring token. |
| TOK-003 | P0 | color | `packages/tokens/src/tokens.json:4` | Brand gold #c49a3a achieves only 2.36:1 contrast against canvas (#f8f3e8) and 2.62:1 against card (#ffffff), failing WCAG 2.2 AA text (4.5:1) and UI element (3.0:1) requirements. | Introduce a high-contrast text gold token (--gold-600: #8f6b1e) for text/icons on light backgrounds and restrict #c49a3a to large filled surfaces. |
| TOK-004 | P0 | color | `packages/tokens/build.js:137` | .joy-button--outline uses gold #c49a3a border and text on light surfaces (#f8f3e8 / #ffffff), producing failing contrast ratios of 2.36:1 and 2.62:1. | Use brand navy #14253e or deep gold #8f6b1e for outline button text and border on light backgrounds. |
| TOK-005 | P0 | color | `packages/tokens/src/tokens.json:34-37` | Status tokens (#10b981, #f59e0b, #ef4444, #3b82f6) are untuned generic Tailwind defaults that fail WCAG AA 4.5:1 when rendered as text on light surfaces (success 2.29:1, warning 1.94:1, danger 3.40:1, info 3.32:1). | Define brand-tuned accessible status ramps with dedicated dark text tokens for light surfaces (e.g. success #065f46, warning #92400e, danger #991b1b, info #1e40af). |
| TOK-006 | P0 | color | `packages/tokens/build.js:200-211` | White text on solid status badges fails WCAG AA 4.5:1 for all four statuses: success 2.54:1, warning 2.15:1, danger 3.76:1, info 3.68:1. | Switch status badges to tinted light backgrounds with high-contrast status text, or use darkened badge fills that meet 4.5:1 with white text. |
| TOK-007 | P0 | color | `packages/tokens/src/tokens.json:17-18` | surface.subtle (#f8fafc) and surface.muted (#f1f5f9) use raw cool Tailwind slate, clashing with warm cream canvas (#f8f3e8) and creating muddy, dirty surfaces. | Replace slate neutrals with warm cream/ink-tinted neutrals (e.g. #f3ede0 for subtle, #ece4d2 for muted). |
| TOK-008 | P0 | color | `packages/tokens/src/tokens.json:25` | border.subtle uses cool slate #cbd5e1, which clashes with warm palette and fails 3:1 contrast against light canvas (1.34:1) and card (1.48:1). | Replace with brand-tuned warm border token (#d8ceba) meeting contrast requirements. |
| TOK-009 | P0 | color | `packages/tokens/src/tokens.json:30` | text.muted uses cool slate #64748b instead of brand-tinted ink/navy neutral, degrading readability on warm cream canvas. | Replace with warm ink-tinted neutral (#524d3e) achieving ≥ 4.5:1 contrast. |
| TOK-010 | P0 | dark | `packages/tokens/build.js:774-817` | Dark mode is implemented via 112 per-component CSS selector overrides rather than semantic token remapping at the root container level. | Remap all semantic tokens (--joy-surface-canvas, --joy-surface-card, --joy-border, --joy-text-primary, --joy-text-muted) under [data-theme="dark"] and remove component overrides. |
| TOK-011 | P0 | dark | `packages/tokens/build.js:808-816` | Dark mode component overrides hardcode foreign Tailwind slate hexes (#0f172a thead/footer bg, #334155 td border and hover, #f8fafc text). | Replace hardcoded slate hexes with semantic tokens (--joy-surface-subtle, --joy-border, --joy-text-primary). |
| TOK-012 | P0 | dark | `packages/tokens/build.js:3653-3668` | [data-palette="joymify"] unconditionally sets --joy-surface-canvas: #0d1829 and --joy-text-primary: #f8f3e8, forcing dark mode even when light theme is active. | Scope palette overrides to preserve theme state or eliminate hardcoded background overrides from palette classes. |
| TOK-013 | P0 | consistency | `packages/tokens/src/tokens.json:54-59` | Typography scale is entirely missing from tokens.json (no font sizes, weights, line heights, or letter spacings), resulting in 113+ hardcoded magic numbers across build.js. | Define formal typography scale in tokens.json (sizes xs through 4xl, weights 400-700, line heights tight to relaxed). |
| TOK-014 | P0 | consistency | `packages/tokens/src/tokens.json:40-47` | Incomplete spacing scale in tokens.json (only 1, 2, 3, 4, 6, 8 covering 4px–32px), forcing build.js to hardcode arbitrary values (20px, 28px, 36px, 40px, 48px). | Expand spacing scale to include 0, 0.5 (2px), 5 (20px), 7 (28px), 9 (36px), 10 (40px), 12 (48px), 16 (64px). |
| TOK-015 | P0 | consistency | `packages/tokens/src/tokens.json:79-83` | Incomplete z-index scale (only dropdown 1000, modal 1050, tooltip 1100), missing sticky, backdrop, drawer, toast, popover, mask. | Implement standard semantic scale: sticky (100), backdrop (900), dropdown (1000), drawer (1020), modal (1050), popover (1060), toast (1100), tooltip (1200). |
| TOK-016 | P0 | motion | `packages/tokens/build.js:34` | Zero @media (prefers-reduced-motion) support across all 3,768 lines of token CSS, causing all keyframes and transitions to run unconditionally in violation of WCAG 2.2 AA SC 2.3.3. | Add global prefers-reduced-motion media query resetting animation durations to 0.01ms and disabling transforms. |
| TOK-017 | P0 | dark | `packages/tokens/src/tokens.json:26` | Dark border #23354e achieves only 1.43:1 contrast against dark canvas (#0d1829) and 1.24:1 against dark card (#14253e), failing WCAG 2.2 AA non-text contrast (3:1). | Lighten dark border to #334c6e to meet 3.0:1 contrast against dark surfaces. |
| TOK-018 | P0 | color | `packages/tokens/build.js:194` | .joy-badge--brand hardcodes purple background #ede9fe and purple fallback #7c3aed, directly violating brand identity. | Use brand gold subtle background (#fdf8ee) and dark gold text (#8f6b1e). |
| TOK-019 | P0 | color | `packages/tokens/build.js:238-239` | .joy-input:focus hardcodes purple fallback #7c3aed and purple focus shadow rgba(124, 58, 237, 0.15), causing inputs to flash purple on focus. | Use brand gold focus border #c49a3a and gold/navy shadow ring. |
| TOK-020 | P0 | taste | `packages/tokens/build.js:1931-1934` | .joy-hero__title-gradient uses gradient text (linear-gradient(135deg, #7c3aed 0%, #c49a3a 100%)) with -webkit-background-clip: text, violating absolute bans on gradient text and purple #7c3aed. | Remove gradient text and background-clip; render headings with solid brand text tokens. |
| TOK-021 | P1 | taste | `packages/tokens/build.js:294` | .joy-alert uses border-left: 4px solid transparent with colored side stripes, violating the absolute ban on side-stripe border-left > 1px accents. | Replace side-stripe with subtle 1px border around entire alert card. |
| TOK-022 | P1 | taste | `packages/tokens/build.js:1060-1069` | .joy-toast variants use border-left: 4px solid, violating the absolute ban on side-stripe accents. | Use a clean 1px border around the entire toast container. |
| TOK-023 | P1 | taste | `packages/tokens/build.js:1759` | .joy-markdown blockquote uses border-left: 4px solid var(--joy-color-brand-primary, #7c3aed), violating both side-stripe ban and purple fallback. | Use 1px border-left or subtle tinted background with 1px border. |
| TOK-024 | P1 | taste | `packages/tokens/build.js:1138-1139` | --joy-surface-frosted: rgba(255, 255, 255, 0.82) and --joy-backdrop-blur: blur(12px) introduce decorative glassmorphism explicitly banned by design standards. | Remove decorative frosted surface and blur tokens; use solid opaque surfaces with proper elevation. |
| TOK-025 | P1 | taste | `packages/tokens/build.js:159-160` | .joy-button--ghost uses backdrop-filter: blur(8px), violating the ban on decorative glassmorphism. | Remove backdrop-filter; use clean transparent background with clear hover state. |
| TOK-026 | P1 | taste | `packages/tokens/build.js:610` | .joy-modal-backdrop uses backdrop-filter: blur(4px), violating the ban on decorative glassmorphism. | Use solid semi-transparent brand navy scrim (rgba(20, 37, 62, 0.6)) without blur. |
| TOK-027 | P1 | taste | `packages/tokens/build.js:973` | .joy-drawer-backdrop uses backdrop-filter: blur(2px), violating glassmorphism ban. | Remove blur filter; use semi-transparent scrim. |
| TOK-028 | P1 | taste | `packages/tokens/build.js:1955-1956` | .joy-hero .joy-button--outline uses backdrop-filter: blur(8px), violating glassmorphism ban. | Remove backdrop-filter; style with clean solid borders. |
| TOK-029 | P1 | taste | `packages/tokens/build.js:2362-2363` | .joy-chart__hud uses backdrop-filter: var(--joy-backdrop-blur, blur(10px)), violating glassmorphism ban. | Use solid surface token with elevation shadow. |
| TOK-030 | P1 | taste | `packages/tokens/build.js:3232` | .joy-spin__mask uses backdrop-filter: blur(2px), violating glassmorphism ban. | Remove backdrop-filter; use semi-transparent background overlay. |
| TOK-031 | P1 | taste | `packages/tokens/build.js:345` | .joy-metric-tile__title uses text-transform: uppercase and letter-spacing: 0.05em, violating the ban on tracked ALL-CAPS eyebrows. | Use sentence case with standard letter-spacing. |
| TOK-032 | P1 | taste | `packages/tokens/build.js:1341` | .joy-stat-card__label uses text-transform: uppercase and letter-spacing: 0.05em, violating the tracked eyebrow ban. | Use sentence case with regular letter-spacing. |
| TOK-033 | P1 | taste | `packages/tokens/build.js:2019` | .joy-pricing-card__popular-badge uses text-transform: uppercase and letter-spacing: 0.05em, violating the tracked eyebrow ban. | Use sentence case with standard spacing. |
| TOK-034 | P1 | taste | `packages/tokens/build.js:3370` | .joy-logo-cloud__title uses text-transform: uppercase and letter-spacing: 0.08em, violating the tracked eyebrow ban. | Use sentence case. |
| TOK-035 | P1 | taste | `packages/tokens/build.js:3603` | .joy-site-footer__col-title uses text-transform: uppercase and letter-spacing: 0.06em, violating the tracked eyebrow ban. | Use sentence case. |
| TOK-036 | P1 | a11y | `packages/tokens/build.js:72` | .joy-button specifies outline: none without an inline replacement outline, violating accessibility focus ring standards. | Remove outline: none or ensure consistent 2px outline-offset focus ring is attached. |
| TOK-037 | P1 | a11y | `packages/tokens/build.js:234` | .joy-input specifies outline: none without fallback outline. | Provide standard 2px focus ring with offset. |
| TOK-038 | P1 | a11y | `packages/tokens/build.js:836` | .joy-select specifies outline: none without replacement. | Apply standard focus-visible outline token. |
| TOK-039 | P1 | a11y | `packages/tokens/build.js:1193` | .joy-date-picker__input specifies outline: none without replacement. | Apply standard focus ring. |
| TOK-040 | P1 | a11y | `packages/tokens/build.js:1685` | .joy-slider__handle specifies outline: none without focus ring replacement. | Apply 2px focus outline with 2px offset on :focus-visible. |
| TOK-041 | P1 | a11y | `packages/tokens/build.js:2736` | .joy-input-number__input specifies outline: none without replacement. | Apply standard focus outline. |
| TOK-042 | P1 | a11y | `packages/tokens/build.js:2817` | .joy-mentions__textarea specifies outline: none without replacement. | Apply standard focus outline. |
| TOK-043 | P1 | mobile | `packages/tokens/build.js:84` | .joy-button--sm padding (6px 12px) yields ~30px height, violating the mandatory 44px touch target on mobile. | Add media query or touch target pseudo-element (min-height: 44px) for touch pointers. |
| TOK-044 | P1 | mobile | `packages/tokens/build.js:533` | .joy-pagination__btn dimensions (32px × 32px) violate the 44px touch target requirement on mobile. | Increase pagination button touch target to 44px on mobile viewports. |
| TOK-045 | P1 | mobile | `packages/tokens/build.js:1216` | .joy-date-picker__cell dimensions (32px × 32px) violate the 44px touch target requirement on mobile. | Expand calendar tap target to 44px on mobile viewports. |
| TOK-046 | P1 | mobile | `packages/tokens/build.js:2899` | .joy-time-picker__cell height of 28px violates the 44px touch target requirement on mobile. | Increase time picker cell touch height to 44px on mobile. |
| TOK-047 | P1 | mobile | `packages/tokens/build.js:2920` | .joy-transfer forces side-by-side layout with fixed 200px panels and action buttons (>440px), causing horizontal overflow on 375px screens. | Add responsive media query to stack transfer panels vertically on screens ≤ 768px. |
| TOK-048 | P1 | mobile | `packages/tokens/build.js:2707` | .joy-form-item--horizontal .joy-form-item__label has fixed width of 160px, causing severe form layout breakdown on 375px screens. | Stack form labels vertically on screens ≤ 768px. |
| TOK-049 | P1 | consistency | `packages/tokens/build.js:86` | Fallback for --joy-radius-sm is 6px, conflicting with tokens.json definition of 4px. | Align fallback to 4px. |
| TOK-050 | P1 | consistency | `packages/tokens/build.js:96` | Fallback for --joy-radius-lg is 10px, conflicting with tokens.json definition of 12px. | Align fallback to 12px. |
| TOK-051 | P1 | consistency | `packages/tokens/build.js:1834` | var(--joy-radius-xl, 16px) is referenced in build.js without --joy-radius-xl being defined in tokens.json. | Add radius.xl: 16px to tokens.json. |
| TOK-052 | P1 | consistency | `packages/tokens/build.js:1533` | var(--joy-color-text-secondary, #475569) is referenced in build.js without being defined in tokens.json. | Define color.text.secondary in tokens.json. |
| TOK-053 | P1 | consistency | `packages/tokens/build.js:2930` | var(--joy-color-surface-elevated, #ffffff) is referenced in build.js without being defined in tokens.json. | Define color.surface.elevated in tokens.json. |
| TOK-054 | P1 | consistency | `packages/tokens/build.js:1039` | .joy-toast-container hardcodes z-index: 1200 outside of the token system. | Define and use var(--joy-z-index-toast, 1100). |
| TOK-055 | P1 | consistency | `packages/tokens/build.js:2836` | .joy-mentions__dropdown hardcodes z-index: 50, causing it to render underneath modals and dropdowns. | Use var(--joy-z-index-dropdown, 1000). |
| TOK-056 | P1 | consistency | `packages/tokens/build.js:2876` | .joy-time-picker__panel hardcodes z-index: 50, causing overlay clipping inside dialogs. | Use var(--joy-z-index-dropdown, 1000). |
| TOK-057 | P1 | consistency | `packages/tokens/build.js:3101` | .joy-message__notice hardcodes z-index: 1010. | Use semantic token var(--joy-z-index-message, 1010). |
| TOK-058 | P1 | consistency | `packages/tokens/build.js:3136` | .joy-notification__notice hardcodes z-index: 1010. | Use semantic token var(--joy-z-index-notification, 1010). |
| TOK-059 | P1 | consistency | `packages/tokens/build.js:3186` | .joy-popconfirm__panel hardcodes z-index: 100, clipping behind modals. | Use var(--joy-z-index-popover, 1060). |
| TOK-060 | P1 | consistency | `packages/tokens/build.js:3236` | .joy-spin__mask hardcodes z-index: 20. | Use semantic token var(--joy-z-index-mask, 20). |
| TOK-061 | P1 | consistency | `packages/tokens/build.js:3278` | .joy-spin__tip uses z-index: 1100 !important to overcome z-index stacking failures. | Remove !important and structure z-index stacking context cleanly. |
| TOK-062 | P1 | taste | `packages/tokens/build.js:1661` | .joy-slider__track uses purple gradient background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%), violating the single brand accent rule. | Use brand gold fill (#c49a3a). |
| TOK-063 | P1 | taste | `packages/tokens/build.js:2014` | .joy-pricing-card__popular-badge uses purple gradient background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%), violating the brand identity. | Use brand gold or navy background. |
| TOK-064 | P1 | consistency | `packages/tokens/build.js:3670-3736` | Non-brand institutional palettes (obsidian, quantum, cyberpunk, titanium) override brand primary tokens with foreign purple, cyan, and emerald. | Remove non-brand palettes or isolate into experimental sub-packages. |
| TOK-065 | P1 | state | `packages/tokens/build.js:111` | .joy-button:disabled uses flat opacity: 0.5 without dedicated disabled surface or text tokens, causing text contrast to collapse. | Define semantic disabled tokens (--joy-surface-disabled, --joy-text-disabled). |
| TOK-066 | P1 | state | `packages/tokens/build.js:286` | .joy-switch:disabled relies on opacity: 0.5. | Use semantic disabled tokens for switch track and thumb. |
| TOK-067 | P1 | state | `packages/tokens/build.js:843` | .joy-select:disabled uses opacity: 0.6 and slate background #f1f5f9. | Use warm-tinted disabled background token. |
| TOK-068 | P1 | state | `packages/tokens/build.js:1690` | .joy-slider--disabled uses opacity: 0.4. | Use semantic disabled tokens for track and handle. |
| TOK-069 | P1 | color | `packages/tokens/build.js:770` | Tooltip arrow border uses slate fallback var(--joy-color-surface-dark-base, #0f172a). | Use brand dark surface token #0d1829. |
| TOK-070 | P1 | color | `packages/tokens/build.js:121` | Button outline text uses slate fallback var(--joy-color-text-primary, #334155). | Use brand ink #1f1c13. |
| TOK-071 | P1 | color | `packages/tokens/build.js:198` | Badge text uses slate fallback var(--joy-color-text-primary, #0f172a). | Use brand ink #1f1c13. |
| TOK-072 | P1 | color | `packages/tokens/build.js:439` | Table container border uses slate fallback var(--joy-color-border-subtle, #e2e8f0). | Use brand warm border #e2d9c8. |
| TOK-073 | P1 | color | `packages/tokens/build.js:450` | Table inner row border uses slate fallback var(--joy-color-border-subtle, #f1f5f9). | Use brand warm border token. |
| TOK-074 | P1 | color | `packages/tokens/build.js:1279` | Breadcrumb separator in dark mode uses slate fallback #1e293b. | Use brand dark border token. |
| TOK-075 | P1 | dark | `packages/tokens/src/tokens.json:74-78` | Shadow tokens use pure black rgba(0, 0, 0, ...) which vanish against dark canvas #0d1829. | Introduce dark elevation tokens with ambient surface elevation tints and subtle border highlights. |
| TOK-076 | P1 | motion | `packages/tokens/src/tokens.json:61-65` | Motion duration scale lacks micro (100ms) for high-frequency feedback and instant (0ms) for reduced-motion modes. | Add instant: 0ms and micro: 100ms to motion.duration tokens. |
| TOK-077 | P1 | consistency | `packages/tokens/build.js:3739-3746` | canonicalVars only exports 8 variables, omitting --joy-text-muted, --joy-border-subtle, status colors, and hover states. | Export complete canonical semantic token mapping in :root. |
| TOK-078 | P2 | taste | `packages/tokens/build.js:98` | .joy-button--solid lacks top highlight rim (box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2)), looking flat rather than enterprise-grade. | Add subtle top highlight rim and pressed inner shadow. |
| TOK-079 | P2 | motion | `packages/tokens/build.js:77` | .joy-button:active uses transform: scale(0.97) which can cause raster blurring on low-DPI displays. | Replace transform: scale with translateY(1px) and inner shadow. |
| TOK-080 | P2 | consistency | `packages/tokens/build.js:32` | Tokens package bundles a 3,700-line monolithic CSS string containing all component implementations instead of exporting pure design tokens. | Refactor build.js to compile design tokens and split component styles into modular component CSS packages. |
| TOK-081 | P2 | consistency | `packages/tokens/build.js:3751` | theme.css output is not wrapped in @layer tokens, components;, making consumer overrides difficult and prone to specificity conflicts. | Wrap generated CSS in standard @layer tokens, components; blocks. |
| TOK-082 | P2 | consistency | `packages/tokens/src/tokens.json:48-53` | Radius scale lacks radius.none (0px), radius.xs (2px), and radius.2xl (24px). | Add none, xs, and 2xl to radius scale in tokens.json. |
| TOK-083 | P2 | consistency | `packages/tokens/build.js:1135-1136` | --joy-font-display-letter-spacing and --joy-font-variant-numeric are declared ad-hoc in build.js instead of tokens.json. | Formalize typographic posture variables in tokens.json. |
| TOK-084 | P2 | color | `packages/tokens/build.js:1474` | Upload dragger hover border uses fallback #7c3aed. | Use brand gold #c49a3a. |
| TOK-085 | P2 | color | `packages/tokens/build.js:2243` | Timeline dot border uses fallback #7c3aed. | Use brand gold #c49a3a. |
| TOK-086 | P2 | color | `packages/tokens/build.js:2566` | Tag brand variant uses fallback #7c3aed. | Use brand gold #c49a3a. |
| TOK-087 | P2 | color | `packages/tokens/build.js:2724` | Input number focus border uses fallback #7c3aed. | Use brand gold #c49a3a. |
| TOK-088 | P2 | color | `packages/tokens/build.js:3044` | Menu active item border uses fallback #7c3aed. | Use brand gold #c49a3a. |
| TOK-089 | P2 | color | `packages/tokens/build.js:3074` | Anchor active ball uses fallback #7c3aed. | Use brand gold #c49a3a. |
| TOK-090 | P2 | color | `packages/tokens/build.js:3216` | Popconfirm icon uses fallback #7c3aed. | Use brand gold #c49a3a or status warning token. |
| TOK-091 | P2 | consistency | `packages/tokens/build.js:2036` | .joy-pricing-card__price uses magic font size 2.25rem and weight 800. | Map to standard display token. |
| TOK-092 | P2 | consistency | `packages/tokens/build.js:3421` | Landing section headings use ad-hoc font sizes (2.25rem, 2rem, 2.75rem). | Map to formalized heading scale in tokens.json. |
| TOK-093 | P2 | parity | `packages/tokens/dist/index.d.ts:1` | TypeScript declarations export generic Record<string, string> rather than strictly typed token union keys. | Generate strongly typed token dictionary definitions in index.d.ts. |
| TOK-094 | P2 | consistency | `packages/tokens/build.js:20` | flattenTokens strips token type metadata, preventing integration with DTCG (Design Tokens Community Group) tooling. | Retain type metadata in JavaScript token export. |

## Contrast table

| Pair | Theme | Role | Contrast Ratio | WCAG AA Requirement | Pass/Fail |
|---|---|---|---|---|---|
| --joy-text-primary (#1f1c13) on --joy-surface-canvas (#f8f3e8) | Light | Text / Surface | 15.38:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-muted (#64748b) on --joy-surface-canvas (#f8f3e8) | Light | Text / Surface | 4.30:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-text-inverse (#ffffff) on --joy-surface-canvas (#f8f3e8) | Light | Text / Surface | 1.11:1 | ≥ 4.5:1 | **FAIL** |
| --joy-text-primary (#1f1c13) on --joy-surface-card (#ffffff) | Light | Text / Surface | 17.02:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-muted (#64748b) on --joy-surface-card (#ffffff) | Light | Text / Surface | 4.76:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-inverse (#ffffff) on --joy-surface-card (#ffffff) | Light | Text / Surface | 1.00:1 | ≥ 4.5:1 | **FAIL** |
| --joy-text-primary (#1f1c13) on --joy-color-surface-subtle (#f8fafc) | Light | Text / Surface | 16.27:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-muted (#64748b) on --joy-color-surface-subtle (#f8fafc) | Light | Text / Surface | 4.55:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-inverse (#ffffff) on --joy-color-surface-subtle (#f8fafc) | Light | Text / Surface | 1.05:1 | ≥ 4.5:1 | **FAIL** |
| --joy-text-primary (#1f1c13) on --joy-color-surface-muted (#f1f5f9) | Light | Text / Surface | 15.54:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-muted (#64748b) on --joy-color-surface-muted (#f1f5f9) | Light | Text / Surface | 4.34:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-text-inverse (#ffffff) on --joy-color-surface-muted (#f1f5f9) | Light | Text / Surface | 1.10:1 | ≥ 4.5:1 | **FAIL** |
| --joy-border (#e2d9c8) on --joy-surface-canvas (#f8f3e8) | Light | Border / Surface | 1.27:1 | ≥ 3:1 | **FAIL** |
| --joy-color-border-subtle (#cbd5e1) on --joy-surface-canvas (#f8f3e8) | Light | Border / Surface | 1.34:1 | ≥ 3:1 | **FAIL** |
| --joy-border (#e2d9c8) on --joy-surface-card (#ffffff) | Light | Border / Surface | 1.40:1 | ≥ 3:1 | **FAIL** |
| --joy-color-border-subtle (#cbd5e1) on --joy-surface-card (#ffffff) | Light | Border / Surface | 1.48:1 | ≥ 3:1 | **FAIL** |
| --joy-border (#e2d9c8) on --joy-color-surface-subtle (#f8fafc) | Light | Border / Surface | 1.34:1 | ≥ 3:1 | **FAIL** |
| --joy-color-border-subtle (#cbd5e1) on --joy-color-surface-subtle (#f8fafc) | Light | Border / Surface | 1.42:1 | ≥ 3:1 | **FAIL** |
| --joy-border (#e2d9c8) on --joy-color-surface-muted (#f1f5f9) | Light | Border / Surface | 1.28:1 | ≥ 3:1 | **FAIL** |
| --joy-color-border-subtle (#cbd5e1) on --joy-color-surface-muted (#f1f5f9) | Light | Border / Surface | 1.36:1 | ≥ 3:1 | **FAIL** |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-surface-canvas (#f8f3e8) [Text] | Light | Accent Text / Surface | 2.36:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-surface-canvas (#f8f3e8) [UI/Icon] | Light | Accent UI / Surface | 2.36:1 | ≥ 3.0:1 | **FAIL** |
| --joy-color-brand-primary-hover (#b3892f) on --joy-surface-canvas (#f8f3e8) [Text] | Light | Accent Text / Surface | 2.90:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-brand-primary-hover (#b3892f) on --joy-surface-canvas (#f8f3e8) [UI/Icon] | Light | Accent UI / Surface | 2.90:1 | ≥ 3.0:1 | **FAIL** |
| --joy-color-brand-secondary / --navy-500 (#14253e) on --joy-surface-canvas (#f8f3e8) [Text] | Light | Accent Text / Surface | 13.91:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-secondary / --navy-500 (#14253e) on --joy-surface-canvas (#f8f3e8) [UI/Icon] | Light | Accent UI / Surface | 13.91:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-surface-card (#ffffff) [Text] | Light | Accent Text / Surface | 2.62:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-surface-card (#ffffff) [UI/Icon] | Light | Accent UI / Surface | 2.62:1 | ≥ 3.0:1 | **FAIL** |
| --joy-color-brand-primary-hover (#b3892f) on --joy-surface-card (#ffffff) [Text] | Light | Accent Text / Surface | 3.21:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-brand-primary-hover (#b3892f) on --joy-surface-card (#ffffff) [UI/Icon] | Light | Accent UI / Surface | 3.21:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-secondary / --navy-500 (#14253e) on --joy-surface-card (#ffffff) [Text] | Light | Accent Text / Surface | 15.40:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-secondary / --navy-500 (#14253e) on --joy-surface-card (#ffffff) [UI/Icon] | Light | Accent UI / Surface | 15.40:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-color-surface-subtle (#f8fafc) [Text] | Light | Accent Text / Surface | 2.50:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-color-surface-subtle (#f8fafc) [UI/Icon] | Light | Accent UI / Surface | 2.50:1 | ≥ 3.0:1 | **FAIL** |
| --joy-color-brand-primary-hover (#b3892f) on --joy-color-surface-subtle (#f8fafc) [Text] | Light | Accent Text / Surface | 3.07:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-brand-primary-hover (#b3892f) on --joy-color-surface-subtle (#f8fafc) [UI/Icon] | Light | Accent UI / Surface | 3.07:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-secondary / --navy-500 (#14253e) on --joy-color-surface-subtle (#f8fafc) [Text] | Light | Accent Text / Surface | 14.72:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-secondary / --navy-500 (#14253e) on --joy-color-surface-subtle (#f8fafc) [UI/Icon] | Light | Accent UI / Surface | 14.72:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-color-surface-muted (#f1f5f9) [Text] | Light | Accent Text / Surface | 2.39:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-color-surface-muted (#f1f5f9) [UI/Icon] | Light | Accent UI / Surface | 2.39:1 | ≥ 3.0:1 | **FAIL** |
| --joy-color-brand-primary-hover (#b3892f) on --joy-color-surface-muted (#f1f5f9) [Text] | Light | Accent Text / Surface | 2.93:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-brand-primary-hover (#b3892f) on --joy-color-surface-muted (#f1f5f9) [UI/Icon] | Light | Accent UI / Surface | 2.93:1 | ≥ 3.0:1 | **FAIL** |
| --joy-color-brand-secondary / --navy-500 (#14253e) on --joy-color-surface-muted (#f1f5f9) [Text] | Light | Accent Text / Surface | 14.05:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-secondary / --navy-500 (#14253e) on --joy-color-surface-muted (#f1f5f9) [UI/Icon] | Light | Accent UI / Surface | 14.05:1 | ≥ 3.0:1 | PASS |
| --joy-color-status-success (#10b981) on --joy-surface-canvas (#f8f3e8) [Text] | Light | Status Text / Surface | 2.29:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-warning (#f59e0b) on --joy-surface-canvas (#f8f3e8) [Text] | Light | Status Text / Surface | 1.94:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-danger (#ef4444) on --joy-surface-canvas (#f8f3e8) [Text] | Light | Status Text / Surface | 3.40:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-info (#3b82f6) on --joy-surface-canvas (#f8f3e8) [Text] | Light | Status Text / Surface | 3.32:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-success (#10b981) on --joy-surface-card (#ffffff) [Text] | Light | Status Text / Surface | 2.54:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-warning (#f59e0b) on --joy-surface-card (#ffffff) [Text] | Light | Status Text / Surface | 2.15:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-danger (#ef4444) on --joy-surface-card (#ffffff) [Text] | Light | Status Text / Surface | 3.76:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-info (#3b82f6) on --joy-surface-card (#ffffff) [Text] | Light | Status Text / Surface | 3.68:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-success (#10b981) on --joy-color-surface-subtle (#f8fafc) [Text] | Light | Status Text / Surface | 2.42:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-warning (#f59e0b) on --joy-color-surface-subtle (#f8fafc) [Text] | Light | Status Text / Surface | 2.05:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-danger (#ef4444) on --joy-color-surface-subtle (#f8fafc) [Text] | Light | Status Text / Surface | 3.60:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-info (#3b82f6) on --joy-color-surface-subtle (#f8fafc) [Text] | Light | Status Text / Surface | 3.52:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-success (#10b981) on --joy-color-surface-muted (#f1f5f9) [Text] | Light | Status Text / Surface | 2.32:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-warning (#f59e0b) on --joy-color-surface-muted (#f1f5f9) [Text] | Light | Status Text / Surface | 1.96:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-danger (#ef4444) on --joy-color-surface-muted (#f1f5f9) [Text] | Light | Status Text / Surface | 3.44:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-info (#3b82f6) on --joy-color-surface-muted (#f1f5f9) [Text] | Light | Status Text / Surface | 3.36:1 | ≥ 4.5:1 | **FAIL** |
| --joy-text-primary (#f8f3e8) on --joy-surface-canvas (#0d1829) | Dark | Text / Surface | 16.08:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-muted (#94a3b8) on --joy-surface-canvas (#0d1829) | Dark | Text / Surface | 6.94:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-inverse (#ffffff) on --joy-surface-canvas (#0d1829) | Dark | Text / Surface | 17.80:1 | ≥ 4.5:1 | PASS |
| Dark Table td text (#f8fafc) (#f8fafc) on --joy-surface-canvas (#0d1829) | Dark | Text / Surface | 17.01:1 | ≥ 4.5:1 | PASS |
| --joy-text-primary (#f8f3e8) on --joy-surface-card (#14253e) | Dark | Text / Surface | 13.91:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-muted (#94a3b8) on --joy-surface-card (#14253e) | Dark | Text / Surface | 6.00:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-inverse (#ffffff) on --joy-surface-card (#14253e) | Dark | Text / Surface | 15.40:1 | ≥ 4.5:1 | PASS |
| Dark Table td text (#f8fafc) (#f8fafc) on --joy-surface-card (#14253e) | Dark | Text / Surface | 14.72:1 | ≥ 4.5:1 | PASS |
| --joy-text-primary (#f8f3e8) on --joy-color-surface-muted (#1e3352) | Dark | Text / Surface | 11.50:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-muted (#94a3b8) on --joy-color-surface-muted (#1e3352) | Dark | Text / Surface | 4.96:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-inverse (#ffffff) on --joy-color-surface-muted (#1e3352) | Dark | Text / Surface | 12.72:1 | ≥ 4.5:1 | PASS |
| Dark Table td text (#f8fafc) (#f8fafc) on --joy-color-surface-muted (#1e3352) | Dark | Text / Surface | 12.16:1 | ≥ 4.5:1 | PASS |
| --joy-text-primary (#f8f3e8) on Dark Thead/Footer (#0f172a) (#0f172a) | Dark | Text / Surface | 16.13:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-muted (#94a3b8) on Dark Thead/Footer (#0f172a) (#0f172a) | Dark | Text / Surface | 6.96:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-inverse (#ffffff) on Dark Thead/Footer (#0f172a) (#0f172a) | Dark | Text / Surface | 17.85:1 | ≥ 4.5:1 | PASS |
| Dark Table td text (#f8fafc) (#f8fafc) on Dark Thead/Footer (#0f172a) (#0f172a) | Dark | Text / Surface | 17.06:1 | ≥ 4.5:1 | PASS |
| --joy-text-primary (#f8f3e8) on Dark Row Hover (#334155) (#334155) | Dark | Text / Surface | 9.36:1 | ≥ 4.5:1 | PASS |
| --joy-color-text-muted (#94a3b8) on Dark Row Hover (#334155) (#334155) | Dark | Text / Surface | 4.04:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-text-inverse (#ffffff) on Dark Row Hover (#334155) (#334155) | Dark | Text / Surface | 10.35:1 | ≥ 4.5:1 | PASS |
| Dark Table td text (#f8fafc) (#f8fafc) on Dark Row Hover (#334155) (#334155) | Dark | Text / Surface | 9.90:1 | ≥ 4.5:1 | PASS |
| --joy-border / border-subtle (#23354e) on --joy-surface-canvas (#0d1829) | Dark | Border / Surface | 1.43:1 | ≥ 3:1 | **FAIL** |
| --joy-color-border-default (#2d4566) on --joy-surface-canvas (#0d1829) | Dark | Border / Surface | 1.83:1 | ≥ 3:1 | **FAIL** |
| Dark Table border (#334155) (#334155) on --joy-surface-canvas (#0d1829) | Dark | Border / Surface | 1.72:1 | ≥ 3:1 | **FAIL** |
| --joy-border / border-subtle (#23354e) on --joy-surface-card (#14253e) | Dark | Border / Surface | 1.24:1 | ≥ 3:1 | **FAIL** |
| --joy-color-border-default (#2d4566) on --joy-surface-card (#14253e) | Dark | Border / Surface | 1.58:1 | ≥ 3:1 | **FAIL** |
| Dark Table border (#334155) (#334155) on --joy-surface-card (#14253e) | Dark | Border / Surface | 1.49:1 | ≥ 3:1 | **FAIL** |
| --joy-border / border-subtle (#23354e) on --joy-color-surface-muted (#1e3352) | Dark | Border / Surface | 1.02:1 | ≥ 3:1 | **FAIL** |
| --joy-color-border-default (#2d4566) on --joy-color-surface-muted (#1e3352) | Dark | Border / Surface | 1.31:1 | ≥ 3:1 | **FAIL** |
| Dark Table border (#334155) (#334155) on --joy-color-surface-muted (#1e3352) | Dark | Border / Surface | 1.23:1 | ≥ 3:1 | **FAIL** |
| --joy-border / border-subtle (#23354e) on Dark Thead/Footer (#0f172a) (#0f172a) | Dark | Border / Surface | 1.44:1 | ≥ 3:1 | **FAIL** |
| --joy-color-border-default (#2d4566) on Dark Thead/Footer (#0f172a) (#0f172a) | Dark | Border / Surface | 1.83:1 | ≥ 3:1 | **FAIL** |
| Dark Table border (#334155) (#334155) on Dark Thead/Footer (#0f172a) (#0f172a) | Dark | Border / Surface | 1.72:1 | ≥ 3:1 | **FAIL** |
| --joy-border / border-subtle (#23354e) on Dark Row Hover (#334155) (#334155) | Dark | Border / Surface | 1.20:1 | ≥ 3:1 | **FAIL** |
| --joy-color-border-default (#2d4566) on Dark Row Hover (#334155) (#334155) | Dark | Border / Surface | 1.06:1 | ≥ 3:1 | **FAIL** |
| Dark Table border (#334155) (#334155) on Dark Row Hover (#334155) (#334155) | Dark | Border / Surface | 1.00:1 | ≥ 3:1 | **FAIL** |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-surface-canvas (#0d1829) [Text] | Dark | Accent Text / Surface | 6.81:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-surface-canvas (#0d1829) [UI/Icon] | Dark | Accent UI / Surface | 6.81:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary-hover (#d4ab4b) on --joy-surface-canvas (#0d1829) [Text] | Dark | Accent Text / Surface | 8.24:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-primary-hover (#d4ab4b) on --joy-surface-canvas (#0d1829) [UI/Icon] | Dark | Accent UI / Surface | 8.24:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-surface-card (#14253e) [Text] | Dark | Accent Text / Surface | 5.89:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-surface-card (#14253e) [UI/Icon] | Dark | Accent UI / Surface | 5.89:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary-hover (#d4ab4b) on --joy-surface-card (#14253e) [Text] | Dark | Accent Text / Surface | 7.13:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-primary-hover (#d4ab4b) on --joy-surface-card (#14253e) [UI/Icon] | Dark | Accent UI / Surface | 7.13:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-color-surface-muted (#1e3352) [Text] | Dark | Accent Text / Surface | 4.87:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on --joy-color-surface-muted (#1e3352) [UI/Icon] | Dark | Accent UI / Surface | 4.87:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary-hover (#d4ab4b) on --joy-color-surface-muted (#1e3352) [Text] | Dark | Accent Text / Surface | 5.89:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-primary-hover (#d4ab4b) on --joy-color-surface-muted (#1e3352) [UI/Icon] | Dark | Accent UI / Surface | 5.89:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on Dark Thead/Footer (#0f172a) (#0f172a) [Text] | Dark | Accent Text / Surface | 6.83:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on Dark Thead/Footer (#0f172a) (#0f172a) [UI/Icon] | Dark | Accent UI / Surface | 6.83:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary-hover (#d4ab4b) on Dark Thead/Footer (#0f172a) (#0f172a) [Text] | Dark | Accent Text / Surface | 8.27:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-primary-hover (#d4ab4b) on Dark Thead/Footer (#0f172a) (#0f172a) [UI/Icon] | Dark | Accent UI / Surface | 8.27:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on Dark Row Hover (#334155) (#334155) [Text] | Dark | Accent Text / Surface | 3.96:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-brand-primary / --gold-400 (#c49a3a) on Dark Row Hover (#334155) (#334155) [UI/Icon] | Dark | Accent UI / Surface | 3.96:1 | ≥ 3.0:1 | PASS |
| --joy-color-brand-primary-hover (#d4ab4b) on Dark Row Hover (#334155) (#334155) [Text] | Dark | Accent Text / Surface | 4.80:1 | ≥ 4.5:1 | PASS |
| --joy-color-brand-primary-hover (#d4ab4b) on Dark Row Hover (#334155) (#334155) [UI/Icon] | Dark | Accent UI / Surface | 4.80:1 | ≥ 3.0:1 | PASS |
| --joy-color-status-success (#10b981) on --joy-surface-canvas (#0d1829) [Text] | Dark | Status Text / Surface | 7.02:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-warning (#f59e0b) on --joy-surface-canvas (#0d1829) [Text] | Dark | Status Text / Surface | 8.29:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-danger (#ef4444) on --joy-surface-canvas (#0d1829) [Text] | Dark | Status Text / Surface | 4.73:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-info (#3b82f6) on --joy-surface-canvas (#0d1829) [Text] | Dark | Status Text / Surface | 4.84:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-success (#10b981) on --joy-surface-card (#14253e) [Text] | Dark | Status Text / Surface | 6.07:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-warning (#f59e0b) on --joy-surface-card (#14253e) [Text] | Dark | Status Text / Surface | 7.17:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-danger (#ef4444) on --joy-surface-card (#14253e) [Text] | Dark | Status Text / Surface | 4.09:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-info (#3b82f6) on --joy-surface-card (#14253e) [Text] | Dark | Status Text / Surface | 4.19:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-success (#10b981) on --joy-color-surface-muted (#1e3352) [Text] | Dark | Status Text / Surface | 5.02:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-warning (#f59e0b) on --joy-color-surface-muted (#1e3352) [Text] | Dark | Status Text / Surface | 5.92:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-danger (#ef4444) on --joy-color-surface-muted (#1e3352) [Text] | Dark | Status Text / Surface | 3.38:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-info (#3b82f6) on --joy-color-surface-muted (#1e3352) [Text] | Dark | Status Text / Surface | 3.46:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-success (#10b981) on Dark Thead/Footer (#0f172a) (#0f172a) [Text] | Dark | Status Text / Surface | 7.04:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-warning (#f59e0b) on Dark Thead/Footer (#0f172a) (#0f172a) [Text] | Dark | Status Text / Surface | 8.31:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-danger (#ef4444) on Dark Thead/Footer (#0f172a) (#0f172a) [Text] | Dark | Status Text / Surface | 4.74:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-info (#3b82f6) on Dark Thead/Footer (#0f172a) (#0f172a) [Text] | Dark | Status Text / Surface | 4.85:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-success (#10b981) on Dark Row Hover (#334155) (#334155) [Text] | Dark | Status Text / Surface | 4.08:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-warning (#f59e0b) on Dark Row Hover (#334155) (#334155) [Text] | Dark | Status Text / Surface | 4.82:1 | ≥ 4.5:1 | PASS |
| --joy-color-status-danger (#ef4444) on Dark Row Hover (#334155) (#334155) [Text] | Dark | Status Text / Surface | 2.75:1 | ≥ 4.5:1 | **FAIL** |
| --joy-color-status-info (#3b82f6) on Dark Row Hover (#334155) (#334155) [Text] | Dark | Status Text / Surface | 2.82:1 | ≥ 4.5:1 | **FAIL** |
| Button Solid: text (#14253e) on gold (#c49a3a) | Light | Text (Button CTA) | 5.89:1 | ≥ 4.5:1 | PASS |
| Button Danger: text (#ffffff) on danger (#ef4444) | Light | Text (Button Danger) | 3.76:1 | ≥ 4.5:1 | **FAIL** |
| Button Outline: gold border (#c49a3a) on canvas (#f8f3e8) | Light | UI Border | 2.36:1 | ≥ 3:1 | **FAIL** |
| Button Outline: gold border (#c49a3a) on card (#ffffff) | Light | UI Border | 2.62:1 | ≥ 3:1 | **FAIL** |
| Focus Ring: gold (#c49a3a) against canvas (#f8f3e8) | Light | Focus Ring | 2.36:1 | ≥ 3:1 | **FAIL** |
| Focus Ring: gold (#c49a3a) against card (#ffffff) | Light | Focus Ring | 2.62:1 | ≥ 3:1 | **FAIL** |
| Status Success Badge: white text (#ffffff) on success (#10b981) | Light | Badge Text | 2.54:1 | ≥ 4.5:1 | **FAIL** |
| Status Warning Badge: white text (#ffffff) on warning (#f59e0b) | Light | Badge Text | 2.15:1 | ≥ 4.5:1 | **FAIL** |
| Status Danger Badge: white text (#ffffff) on danger (#ef4444) | Light | Badge Text | 3.76:1 | ≥ 4.5:1 | **FAIL** |
| Status Info Badge: white text (#ffffff) on info (#3b82f6) | Light | Badge Text | 3.68:1 | ≥ 4.5:1 | **FAIL** |
| Button Solid: text (#14253e) on gold (#c49a3a) | Dark | Text (Button CTA) | 5.89:1 | ≥ 4.5:1 | PASS |
| Button Outline: gold border (#c49a3a) on dark canvas (#0d1829) | Dark | UI Border | 6.81:1 | ≥ 3:1 | PASS |
| Button Outline: gold border (#c49a3a) on dark card (#14253e) | Dark | UI Border | 5.89:1 | ≥ 3:1 | PASS |
| Focus Ring: gold (#c49a3a) against dark canvas (#0d1829) | Dark | Focus Ring | 6.81:1 | ≥ 3:1 | PASS |
| Focus Ring: gold (#c49a3a) against dark card (#14253e) | Dark | Focus Ring | 5.89:1 | ≥ 3:1 | PASS |
| Status Success Badge: white text (#ffffff) on success (#10b981) | Dark | Badge Text | 2.54:1 | ≥ 4.5:1 | **FAIL** |
| Status Warning Badge: white text (#ffffff) on warning (#f59e0b) | Dark | Badge Text | 2.15:1 | ≥ 4.5:1 | **FAIL** |
| Status Danger Badge: white text (#ffffff) on danger (#ef4444) | Dark | Badge Text | 3.76:1 | ≥ 4.5:1 | **FAIL** |
| Status Info Badge: white text (#ffffff) on info (#3b82f6) | Dark | Badge Text | 3.68:1 | ≥ 4.5:1 | **FAIL** |
