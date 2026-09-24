import React from 'react';
import { LandingAction } from './LandingAction.js';

export interface CTASectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  primaryHref?: string;
  secondaryHref?: string;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryDisabled?: boolean;
  onPrimaryClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onSecondaryClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const CTASection = React.forwardRef<HTMLElement, CTASectionProps>(({
  title,
  description,
  primaryCtaText = 'Get started today',
  secondaryCtaText = 'Contact sales',
  primaryHref,
  secondaryHref,
  primaryLoading = false,
  primaryDisabled = false,
  secondaryDisabled = false,
  onPrimaryClick,
  onSecondaryClick,
  className = '',
  ...props
}, ref) => {
  const titleId = `joy-cta-title-${React.useId()}`;
  return (
    <section ref={ref} className={`joy-cta-section ${className}`} aria-labelledby={props['aria-label'] ? undefined : titleId} {...props}>
      <div className="joy-cta-section__container">
        <h2 className="joy-cta-section__title" id={titleId}>{title}</h2>
        {description && <p className="joy-cta-section__desc">{description}</p>}
        <div className="joy-cta-section__actions">
          {primaryCtaText && (
            <LandingAction variant="solid" href={primaryHref} loading={primaryLoading} disabled={primaryDisabled} onClick={onPrimaryClick}>
              {primaryCtaText}
            </LandingAction>
          )}
          {secondaryCtaText && (
            <LandingAction variant="outline" href={secondaryHref} disabled={secondaryDisabled} onClick={onSecondaryClick}>
              {secondaryCtaText}
            </LandingAction>
          )}
        </div>
      </div>
    </section>
  );
});

CTASection.displayName = 'CTASection';
