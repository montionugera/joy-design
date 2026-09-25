// Pure layout math for the brand kit: no palette, no XML, no side effects. render.js (the static
// asset generator) and the @joymify/svelte / @joymify/react BrandBanner + Wordmark components both
// consume these so the grid/fade and lockup proportions can never drift apart again (Fix round 1,
// code-reviewer + typescript-reviewer Important #1: this math used to be copied verbatim into
// three places and had already drifted — the components used glyph 0.70/gap 0.30 of the lockup
// height while the canonical asset uses glyph 40/48 and gap 16/48 of the mark size).

import { WORDMARK } from './geometry.js';

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * The decorative diamond lattice from hero-banner.svg: a grid of cells across `width` x `height`,
 * each `cell` px, with per-cell opacity fading from 0 at `fadeStart` (default 55% of width) up to
 * `maxOpacity` at the right edge. Returns positions/opacity only — callers supply their own stroke
 * colour and draw `MARK.outline` at each cell, scaled by `diamondScale` (`cell / 32`, the mark's
 * native size).
 */
export function heroLattice({ width = 1600, height = 560, cell = 64, fadeStart, maxOpacity = 0.35 } = {}) {
  const start = fadeStart === undefined ? width * 0.55 : fadeStart;
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell) + 1;
  // Diamonds are sampled at cell centres, so the rightmost one actually drawn is centred at
  // (width - cell/2), not at the viewBox edge (width). Normalising by (width - fadeStart) would
  // therefore always fall short of maxOpacity. Normalise by the distance from fadeStart to that
  // last reachable centre instead, so the last column hits maxOpacity exactly.
  const fadeRange = width - cell / 2 - start;

  const diamonds = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * cell;
      const y = row * cell;
      const centerX = x + cell / 2;
      if (centerX <= start) continue;
      const opacity = round2(Math.min(maxOpacity, (maxOpacity * (centerX - start)) / fadeRange));
      if (opacity <= 0) continue;
      diamonds.push({ x, y, opacity });
    }
  }

  return { width, height, cell, diamondScale: round2(cell / 32), diamonds };
}

/**
 * The mark + wordmark lockup from wordmark-*.svg, parameterised by the total lockup `height`
 * (the canonical asset uses 80). The mark fills 0.6 of the lockup height; the margin around it
 * (and the gap before the glyph) is 0.2 of the lockup height; the glyph is scaled to a cap height
 * of 0.5 of the lockup height (asset ratios: mark 48, margin/gap 16, glyph 40, all out of a 80px
 * lockup — 48/80 = 0.6, 16/80 = 0.2, 40/80 = 0.5, and 40/48 / 16/48 are exactly the ratios the
 * review pinned as canonical). `withMark: false` drops the mark, its margin and the gap, and
 * centres the glyph on the full lockup height instead.
 */
export function wordmarkLayout({ height = 80, withMark = true } = {}) {
  const margin = round2(height * 0.2);
  const markSize = withMark ? round2(height * 0.6) : 0;
  const markX = withMark ? margin : 0;
  const markY = withMark ? margin : 0;
  const gap = withMark ? margin : 0;
  // Without a mark there is nothing to centre on, so the glyph centres on the full lockup height
  // instead (markY/markSize are both 0 in that case, which would otherwise centre on y=0).
  const markCenterY = withMark ? markY + markSize / 2 : height / 2;

  const glyphTargetHeight = round2(height * 0.5);
  const glyphScale = round2(glyphTargetHeight / WORDMARK.baseline);
  const glyphWidth = round2(WORDMARK.width * glyphScale);
  const glyphX = round2(markX + markSize + gap);
  const glyphY = round2(markCenterY + glyphScale * (WORDMARK.baseline - WORDMARK.height / 2));

  const width = round2(glyphX + glyphWidth + (withMark ? margin : 0));

  return { width, height, markX, markY, markSize, markCenterY, glyphX, glyphY, glyphScale, glyphWidth };
}
