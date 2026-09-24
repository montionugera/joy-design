import React from 'react';

export interface FeatureGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
  /** 'lead' (default): the first card spans two of three columns from 900px up. 'uniform': equal cards. */
  layout?: 'lead' | 'uniform';
  children: React.ReactNode;
}

export const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(({
  columns = 3,
  layout = 'lead',
  children,
  className = '',
  ...props
}, ref) => {
  // Never emit an empty or unknown modifier (a "cols-undefined" class has no rule).
  const cols = columns === 2 || columns === 4 ? columns : 3;
  return (
    <div
      ref={ref}
      className={`joy-feature-grid joy-feature-grid--cols-${cols} ${layout === 'uniform' ? '' : 'joy-feature-grid--lead'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

FeatureGrid.displayName = 'FeatureGrid';
