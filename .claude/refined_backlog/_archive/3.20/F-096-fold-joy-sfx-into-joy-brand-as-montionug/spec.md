---
title: "Fold joy-sfx into joy-brand as @montionugera/joy-brand/sfx; remove packages/sfx; rule: no new npm packages"
id: F-096
from_idea: I-107
status: refined
---

# I-107 — Fold `joy-sfx` into `@montionugera/joy-brand/sfx`

## Problem
F-095 (3.19) created a 7th npm package `@montionugera/joy-sfx`. npmjs trusted publishing cannot be attached to a
package that does not exist yet, so a new package needs a manual first publish (npm login + 2FA) and a web click.
The owner refuses more logins and more registries (2026-11-09). `joy-sfx` therefore reached GitHub Packages only.

## Why now
Joy-Quest F-016 is waiting on these clips from npmjs. Fixing distribution before any consumer imports `joy-sfx`
avoids a rename later.

## Shape
- Move `packages/sfx/assets/*.mp3` (51) → `packages/brand/assets/sfx/<name>.mp3` byte-for-byte.
- Move the player/manifest code → `packages/brand/src/sfx/` (`index.js` + `index.d.ts` + `manifest.json` +
  `manifest.d.ts`), plain JS like the rest of brand (no TS build step; convert `index.ts` to JS with a matching `.d.ts`).
  `sfxUrl(name)` resolves `../../assets/sfx/<name>.mp3` from `import.meta.url`, keeps `baseUrl` override and `RangeError`.
- `packages/brand/package.json`: add export `"./sfx": { types: "./src/sfx/index.d.ts", default: "./src/sfx/index.js" }`,
  bump version to 0.3.0, keep `files` (src, assets, PROVENANCE.md already cover it).
- `packages/brand/PROVENANCE.md`: append the SFX section from `packages/sfx/PROVENANCE.md` (per-clip source/licence
  table, ElevenLabs commercial-terms follow-up).
- Move tests to `packages/brand/test/sfx-*.test.js` and `scripts/build-manifest.mjs` to `packages/brand/scripts/`.
- Delete `packages/sfx` entirely and remove `sfx` from every enumeration in `.github/workflows/publish.yml`,
  `scripts/integration.sh`, `scripts/test/consumer-smoke.sh`, `scripts/test/publish-contract.test.mjs`,
  `packages/mascots/test/publish-workflow.test.js` (back to the six packages); consumer-smoke's brand expected-files
  line adds `src/sfx/index.js assets/sfx/win.mp3`, and its plain-Node check imports `sfxUrl` from
  `@montionugera/joy-brand/sfx`.
- README.md: replace the joy-sfx package row/section with a `@montionugera/joy-brand/sfx` usage section; "seven" → "six".
- AGENTS.md: add the rule "Do not create new npm packages. Shared assets are subpath exports of an existing
  npmjs package (brand for identity assets incl. SFX, mascots for characters). Reason: npmjs trusted publishing
  needs the package to exist; the owner does not do manual first publishes."

## Acceptance criteria
- [ ] `packages/sfx` no longer exists; `grep -rn "joy-sfx" --include=*.yml --include=*.sh --include=*.mjs --include=*.js --include=*.md .` returns only PROVENANCE/README history lines, none in workflow or scripts.
- [ ] `packages/brand/assets/sfx` has 51 mp3 whose sha256 match `~/workspace/repos/play-joymify/web/public/audio/sfx`.
- [ ] `node -e "import('@montionugera/joy-brand/sfx')"` style import works in consumer-smoke plain Node and resolves `sfxUrl('win')` to an `assets/sfx/win.mp3` URL.
- [ ] `pnpm --filter @montionugera/joy-brand test` passes incl. the moved player tests (limiter, onended disconnect, enabled/reducedMotion, RangeError).
- [ ] `pnpm check && pnpm lint && pnpm test` and `bash scripts/test/consumer-smoke.sh` green.
- [ ] AGENTS.md carries the no-new-packages rule.
