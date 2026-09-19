# [F-016] Complete Ant Design Parity: Upload, Avatar, Slider, MarkdownViewer, Micro-Animations, Zero-Emoji Hub & 48 Novel Icons

> **For agentic workers:** Autonomous execution mode. Zero mid-turn interruptions. Verify evidence before assertions.

**Goal:** Close all remaining component parity gaps with Ant Design, expand `@joymify/icons` to 137 verified vector icons with dual Svelte 5 and React 19 exports, purge 100% of raw emojis from Storybook Hub in favor of crisp SVG vectors, add Ant Design & Linear inspired micro-animations and layout transitions, and verify live on `https://design.joymify.com`.

**Tech Stack:** Svelte 5 (Runes), React 19, TypeScript, CSS Custom Properties (DTCG), Node.js Test Runner, Docker, Kubernetes.

---

## Phase 1: Zero-Emoji Purge in Storybook Hub (`apps/storybook-hub/build.js`)
- [x] Replace all sidebar navigation emojis with inline/imported 16x16 vector SVGs
- [x] Replace Auto-Stream player emojis (`▶`, `⏸`) with Play/Pause SVGs
- [x] Replace Dropdown action emojis (`📋`, `📥`, `⚡`, `🗑️`) with vector SVGs
- [x] Verify zero raw OS emojis exist in the Storybook Hub DOM or source

## Phase 2: Expand `@joymify/icons` with 48 Novel Icons (Total = 137 Icons)
- [x] Add 48 novel, non-duplicate icons from `novel-icon-expansion-catalog.md`:
  - Infra/Quant: `Server`, `Database`, `Cpu`, `Terminal`, `Cloud`, `HardDrive`, `Network`, `Key`
  - Layout/Docs: `Home`, `Grid`, `List`, `Folder`, `FolderPlus`, `File`, `FileText`, `FilePlus`, `Maximize2`, `Minimize2`
  - Finance/Billing: `CreditCard`, `ShoppingCart`, `Tag`, `Percent`, `DollarSign`, `Bookmark`, `Share2`
  - Time/Execution: `Clock`, `History`, `Hourglass`, `Calendar`
  - Comm/Devices: `Bell`, `BellOff`, `Mail`, `MessageSquare`, `Phone`, `Video`, `Monitor`, `Smartphone`, `Tablet`, `Laptop`, `Fingerprint`
  - Links/Zoom: `Link`, `Unlink`, `ZoomIn`, `ZoomOut`, `Volume2`, `VolumeX`, `Shield`, `ShieldAlert`
- [x] Generate Svelte 5 and React 19 icon components
- [x] Update `packages/icons/src/index.ts` and `packages/icons/src/react.ts`
- [x] Expand test coverage in `packages/icons/test/icons.test.js`

## Phase 3: Ant Design Component Parity
- [x] **`Upload` (`Upload.svelte` / `Upload.tsx`):**
  - Drag-and-drop zone (`Upload.Dragger`), file list with status badges, progress indicator, image preview, removal trigger.
- [x] **`Avatar` & `AvatarGroup` (`Avatar.svelte` / `Avatar.tsx`, `AvatarGroup.svelte` / `AvatarGroup.tsx`):**
  - Circle/square sizing (`sm`, `md`, `lg`), image source with fallback initials, active online/offline status dot, overlapping group display with `+N` count.
- [x] **`Slider` (`Slider.svelte` / `Slider.tsx`):**
  - Continuous or stepped range slider, custom track, value tooltip tooltip bubble, min/max marks, disabled state.
- [x] **`MarkdownViewer` (`MarkdownViewer.svelte` / `MarkdownViewer.tsx`):**
  - Tencent Cherry Markdown inspired stream-safe rendering, fenced code block styling with one-click copy button, callout blocks (`info`, `warning`, `success`), tables, blockquotes.
- [x] Export all new components in `@joymify/svelte` and `@joymify/react`.
- [x] Add comprehensive tests in `packages/svelte/test/components.test.js` and `packages/react/test/components.test.js`.

## Phase 4: Micro-Animations & Fine-Grain Layout Transitions
- [x] Add Ant Design style click-wave ripple effect (`.joy-button--wave`)
- [x] Add smooth accordion / collapse transitions (`max-height` + opacity ease-in-out)
- [x] Add view-panel cross-fade and slide transitions for tab switching and story selection in Storybook Hub
- [x] Update theme tokens in `packages/tokens` with cubic-bezier easing presets

## Phase 5: Verification, Ship, Promote & Live Check
- [ ] Run full build: `pnpm build` across all packages
- [ ] Run test suite: `pnpm test` across all packages
- [ ] Run `./scripts/integration.sh`
- [ ] Ship feature via `psrw ship`
- [ ] Promote release via `psrw promote --babysit`
- [ ] Verify HTTP 200 and updated bundle at `https://design.joymify.com`
