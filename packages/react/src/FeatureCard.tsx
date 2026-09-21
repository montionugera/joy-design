import React from 'react';

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  linkText?: string;
  linkHref?: string;
  onLinkClick?: () => void;
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(({
  title,
  description,
  icon,
  badge,
  linkText,
  linkHref = '#',
  onLinkClick,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`joy-feature-card ${className}`} {...props}>
      {badge && <div className="joy-feature-card__badge">{badge}</div>}
      {icon && <div className="joy-feature-card__icon">{icon}</div>}
      <h3 className="joy-feature-card__title">{title}</h3>
      <p className="joy-feature-card__desc">{description}</p>
      {linkText && (
        <a
          href={linkHref}
          className="joy-feature-card__link"
          onClick={(e) => {
            if (onLinkClick) {
              e.preventDefault();
              onLinkClick();
            }
          }}
        >
          {linkText}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      )}
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';
