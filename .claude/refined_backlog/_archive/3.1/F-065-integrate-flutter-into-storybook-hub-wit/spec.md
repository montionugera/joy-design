---
title: "Integrate Flutter into Storybook Hub with 3-way framework toggle, synchronized bridge, and Dart snippets"
id: F-065
status: refined
from_idea: I-070
---

# Integrate Flutter into Storybook Hub with 3-way framework toggle, synchronized bridge, and Dart snippets

## Problem

The current Storybook Hub at `design.joymify.com` (`apps/storybook-hub`) only provides a two-way toggle in the top bar: `[ Svelte 5 | React 19 ]`.
While `joymify_flutter` achieved 100% component and token parity in Release 3.00, it currently lives in a separate app (`apps/flutter-hub`), meaning visitors and developers browsing `design.joymify.com` cannot view, interact with, or copy code for Flutter components alongside their Web twins.

## Why now

With full triplet parity shipped in Epic E-002, unifying the catalog experience into a single seamless design workshop directly fulfills the multi-platform vision of Joymify Design System. Developers building mobile applications (`joy-coach-fe`, `quant-fe`) need instant access to Flutter widget previews and Dart code examples in the primary design hub.

## Sketch

1. **Header Framework Switcher**:
   - Upgrade the top-right header button group to a 3-way toggle: `[ Svelte 5 | React 19 | Flutter ]`.
   - Preserve keyboard navigation and ARIA attributes (`aria-pressed`, `data-framework`).

2. **Embedded Flutter Canvas View**:
   - When `Flutter` is selected, the preview area renders the live Flutter Web CanvasKit application from `/flutter/` inside a responsive, seamless frame container.
   - When `Svelte 5` or `React 19` is selected, the HTML/DOM component preview is restored.

3. **Live Theme & State Synchronization (`JoyHubBridge`)**:
   - Theme toggle (`Light theme` / `Dark theme`) and palette preset picker (`Joy Classic`, `Ocean Blue`, etc.) in the top bar automatically invoke `window.__joyHub.setTheme(theme)`.
   - Flutter canvas updates its `JoyThemeTokens` immediately in sync with the Web components.

4. **Synchronized Dart Code Snippets**:
   - Update `updateCodeSnippets()` to output idiomatic Flutter/Dart code when `activeFramework === 'flutter'`.

5. **Unified Build Pipeline & Deployment**:
   - Update `apps/storybook-hub/build.js` to ensure `apps/flutter-hub/build/web` is copied or linked into `apps/storybook-hub/dist/flutter/`.
   - Ensure `Dockerfile` packages both Web and Flutter artifacts into the single NGINX container for `design.joymify.com`.

6. **Automated Verification**:
   - Extend Playwright test suite (`apps/storybook-hub/tests/`) to verify framework switching, Flutter view mounting, and theme propagation.

## Acceptance criteria

- [ ] Header framework switcher contains accessible buttons for `Svelte 5`, `React 19`, and `Flutter`.
- [ ] Clicking `Flutter` sets `activeFramework = 'flutter'`, updates active button styling, and updates code snippets with Dart widget examples.
- [ ] Preview area embeds the responsive Flutter Web application when Flutter mode is active.
- [ ] Switching between light and dark theme propagates to the Flutter app via `JoyHubBridge`.
- [ ] `node apps/storybook-hub/build.js` generates the complete static bundle with `dist/flutter` included.
- [ ] Gate 1 (`bash scripts/precheck.sh`) and Playwright tests pass with 0 failures.
