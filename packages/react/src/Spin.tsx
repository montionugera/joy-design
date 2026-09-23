import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

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

    const indicator = (
      <>
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
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        {tip && <span className="joy-spin__tip">{tip}</span>}
      </>
    );

    if (children) {
      return (
        <div ref={ref} className={cx('joy-spin__container', className)} {...rest}>
          {children}
          {spinning && (
            <div className="joy-spin__mask" role="status" aria-busy="true">
              <div className="joy-spin">{indicator}</div>
            </div>
          )}
        </div>
      );
    }

    if (!spinning) return null;

    return (
      <div ref={ref} className={cx('joy-spin', className)} role="status" aria-busy="true" {...rest}>
        {indicator}
      </div>
    );
  }
);

Spin.displayName = 'Spin';
