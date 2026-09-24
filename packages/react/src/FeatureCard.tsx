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
  linkHref,
  onLinkClick,
  className = '',
  ...props
}, ref) => {
  // A handler with no destination is an action, not a link: a real button, so there is no fake "#" anchor to
  // middle-click or scroll to the top of the page.
  const asButton = linkHref === undefined && !!onLinkClick;
  return (
    <div ref={ref} className={`joy-feature-card ${className}`} {...props}>
      {badge && <div className="joy-feature-card__badge">{badge}</div>}
      {icon && <div className="joy-feature-card__icon">{icon}</div>}
      <h3 className="joy-feature-card__title">{title}</h3>
      <p className="joy-feature-card__desc">{description}</p>
      {linkText && (asButton ? (
        <button type="button" className="joy-feature-card__link" onClick={() => onLinkClick?.()}>
          {linkText}
        </button>
      ) : (
        <a
          href={linkHref ?? '#'}
          className="joy-feature-card__link"
          onClick={onLinkClick ? (e) => {
            e.preventDefault();
            onLinkClick();
          } : undefined}
        >
          {linkText}
        </a>
      ))}
    </div>
  );
});

FeatureCard.displayName = 'FeatureCard';
