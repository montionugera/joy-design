import * as React from 'react';

// A small label badge. The `corner` variant is absolutely positioned and rotated, so its parent
// must set `position: relative; overflow: hidden` for the band to clip to the parent's box.
export interface RibbonProps {
  label: string;
  variant?: 'corner' | 'inline';
  tone?: 'gold' | 'navy';
  decorative?: boolean;
  className?: string;
}

export function Ribbon({ label, variant = 'inline', tone = 'gold', decorative = false, className = '' }: RibbonProps) {
  return (
    <span className={`joy-ribbon joy-ribbon--${variant} joy-ribbon--${tone} ${className}`} aria-hidden={decorative ? 'true' : undefined}>{label}</span>
  );
}
