<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    spinning?: boolean;
    size?: 'sm' | 'md' | 'lg';
    tip?: string;
    children?: Snippet;
  }

  let {
    spinning = true,
    size = 'md',
    tip = '',
    children
  }: Props = $props();

  const sizePx = {
    sm: 16,
    md: 24,
    lg: 36
  }[size] || 24;
</script>

{#if children}
  <div class="joy-spin__container">
    {@render children()}
    {#if spinning}
      <div class="joy-spin__mask" role="status" aria-busy="true">
        <div class="joy-spin" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <svg
            class="joy-spin__indicator"
            width={sizePx}
            height={sizePx}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
          {#if tip}
            <span style="font-size: 0.8125rem; color: var(--joy-color-brand-primary, #7c3aed);">{tip}</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{:else if spinning}
  <div class="joy-spin" role="status" aria-busy="true" style="display: inline-flex; flex-direction: column; align-items: center; gap: 8px;">
    <svg
      class="joy-spin__indicator"
      width={sizePx}
      height={sizePx}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
    {#if tip}
      <span style="font-size: 0.8125rem; color: var(--joy-color-brand-primary, #7c3aed);">{tip}</span>
    {/if}
  </div>
{/if}
