import React from 'react';

export interface CTASectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

export const CTASection = React.forwardRef<HTMLElement, CTASectionProps>(({
  title,
  description,
  primaryCtaText = 'Get Started Today',
  secondaryCtaText = 'Contact Sales',
  onPrimaryClick,
  onSecondaryClick,
  className = '',
  ...props
}, ref) => {
  return (
    <section ref={ref} className={`joy-cta-section ${className}`} {...props}>
      <div className="joy-cta-section__container">
        <h2 className="joy-cta-section__title">{title}</h2>
        {description && <p className="joy-cta-section__desc">{description}</p>}
        <div className="joy-cta-section__actions">
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
              className="joy-button joy-button--glass joy-button--lg"
              onClick={onSecondaryClick}
            >
              {secondaryCtaText}
            </button>
          )}
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';
