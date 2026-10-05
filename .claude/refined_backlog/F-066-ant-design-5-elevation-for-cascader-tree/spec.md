---
title: "Ant Design 5 elevation for Cascader, TreeSelect, floating overlays, navigation, and form controls"
id: F-066
status: refined
from_idea: I-071
---

# Ant Design 5 elevation for Cascader, TreeSelect, floating overlays, navigation, and form controls

## Problem

Joy Design components lacked the visual micro-interactions, responsive spring easing, and polished overlay mechanics benchmarked against enterprise design systems like Ant Design 5:
- Cascader lacked smooth column slide-in transitions with `--joy-ease-out-quint`.
- TreeSelect lacked live keyboard/input search filtering with auto-expanding ancestor branches and async node loading spinners.
- Overlays (Tooltip, Popconfirm, Modal, Notification) lacked unified transform-origin zooming, directional arrow pointers, and reduced-motion compliant entrances.
- Navigation (Segmented, Steps) lacked smooth thumb transitions while maintaining 44px coarse pointer touch targets, and active step pulsing rings.
- Form controls (InputNumber, Rate, Slider) lacked hover/focus-within handler reveals, smooth star hover physics, and handle scale with subtle glow halos.

## Why now

To achieve complete parity and benchmark superiority against Ant Design 5.14+ across all component families while strictly upholding Joymify's design contracts (token exclusivity, zero raw emojis, dark/light contrast, and touch target sizing).

## Sketch

Implement across Waves 2 through 5:
- **Wave 2**: Elevate Cascader with column animations; TreeSelect with live search, node expand, and spinner.
- **Wave 3**: Elevate Tooltip with zoom transform-origins, Popconfirm panel entrance and directional pointer arrow, Notification slide-in, and Modal zoom.
- **Wave 4**: Elevate Segmented with smooth thumb entrance without compromising 44px mobile touch targets, and Steps with active pulse ring.
- **Wave 5**: Elevate InputNumber handler reveal, Rate star hover bounce, and Slider handle scale and glow.
- Comprehensive Playwright tests verifying both desktop and mobile behaviors across light and dark themes.

## Acceptance criteria

- [ ] Cascader supports animated column slide-in and TreeSelect supports live search filtering with auto-expansion.
- [ ] Tooltip and Popconfirm support scale-in zoom animations and directional arrow pointers.
- [ ] Segmented and Steps support fluid micro-interactions with mobile touch targets >= 44px on coarse pointers.
- [ ] InputNumber, Rate, and Slider support hover reveals, star bounce, and handle focus glow.
- [ ] All components use semantic tokens only (0 color literals).
- [ ] Gate 1 Precheck passes with 0 test failures.
