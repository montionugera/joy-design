<script lang="ts">
  import LandingAction from './LandingAction.svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'title'> {
    title: string;
    description?: string;
    primaryCtaText?: string;
    secondaryCtaText?: string;
    primaryHref?: string;
    secondaryHref?: string;
    primaryLoading?: boolean;
    primaryDisabled?: boolean;
    secondaryDisabled?: boolean;
    onprimaryclick?: (e: MouseEvent) => void;
    onsecondaryclick?: (e: MouseEvent) => void;
    class?: string;
    ref?: HTMLElement | null;
  }

  let {
    title,
    description,
    primaryCtaText = 'Get started today',
    secondaryCtaText = 'Contact sales',
    primaryHref,
    secondaryHref,
    primaryLoading = false,
    primaryDisabled = false,
    secondaryDisabled = false,
    onprimaryclick,
    onsecondaryclick,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const titleId = `joy-cta-title-${uid}`;
</script>

<section bind:this={ref} class="joy-cta-section {className}" aria-labelledby={rest['aria-label'] ? undefined : titleId} {...rest}>
  <div class="joy-cta-section__container">
    <h2 class="joy-cta-section__title" id={titleId}>{title}</h2>
    {#if description}
      <p class="joy-cta-section__desc">{description}</p>
    {/if}
    <div class="joy-cta-section__actions">
      {#if primaryCtaText}
        <LandingAction variant="solid" href={primaryHref} loading={primaryLoading} disabled={primaryDisabled} onclick={onprimaryclick}>
          {primaryCtaText}
        </LandingAction>
      {/if}
      {#if secondaryCtaText}
        <LandingAction variant="outline" href={secondaryHref} disabled={secondaryDisabled} onclick={onsecondaryclick}>
          {secondaryCtaText}
        </LandingAction>
      {/if}
    </div>
  </div>
</section>
