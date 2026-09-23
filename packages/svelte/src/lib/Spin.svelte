<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    spinning?: boolean;
    size?: 'sm' | 'md' | 'lg';
    tip?: string;
    children?: Snippet;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    spinning = true,
    size = 'md',
    tip = '',
    children,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const sizePx = $derived({
    sm: 16,
    md: 24,
    lg: 36
  }[size] || 24);
</script>

{#snippet indicator()}
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
    aria-hidden="true"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
  </svg>
  {#if tip}
    <span class="joy-spin__tip">{tip}</span>
  {/if}
{/snippet}

{#if children}
  <div bind:this={ref} class="joy-spin__container {className}" {...rest}>
    {@render children()}
    {#if spinning}
      <div class="joy-spin__mask" role="status" aria-busy="true">
        <div class="joy-spin">
          {@render indicator()}
        </div>
      </div>
    {/if}
  </div>
{:else if spinning}
  <div bind:this={ref} class="joy-spin {className}" role="status" aria-busy="true" {...rest}>
    {@render indicator()}
  </div>
{/if}
