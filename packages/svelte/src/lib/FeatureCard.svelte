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
  }

  let {
    title,
    description,
    icon,
    badge,
    linkText,
    linkHref = '#',
    onlinkclick,
    class: className = ''
  }: Props = $props();
</script>

<div class="joy-feature-card {className}">
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
    <a
      href={linkHref}
      class="joy-feature-card__link"
      onclick={(e) => {
        if (onlinkclick) {
          e.preventDefault();
          onlinkclick();
        }
      }}
    >
      {linkText}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    </a>
  {/if}
</div>
