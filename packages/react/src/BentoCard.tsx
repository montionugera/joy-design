import React from 'react';

export type BentoColSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: BentoColSpan;
  title?: string;
  description?: string;
  badge?: string;
  children?: React.ReactNode;
}

export const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(({
  colSpan = 4,
  title,
  description,
  badge,
  children,
  className = '',
  ...props
}, ref) => {
  // Only 1..12 have a rule; anything else falls back to 4 instead of emitting a NaN modifier.
  const span = Number.isInteger(colSpan) && colSpan >= 1 && colSpan <= 12 ? colSpan : 4;
  return (
    <div
      ref={ref}
      className={`joy-bento-card joy-bento-card--col-${span} ${className}`}
      {...props}
    >
      <div>
        {badge && <div className="joy-bento-card__badge">{badge}</div>}
        {title && <h4 className="joy-bento-card__title">{title}</h4>}
        {description && <p className="joy-bento-card__desc">{description}</p>}
      </div>
      {children && <div className="joy-bento-card__content">{children}</div>}
    </div>
  );
});

BentoCard.displayName = 'BentoCard';
