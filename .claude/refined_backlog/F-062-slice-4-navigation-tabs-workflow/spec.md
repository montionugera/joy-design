---
title: "Slice 4: Navigation, Tabs & Workflow"
id: F-062
status: refined
from_idea: I-067
---

# Slice 4: Navigation, Tabs & Workflow

## Acceptance criteria

- [ ] `JoyTabs` implemented with tab bar, animated active underline/indicator, roving keyboard focus, scrollable horizontal layout on mobile viewports, and 44px touch target bounds.
- [ ] `JoyPagination` implemented with current page, total items, page size change, windowed page numbers, next/previous buttons with vector chevrons, and compact mode for mobile screens.
- [ ] `JoyBreadcrumb` implemented with breadcrumb items, custom separator, clickable path links, and active current page item.
- [ ] `JoySteps` implemented with horizontal and vertical step progression, step status (`wait`, `process`, `finish`, `error`), vector step icons, and connecting lines.
- [ ] `JoyTimeline` implemented with vertical event list, customizable node dots (token colors: success, warning, danger, accent), and timeline stem connectors.
- [ ] Declarative Contract Schemas v2 created for Tabs, Pagination, Breadcrumb, Steps, Timeline and executed natively via Flutter `testWidgets`.
- [ ] Triplet parity checker (`scripts/parity-check.mjs --triplet`) verifies exports and prop compatibility for all Slice 4 components.
- [ ] `apps/flutter-hub` updated with interactive navigation and workflow showcase sections.
- [ ] Gate 1 (`scripts/precheck.sh`) passes with exit code 0.
