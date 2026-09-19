import React from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = ''
}) => {
  return (
    <div className={`joy-empty-state ${className}`}>
      {icon && <div className="joy-empty-state__icon">{icon}</div>}
      <h3 className="joy-empty-state__title">{title}</h3>
      {description && <p className="joy-empty-state__desc">{description}</p>}
      {action && <div className="joy-empty-state__action">{action}</div>}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';
