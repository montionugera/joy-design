<script lang="ts">
  import type { Snippet } from 'svelte';
  import HeroSection from './HeroSection.svelte';
  import LogoCloud from './LogoCloud.svelte';
  import FeatureGrid from './FeatureGrid.svelte';
  import FeatureCard from './FeatureCard.svelte';
  import StatsSection from './StatsSection.svelte';
  import CTASection from './CTASection.svelte';
  import FAQSection from './FAQSection.svelte';
  import SiteFooter from './SiteFooter.svelte';

  interface Props {
    palette?: 'joymify' | 'obsidian' | 'quantum' | 'cyberpunk' | 'titanium';
    ondeployclick?: () => void;
    ondocsclick?: () => void;
    interactiveSlot?: Snippet;
    class?: string;
  }

  let {
    palette = 'joymify',
    ondeployclick,
    ondocsclick,
    interactiveSlot,
    class: className = ''
  }: Props = $props();

  const logoList = [
    {
      name: 'Quantum Capital',
      svgHtml: `<svg width="120" height="32" viewBox="0 0 120 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2"/><path d="M12 10v12M6 16h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">QUANTUM</text></svg>`
    },
    {
      name: 'Citadel Trading',
      svgHtml: `<svg width="110" height="32" viewBox="0 0 110 32" fill="none"><polygon points="12,6 22,26 2,26" stroke="currentColor" stroke-width="2"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">CITADEL</text></svg>`
    },
    {
      name: 'Nexus Alpha',
      svgHtml: `<svg width="120" height="32" viewBox="0 0 120 32" fill="none"><circle cx="12" cy="16" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="16" r="4" fill="currentColor"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">NEXUS CAP</text></svg>`
    },
    {
      name: 'Flow Desk',
      svgHtml: `<svg width="115" height="32" viewBox="0 0 115 32" fill="none"><rect x="4" y="6" width="16" height="20" rx="3" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="28" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">FLOW DESK</text></svg>`
    }
  ];

  const statsList = [
    { label: 'P99 Order Latency', value: '4.2 μs', description: 'Kernel bypass colocation', change: '-14% vs L1', trend: 'up' as const },
    { label: 'Historical Uptime', value: '99.999%', description: 'Dual active-active failover', change: 'Zero downtime', trend: 'up' as const },
    { label: 'Monthly Volume', value: '$48.2B', description: 'Settled across 14 networks', change: '+32% MoM', trend: 'up' as const },
    { label: 'Settlement Chains', value: '14 Chains', description: 'Instant cross-L2 finality', change: 'EVM & SVM', trend: 'up' as const }
  ];

  const faqList = [
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
  ];

  const footerCols = [
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
  ];
</script>

<div data-palette={palette} class="joy-landing-page {className}">
  {/* Header */}
  <header class="joy-landing-header" style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; max-width: 1200px; margin: 0 auto; width: 100%;">
    <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1.25rem; color: var(--joy-text-primary, #0f172a);">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gold-400, #c49a3a);">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span>Joymify Quant</span>
    </div>
    <nav style="display: flex; align-items: center; gap: 20px;">
      <a href="#features" style="font-size: 0.875rem; font-weight: 600; color: var(--joy-color-text-muted, #64748b); text-decoration: none;">Features</a>
      <a href="#telemetry" style="font-size: 0.875rem; font-weight: 600; color: var(--joy-color-text-muted, #64748b); text-decoration: none;">Telemetry</a>
      <a href="#faq" style="font-size: 0.875rem; font-weight: 600; color: var(--joy-color-text-muted, #64748b); text-decoration: none;">FAQ</a>
      <button
        type="button"
        class="joy-button joy-button--solid joy-button--sm"
        onclick={ondeployclick}
      >
        Launch Terminal
      </button>
    </nav>
  </header>

  <HeroSection
    badgeText="Institutional Engine &bull; Sub-5μs Execution"
    title="Deterministic Financial Telemetry &"
    titleGradient="Quantitative UI Systems"
    subtitle="Engineered for high-frequency trading desks, liquidity aggregators, and institutional asset portals requiring strict sub-5ms rendering budgets."
    primaryCtaText="Deploy Quantitative Node"
    secondaryCtaText="Read Whitepaper"
    onprimaryclick={ondeployclick}
    onsecondaryclick={ondocsclick}
  />

  <LogoCloud
    title="Trusted by Premier Quantitative Desks & Liquidity Providers"
    logos={logoList}
  />

  <div id="telemetry">
    <StatsSection stats={statsList} />
  </div>

  {#if interactiveSlot}
    <div style="max-width: 1200px; margin: 0 auto 48px auto; padding: 0 24px;">
      {@render interactiveSlot()}
    </div>
  {/if}

  <div id="features" style="max-width: 1200px; margin: 0 auto 48px auto; padding: 0 24px;">
    <FeatureGrid columns={3}>
      {#snippet children()}
        <FeatureCard
          title="Sub-Microsecond Matching"
          description="FPGA co-located order matching rings processing up to 2.4M ops/sec with deterministic tick dispatch."
          linkText="Learn more"
          linkHref="#features"
        />
        <FeatureCard
          title="Institutional Color Palettes"
          description="Five mathematically calibrated dark & light themes guaranteeing WCAG 2.2 AA contrast on every component."
          linkText="Inspect tokens"
          linkHref="#features"
        />
        <FeatureCard
          title="Adaptive Mobile Viewports"
          description="Responsive stacking modes transform complex multi-column market tables into crisp cards on mobile screens."
          linkText="View demo"
          linkHref="#features"
        />
      {/snippet}
    </FeatureGrid>
  </div>

  <div id="faq">
    <FAQSection
      title="Frequently Asked Questions"
      subtitle="Institutional queries regarding architecture, performance bounds, and security compliance."
      items={faqList}
    />
  </div>

  <CTASection
    title="Ready to Transform Your Institutional Trading Platform?"
    description="Experience deterministic UI latency, high-density financial tables, and verified WCAG 2.2 contrast."
    primaryCtaText="Deploy Quantitative Node"
    secondaryCtaText="Contact Sales"
    onprimaryclick={ondeployclick}
    onsecondaryclick={ondocsclick}
  />

  <SiteFooter
    brandTitle="Joymify Design"
    brandDescription="Enterprise quantitative UI and design token architecture."
    columns={footerCols}
  />
</div>
