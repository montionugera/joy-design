<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand';
    size?: 'sm' | 'md';
    dot?: boolean;
    children?: Snippet;
  }

  let { variant = 'neutral', size = 'md', dot = false, children }: Props = $props();
</script>

<span class="joy-badge joy-badge--{variant} joy-badge--{size}">
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
    gap: var(--joy-spacing-1, 4px);
    font-family: var(--joy-font-family-sans, sans-serif);
    font-weight: 600;
    border-radius: var(--joy-radius-full, 9999px);
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
    background-color: #ede9fe;
    color: var(--joy-color-brand-primary, #7c3aed);
  }
  .joy-badge--success {
    background-color: #d1fae5;
    color: var(--joy-color-status-success, #10b981);
  }
  .joy-badge--warning {
    background-color: #fef3c7;
    color: var(--joy-color-status-warning, #f59e0b);
  }
  .joy-badge--danger {
    background-color: #fee2e2;
    color: var(--joy-color-status-danger, #ef4444);
  }
  .joy-badge--neutral {
    background-color: var(--joy-color-surface-muted, #f1f5f9);
    color: var(--joy-color-text-muted, #64748b);
  }
</style>
