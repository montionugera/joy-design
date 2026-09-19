import React, { forwardRef } from 'react';

export interface SpaceProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
  size?: 'small' | 'middle' | 'large' | number;
  align?: 'start' | 'end' | 'center' | 'baseline';
  wrap?: boolean;
  children?: React.ReactNode;
}

const sizeMap: Record<string, number> = {
  small: 8,
  middle: 16,
  large: 24
};

export const Space = forwardRef<HTMLDivElement, SpaceProps>(
  (
    {
      direction = 'horizontal',
      size = 'small',
      align,
      wrap = false,
      children,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const gapPx = typeof size === 'number' ? size : sizeMap[size] || 8;
    const computedStyle: React.CSSProperties = {
      gap: `${gapPx}px`,
      flexWrap: wrap ? 'wrap' : undefined,
      alignItems: align,
      ...style
    };

    return (
      <div
        ref={ref}
        className={`joy-space joy-space--${direction} ${className}`}
        style={computedStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Space.displayName = 'Space';
