<script lang="ts">
  import { TrendingUp, TrendingDown } from '@joymify/icons';

  interface Props {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    title,
    value,
    change,
    trend = 'neutral',
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();
</script>

<div bind:this={ref} class="joy-metric-tile joy-metric-tile--{trend} {className}" {...rest}>
  <div class="joy-metric-tile__title">{title}</div>
  <div class="joy-metric-tile__value">{value}</div>
  {#if change}
    <div class="joy-metric-tile__change">
      {#if trend === 'up'}
        <TrendingUp size="1em" /><span class="joy-metric-tile__sr">Increase: </span>
      {:else if trend === 'down'}
        <TrendingDown size="1em" /><span class="joy-metric-tile__sr">Decrease: </span>
      {/if}
      <span>{change}</span>
    </div>
  {/if}
</div>

<style>
  .joy-metric-tile {
    padding: var(--joy-space-4);
    background: var(--joy-surface-card);
    border: 1px solid var(--joy-border-default);
    border-radius: var(--joy-radius-card);
    display: flex;
    flex-direction: column;
    gap: var(--joy-space-1);
    font-family: var(--joy-font-family-sans);
  }
  .joy-metric-tile__title {
    font-size: var(--joy-font-size-sm);
    color: var(--joy-text-muted);
  }
  .joy-metric-tile__value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--joy-text-primary);
    font-family: var(--joy-font-family-mono);
  }
  .joy-metric-tile__change {
    display: inline-flex;
    align-items: center;
    gap: var(--joy-space-1);
    font-size: var(--joy-font-size-xs);
    font-weight: 600;
  }
  .joy-metric-tile__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .joy-metric-tile--up .joy-metric-tile__change {
    color: var(--joy-status-success-fg);
  }
  .joy-metric-tile--down .joy-metric-tile__change {
    color: var(--joy-status-danger-fg);
  }
  .joy-metric-tile--neutral .joy-metric-tile__change {
    color: var(--joy-text-muted);
  }
</style>
