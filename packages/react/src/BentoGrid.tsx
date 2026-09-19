import React from 'react';

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const BentoGrid: React.FC<BentoGridProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`joy-bento-grid ${className}`} {...props}>
      {children}
    </div>
  );
};

BentoGrid.displayName = 'BentoGrid';
