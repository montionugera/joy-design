import * as React from 'react';
import { MARK, WORDMARK, wordmarkLayout, markScale } from '@montionugera/joy-brand';

// The "Joymify" outlined wordmark, optionally paired with the bare diamond mark. Geometry AND
// layout (the mark/gap/glyph proportions) come from @montionugera/joy-brand's `wordmarkLayout` — the same
// helper the canonical wordmark-*.svg asset is built from (packages/brand/src/render.js), so this
// component can never drift from the shipped asset the way a copied implementation once did.
// Colours are `--joy-brand-*` custom properties chosen by `tone` so the lockup stays correct on
// both a light canvas (deep) and a brand tile background (cream) — the component itself never
// paints a background, the consumer supplies the tile.
export interface WordmarkProps {
  tone?: 'deep' | 'cream';
  height?: number;
  withMark?: boolean;
  title?: string;
  className?: string;
}

export function Wordmark({ tone = 'deep', height = 32, withMark = true, title = 'Joymify', className = '' }: WordmarkProps) {
  const lockupHeight = Number.isFinite(height) && height > 0 ? height : 32;
  const isCream = tone === 'cream';
  const glyphColor = isCream ? 'var(--joy-brand-ink-on-tile)' : 'var(--joy-brand-ink)';
  const markColor = isCream ? 'var(--joy-brand-mark-on-tile)' : 'var(--joy-brand-mark)';

  // padding: 0 — no outer whitespace, unlike the downloadable asset, so the mark fills the full
  // component height (markSize === height).
  const layout = wordmarkLayout({ height: lockupHeight, withMark, padding: 0 });

  return (
    // Fix round 3: the glyph outline has a descender, so its full ink height (WORDMARK.height)
    // exceeds the "height above baseline" it is scaled by (WORDMARK.baseline) — at padding 0 the
    // ink pokes past the viewBox top and bottom by design (the mark:gap:glyph ratio is canonical,
    // the box is not padded to fit it). overflow="visible" lets that ink render instead of being
    // clipped by the svg's default overflow: hidden.
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${layout.width} ${lockupHeight}`}
      width={layout.width}
      height={lockupHeight}
      className={`joy-wordmark ${className}`}
      role="img"
      aria-label={title}
      overflow="visible"
    >
      <title>{title}</title>
      {withMark && (
        <g transform={`translate(${layout.markX} ${layout.markY}) scale(${markScale(layout.markSize)})`}>
          <path d={MARK.outline} fill="none" stroke={markColor} strokeWidth={MARK.outlineWidth} />
          <path d={MARK.inner} fill={markColor} />
          {/* Fix round (final review Minor 1): wordmark-cream.svg draws the tile mark's centre dot
              (packages/brand/src/render.js markGroup, tile: isCream); the cream component skipped
              it, so the same logo showed a dot in the download and none in the component. The
              asset is canonical, so match its geometry (MARK.dot) here. */}
          {isCream && <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill="var(--joy-brand-mark-contrast)" />}
        </g>
      )}
      <path d={WORDMARK.d} fill={glyphColor} transform={`translate(${layout.glyphX} ${layout.glyphY}) scale(${layout.glyphScale})`} />
    </svg>
  );
}
