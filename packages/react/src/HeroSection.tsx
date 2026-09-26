import React from 'react';
import { LandingAction } from './LandingAction.js';

export interface HeroSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  badgeText?: string;
  title?: string;
  titleEmphasis?: string;
  subtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  primaryHref?: string;
  secondaryHref?: string;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  onPrimaryClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onSecondaryClick?: (e: React.MouseEvent<HTMLElement>) => void;
  previewSlot?: React.ReactNode;
}

export const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(({
  badgeText,
  title,
  titleEmphasis,
  subtitle,
  primaryCtaText = 'Get started free',
  secondaryCtaText = 'Explore documentation',
  primaryHref,
  secondaryHref,
  primaryLoading = false,
  primaryDisabled = false,
  secondaryDisabled = false,
  onPrimaryClick,
  onSecondaryClick,
  previewSlot,
  className = '',
  ...props
}, ref) => {
  return (
    <section ref={ref} className={`joy-hero ${className}`} {...props}>
      {badgeText && (
        <div className="joy-hero__badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {badgeText}
        </div>
      )}

      {(title || titleEmphasis) && (
        <h1 className="joy-hero__title">
          {title}
          {titleEmphasis && (
            <>{title && ' '}<span className="joy-hero__title-emphasis">{titleEmphasis}</span></>
          )}
        </h1>
      )}

      {subtitle && <p className="joy-hero__subtitle">{subtitle}</p>}

      <div className="joy-hero__ctas">
        {primaryCtaText && (
          <LandingAction variant="solid" href={primaryHref} loading={primaryLoading} disabled={primaryDisabled} onClick={onPrimaryClick}>
            {primaryCtaText}
          </LandingAction>
        )}
        {secondaryCtaText && (
          <LandingAction variant="outline" className="joy-hero__secondary-cta" href={secondaryHref} disabled={secondaryDisabled} onClick={onSecondaryClick}>
            {secondaryCtaText}
          </LandingAction>
        )}
      </div>

      {previewSlot && <div className="joy-hero__preview">{previewSlot}</div>}
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
