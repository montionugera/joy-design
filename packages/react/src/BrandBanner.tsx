import * as React from 'react';
import { MARK } from '@joymify/brand';
import { LandingAction } from './LandingAction.js';

export interface BrandBannerProps {
  eyebrow?: string;
  title: string;
  lede?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  align?: 'start' | 'center';
  children?: React.ReactNode;
  className?: string;
}

// Decorative diamond lattice, same grid + right-edge fade algorithm as @joymify/brand's
// heroBannerSvg (packages/brand/src/render.js), recomputed here (not imported) because that
// helper bakes in a resolved hex palette and a fixed role="img" wrapper; this one is a themeable
// `aria-hidden` overlay stroked with a `--joy-brand-*` custom property.
const LATTICE_WIDTH = 1600;
const LATTICE_HEIGHT = 560;
const LATTICE_CELL = 64;
const LATTICE_FADE_START = LATTICE_WIDTH * 0.55;
const LATTICE_MAX_OPACITY = 0.35;
const LATTICE_FADE_RANGE = LATTICE_WIDTH - LATTICE_CELL / 2 - LATTICE_FADE_START;

function buildLattice() {
  const cols = Math.ceil(LATTICE_WIDTH / LATTICE_CELL);
  const rows = Math.ceil(LATTICE_HEIGHT / LATTICE_CELL) + 1;
  const diamonds: { x: number; y: number; opacity: number }[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * LATTICE_CELL;
      const y = row * LATTICE_CELL;
      const centerX = x + LATTICE_CELL / 2;
      if (centerX <= LATTICE_FADE_START) continue;
      const opacity = Math.min(LATTICE_MAX_OPACITY, (LATTICE_MAX_OPACITY * (centerX - LATTICE_FADE_START)) / LATTICE_FADE_RANGE);
      if (opacity <= 0) continue;
      diamonds.push({ x, y, opacity: Math.round(opacity * 100) / 100 });
    }
  }
  return diamonds;
}

const LATTICE = buildLattice();

export function BrandBanner({
  eyebrow,
  title,
  lede,
  primaryCtaText,
  primaryCtaHref,
  secondaryCtaText,
  secondaryCtaHref,
  align = 'start',
  children,
  className = ''
}: BrandBannerProps) {
  return (
    <section className={`joy-brand-banner joy-brand-banner--${align} ${className}`}>
      <svg className="joy-brand-banner__lattice" viewBox={`0 0 ${LATTICE_WIDTH} ${LATTICE_HEIGHT}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        {LATTICE.map((diamond, i) => (
          <g key={i} transform={`translate(${diamond.x} ${diamond.y}) scale(2)`}>
            <path d={MARK.outline} fill="none" stroke="var(--joy-brand-mark-on-tile)" strokeWidth="0.5" strokeOpacity={diamond.opacity} />
          </g>
        ))}
      </svg>
      <div className="joy-brand-banner__content">
        {eyebrow && <p className="joy-brand-banner__eyebrow">{eyebrow}</p>}
        <h2 className="joy-brand-banner__title">{title}</h2>
        {lede && <p className="joy-brand-banner__lede">{lede}</p>}
        {(primaryCtaText || secondaryCtaText) && (
          <div className="joy-brand-banner__ctas">
            {primaryCtaText && (
              <LandingAction variant="solid" href={primaryCtaHref}>
                {primaryCtaText}
              </LandingAction>
            )}
            {secondaryCtaText && (
              <LandingAction variant="outline" href={secondaryCtaHref}>
                {secondaryCtaText}
              </LandingAction>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
