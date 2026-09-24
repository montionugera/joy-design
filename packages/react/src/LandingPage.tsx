import React from 'react';
import { Cpu, Layers, Menu, Smartphone } from '@joymify/icons/react';
import { Drawer } from './Drawer.js';
import { HeroSection } from './HeroSection.js';
import { LogoCloud } from './LogoCloud.js';
import { FeatureGrid } from './FeatureGrid.js';
import { FeatureCard } from './FeatureCard.js';
import { StatsSection } from './StatsSection.js';
import { CTASection } from './CTASection.js';
import { FAQSection } from './FAQSection.js';
import { SiteFooter } from './SiteFooter.js';

export interface LandingPageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A plain `data-palette` attribute; the theme is decided by `data-theme` alone. */
  palette?: 'joymify' | 'obsidian' | 'quantum' | 'cyberpunk' | 'titanium';
  onDeployClick?: () => void;
  onDocsClick?: () => void;
  interactiveSlot?: React.ReactNode;
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Telemetry', href: '#telemetry' },
  { label: 'FAQ', href: '#faq' }
];

export const LandingPage = React.forwardRef<HTMLDivElement, LandingPageProps>(({
  palette = 'joymify',
  onDeployClick,
  onDocsClick,
  interactiveSlot,
  className = '',
  ...props
}, ref) => {
  // Unique per instance: two landing pages never share the menu panel or the main landmark id.
  const uid = React.useId();
  const menuId = `${uid}-menu`;
  const mainId = `${uid}-main`;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div
      ref={ref}
      data-palette={palette}
      className={`joy-landing-page ${className}`}
      {...props}
    >
      <a className="joy-landing-skip" href={`#${mainId}`}>Skip to main content</a>

      <header className="joy-landing-header">
        <div className="joy-landing-header__brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Joymify Quant</span>
        </div>
        <nav className="joy-landing-header__nav" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} className="joy-landing-header__link" href={link.href}>{link.label}</a>
          ))}
          <button type="button" className="joy-button joy-button--solid joy-button--sm" onClick={onDeployClick}>
            Launch Terminal
          </button>
        </nav>
        <button
          type="button"
          className="joy-button joy-button--ghost joy-button--icon-only joy-landing-header__menu"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen(true)}
        >
          <Menu size="1.25rem" />
        </button>
      </header>

      {/* Below 768px the inline nav is hidden; the same links live in this drawer (a bottom sheet at 480px and below). */}
      <Drawer
        id={menuId}
        open={menuOpen}
        title="Menu"
        onClose={closeMenu}
        footer={(
          <button
            type="button"
            className="joy-button joy-button--solid joy-button--lg joy-button--block"
            onClick={() => {
              closeMenu();
              onDeployClick?.();
            }}
          >
            Launch Terminal
          </button>
        )}
      >
        <nav className="joy-landing-drawer__nav" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <a key={link.href} className="joy-landing-drawer__link" href={link.href} onClick={closeMenu}>{link.label}</a>
          ))}
        </nav>
      </Drawer>

      <main id={mainId}>
        <HeroSection
          badgeText="Sub-5μs execution engine"
          title="Live market data and"
          titleEmphasis="fast trading screens"
          subtitle="Built for trading desks and portals that need every chart, table and price to render in under 5 ms."
          primaryCtaText="Deploy a node"
          secondaryCtaText="Read the whitepaper"
          onPrimaryClick={onDeployClick}
          onSecondaryClick={onDocsClick}
        />

        {/* Partner Logo Cloud */}
        <LogoCloud
          title="Trusted by trading desks and liquidity providers"
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
              { label: 'Historical Uptime', value: '99.999%', description: 'Two live sites, instant failover', change: 'Zero downtime', trend: 'up' },
              { label: 'Monthly Volume', value: '$48.2B', description: 'Settled across 14 networks', change: '+32% MoM', trend: 'up' },
              { label: 'Settlement Chains', value: '14 Chains', description: 'Instant cross-L2 finality', change: 'EVM & SVM', trend: 'up' }
            ]}
          />
        </div>

        {/* Interactive Slot (Charts / Simulator Preview) */}
        {interactiveSlot && <div className="joy-landing-page__slot">{interactiveSlot}</div>}

        {/* Modular Feature Grid */}
        <div id="features" className="joy-landing-page__features">
          <FeatureGrid columns={3}>
            <FeatureCard
              title="Fast order matching"
              description="Co-located matching engines process up to 2.4M orders a second with steady, predictable timing."
              icon={<Cpu size="1.5rem" />}
              badge={<span className="joy-badge joy-badge--brand">FPGA-Core</span>}
              linkText="See the engine"
              linkHref="#features"
            />
            <FeatureCard
              title="Five tested color themes"
              description="Light and dark themes keep text at WCAG 2.2 AA contrast on every component."
              icon={<Layers size="1.5rem" />}
              badge={<span className="joy-badge joy-badge--success">WCAG AA</span>}
              linkText="Browse tokens"
              linkHref="#features"
            />
            <FeatureCard
              title="Tables that fit phones"
              description="Wide market tables turn into clear stacked cards on small screens."
              icon={<Smartphone size="1.5rem" />}
              badge={<span className="joy-badge joy-badge--warning">Adaptive</span>}
              linkText="Try the demo"
              linkHref="#features"
            />
          </FeatureGrid>
        </div>

        {/* FAQ Section */}
        <div id="faq">
          <FAQSection
            title="Frequently Asked Questions"
            subtitle="Answers on architecture, speed and security."
            items={[
              {
                question: 'How do charts stay under 5 ms?',
                answer: 'Charts draw on two canvas layers, thin out dense data with a downsampling step and reuse preallocated buffers, so garbage collection never stalls a frame.',
                defaultOpen: true
              },
              {
                question: 'Can the color theme change at runtime?',
                answer: 'Yes. Every component reads shared CSS custom properties, so a new theme applies the moment the variables change.'
              },
              {
                question: 'How do tables look on phones?',
                answer: 'Below 768px each row becomes a stacked card and every value keeps its label, so nothing is cut off.'
              }
            ]}
          />
        </div>

        {/* Call to Action Banner */}
        <CTASection
          title="Build fast, exact trading interfaces"
          description="Get low-latency screens, dense financial tables and verified WCAG 2.2 contrast in one design system."
          primaryCtaText="Deploy a node"
          secondaryCtaText="Contact sales"
          onPrimaryClick={onDeployClick}
          onSecondaryClick={onDocsClick}
        />
      </main>

      {/* Site Footer */}
      <SiteFooter
        brandTitle="Joymify Design"
        brandDescription="Design tokens and UI parts for trading products."
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
              { label: 'Docs', href: '#' },
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
