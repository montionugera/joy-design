---
title: "Ant Design 5 elevation for Cascader, TreeSelect, floating overlays, navigation, and form controls"
id: F-066
status: refined
from_idea: I-071
---

# Ant Design 5 elevation for Cascader, TreeSelect, floating overlays, navigation, and form controls

## Goal

Elevate Joy Design components across Waves 2 through 5 to Ant Design 5 benchmark standards, including responsive spring transitions, live search filtering with auto-expansion, unified popover zoom origins, directional pointer arrows, mobile touch target preservation (>= 44px), and micro-interaction states across light and dark themes.

## Architecture

- **Wave 2 (Hierarchical Selection)**:
  - Cascader: CSS slide-in cascade animations powered by `--joy-ease-out-quint` and `--joy-duration-fast`.
  - TreeSelect: Live input search with auto-expanded branch hierarchies and async loading spinners.
- **Wave 3 (Overlays & Feedback)**:
  - Tooltip: Scale-in `@keyframes joy-tooltip-zoom` with dynamic transform-origin matching placement.
  - Popconfirm: Smooth entrance panel and directional pseudo-element pointer arrow (`:not(.joy-overlay)::after`).
  - Modal: Responsive zoom-in (`@keyframes joy-modal-pop`) with `scale(0.88)` start.
  - Notification: Reduced-motion compliant entrance slides (`@keyframes joy-notification-slide-in`).
- **Wave 4 (Navigation)**:
  - Segmented: Smooth opacity entrance transition for the active thumb pill, preserving mobile 44px touch targets.
  - Steps: Process step pulsing indicator ring (`@keyframes joy-step-pulse`).
- **Wave 5 (Form Controls)**:
  - InputNumber: Stepper handlers hover/focus-within reveal (`opacity: 0` to `1`).
  - Rate: Star hover bounce physics (`@keyframes joy-star-hover`).
  - Slider: Thumb handle scale (`scale(1.15)`) with accent focus halo glow.

## Acceptance criteria

- [x] Cascader supports animated column slide-in and TreeSelect supports live search filtering with auto-expansion.
- [x] Tooltip and Popconfirm support scale-in zoom animations and directional arrow pointers.
- [x] Segmented and Steps support fluid micro-interactions with mobile touch targets >= 44px on coarse pointers.
- [x] InputNumber, Rate, and Slider support hover reveals, star bounce, and handle focus glow.
- [x] All components use semantic tokens only (0 color literals).
- [x] Gate 1 Precheck passes with 0 test failures.
