import React, { forwardRef } from 'react';

export interface PricingMatrixProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const PricingMatrix = forwardRef<HTMLDivElement, PricingMatrixProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`joy-pricing-matrix ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

PricingMatrix.displayName = 'PricingMatrix';
