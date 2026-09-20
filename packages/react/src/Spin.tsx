import * as React from 'react';

export interface SpinProps extends React.HTMLAttributes<HTMLDivElement> {
  spinning?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tip?: React.ReactNode;
  children?: React.ReactNode;
}

export const Spin = React.forwardRef<HTMLDivElement, SpinProps>(
  ({ spinning = true, size = 'md', tip, children, className = '', ...rest }, ref) => {
    const sizePx = {
      sm: 16,
      md: 24,
      lg: 36
    }[size] || 24;

    const spinnerContent = (
      <div
        className={`joy-spin ${className}`.trim()}
        role="status"
        aria-busy="true"
        style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
      >
        <svg
          className="joy-spin__indicator"
          width={sizePx}
          height={sizePx}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        {tip && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--joy-color-brand-primary, #7c3aed)' }}>
            {tip}
          </span>
        )}
      </div>
    );

    if (children) {
      return (
        <div ref={ref} className="joy-spin__container" {...rest}>
          {children}
          {spinning && (
            <div className="joy-spin__mask" role="status" aria-busy="true">
              {spinnerContent}
            </div>
          )}
        </div>
      );
    }

    if (!spinning) return null;

    return (
      <div ref={ref} {...rest}>
        {spinnerContent}
      </div>
    );
  }
);

Spin.displayName = 'Spin';
