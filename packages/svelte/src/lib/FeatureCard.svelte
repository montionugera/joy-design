<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    description: string;
    icon?: Snippet;
    badge?: Snippet;
    linkText?: string;
    linkHref?: string;
    onlinkclick?: () => void;
    class?: string;
    ref?: HTMLDivElement | null;
  }

  let {
    title,
    description,
    icon,
    badge,
    linkText,
    linkHref,
    onlinkclick,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  // A handler with no destination is an action, not a link: a real button, so there is no fake "#" anchor to
  // middle-click or scroll to the top of the page.
  const asButton = $derived(linkHref === undefined && !!onlinkclick);
</script>

<div bind:this={ref} class="joy-feature-card {className}" {...rest}>
  {#if badge}
    <div class="joy-feature-card__badge">
      {@render badge()}
    </div>
  {/if}
  {#if icon}
    <div class="joy-feature-card__icon">
      {@render icon()}
    </div>
  {/if}
  <h3 class="joy-feature-card__title">{title}</h3>
  <p class="joy-feature-card__desc">{description}</p>
  {#if linkText}
    {#if asButton}
      <button type="button" class="joy-feature-card__link" onclick={() => onlinkclick?.()}>{linkText}</button>
    {:else}
      <a
        href={linkHref ?? '#'}
        class="joy-feature-card__link"
        onclick={(e) => {
          if (onlinkclick) {
            e.preventDefault();
            onlinkclick();
          }
        }}>{linkText}</a
      >
    {/if}
  {/if}
</div>
