import React from 'react';

export type BentoColSpan = 4 | 6 | 8 | 12;

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
  return (
    <div
      ref={ref}
      className={`joy-bento-card joy-bento-card--col-${colSpan} ${className}`}
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
