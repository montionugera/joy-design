import React, { forwardRef } from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'horizontal' | 'vertical';
  dashed?: boolean;
  orientation?: 'left' | 'center' | 'right';
  children?: React.ReactNode;
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ type = 'horizontal', dashed = false, orientation = 'center', children, className = '', ...props }, ref) => {
    if (type === 'vertical') {
      return (
        <div
          ref={ref}
          className={cx('joy-divider joy-divider--vertical', dashed && 'joy-divider--dashed', className)}
          role="separator"
          aria-orientation="vertical"
          {...props}
        />
      );
    }

    if (children) {
      return (
        <div
          ref={ref}
          className={cx(`joy-divider joy-divider--with-text joy-divider--${orientation}`, dashed && 'joy-divider--dashed', className)}
          role="separator"
          {...props}
        >
          <span className="joy-divider__text">{children}</span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cx('joy-divider', dashed && 'joy-divider--dashed', className)}
        role="separator"
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';
