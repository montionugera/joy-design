import React, { forwardRef } from 'react';

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
  wrap?: boolean;
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: number | string;
  children?: React.ReactNode;
}

const justifyMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly'
};

const alignMap: Record<string, string> = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  baseline: 'baseline',
  stretch: 'stretch'
};

export const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      vertical = false,
      wrap = false,
      justify = 'start',
      align = 'stretch',
      gap = 8,
      children,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const computedStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      flexWrap: wrap ? 'wrap' : 'nowrap',
      justifyContent: justifyMap[justify] || justify,
      alignItems: alignMap[align] || align,
      gap: typeof gap === 'number' ? `${gap}px` : gap,
      ...style
    };

    return (
      <div ref={ref} className={`joy-flex ${className}`} style={computedStyle} {...props}>
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';
