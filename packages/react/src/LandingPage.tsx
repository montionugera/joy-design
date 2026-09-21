import React from 'react';
import { HeroSection } from './HeroSection.js';
import { LogoCloud } from './LogoCloud.js';
import { FeatureGrid } from './FeatureGrid.js';
import { FeatureCard } from './FeatureCard.js';
import { StatsSection } from './StatsSection.js';
import { CTASection } from './CTASection.js';
import { FAQSection } from './FAQSection.js';
import { SiteFooter } from './SiteFooter.js';

export interface LandingPageProps extends React.HTMLAttributes<HTMLDivElement> {
  palette?: 'joymify' | 'obsidian' | 'quantum' | 'cyberpunk' | 'titanium';
  onDeployClick?: () => void;
  onDocsClick?: () => void;
  interactiveSlot?: React.ReactNode;
}

export const LandingPage = React.forwardRef<HTMLDivElement, LandingPageProps>(({
  palette = 'joymify',
  onDeployClick,
  onDocsClick,
  interactiveSlot,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      data-palette={palette}
      className={`joy-landing-page ${className}`}
      {...props}
    >
      {/* Header Navigation */}
      <header className="joy-landing-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.25rem', color: 'var(--joy-text-primary, #0f172a)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold-400, #c49a3a)' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Joymify Quant</span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="#features" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--joy-color-text-muted, #64748b)', textDecoration: 'none' }}>Features</a>
          <a href="#telemetry" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--joy-color-text-muted, #64748b)', textDecoration: 'none' }}>Telemetry</a>
          <a href="#faq" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--joy-color-text-muted, #64748b)', textDecoration: 'none' }}>FAQ</a>
          <button
            type="button"
            className="joy-button joy-button--solid joy-button--sm"
            onClick={onDeployClick}
          >
            Launch Terminal
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <HeroSection
        badgeText="Institutional Engine &bull; Sub-5μs Execution"
        title="Deterministic Financial Telemetry &"
        titleGradient="Quantitative UI Systems"
        subtitle="Engineered for high-frequency trading desks, liquidity aggregators, and institutional asset portals requiring strict sub-5ms rendering budgets."
        primaryCtaText="Deploy Quantitative Node"
        secondaryCtaText="Read Whitepaper"
        onPrimaryClick={onDeployClick}
        onSecondaryClick={onDocsClick}
      />

      {/* Partner Logo Cloud */}
      <LogoCloud
        title="Trusted by Premier Quantitative Desks & Liquidity Providers"
        logos={[
          {
            name: 'Quantum Capital',
            logo: (
              <svg width="120" height="32" viewBox="0 0 120 32" fill="none">
                <rect x="2" y="6" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 10v12M6 16h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <text x="30" y="21" fontFamily="sans-serif" fontWeight="700" fontSize="14" fill="currentColor">QUANTUM</text>
              </svg>
            )
          },
          {
            name: 'Citadel Trading',
            logo: (
              <svg width="110" height="32" viewBox="0 0 110 32" fill="none">
                <polygon points="12,6 22,26 2,26" stroke="currentColor" strokeWidth="2"/>
                <text x="30" y="21" fontFamily="sans-serif" fontWeight="700" fontSize="14" fill="currentColor">CITADEL</text>
              </svg>
            )
          },
          {
            name: 'Nexus Alpha',
            logo: (
              <svg width="120" height="32" viewBox="0 0 120 32" fill="none">
                <circle cx="12" cy="16" r="10" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="16" r="4" fill="currentColor"/>
                <text x="30" y="21" fontFamily="sans-serif" fontWeight="700" fontSize="14" fill="currentColor">NEXUS CAP</text>
              </svg>
            )
          },
          {
            name: 'Flow Desk',
            logo: (
              <svg width="115" height="32" viewBox="0 0 115 32" fill="none">
                <rect x="4" y="6" width="16" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <text x="28" y="21" fontFamily="sans-serif" fontWeight="700" fontSize="14" fill="currentColor">FLOW DESK</text>
              </svg>
            )
          }
        ]}
      />

      {/* Key Metrics Stats */}
      <div id="telemetry">
        <StatsSection
          stats={[
            { label: 'P99 Order Latency', value: '4.2 μs', description: 'Kernel bypass colocation', change: '-14% vs L1', trend: 'up' },
            { label: 'Historical Uptime', value: '99.999%', description: 'Dual active-active failover', change: 'Zero downtime', trend: 'up' },
            { label: 'Monthly Volume', value: '$48.2B', description: 'Settled across 14 networks', change: '+32% MoM', trend: 'up' },
            { label: 'Settlement Chains', value: '14 Chains', description: 'Instant cross-L2 finality', change: 'EVM & SVM', trend: 'up' }
          ]}
        />
      </div>

      {/* Interactive Slot (Charts / Simulator Preview) */}
      {interactiveSlot && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 48px auto', padding: '0 24px' }}>
          {interactiveSlot}
        </div>
      )}

      {/* Modular Feature Grid */}
      <div id="features" style={{ maxWidth: '1200px', margin: '0 auto 48px auto', padding: '0 24px' }}>
        <FeatureGrid columns={3}>
          <FeatureCard
            title="Sub-Microsecond Matching"
            description="FPGA co-located order matching rings processing up to 2.4M ops/sec with deterministic tick dispatch."
            badge={<span className="joy-badge joy-badge--brand">FPGA-Core</span>}
            linkText="Learn more"
            linkHref="#features"
          />
          <FeatureCard
            title="Institutional Color Palettes"
            description="Five mathematically calibrated dark & light themes guaranteeing WCAG 2.2 AA contrast on every component."
            badge={<span className="joy-badge joy-badge--success">WCAG AAA</span>}
            linkText="Inspect tokens"
            linkHref="#features"
          />
          <FeatureCard
            title="Adaptive Mobile Viewports"
            description="Responsive stacking modes transform complex multi-column market tables into crisp cards on mobile screens."
            badge={<span className="joy-badge joy-badge--warning">Adaptive</span>}
            linkText="View demo"
            linkHref="#features"
          />
        </FeatureGrid>
      </div>

      {/* FAQ Section */}
      <div id="faq">
        <FAQSection
          title="Frequently Asked Questions"
          subtitle="Institutional queries regarding architecture, performance bounds, and security compliance."
          items={[
            {
              question: 'How are sub-5ms chart rendering benchmarks maintained?',
              answer: 'Decoupled double-buffered canvas layers, Largest-Triangle-Three-Buckets (LTTB) downsampling, and pre-allocated circular RingBuffers eliminate GC pauses.',
              defaultOpen: true
            },
            {
              question: 'Can the color palette be switched at runtime?',
              answer: 'Yes. All components leverage canonical CSS custom properties (--joy-surface-*, --joy-border, --gold-400), enabling instant runtime palette swaps with zero DOM reflows.'
            },
            {
              question: 'How do tables render on mobile viewports under 768px?',
              answer: 'With responsive stack mode, rows automatically convert into stacked cards where data-label attributes label each value cleanly without horizontal cutoff.'
            }
          ]}
        />
      </div>

      {/* Call to Action Banner */}
      <CTASection
        title="Ready to Transform Your Institutional Trading Platform?"
        description="Experience deterministic UI latency, high-density financial tables, and verified WCAG 2.2 contrast."
        primaryCtaText="Deploy Quantitative Node"
        secondaryCtaText="Contact Sales"
        onPrimaryClick={onDeployClick}
        onSecondaryClick={onDocsClick}
      />

      {/* Site Footer */}
      <SiteFooter
        brandTitle="Joymify Design"
        brandDescription="Enterprise quantitative UI and design token architecture."
        columns={[
          {
            title: 'Platform',
            links: [
              { label: 'Financial Charts', href: '#features' },
              { label: 'Adaptive Table', href: '#features' },
              { label: 'Bento Grid', href: '#features' }
            ]
          },
          {
            title: 'Resources',
            links: [
              { label: 'Documentation', href: '#' },
              { label: 'Design Tokens', href: '#' },
              { label: 'API Reference', href: '#' }
            ]
          },
          {
            title: 'Compliance',
            links: [
              { label: 'WCAG 2.2 AA', href: '#' },
              { label: 'Zero Emoji Policy', href: '#' },
              { label: 'SOC 2 Type II', href: '#' }
            ]
          }
        ]}
      />
    </div>
  );
});

LandingPage.displayName = 'LandingPage';
