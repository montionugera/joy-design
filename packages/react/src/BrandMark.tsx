import * as React from 'react';
import { MARK } from '@joymify/brand';

// The Joymify diamond mark. Geometry comes from @joymify/brand (never copy the paths); every
// colour is a `--joy-brand-*` custom property so the mark stays correct across light/dark themes,
// unlike the static assets in @joymify/brand which bake in resolved hex values.
export interface BrandMarkProps {
  size?: number;
  variant?: 'tile' | 'bare';
  title?: string;
  className?: string;
}

export function BrandMark({ size = 32, variant = 'tile', title, className = '' }: BrandMarkProps) {
  const px = Number.isFinite(size) && (size as number) > 0 ? size : 32;
  const isTile = variant === 'tile';
  const strokeColor = isTile ? 'var(--joy-brand-mark-on-tile)' : 'var(--joy-brand-mark)';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={MARK.viewBox}
      width={px}
      height={px}
      className={`joy-brand-mark ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable={title ? undefined : 'false'}
    >
      {title && <title>{title}</title>}
      {isTile && <rect width="32" height="32" rx={MARK.tileRx} fill="var(--joy-brand-tile)" />}
      <path d={MARK.outline} fill="none" stroke={strokeColor} strokeWidth={MARK.outlineWidth} />
      <path d={MARK.inner} fill={strokeColor} />
      {isTile && <circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill="var(--joy-brand-mark-contrast)" />}
    </svg>
  );
}
