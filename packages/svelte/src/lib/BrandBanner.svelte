<script lang="ts">
  import type { Snippet } from 'svelte';
  import { MARK, heroLattice } from '@joymify/brand';
  import LandingAction from './LandingAction.svelte';

  interface Props {
    eyebrow?: string;
    title: string;
    lede?: string;
    primaryCtaText?: string;
    primaryCtaHref?: string;
    secondaryCtaText?: string;
    secondaryCtaHref?: string;
    align?: 'start' | 'center';
    children?: Snippet;
    class?: string;
  }

  let {
    eyebrow,
    title,
    lede,
    primaryCtaText,
    primaryCtaHref,
    secondaryCtaText,
    secondaryCtaHref,
    align = 'start',
    children,
    class: className = ''
  }: Props = $props();

  // Decorative diamond lattice: the same grid + right-edge fade as @joymify/brand's hero-banner.svg
  // asset (packages/brand/src/render.js's heroBannerSvg), sourced from the shared `heroLattice`
  // helper so the two can never drift apart. This is an `aria-hidden` overlay stroked with a
  // `--joy-brand-*` custom property rather than heroBannerSvg's fixed role="img" + resolved-hex
  // wrapper.
  const lattice = heroLattice();
</script>

<section class="joy-brand-banner {className}" class:joy-brand-banner--center={align === 'center'}>
  <svg class="joy-brand-banner__lattice" viewBox="0 0 {lattice.width} {lattice.height}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    {#each lattice.diamonds as diamond}
      <g transform="translate({diamond.x} {diamond.y}) scale({lattice.diamondScale})">
        <path d={MARK.outline} fill="none" stroke="var(--joy-brand-mark-on-tile)" stroke-width="0.5" stroke-opacity={diamond.opacity} />
      </g>
    {/each}
  </svg>
  <div class="joy-brand-banner__content">
    {#if eyebrow}
      <p class="joy-brand-banner__eyebrow">{eyebrow}</p>
    {/if}
    <h2 class="joy-brand-banner__title">{title}</h2>
    {#if lede}
      <p class="joy-brand-banner__lede">{lede}</p>
    {/if}
    {#if primaryCtaText || secondaryCtaText}
      <div class="joy-brand-banner__ctas">
        {#if primaryCtaText}
          <LandingAction variant="solid" href={primaryCtaHref}>{primaryCtaText}</LandingAction>
        {/if}
        {#if secondaryCtaText}
          <LandingAction variant="outline" href={secondaryCtaHref}>{secondaryCtaText}</LandingAction>
        {/if}
      </div>
    {/if}
    {@render children?.()}
  </div>
</section>
