<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    description?: string;
    variant?: 'info' | 'success' | 'warning' | 'danger';
    children?: Snippet;
  }

  let { title, description, variant = 'info', children }: Props = $props();
</script>

<div class="joy-alert joy-alert--{variant}" role="alert">
  {#if title}
    <div class="joy-alert__title">{title}</div>
  {/if}
  {#if description}
    <div class="joy-alert__desc">{description}</div>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .joy-alert {
    padding: var(--joy-spacing-3, 12px) var(--joy-spacing-4, 16px);
    border-radius: var(--joy-radius-md, 8px);
    font-family: var(--joy-font-family-sans, sans-serif);
    border-left: 4px solid;
    margin-bottom: var(--joy-spacing-3, 12px);
  }
  .joy-alert__title {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 2px;
  }
  .joy-alert__desc {
    font-size: 0.875rem;
    color: var(--joy-color-text-primary, #0f172a);
  }
  .joy-alert--info {
    background-color: #eff6ff;
    border-color: var(--joy-color-status-info, #3b82f6);
    color: #1e40af;
  }
  .joy-alert--success {
    background-color: #ecfdf5;
    border-color: var(--joy-color-status-success, #10b981);
    color: #065f46;
  }
  .joy-alert--warning {
    background-color: #fffbeb;
    border-color: var(--joy-color-status-warning, #f59e0b);
    color: #92400e;
  }
  .joy-alert--danger {
    background-color: #fef2f2;
    border-color: var(--joy-color-status-danger, #ef4444);
    color: #991b1b;
  }
</style>
