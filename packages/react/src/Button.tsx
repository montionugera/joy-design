import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  iconOnly?: boolean;
  type?: 'button' | 'submit' | 'reset';
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'solid',
      size = 'md',
      disabled = false,
      loading = false,
      block = false,
      iconOnly = false,
      type = 'button',
      iconStart,
      iconEnd,
      onClick,
      children,
      className = '',
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        onClick={onClick}
        className={cx(
          'joy-button',
          variant && `joy-button--${variant}`,
          size && `joy-button--${size}`,
          loading && 'joy-button--loading',
          block && 'joy-button--block',
          iconOnly && 'joy-button--icon-only',
          className
        )}
        {...rest}
      >
        {iconStart && <span className="joy-button__icon">{iconStart}</span>}
        <span className="joy-button__label">{children}</span>
        {iconEnd && <span className="joy-button__icon">{iconEnd}</span>}
        {loading && (
          <span className="joy-button__spinner" aria-hidden="true">
            <svg
              className="joy-button__spinner-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
