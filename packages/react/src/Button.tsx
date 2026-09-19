import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'solid',
      size = 'md',
      loading = false,
      disabled = false,
      children,
      className = '',
      type = 'button',
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`joy-button joy-button--${variant} joy-button--${size} ${className}`}
        {...rest}
      >
        {loading && <span className="joy-button__spinner" aria-hidden="true">⏳</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
