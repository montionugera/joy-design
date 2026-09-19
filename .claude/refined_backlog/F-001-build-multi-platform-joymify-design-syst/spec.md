---
title: "Build Multi-Platform Joymify Design System and Composed Storybook (Svelte 5 + React + Tokens)"
id: F-001
from_idea: I-001
status: refined
---

# Build Multi-Platform Joymify Design System and Composed Storybook (Svelte 5 + React + Tokens) — Spec

## Goal
Build an enterprise-grade, multi-platform UI design system for the **Joymify** ecosystem (`quant`, `joy-coach`, `asset-studio`, `joy-quest`, `joymify-portal`) supporting both **Svelte 5** (Runes) and **React 19**, powered by token-first styling (Tailwind CSS v4 + Style Dictionary CSS variables) and documented via a unified, composed Storybook workshop.

## Architecture & Monorepo Topology
The repository is structured as a `pnpm` workspace monorepo powered by Turborepo:
```
joy-design/
├── packages/
│   ├── tokens/          # Core design tokens (JSON -> CSS vars, TS types, Tailwind preset)
│   ├── svelte/          # Svelte 5 component library (Runes: $props, $state, $derived)
│   ├── react/           # React 19 component library (TypeScript, forwardRef, a11y)
│   └── icons/           # Shared SVG icons / Lucide wrappers for React & Svelte
├── apps/
│   ├── storybook-react/ # Storybook for React components (@storybook/react-vite)
│   ├── storybook-svelte/# Storybook for Svelte 5 components (@storybook/svelte-vite)
│   └── storybook-hub/   # Composed Storybook Hub (Storybook Composition referencing both via refs)
└── package.json
```

## Consumers & Product Alignment
1. **Quant (`quant-fe`, `quant-admin-fe`)**: High-density trading dashboards, candlestick charts, stats tiles, badge/pills, data tables. (SvelteKit + TypeScript).
2. **JoyCoach (`joy-coach-fe`)**: Coaching & scoring interface, motivational cards, progress steppers, dark/light theme shifts. (SvelteKit).
3. **AssetStudio (`asset-studio`)**: Asset generation and inspection suites, modal drawers, file drops, tooltips. (React/Next.js).
4. **JoyQuest / Joymify Portal (`joymify-portal`)**: Landing & account management, quest log, interactive rewards, avatars. (Svelte 5 + React).

## Token Architecture (The "Open Design" Standard)
- **Token Engine**: Style Dictionary with W3C Design Tokens Community Group (DTCG) specification.
- **Layers**:
  - `Global/Primitive`: Palette (Joymify Violet, Amber, Emerald, Slate), Typography (Inter, JetBrains Mono), Spacing (4px base grid), Elevation / Shadows, Radii.
  - `Semantic`: `surface-primary`, `text-muted`, `border-subtle`, `intent-success`, `intent-warning`, `intent-danger`.
  - `Component-Level`: Specific overrides (`--joy-btn-height`, `--joy-input-ring`).
- **Outputs**:
  - CSS Custom Properties (`theme.css`)
  - Tailwind CSS v4 `@theme` configuration
  - TypeScript constants & typing definitions (`@joymify/tokens`)

## Core Component Suite (Phase 1 Baseline)
Each component is implemented natively with zero compromise in both Svelte 5 and React:
1. **Button & IconButton**: Variants (`solid`, `outline`, `ghost`, `danger`), Sizes (`sm`, `md`, `lg`), loading spinner state, icon slot.
2. **Badge & Tag**: Status indicators (`default`, `success`, `warning`, `error`, `neutral`), pill vs rounded.
3. **Card & MetricTile**: Elevated and outlined cards, header/body/footer composition, trend indicator tiles for Quant/Coach.
4. **Input & Textarea**: Accessible labels, prefix/suffix adornments, error validation states, focus ring.
5. **Modal / Dialog**: Accessible dialog (native `<dialog>` / Radix / Melt-UI primitive foundation), focus lock, keyboard navigation (Esc to close), backdrop blur.
6. **Toast / Notification**: Alert banners and toast triggers with auto-dismiss.

## Storybook Multi-Framework Composition
- `apps/storybook-svelte`: Port 6006, builds stories for all `@joymify/svelte` components using `@storybook/svelte-vite` with Svelte 5 CSF.
- `apps/storybook-react`: Port 6007, builds stories for all `@joymify/react` components using `@storybook/react-vite`.
- `apps/storybook-hub`: Port 6008, unifies both libraries side-by-side using Storybook Composition:
  ```ts
  // apps/storybook-hub/.storybook/main.ts
  export default {
    framework: '@storybook/react-vite',
    stories: ['./docs/**/*.mdx'],
    refs: {
      svelte: {
        title: 'Joymify Svelte 5',
        url: 'http://localhost:6006',
      },
      react: {
        title: 'Joymify React 19',
        url: 'http://localhost:6007',
      },
    },
  };
  ```

## Quality Gates & Verification (Ps-Release-Workflow)
- **Unit & Component Testing**: Vitest + Testing Library for both Svelte (`@testing-library/svelte`) and React (`@testing-library/react`).
- **Storybook Accessibility**: `@storybook/addon-a11y` with 0 WCAG 2.2 AA violations.
- **Type Checking**: `tsc --noEmit` and `svelte-check` across the entire monorepo.
- **Gate 1 & Gate 2**: Verification scripts ready for `psrw ship` and `psrw promote`.
