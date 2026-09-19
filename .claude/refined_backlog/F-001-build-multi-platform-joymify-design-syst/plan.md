# Build Multi-Platform Joymify Design System and Composed Storybook (Svelte 5 + React + Tokens) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an enterprise-grade multi-platform design system monorepo for the Joymify brand supporting Svelte 5 and React with W3C design tokens, core components, and a composed multi-framework Storybook hub.

**Architecture:** Monorepo with pnpm workspaces and Turborepo containing `packages/tokens` (Style Dictionary + Tailwind v4), `packages/svelte` (Svelte 5 runes), `packages/react` (React 19 + TypeScript), and `apps/storybook-*` composed into a unified Storybook Hub via Storybook Composition refs.

**Tech Stack:** pnpm 10, Turborepo, TypeScript 5.9, Svelte 5, React 19, Tailwind CSS v4, Style Dictionary, Storybook 8/9, Vitest, Testing Library.

**Spec:** `.claude/refined_backlog/F-001-build-multi-platform-joymify-design-syst/spec.md`

## Global Constraints
- Node >= 20.0.0, pnpm >= 10.0.0
- All tokens adhere to W3C Design Tokens Community Group (DTCG) specification.
- Svelte components strictly use Svelte 5 runes (`$props`, `$state`, `$derived`).
- React components use strict React 19 / TypeScript standards with standard accessible HTML primitives.
- Storybook Hub composes child Storybooks (`svelte` on 6006, `react` on 6007, hub on 6008).
- Every phase ends with a Quality Gate (Verify -> Review -> Refactor -> Re-verify).

---

## Task Breakdown

### Phase 1: Monorepo Foundation & Design Tokens Engine (`packages/tokens`)
- [ ] **Task 1.1: Scaffolding Monorepo Structure**
  - Create root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`.
  - Configure root build, test, and typecheck scripts.
  - Setup TypeScript project references and base `tsconfig.json`.
  - *Deliverable:* Working root pnpm monorepo with Turborepo pipeline.
- [ ] **Task 1.2: Design Tokens Definition & Style Dictionary Build**
  - Implement `packages/tokens/tokens/` (primitives: color, spacing, radius, typography; semantics: surface, text, border, status).
  - Configure Style Dictionary to output CSS custom properties (`dist/theme.css`), Tailwind v4 theme, and TypeScript constants (`dist/index.ts`).
  - Write unit tests for token generation and integrity in `packages/tokens`.
  - *Deliverable:* `@joymify/tokens` package that builds and exports tokens for both web CSS and TypeScript.
- [ ] **Task 1.3: Quality Gate (Phase 1)**
  - Verify build & test across monorepo root.
  - Independent code review & refactoring.

### Phase 2: Svelte 5 Component Library (`packages/svelte`)
- [ ] **Task 2.1: Svelte 5 Package Scaffolding & Setup**
  - Initialize `packages/svelte` with `svelte@^5.54.0`, `@joymify/tokens` dependency, Vite, and Vitest.
  - Configure build output via `svelte-package` or Vite library mode.
- [ ] **Task 2.2: Core Components Implementation (Svelte 5 Runes)**
  - Implement `Button.svelte` & `IconButton.svelte` (variants, sizes, loading).
  - Implement `Badge.svelte` & `MetricTile.svelte` (designed for Quant and JoyCoach metrics).
  - Implement `Input.svelte` & `Textarea.svelte`.
  - Implement `Modal.svelte` with accessible dialog behaviors.
  - Write Vitest unit tests for each component using `@testing-library/svelte`.
- [ ] **Task 2.3: Quality Gate (Phase 2)**
  - Run `pnpm --filter @joymify/svelte test` and `svelte-check`.
  - Review & refactor.

### Phase 3: React 19 Component Library (`packages/react`)
- [ ] **Task 3.1: React 19 Package Scaffolding & Setup**
  - Initialize `packages/react` with `react@^19.0.0`, `react-dom@^19.0.0`, `@joymify/tokens`, and `tsup` / `vite` bundler.
  - Setup Vitest with `@testing-library/react` and JSDOM.
- [ ] **Task 3.2: Core Components Implementation (React 19)**
  - Implement `Button` & `IconButton` matching `@joymify/svelte` design parity.
  - Implement `Badge` & `MetricTile`.
  - Implement `Input` & `Textarea`.
  - Implement `Modal` with accessibility and portal rendering.
  - Write Vitest unit tests for each component.
- [ ] **Task 3.3: Quality Gate (Phase 3)**
  - Run `pnpm --filter @joymify/react test` and `pnpm --filter @joymify/react build`.
  - Review & refactor.

### Phase 4: Composed Storybook Workshop (`apps/storybook-*`)
- [ ] **Task 4.1: Storybook Svelte App (`apps/storybook-svelte`)**
  - Configure `@storybook/svelte-vite` with `@joymify/svelte`.
  - Create stories for all Svelte components with controls and doc blocks.
- [ ] **Task 4.2: Storybook React App (`apps/storybook-react`)**
  - Configure `@storybook/react-vite` with `@joymify/react`.
  - Create stories for all React components with controls and doc blocks.
- [ ] **Task 4.3: Storybook Composition Hub (`apps/storybook-hub`)**
  - Create the unified Hub referencing both React & Svelte Storybooks via `refs`.
  - Document the Joymify Brand Story, Design Tokens, and Multi-platform guidelines in MDX.
- [ ] **Task 4.4: Quality Gate (Phase 4)**
  - Verify all 3 Storybook builds (`pnpm storybook:build`).

### Phase 5: Integration, ps-release-workflow Verification & Ship
- [ ] **Task 5.1: End-to-End Pipeline & Consumer Simulation**
  - Test sample imports of both `@joymify/tokens`, `@joymify/svelte`, and `@joymify/react`.
  - Verify full CI pipeline runs clean (`pnpm build`, `pnpm test`, `pnpm lint`).
- [ ] **Task 5.2: ps-release-workflow Gate 1 & Ship**
  - Run `psrw ship` to merge F-001 into `release/1.1`.
