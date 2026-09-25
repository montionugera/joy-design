import * as React from 'react';
import { MARK, WORDMARK } from '@joymify/brand';

// The "Joymify" outlined wordmark, optionally paired with the bare diamond mark. Geometry comes
// from @joymify/brand; colours are `--joy-brand-*` custom properties chosen by `tone` so the
// lockup stays correct on both a light canvas (deep) and a brand tile background (cream) — the
// component itself never paints a background, the consumer supplies the tile.
export interface WordmarkProps {
  tone?: 'deep' | 'cream';
  height?: number;
  withMark?: boolean;
  title?: string;
  className?: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function Wordmark({ tone = 'deep', height = 32, withMark = true, title = 'Joymify', className = '' }: WordmarkProps) {
  const lockupHeight = Number.isFinite(height) && (height as number) > 0 ? height : 32;
  const isCream = tone === 'cream';
  const glyphColor = isCream ? 'var(--joy-brand-ink-on-tile)' : 'var(--joy-brand-ink)';
  const markColor = isCream ? 'var(--joy-brand-mark-on-tile)' : 'var(--joy-brand-mark)';

  // The mark (when shown) fills the full lockup height; the glyph outline is scaled to 70% of it
  // and vertically centred on whichever box currently owns the centreline (the mark's box when
  // shown, the full lockup otherwise).
  const markSize = withMark ? lockupHeight : 0;
  const gap = withMark ? round2(lockupHeight * 0.3) : 0;
  const markY = round2((lockupHeight - markSize) / 2);
  const markCenterY = markY + markSize / 2;

  const scale = round2((lockupHeight * 0.7) / WORDMARK.baseline);
  const wmWidth = round2(WORDMARK.width * scale);
  const wordmarkX = round2(markSize + gap);
  const wordmarkY = round2(markCenterY + scale * (WORDMARK.baseline - WORDMARK.height / 2));
  const totalWidth = round2(wordmarkX + wmWidth);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalWidth} ${lockupHeight}`}
      width={totalWidth}
      height={lockupHeight}
      className={`joy-wordmark ${className}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {withMark && (
        <g transform={`translate(0 ${markY}) scale(${round2(markSize / 32)})`}>
          <path d={MARK.outline} fill="none" stroke={markColor} strokeWidth={MARK.outlineWidth} />
          <path d={MARK.inner} fill={markColor} />
        </g>
      )}
      <path d={WORDMARK.d} fill={glyphColor} transform={`translate(${wordmarkX} ${wordmarkY}) scale(${scale})`} />
    </svg>
  );
}
