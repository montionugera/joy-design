import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, icon, action, className = '', ...rest }, ref) => {
    return (
      <div ref={ref} className={cx('joy-empty-state', className)} {...rest}>
        {icon && <div className="joy-empty-state__icon">{icon}</div>}
        <h3 className="joy-empty-state__title">{title}</h3>
        {description && <p className="joy-empty-state__desc">{description}</p>}
        {action && <div className="joy-empty-state__action">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
