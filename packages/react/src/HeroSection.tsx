import React from 'react';

export interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  badgeText?: string;
  title?: string;
  titleGradient?: string;
  subtitle?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  previewSlot?: React.ReactNode;
}

export const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(({
  badgeText,
  title,
  titleGradient,
  subtitle,
  primaryCtaText = 'Get Started Free',
  secondaryCtaText = 'Explore Documentation',
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {badgeText}
        </div>
      )}

      {(title || titleGradient) && (
        <h1 className="joy-hero__title">
          {title}
          {titleGradient && (
            <> <span className="joy-hero__title-gradient">{titleGradient}</span></>
          )}
        </h1>
      )}

      {subtitle && <p className="joy-hero__subtitle">{subtitle}</p>}

      <div className="joy-hero__ctas">
        {primaryCtaText && (
          <button
            type="button"
            className="joy-button joy-button--solid joy-button--lg"
            onClick={onPrimaryClick}
          >
            {primaryCtaText}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        )}
        {secondaryCtaText && (
          <button
            type="button"
            className="joy-button joy-button--outline joy-hero__secondary-cta joy-button--lg"
            onClick={onSecondaryClick}
          >
            {secondaryCtaText}
          </button>
        )}
      </div>

      {previewSlot && <div className="joy-hero__preview">{previewSlot}</div>}
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
