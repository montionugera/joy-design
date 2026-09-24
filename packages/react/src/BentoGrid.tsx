import React from 'react';

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(({
  children,
  className = '',
  ...props
}, ref) => {
  return (
    <div ref={ref} className={`joy-bento-grid ${className}`} {...props}>
      {children}
    </div>
  );
});

BentoGrid.displayName = 'BentoGrid';
