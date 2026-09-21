import React from 'react';

export interface FeatureGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

export const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(({
  columns = 3,
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={`joy-feature-grid joy-feature-grid--cols-${columns} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

FeatureGrid.displayName = 'FeatureGrid';
