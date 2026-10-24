import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
  size?: 'sm' | 'md';
  dot?: boolean;
  /** Rendered in an aria-hidden span before the children. */
  icon?: React.ReactNode;
}

/**
 * Variant modifiers: joy-badge--neutral, joy-badge--success, joy-badge--warning,
 * joy-badge--danger, joy-badge--brand. Size modifiers: joy-badge--sm, joy-badge--md.
 * Colors come from theme.css tokens (brand = accent-subtle / accent-text).
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'neutral', size = 'md', dot = false, icon, children, className = '', ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={cx(`joy-badge joy-badge--${variant} joy-badge--${size}`, className)}
        {...rest}
      >
        {dot && <span className="joy-badge__dot" aria-hidden="true" />}
        {icon != null && icon !== false && <span aria-hidden="true">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
