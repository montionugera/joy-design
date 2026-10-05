# Ant Design 5 Parity & Fluid Transitions Implementation Plan

Goal: Elevate Joy Design components to match and exceed Ant Design 5 standards for visual polish, custom calendar popover overlays, range selection trails, fluid transitions, and accessibility, maintaining 100% token compliance and Svelte 5 / React 19 twin parity.

Architecture Spec: [Ant Design 5 Parity Specification](file:///Users/pasitnusso/workspace/repos/joy-design/docs/superpowers/specs/2026-10-05-antd5-parity-design-and-transitions-design.md)
Architecture Diagram: [Ant Design 5 Parity Diagram](file:///Users/pasitnusso/workspace/repos/joy-design/docs/superpowers/specs/2026-10-05-antd5-parity-architecture.drawio.svg)

---

## Phase 1: Design Tokens & Custom Calendar Overlay Styles

### Task 1.1: Add AntD 5 Motion Curves & Calendar Tokens
- File: `packages/tokens/build.js` & `packages/tokens/src/tokens.json`
- Description:
  - Add `--joy-ease-out-quint: cubic-bezier(0.23, 1, 0.32, 1)` and `--joy-ease-in-out-quint: cubic-bezier(0.86, 0, 0.07, 1)`.
  - Add styles for `.joy-calendar`:
    - `.joy-calendar__panel`: background `--joy-surface-card`, border `--joy-border-default`, border-radius `--joy-radius-lg`, box-shadow `--joy-elevation-3`.
    - `.joy-calendar__header`: navigation row with `<<`, `<`, Month/Year, `>`, `>>`.
    - `.joy-calendar__grid`: 7-col grid for weekdays and day cells.
    - `.joy-calendar__cell`: 32x32px rounded pill, text `--joy-text-primary`.
    - `.joy-calendar__cell--today`: border `--joy-border-default`, text `--joy-accent-default`.
    - `.joy-calendar__cell--selected`: background `--joy-accent-default`, text `--joy-accent-contrast`.
    - `.joy-calendar__cell--in-range`: background `--joy-accent-subtle`, color `--joy-text-primary`.
    - `.joy-calendar__cell--range-start`, `.joy-calendar__cell--range-end`: pill endpoints.
    - `.joy-calendar__cell--muted`: out-of-month days `--joy-text-muted`.
    - `.joy-calendar__footer`: footer with presets and "Today" button.
  - Add unified pill styles for `.joy-date-range-picker`:
    - Single container with start/end inputs, separator arrow `->`, clear button `(x)`, and calendar icon.
- Gate Check:
  - Run `node packages/tokens/build.js`
  - Run `bash scripts/lint-colors.sh` (must be 0 violations).
  - Run `pnpm --filter @joymify/tokens test`.

---

## Phase 2: Svelte 5 & React 19 DatePicker & DateRangePicker Parity

### Task 2.1: Implement Custom DatePicker & DateRangePicker in Svelte 5
- Files: `packages/svelte/src/lib/DatePicker.svelte`, `packages/svelte/src/lib/DateRangePicker.svelte`, and calendar helpers.
- Description:
  - Replace `<input type="date">` with custom interactive trigger and floating calendar popover.
  - Implement full calendar arithmetic: 42-cell matrix (7x6), previous/next month days, leap years.
  - Implement header navigation: `<<` (-12m), `<` (-1m), `>` (+1m), `>>` (+12m), and "Today" quick pick.
  - Implement DateRangePicker:
    - Unified pill trigger `[ Start Date -> End Date (x) [cal] ]`.
    - Side-by-side dual calendars (Month N and Month N+1).
    - Range hover trail: highlight track from start to currently hovered day cell.
    - Presets: "Last 7 Days", "Last 30 Days", "Month to Date", "Year to Date".
  - Full keyboard accessibility: Arrow keys roving tabindex, Enter to pick, Escape to dismiss.
- Verification:
  - `pnpm --filter @joymify/svelte test`

### Task 2.2: Implement Custom DatePicker & DateRangePicker in React 19
- Files: `packages/react/src/DatePicker.tsx`, `packages/react/src/DateRangePicker.tsx`, and calendar helpers.
- Description:
  - Byte-for-byte prop and behavioral parity with Svelte 5 components.
  - Support `forwardRef`, controlled/uncontrolled values, `onChange`, `presets`, `disabled`, `error`, `size`.
  - Floating popover with outside-click handling and Escape key listener via `useOverlay`.
- Verification:
  - `node scripts/parity-check.mjs` (must be 0 violations).
  - `pnpm --filter @joymify/react test`.

---

## Phase 3: Fluid Navigation & Component Micro-Transitions

### Task 3.1: Sliding Ink-Bar for Tabs & Sliding Thumb for Segmented
- Files: `packages/tokens/build.js`, `packages/svelte/src/lib/Tabs.svelte`, `packages/react/src/Tabs.tsx`, `packages/svelte/src/lib/Segmented.svelte`, `packages/react/src/Segmented.tsx`.
- Description:
  - Tabs: Replace static border with dynamic `.joy-tabs__ink-bar` using `transform: translateX()` and `width` transitions.
  - Segmented: Add `.joy-segmented__thumb` that smoothly glides between items with `--joy-ease-out-quint`.
  - Verification: `node scripts/parity-check.mjs`, `bash scripts/lint-colors.sh`.

### Task 3.2: Popover Scale & Fade Choreography & Form Input Micro-Interactions
- Files: `packages/tokens/build.js`
- Description:
  - Add `@keyframes joy-popover-scale-in` with `--joy-ease-out-quint` to all dropdowns, select menus, and tooltips.
  - Add hover-reveal clear button `(x)` to inputs and date pickers.
  - Add smooth focus ring transitions.
  - Add animated progress stripes for active progress bars.

---

## Phase 4: Hub Showcase, E2E Playwright Suite & Documentation

### Task 4.1: Update Storybook Hub Showcase
- File: `apps/storybook-hub/build.js`
- Description:
  - Overhaul `view-date-picker` showcase with:
    - Standard Single DatePicker with custom calendar popover, quick month/year jumps, and "Today" button.
    - Financial Date Range Picker (Backtest Window) with unified trigger pill, dual calendar panels, hover track, and preset range pills.
    - Dark and light theme showcase with full interactive state switching.
- Verification:
  - Build hub: `node apps/storybook-hub/build.js`.

### Task 4.2: Playwright Verification Suite & Visual Screenshots
- File: `apps/storybook-hub/tests/antd5-parity.spec.ts`
- Description:
  - Test single date picker open, month chevron jump, day selection, clear button.
  - Test date range picker open, dual panel display, range selection, hover track styling, presets.
  - Test keyboard navigation (`ArrowDown`, `Enter`, `Escape`).
  - Capture visual screenshots at 1280px and 375px in both light and dark themes.

### Task 4.3: Quality Gate, README Sync & Promotion
- Files: `README.md`, `packages/svelte/README.md`, `packages/react/README.md`.
- Description:
  - Synchronize documentation with new DatePicker and DateRangePicker capabilities and transition tokens.
  - Run full Gate 1 Precheck: `bash scripts/precheck.sh`.
