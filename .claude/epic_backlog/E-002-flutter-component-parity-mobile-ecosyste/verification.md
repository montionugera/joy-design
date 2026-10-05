---
title: "Flutter Component Parity & Mobile Ecosystem"
id: E-002
---

# How we will know E-002 works

Prose for humans. `scripts/epic-check.sh` implements these assertions; the
toolkit never parses this file.

## Assertions

1. `packages/tokens/scripts/gen-dart-tokens.mjs` generates `packages/flutter/lib/src/tokens/joy_tokens.g.dart` deterministically matching `tokens.json`.
2. `bash scripts/lint-colors.sh` verifies zero color literals (`0xFF...`, RGB, raw hex) across `packages/flutter/`.
3. `scripts/precheck.sh` verifies zero raw OS emojis across all Flutter files.
4. Native Flutter contract runner (`flutter test test/contracts/`) passes all Tier 1 declarative JSON contracts.
5. Triplet parity check (`node scripts/parity-check.mjs --triplet`) exits 0 with zero missing components or prop mismatches across React, Svelte, and Flutter.
6. Playwright smoke suite loads `apps/flutter-hub` and verifies cross-platform theme switching and button interaction.
7. Both Gate 1 (`scripts/precheck.sh`) and Gate 2 (`scripts/integration.sh`) exit with code 0 on the combined release branch.
