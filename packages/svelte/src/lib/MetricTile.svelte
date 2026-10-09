<script lang="ts">
  import { TrendingUp, TrendingDown } from '@montionugera/joy-icons';

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
