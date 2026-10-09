<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { Cpu, Layers, Menu, Smartphone } from '@montionugera/joy-icons';
  import Badge from './Badge.svelte';
  import Drawer from './Drawer.svelte';
  import HeroSection from './HeroSection.svelte';
  import LogoCloud from './LogoCloud.svelte';
  import FeatureGrid from './FeatureGrid.svelte';
  import FeatureCard from './FeatureCard.svelte';
  import StatsSection from './StatsSection.svelte';
  import CTASection from './CTASection.svelte';
  import FAQSection from './FAQSection.svelte';
  import SiteFooter from './SiteFooter.svelte';

  /**
   * A full-page template: it renders its own banner, `<main>` and footer landmarks, so render it as the page body and
   * not inside another `<main>` (that would nest two main landmarks).
   */
  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
    /** A plain `data-palette` attribute; the theme is decided by `data-theme` alone. */
    palette?: 'joymify' | 'obsidian' | 'quantum' | 'cyberpunk' | 'titanium';
    ondeployclick?: () => void;
    ondocsclick?: () => void;
    interactiveSlot?: Snippet;
    class?: string;
    ref?: HTMLDivElement | null;
  }

  let {
    palette = 'joymify',
    ondeployclick,
    ondocsclick,
    interactiveSlot,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  // Unique per instance: two landing pages never share the menu panel or the main landmark id.
  const uid = $props.id();
  const menuId = `${uid}-menu`;
  const mainId = `${uid}-main`;

  let menuOpen = $state(false);
  const closeMenu = () => (menuOpen = false);
  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Telemetry', href: '#telemetry' },
    { label: 'FAQ', href: '#faq' }
  ];

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
    { label: 'P99 Order Latency', value: '4.2 μs', description: 'Kernel bypass colocation', change: '14% faster vs L1', trend: 'up' as const },
    { label: 'Historical Uptime', value: '99.999%', description: 'Two live sites, instant failover', change: 'Zero downtime', trend: 'up' as const },
    { label: 'Monthly Volume', value: '$48.2B', description: 'Settled across 14 networks', change: '+32% MoM', trend: 'up' as const },
    { label: 'Settlement Chains', value: '14 Chains', description: 'Instant cross-L2 finality', change: 'EVM & SVM', trend: 'up' as const }
  ];

  const faqList = [
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
  ];
</script>

<div bind:this={ref} data-palette={palette} class="joy-landing-page {className}" {...rest}>
  <a class="joy-landing-skip" href="#{mainId}">Skip to main content</a>

  <header class="joy-landing-header">
    <div class="joy-landing-header__brand">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span>Joymify Design</span>
    </div>
    <nav class="joy-landing-header__nav" aria-label="Primary">
      {#each navLinks as link, i (`${i}-${link.href}`)}
        <a class="joy-landing-header__link" href={link.href}>{link.label}</a>
      {/each}
      <button type="button" class="joy-button joy-button--solid joy-button--sm" onclick={ondeployclick}>
        Launch Terminal
      </button>
    </nav>
    <button
      type="button"
      class="joy-button joy-button--ghost joy-button--icon-only joy-landing-header__menu"
      aria-label="Open menu"
      aria-expanded={menuOpen}
      aria-controls={menuId}
      onclick={() => (menuOpen = true)}
    >
      <Menu size="1.25rem" />
    </button>
  </header>

  <!-- Below 768px the inline nav is hidden; the same links live in this drawer (a bottom sheet at 480px and below). -->
  <Drawer id={menuId} open={menuOpen} title="Menu" onclose={closeMenu}>
    <nav class="joy-landing-drawer__nav" aria-label="Mobile">
      {#each navLinks as link, i (`${i}-${link.href}`)}
        <a class="joy-landing-drawer__link" href={link.href} onclick={closeMenu}>{link.label}</a>
      {/each}
    </nav>
    {#snippet footer()}
      <button
        type="button"
        class="joy-button joy-button--solid joy-button--lg joy-button--block"
        onclick={() => {
          closeMenu();
          ondeployclick?.();
        }}
      >
        Launch Terminal
      </button>
    {/snippet}
  </Drawer>

  <main id={mainId} tabindex="-1">
    <HeroSection
      badgeText="Sub-5μs execution engine"
      title="Live market data and"
      titleEmphasis="fast trading screens"
      subtitle="Built for trading desks and portals that need every chart, table and price to render in under 5 ms."
      primaryCtaText="Deploy a node"
      secondaryCtaText="Read the whitepaper"
      onprimaryclick={ondeployclick}
      onsecondaryclick={ondocsclick}
    />

    <LogoCloud title="Trusted by trading desks and liquidity providers" logos={logoList} />

    <div id="telemetry">
      <StatsSection stats={statsList} />
    </div>

    {#if interactiveSlot}
      <div class="joy-landing-page__slot">
        {@render interactiveSlot()}
      </div>
    {/if}

    <div id="features" class="joy-landing-page__features">
      <FeatureGrid columns={3}>
        {#snippet children()}
          <FeatureCard
            title="Fast order matching"
            description="Co-located matching engines process up to 2.4M orders a second with steady, predictable timing."
            linkText="See the engine"
            linkHref="#features"
          >
            {#snippet icon()}<Cpu size="1.5rem" />{/snippet}
            {#snippet badge()}<Badge variant="brand" size="sm">FPGA-Core</Badge>{/snippet}
          </FeatureCard>
          <FeatureCard
            title="Tested light and dark themes"
            description="Light and dark themes keep text at WCAG 2.2 AA contrast on every component."
            linkText="Browse tokens"
            linkHref="#features"
          >
            {#snippet icon()}<Layers size="1.5rem" />{/snippet}
            {#snippet badge()}<Badge variant="success" size="sm">WCAG AA</Badge>{/snippet}
          </FeatureCard>
          <FeatureCard
            title="Tables that fit phones"
            description="Wide market tables turn into clear stacked cards on small screens."
            linkText="Try the demo"
            linkHref="#features"
          >
            {#snippet icon()}<Smartphone size="1.5rem" />{/snippet}
            {#snippet badge()}<Badge variant="warning" size="sm">Adaptive</Badge>{/snippet}
          </FeatureCard>
        {/snippet}
      </FeatureGrid>
    </div>

    <div id="faq">
      <FAQSection
        title="Frequently asked questions"
        subtitle="Answers on architecture, speed and security."
        items={faqList}
      />
    </div>

    <CTASection
      title="Build fast, exact trading interfaces"
      description="Get low-latency screens, dense financial tables and verified WCAG 2.2 contrast in one design system."
      primaryCtaText="Deploy a node"
      secondaryCtaText="Contact sales"
      onprimaryclick={ondeployclick}
      onsecondaryclick={ondocsclick}
    />
  </main>

  <SiteFooter
    brandTitle="Joymify Design"
    brandDescription="Design tokens and UI parts for trading products."
    columns={footerCols}
  />
</div>
