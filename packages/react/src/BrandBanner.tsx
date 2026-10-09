import * as React from 'react';
import { MARK, heroLattice } from '@joymify/brand';
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

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

// Decorative diamond lattice: the same grid + right-edge fade as @joymify/brand's hero-banner.svg
// asset (packages/brand/src/render.js's heroBannerSvg), sourced from the shared `heroLattice`
// helper so the two can never drift apart. This is an `aria-hidden` overlay stroked with a
// `--joy-brand-*` custom property rather than heroBannerSvg's fixed role="img" + resolved-hex
// wrapper.
const LATTICE = heroLattice();

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
    <section className={cx('joy-brand-banner', align === 'center' && 'joy-brand-banner--center', className)}>
      <svg className="joy-brand-banner__lattice" viewBox={`0 0 ${LATTICE.width} ${LATTICE.height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        {LATTICE.diamonds.map((diamond, i) => (
          <g key={i} transform={`translate(${diamond.x} ${diamond.y}) scale(${LATTICE.diamondScale})`}>
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
