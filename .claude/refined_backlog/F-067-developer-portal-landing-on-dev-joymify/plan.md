# Developer Portal landing on dev.joymify.com with 3-library switcher and legacy design redirect Implementation Plan

## Phase 1: Developer Portal Landing View & Component Architecture
- [x] Create Developer Portal Bento view presenting `joy-design`, `node-server-decorator`, and `cli-state-handler`
- [x] Design semantic bento cards with live feature lists, code snippets, and repo metadata using `--joy-*` tokens
- [x] Add top-level cross-library switcher in Storybook Hub header

## Phase 2: Navigation & Manifest Integration
- [x] Register Developer Portal in `navigation.manifest.json` and ensure seamless route switching
- [x] Wire up root `/` route to showcase the Developer Portal with direct links to `/design`, `/server-decorator`, `/cli-state-handler`

## Phase 3: Ingress Configuration & Legacy Redirect
- [x] Update `k8s/ingress.yml` to route `dev.joymify.com` across the subpaths
- [x] Add HTTP 301 permanent redirect ingress rule for `design.joymify.com`

## Phase 4: Verification & Automated Quality Gate
- [x] Add Playwright test suite verifying Developer Portal layout, theme switching, and links
- [x] Verify Gate 1 Precheck (`scripts/precheck.sh`) passes with 0 failures
