# Hero Developer Portal landing page on dev.joymify.com fanning out to 3 sub-webapps: Design System, Server Decorator, and CLI State Handler Implementation Plan

## Phase 1: Portal Bundles Assembly & Hermetic Packaging
- [ ] Export production builds of `node-server-decorator` (with base `/server-decorator/`) and `cli-state-handler` (with base `/cli-state-handler/`) into tracked portal bundles directory `apps/storybook-hub/portal-bundles/`
- [ ] Update `scripts/assemble-portal.sh` to assemble both local siblings or fallback to tracked portal bundles
- [ ] Ensure Docker build copies portal bundles into `/usr/share/nginx/html/`

## Phase 2: Dedicated Developer Portal Hero Landing Page
- [ ] Build dedicated standalone Hero Landing Page at `apps/storybook-hub/dist/index.html`:
  - Joymify brand mark, header with dark/light theme switch
  - Hero headline & subtitle introducing the unified developer ecosystem
  - 3 interactive Bento Launch Cards with live feature pills, badges, and action buttons (`/design/`, `/server-decorator/`, `/cli-state-handler/`)
  - Direct links to GitHub repositories
- [ ] Render Joy Design System Storybook Hub at `apps/storybook-hub/dist/design/index.html` (and maintain `/design` routing)

## Phase 3: Nginx Subpath Routing & Legacy Redirects
- [ ] Update `nginx.conf`:
  - `/` -> serves Developer Portal Hero Landing Page
  - `/design/` -> serves Joy Design Storybook Hub
  - `/server-decorator/` -> serves Node Server Decorator Starlight site
  - `/cli-state-handler/` -> serves CLI State Handler Vite docs
  - `design.joymify.com` -> 301 redirects to `https://dev.joymify.com/design$request_uri`
  - Trailing slash auto-redirection (`/design` -> `/design/`, etc.)

## Phase 4: Verification, Gate 1 & End-to-End Tests
- [ ] Update Playwright test suite `dev-portal.spec.ts` to test the Hero Landing Page at `/`, verify links to all 3 sub-webapps, and test responsive layout
- [ ] Update `scripts/smoke-prod.sh` to check `/`, `/design/`, `/server-decorator/`, `/cli-state-handler/` (all HTTP 200) and `design.joymify.com` (HTTP 301)
- [ ] Verify Gate 1 Precheck (`scripts/precheck.sh`) passes with 0 failures
- [ ] Update README.md
