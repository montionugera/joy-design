# F-065 Implementation Plan: Integrate Flutter into Storybook Hub with 3-Way Framework Toggle & Live Bridge

**Verbatim Goal**: "Integrate Flutter into Storybook Hub with 3-way framework toggle, synchronized bridge, Dart snippets, and unified bundle distribution."

---

### Task 1: Navigation Manifest & Flutter View Scaffold
- Update `apps/storybook-hub/src/navigation.manifest.json` to register `"flutter"` view under `"getting-started"`:
  `{ "id": "flutter", "label": "Flutter 3.32 Showcase", "icon": "monitor" }`.
- In `apps/storybook-hub/build.js`:
  - Add `<section id="view-flutter" class="view-panel">` rendering the responsive Flutter Web application container with header badges (`Dart 3.8.1`, `35+ Widgets`), responsive container frame, and embedded iframe pointing to `/flutter/index.html`.
  - Ensure zero horizontal overflow on both 375px and 1280px viewports.

### Task 2: 3-Way Header Framework Switcher & Dart Code Generator
- In `apps/storybook-hub/build.js`:
  - Upgrade `.framework-pill--drawer` and `.framework-pill--topbar` to include:
    `<button type="button" class="framework-btn" id="btn-tab-flutter" data-framework="flutter" aria-pressed="false" onclick="setFramework('flutter')">Flutter 3.32</button>`.
  - Update `setFramework(fw)`:
    - Sets active button classes and ARIA state.
    - Synchronizes active theme to Flutter frame via `JoyHubBridge` (`flutterFrame.contentWindow.__joyHub.setTheme(currentTheme)`).
  - Update `updateCodeSnippets()`:
    - Generates dynamic Dart `JoyButton(...)` snippet when `activeFramework === 'flutter'`.
  - Update `copyIconName(name)`:
    - Copies `JoyIcons.<camelCaseName>` when `activeFramework === 'flutter'`.
  - Add theme sync hook in `setTheme()` and `syncThemeFromHash()` so toggling light/dark mode in the Hub immediately updates the embedded Flutter app.

### Task 3: Artifact Distribution & CI Docker Build
- In `apps/storybook-hub/build.js`:
  - Check if `apps/flutter-hub/build/web` exists. If present, copy it recursively to `apps/storybook-hub/dist/flutter/`.
- In `.github/workflows/ci.yml`:
  - Ensure `build-push-image` sets up Flutter and builds `apps/flutter-hub` so the Docker image includes `/usr/share/nginx/html/flutter`.
- In `scripts/precheck.sh`:
  - Ensure `apps/flutter-hub` is compiled to `build/web` before Hub build and Playwright contract tests execute.

### Task 4: Playwright Parity & Contract Tests
- Create `apps/storybook-hub/tests/framework-switcher.spec.ts`:
  - Verifies presence and accessibility of 3-way toggle (`Svelte 5`, `React 19`, `Flutter 3.32`).
  - Verifies switching to `Flutter 3.32` updates code snippet to `JoyButton`.
  - Verifies navigating to `/#flutter` activates `#view-flutter` without overflow.
  - Verifies theme synchronization across web hub and `JoyHubBridge`.
- Run Contract 6 tests in `apps/storybook-hub/tests/contracts.spec.ts` for the new `flutter` view.

### Task 5: Gate 1 Precheck & PSRW Ship
- Run `bash scripts/precheck.sh` and ensure exit 0.
- Update `README.md` documenting the 3-way framework switcher in the Storybook Hub.
- Commit all changes and run `psrw ship`.
