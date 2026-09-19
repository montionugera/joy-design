import React, { forwardRef } from 'react';

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  price: string;
  period?: string;
  features?: string[];
  ctaText?: string;
  featured?: boolean;
  badge?: string;
  onSelect?: () => void;
}

export const PricingCard = forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      title,
      description,
      price,
      period = '/month',
      features = [],
      ctaText = 'Get Started',
      featured = false,
      badge,
      onSelect,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`joy-pricing-card ${featured ? 'joy-pricing-card--featured' : ''} ${className}`}
        {...props}
      >
        {badge && <div className="joy-pricing-card__badge">{badge}</div>}

        <h3 className="joy-pricing-card__title">{title}</h3>
        {description && <p className="joy-pricing-card__desc">{description}</p>}

        <div className="joy-pricing-card__price">
          <span>{price}</span>
          <span className="joy-pricing-card__period">{period}</span>
        </div>

        {features.length > 0 && (
          <ul className="joy-pricing-card__features">
            {features.map((feature, idx) => (
              <li key={idx} className="joy-pricing-card__feature">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--joy-color-status-success, #10b981)', flexShrink: 0 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className={`joy-button ${featured ? 'joy-button--solid' : 'joy-button--outline'} joy-button--md`}
          style={{ width: '100%', marginTop: 'auto' }}
          onClick={onSelect}
        >
          {ctaText}
        </button>
      </div>
    );
  }
);

PricingCard.displayName = 'PricingCard';
