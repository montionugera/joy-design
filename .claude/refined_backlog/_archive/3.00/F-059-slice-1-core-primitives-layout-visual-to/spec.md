---
title: "Slice 1: Core Primitives, Layout & Visual Tokens"
id: F-059
status: refined
from_idea: I-064
---

# Slice 1: Core Primitives, Layout & Visual Tokens

## Acceptance criteria

- [ ] `JoyText` widget implemented with full typography scale (h1-h6, body, caption, code), semantic text color mapping (`primary`, `secondary`, `tertiary`, `inverse`), and text overflow support.
- [ ] `JoyIcon` vector SVG bridge implemented using `flutter_svg`, rendering vector icons from `@joymify/icons` with customizable size and semantic color tinting, strictly adhering to the Zero Emoji Policy.
- [ ] `JoyBox` layout primitive with token-based padding, margin, surface backgrounds (`canvas`, `card`, `subtle`), and semantic border styling.
- [ ] `JoyFlex` and `JoySpace` primitives supporting horizontal/vertical axes and token gap scaling via `JoySpacing`.
- [ ] `JoyGrid` supporting responsive multi-column layouts with token gutter widths.
- [ ] `JoyDivider` rendering horizontal and vertical hair lines using semantic border tokens (`--joy-border-subtle` / `--joy-border-default`).
- [ ] `JoyBadge` supporting numeric count, dot indicators, and semantic status variants (`success`, `warning`, `danger`, `info`).
- [ ] `JoyTag` supporting static and closable chips, semantic status variants, and `onClose` callback.
- [ ] `JoyAvatar` supporting image URLs, initials fallback, size scale (`sm`, `md`, `lg`), shape (`circle`, `square`), and ring border using `--joy-surface-canvas`.
- [ ] Declarative Contract Schemas v2 created for each component and executed natively via Flutter `testWidgets`.
- [ ] Triplet parity checker (`scripts/parity-check.mjs --triplet`) verifies exports and prop compatibility for all Slice 1 primitives.
- [ ] `apps/flutter-hub` updated with showcase demos for all Slice 1 primitives.
- [ ] Gate 1 (`scripts/precheck.sh`) passes with exit code 0.
