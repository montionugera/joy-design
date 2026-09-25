<script lang="ts">
  import type { Snippet } from 'svelte';
  import { MARK } from '@joymify/brand';
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

  // Decorative diamond lattice, same grid + right-edge fade algorithm as @joymify/brand's
  // heroBannerSvg (packages/brand/src/render.js), recomputed here (not imported) because that
  // helper bakes in a resolved hex palette and a fixed role="img" wrapper; this one is a
  // themeable `aria-hidden` overlay stroked with a `--joy-brand-*` custom property.
  const LATTICE_WIDTH = 1600;
  const LATTICE_HEIGHT = 560;
  const LATTICE_CELL = 64;
  const LATTICE_FADE_START = LATTICE_WIDTH * 0.55;
  const LATTICE_MAX_OPACITY = 0.35;
  const LATTICE_FADE_RANGE = LATTICE_WIDTH - LATTICE_CELL / 2 - LATTICE_FADE_START;

  function buildLattice() {
    const cols = Math.ceil(LATTICE_WIDTH / LATTICE_CELL);
    const rows = Math.ceil(LATTICE_HEIGHT / LATTICE_CELL) + 1;
    const diamonds: { x: number; y: number; opacity: number }[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = col * LATTICE_CELL;
        const y = row * LATTICE_CELL;
        const centerX = x + LATTICE_CELL / 2;
        if (centerX <= LATTICE_FADE_START) continue;
        const opacity = Math.min(LATTICE_MAX_OPACITY, (LATTICE_MAX_OPACITY * (centerX - LATTICE_FADE_START)) / LATTICE_FADE_RANGE);
        if (opacity <= 0) continue;
        diamonds.push({ x, y, opacity: Math.round(opacity * 100) / 100 });
      }
    }
    return diamonds;
  }

  const lattice = buildLattice();
</script>

<section class="joy-brand-banner joy-brand-banner--{align} {className}">
  <svg class="joy-brand-banner__lattice" viewBox="0 0 {LATTICE_WIDTH} {LATTICE_HEIGHT}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    {#each lattice as diamond}
      <g transform="translate({diamond.x} {diamond.y}) scale(2)">
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
