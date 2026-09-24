import React, { forwardRef } from 'react';
import { Check } from '@joymify/icons/react';
import { Button } from './Button.js';

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  price: string;
  period?: string;
  features?: string[];
  ctaText?: string;
  featured?: boolean;
  badge?: string;
  loading?: boolean;
  disabled?: boolean;
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
      ctaText = 'Get started',
      featured = false,
      badge,
      loading = false,
      disabled = false,
      onSelect,
      className = '',
      ...rest
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`joy-pricing-card ${featured ? 'joy-pricing-card--featured' : ''} ${className}`}
        {...rest}
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
                <span className="joy-pricing-card__check">
                  <Check size="18" />
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <Button
          variant={featured ? 'solid' : 'outline'}
          block
          loading={loading}
          disabled={disabled}
          onClick={onSelect}
          className="joy-pricing-card__cta"
        >
          {ctaText}
        </Button>
      </div>
    );
  }
);

PricingCard.displayName = 'PricingCard';
