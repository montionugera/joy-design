<script lang="ts">
  interface Props {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
  }

  let { title, value, change, trend = 'neutral' }: Props = $props();
</script>

<div class="joy-metric-tile joy-metric-tile--{trend}">
  <div class="joy-metric-tile__title">{title}</div>
  <div class="joy-metric-tile__value">{value}</div>
  {#if change}
    <div class="joy-metric-tile__change">
      {#if trend === 'up'}▲{:else if trend === 'down'}▼{/if} {change}
    </div>
  {/if}
</div>

<style>
  .joy-metric-tile {
    padding: var(--joy-spacing-4, 16px);
    background: var(--joy-color-surface-subtle, #f8fafc);
    border: 1px solid var(--joy-color-surface-muted, #f1f5f9);
    border-radius: var(--joy-radius-md, 8px);
    display: flex;
    flex-direction: column;
    gap: var(--joy-spacing-1, 4px);
    font-family: var(--joy-font-family-sans, sans-serif);
  }
  .joy-metric-tile__title {
    font-size: 0.875rem;
    color: var(--joy-color-text-muted, #64748b);
  }
  .joy-metric-tile__value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--joy-color-text-primary, #0f172a);
    font-family: var(--joy-font-family-mono, monospace);
  }
  .joy-metric-tile__change {
    font-size: 0.75rem;
    font-weight: 600;
  }
  .joy-metric-tile--up .joy-metric-tile__change {
    color: var(--joy-color-status-success, #10b981);
  }
  .joy-metric-tile--down .joy-metric-tile__change {
    color: var(--joy-color-status-danger, #ef4444);
  }
  .joy-metric-tile--neutral .joy-metric-tile__change {
    color: var(--joy-color-text-muted, #64748b);
  }
</style>
