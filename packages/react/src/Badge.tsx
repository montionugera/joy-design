import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  children,
  className = '',
  ...rest
}) => {
  return (
    <span className={`joy-badge joy-badge--${variant} joy-badge--${size} ${className}`} {...rest}>
      {dot && <span className="joy-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
