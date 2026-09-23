<script lang="ts">
  import type { Snippet } from 'svelte';

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

<style>
  .joy-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--joy-space-1);
    font-family: var(--joy-font-family-sans);
    font-weight: 600;
    border-radius: var(--joy-radius-pill);
    line-height: 1;
  }
  .joy-badge--sm {
    padding: 2px 6px;
    font-size: 0.75rem;
  }
  .joy-badge--md {
    padding: 4px 10px;
    font-size: 0.875rem;
  }
  .joy-badge__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
  }
  .joy-badge--brand {
    background-color: var(--joy-accent-subtle);
    color: var(--joy-accent-text);
  }
  .joy-badge--success {
    background-color: var(--joy-status-success-bg);
    color: var(--joy-status-success-fg);
  }
  .joy-badge--warning {
    background-color: var(--joy-status-warning-bg);
    color: var(--joy-status-warning-fg);
  }
  .joy-badge--danger {
    background-color: var(--joy-status-danger-bg);
    color: var(--joy-status-danger-fg);
  }
  .joy-badge--neutral {
    background-color: var(--joy-surface-sunken);
    color: var(--joy-text-secondary);
  }
</style>
