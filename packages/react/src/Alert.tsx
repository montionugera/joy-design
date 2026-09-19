import * as React from 'react';

export interface AlertProps {
  title?: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  children?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  description,
  variant = 'info',
  children,
  className = ''
}) => {
  return (
    <div className={`joy-alert joy-alert--${variant} ${className}`} role="alert">
      {title && <div className="joy-alert__title">{title}</div>}
      {description && <div className="joy-alert__desc">{description}</div>}
      {children}
    </div>
  );
};

Alert.displayName = 'Alert';
