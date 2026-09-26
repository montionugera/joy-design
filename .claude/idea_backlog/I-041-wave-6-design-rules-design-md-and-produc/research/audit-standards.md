# joy-design Audit Standards (input for every audit lane)

You are auditing the Joymify design system (`joy-design`) for production-grade quality. The owner's verdict: "mobile and dark mode are noticeably sloppy; colors are not production grade; the hero button (and components generally) lack professional detail." Find EVERY concrete defect. Be specific: file:line, what is wrong, what the fix is. No vague advice.

## Brand invariants (from AGENTS.md — must hold)
- Palette anchors: navy `#14253e` (primary surface anchor), gold `#c49a3a` (singular accent), cream `#f8f3e8` (warm canvas), ink `#1f1c13` (primary text). These are the committed brand identity: keep them, tune ramps around them.
- Dark mode must be fully token-driven via semantic tokens (`--joy-surface-canvas`, `--joy-surface-card`, `--joy-border`, `--joy-text-primary`, ...). Any hardcoded `#fff`/`#ffffff`/`white` inside a component that can appear in dark mode is a defect.
- Zero Emoji Policy: no raw OS emoji anywhere in components or hub markup. SVG icons only.

## Color (production-grade bar)
- Every text/background pair must meet WCAG 2.2 AA: body ≥ 4.5:1, large text (≥18px or bold ≥14px) ≥ 3:1, UI borders/icons vs adjacent ≥ 3:1. Compute real ratios, do not eyeball. Check BOTH themes.
- Fallback values in `var(--x, fallback)` must match the brand token, never a foreign default (e.g. `#7c3aed` purple, `#0f172a` slate, `#3b82f6` blue, Tailwind gray/slate ramps). Every foreign fallback is a defect.
- Status colors (success/warning/danger/info) need dark-mode-tuned variants and text-on-status contrast; generic Tailwind `#10b981/#f59e0b/#ef4444/#3b82f6` are not brand-tuned.
- Neutral ramp must be tinted toward the brand hue (navy/ink), not raw slate (`#64748b`, `#cbd5e1`, `#f1f5f9`, `#f8fafc`). Mixed cool-slate + warm-cream in one surface = muddy, flag it.
- Gold `#c49a3a` on white is ~2.6:1 — insufficient for body text or thin borders. Flag every place gold is used as small text or as the only focus indicator.
- Dark mode is NOT inverted light mode. Cards should be lighter than canvas; shadows must be replaced by borders/elevation tints; gold should shift lighter; pure white text should not be used on dark (use ~92% ink).
- Look for: gray text on colored bg, low-contrast placeholders, disabled states that vanish, hover states with no visible change, focus rings that fail 3:1.

## Component detail (every interactive component)
- Required states: default, hover, focus-visible, active/pressed, disabled, loading, error, selected. List which are missing per component.
- Focus ring: consistent 2px ring + offset using one token; never `outline: none` without replacement.
- Touch targets ≥ 44×44 CSS px on mobile for buttons, inputs, checkboxes, tabs, pagination, close buttons.
- Sizes sm/md/lg must share one type + spacing scale; check for magic numbers (`0.875rem`, `13px`, `6px`) that should be tokens.
- Consistent radius vocabulary (one radius per role: control, card, overlay, pill). Flag mismatches.
- Transitions: 150–250ms, ease-out; every animation must have `prefers-reduced-motion` handling; never animate layout properties.
- Semantic z-index scale (dropdown < sticky < backdrop < modal < toast < tooltip); flag any `999`/`9999`/arbitrary values.
- Hero/primary CTA: a production hero button has depth (subtle top highlight or 2-stop gradient in the SAME hue, inner shadow on press), refined hover (lift + shadow tint in brand hue, not gray), a visible focus ring, and a loading state. A flat single-color rect with a color-only hover is "not production grade".
- Overlays (dropdown, select, tooltip, modal, drawer): must escape `overflow:hidden` parents, trap focus where modal, close on Escape, lock scroll, animate in/out, be usable on mobile (drawer/sheet on small screens).

## Mobile (≤ 430px and ≤ 768px)
- No horizontal overflow; headings must not overflow (test clamp maxima against long words).
- Grids collapse to 1 column; tables have a stacked/scroll strategy; forms full-width; sticky headers don't cover content.
- Typography: body ≥ 16px on mobile inputs (avoid iOS zoom), line length ≤ 75ch.
- 16px side gutters minimum; tap targets ≥ 44px; hover-only affordances need a touch alternative.
- Storybook hub: sidebar drawer, top bar, hero, cards, playground headers, code blocks must all work at 375px wide in both themes.

## Consistency & taste (reject AI-slop defaults)
- Absolute bans: side-stripe `border-left > 1px` accents; gradient text (`background-clip:text`); decorative glassmorphism; identical icon+heading+text card grids; tracked ALL-CAPS eyebrow above every section; numbered 01/02/03 markers where content is not a sequence; `→` appended to link text; `#0B0B0B`/`#111` standing in for black; middle-dot meta strings.
- Same control must look identical in Svelte and React packages (parity). Flag divergences (different padding, radius, colors, missing variants).
- One type scale (1.125–1.2 ratio) and one spacing scale; flag ad-hoc font sizes.
- Copy: sentence case, active voice, CTA says what happens.

## Output contract
Write ONE markdown report at the path given in your task. Structure:
1. `## Summary` — 3 lines: files audited, issue count by severity (P0 blocks production / P1 visibly sloppy / P2 polish).
2. `## Systemic patterns` — ≤ 10 bullets of root causes (things to fix once in tokens/build rather than per component).
3. `## Issues` — one markdown table: `| ID | Sev | Category | File:line | Issue | Fix |`. ID = `<LANE>-NNN`. Category ∈ {color, dark, mobile, state, a11y, motion, consistency, taste, parity, copy}. Be exhaustive; 40–120 rows is normal.
4. `## Contrast table` (only if you computed ratios) — pair, theme, ratio, pass/fail.
Do NOT modify any repo file. Do NOT commit. Read-only audit; scripts you need go in the report directory.
