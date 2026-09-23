<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * Variant modifiers: joy-badge--neutral, joy-badge--success, joy-badge--warning,
   * joy-badge--danger, joy-badge--brand. Size modifiers: joy-badge--sm, joy-badge--md.
   * Colors come from theme.css tokens (brand = accent-subtle / accent-text); this component has no scoped style.
   */
  interface Props {
    variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
    size?: 'sm' | 'md';
    dot?: boolean;
    children?: Snippet;
    class?: string;
    ref?: HTMLSpanElement | null;
  }

  let {
    variant = 'neutral',
    size = 'md',
    dot = false,
    children,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();
</script>

<span bind:this={ref} class="joy-badge joy-badge--{variant} joy-badge--{size} {className}" {...rest}>
  {#if dot}
    <span class="joy-badge__dot" aria-hidden="true"></span>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</span>
