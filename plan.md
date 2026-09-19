# [F-008] Enterprise AntDesign-Parity Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship an enterprise-grade component architecture exceeding Ant Design for Joymify, adding Motion Tokens, Floating Overlays, Modal/Dialog, Dropdown Menu, Tabs, and Tooltip in both Svelte 5 (Runes) and React 19 with live interactive playground controls.

**Architecture:** Extend `@joymify/tokens` with DTCG motion, shadow, and z-index specifications; expand global theme CSS with GPU-accelerated keyframe transitions; implement Svelte 5 and React 19 components with identical accessible contracts; showcase all components with live interactive switches and interactive controls on `apps/storybook-hub`.

**Tech Stack:** Svelte 5 (Runes), React 19, TypeScript, CSS Custom Properties (DTCG), Node.js Test Runner, Docker, Kubernetes.

**Spec:** `F-008-enterprise-antdesign-parity-layer-motion`

## Global Constraints
- Svelte 5 components must use Runes (`$props`, `$state`, `$derived`, `$bindable`) with zero legacy Svelte syntax.
- React 19 components must be strict TypeScript, forwardRef-compliant, and accessible (WAI-ARIA).
- Zero external runtime CSS dependencies (pure DTCG CSS custom properties with hardware-accelerated transitions).
- Zero regression on existing components (`Button`, `MetricTile`, `Badge`, `Input`, `Switch`, `Table`, `Alert`).
- Automated pipeline and smoke checks must remain 100% green on deployment.

---

### Task 1: Motion, Shadow & Elevation Tokens Compiler
**Files:**
- Modify: `packages/tokens/src/tokens.json`
- Modify: `packages/tokens/build.js`
- Test: `packages/tokens/test/tokens.test.js`

- [ ] **Step 1: Write test asserting motion and overlay tokens**
- [ ] **Step 2: Run test and verify failure/pass**
- [ ] **Step 3: Update build.js with motion keyframes, modal, dropdown, tabs, and tooltip CSS classes**
- [ ] **Step 4: Re-run test and compile tokens**
- [ ] **Step 5: Commit changes**

### Task 2: Svelte 5 Enterprise Overlays & Layouts (Modal, Dropdown, Tabs, Tooltip)
**Files:**
- Create: `packages/svelte/src/lib/Modal.svelte`
- Create: `packages/svelte/src/lib/Dropdown.svelte`
- Create: `packages/svelte/src/lib/Tabs.svelte`
- Create: `packages/svelte/src/lib/Tooltip.svelte`
- Modify: `packages/svelte/src/lib/index.ts`
- Test: `packages/svelte/test/components.test.js`

- [ ] **Step 1: Write tests for Svelte Modal, Dropdown, Tabs, and Tooltip**
- [ ] **Step 2: Implement Svelte 5 Runes components**
- [ ] **Step 3: Run node --test test/components.test.js**
- [ ] **Step 4: Commit Svelte enterprise components**

### Task 3: React 19 Enterprise Overlays & Layouts (Modal, Dropdown, Tabs, Tooltip)
**Files:**
- Create: `packages/react/src/Modal.tsx`
- Create: `packages/react/src/Dropdown.tsx`
- Create: `packages/react/src/Tabs.tsx`
- Create: `packages/react/src/Tooltip.tsx`
- Modify: `packages/react/src/index.ts`
- Test: `packages/react/test/components.test.js`

- [ ] **Step 1: Write tests for React Modal, Dropdown, Tabs, and Tooltip**
- [ ] **Step 2: Implement React 19 components with forwardRef & WAI-ARIA**
- [ ] **Step 3: Run node --test test/components.test.js**
- [ ] **Step 4: Commit React enterprise components**

### Task 4: Interactive Storybook Hub Expansion & Production Verification
**Files:**
- Modify: `apps/storybook-hub/build.js`
- Test: `scripts/integration.sh`

- [ ] **Step 1: Add Modal, Dropdown, Tabs, and Tooltip interactive playgrounds into storybook-hub**
- [ ] **Step 2: Rebuild distribution and verify with scripts/integration.sh**
- [ ] **Step 3: Ship and promote via psrw**
- [ ] **Step 4: Verify production deployment on design.joymify.com**
