import * as React from 'react';
import { Button } from './Button.js';

// Internal (not exported from index.ts): the CTA button used by HeroSection and CTASection.
// Without href it composes Button; with href it renders an anchor. A link ignores :disabled, so
// a disabled or loading link drops href, is aria-disabled and leaves the tab order.
export interface LandingActionProps {
  variant?: 'solid' | 'outline';
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  children?: React.ReactNode;
  className?: string;
}

export function LandingAction({
  variant = 'solid',
  href,
  loading = false,
  disabled = false,
  onClick,
  children,
  className = ''
}: LandingActionProps) {
  if (!href) {
    return (
      <Button variant={variant} size="lg" loading={loading} disabled={disabled} onClick={onClick} className={className}>
        {children}
      </Button>
    );
  }
  const inert = disabled || loading;
  return (
    <a
      className={`joy-button joy-button--${variant} joy-button--lg ${loading ? 'joy-button--loading' : ''} ${className}`}
      href={inert ? undefined : href}
      role={inert ? 'link' : undefined}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      tabIndex={inert ? -1 : undefined}
      onClick={inert ? (e) => e.preventDefault() : onClick}
    >
      <span className="joy-button__label">{children}</span>
      {loading && (
        <span className="joy-button__spinner" aria-hidden="true">
          <svg className="joy-button__spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </span>
      )}
    </a>
  );
}
