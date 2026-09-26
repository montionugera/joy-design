<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import LandingAction from './LandingAction.svelte';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'title'> {
    badgeText?: string;
    title?: string;
    titleEmphasis?: string;
    subtitle?: string;
    primaryCtaText?: string;
    secondaryCtaText?: string;
    primaryHref?: string;
    secondaryHref?: string;
    primaryLoading?: boolean;
    primaryDisabled?: boolean;
    secondaryDisabled?: boolean;
    onprimaryclick?: (e: MouseEvent) => void;
    onsecondaryclick?: (e: MouseEvent) => void;
    previewSlot?: Snippet;
    class?: string;
    ref?: HTMLElement | null;
  }

  let {
    badgeText,
    title,
    titleEmphasis,
    subtitle,
    primaryCtaText = 'Get started free',
    secondaryCtaText = 'Explore documentation',
    primaryHref,
    secondaryHref,
    primaryLoading = false,
    primaryDisabled = false,
    secondaryDisabled = false,
    onprimaryclick,
    onsecondaryclick,
    previewSlot,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();
</script>

<section bind:this={ref} class="joy-hero {className}" {...rest}>
  {#if badgeText}
    <div class="joy-hero__badge">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      {badgeText}
    </div>
  {/if}

  {#if title || titleEmphasis}
    <h1 class="joy-hero__title">
      {title}{#if titleEmphasis}{#if title}{' '}{/if}<span class="joy-hero__title-emphasis">{titleEmphasis}</span>{/if}
    </h1>
  {/if}

  {#if subtitle}
    <p class="joy-hero__subtitle">{subtitle}</p>
  {/if}

  <div class="joy-hero__ctas">
    {#if primaryCtaText}
      <LandingAction variant="solid" href={primaryHref} loading={primaryLoading} disabled={primaryDisabled} onclick={onprimaryclick}>
        {primaryCtaText}
      </LandingAction>
    {/if}
    {#if secondaryCtaText}
      <LandingAction variant="outline" class="joy-hero__secondary-cta" href={secondaryHref} disabled={secondaryDisabled} onclick={onsecondaryclick}>
        {secondaryCtaText}
      </LandingAction>
    {/if}
  </div>

  {#if previewSlot}
    <div class="joy-hero__preview">
      {@render previewSlot()}
    </div>
  {/if}
</section>
