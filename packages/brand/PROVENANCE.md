# Provenance

## Display font

- **Name:** Cormorant Garamond
- **Weights used:** 500 (medium, normal) for the wordmark; 400 (regular, italic) for the tagline
- **Package:** `@fontsource/cormorant-garamond` (devDependency here, outlining only — never shipped as a runtime font asset by this package)
- **Licence:** SIL Open Font License 1.1
- **Upstream:** https://github.com/CatharsisFonts/Cormorant

The wordmark and tagline are outlined to static SVG path data at build time
(see `scripts/outline-text.mjs`), so no font file or `@font-face` is needed
at runtime — the shipped assets are plain vector paths.

## Mark geometry

The diamond mark (viewBox `0 0 32 32`, tile `rx=6`, outline
`M16 4 28 16 16 28 4 16Z`, inner `M16 9 23 16 16 23 9 16Z`, centre dot
`cx=16 cy=16 r=1.6`) is the canonical Joymify mark, sourced from
`user-svc`'s `user-fe/src/lib/assets/favicon.svg`. It is reproduced here as
a literal in `src/geometry.js` per the F-043 plan's Global Constraints.

## Regenerating

- Outlines (wordmark + tagline path data): `pnpm --filter @joymify/brand outline`
  — regenerates `src/outlines.generated.js` from the Cormorant Garamond
  `.woff` files bundled by `@fontsource/cormorant-garamond`. Commit the
  result; it is a generated file (do not hand-edit).
- Assets (SVG + PNG in `assets/`): `pnpm --filter @joymify/brand build`
  (`node build.js`) — reads the resolved `--joy-brand-*` token values from
  `@joymify/tokens`' `dist/theme.css` (building it first if missing) and
  writes every asset deterministically. Commit the result.
