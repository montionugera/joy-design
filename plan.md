# [F-020] Enterprise Navigation & Feedback Suite Parity

> **Autonomous Execution Standard**: Zero mid-turn interruptions. Verify evidence before assertions. Zero OS emojis.

**Goal**: Deliver complete Ant Design parity for Navigation & Feedback:
1. `Menu`: Comprehensive navigation menu supporting `horizontal`, `vertical`, and `inline` modes with submenus, selection state, and collapsible sidebar support.
2. `Anchor`: Smooth in-page section scrolling navigation with active marker track and links.
3. `Message`: Imperative & declarative top-centered transient feedback notifications (`message.success()`, `message.error()`, `message.info()`, `message.warning()`).
4. `Notification`: Rich corner alert banner with title, description, status vector SVGs, and auto-dismiss timer.
5. `Popconfirm`: Compact confirmation popover triggered on buttons/links before destructive actions.
6. `Spin`: Crisp SVG loading spinner supporting standalone and wrapped container loading states.

Dual-framework exports (`@joymify/svelte` + `@joymify/react`), Storybook Hub interactive showcases, and live Kubernetes deployment.

---

## Phase 1: Tokens & Styling Engine Expansion
- [x] Add CSS classes in `packages/tokens/build.js`:
  - `.joy-menu`, `.joy-menu--horizontal`, `.joy-menu--vertical`, `.joy-menu--inline`, `.joy-menu__item`, `.joy-menu__item--active`, `.joy-menu__submenu`
  - `.joy-anchor`, `.joy-anchor__ink`, `.joy-anchor__link`, `.joy-anchor__link--active`
  - `.joy-message`, `.joy-message__notice`, `.joy-message__content`
  - `.joy-notification`, `.joy-notification__notice`, `.joy-notification__title`, `.joy-notification__desc`
  - `.joy-popconfirm`, `.joy-popconfirm__panel`, `.joy-popconfirm__buttons`
  - `.joy-spin`, `.joy-spin--spinning`, `.joy-spin__container`, `.joy-spin__mask`
- [x] Compile tokens and verify `packages/tokens/test/tokens.test.js`

## Phase 2: Svelte 5 Runes Implementation
- [x] `Menu.svelte`
- [x] `Anchor.svelte`
- [x] `Message.svelte`
- [x] `Notification.svelte`
- [x] `Popconfirm.svelte`
- [x] `Spin.svelte`
- [x] Export in `packages/svelte/src/lib/index.ts` and test in `packages/svelte/test/components.test.js`

## Phase 3: React 19 Implementation
- [x] `Menu.tsx`
- [x] `Anchor.tsx`
- [x] `Message.tsx`
- [x] `Notification.tsx`
- [x] `Popconfirm.tsx`
- [x] `Spin.tsx`
- [x] Export in `packages/react/src/index.ts` and test in `packages/react/test/components.test.js`

## Phase 4: Storybook Hub Integration & Zero Emoji Audit
- [x] Add Navigation & Feedback showcase tab (`#view-nav-feedback`) in `apps/storybook-hub/build.js`
- [x] Verify zero raw OS emojis

## Phase 5: Verification & Promotion
- [ ] Run `./scripts/integration.sh`
- [ ] `psrw ship`
- [ ] `psrw promote --babysit`
- [ ] Live verification on `https://design.joymify.com`
