<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface StatItem {
    label: string;
    value: string | number;
    description?: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
  }

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'> {
    stats: StatItem[];
    class?: string;
    ref?: HTMLElement | null;
  }

  let {
    stats,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();
</script>

<section bind:this={ref} class="joy-stats-section {className}" {...rest}>
  <div class="joy-stats-grid">
    {#each stats as item}
      <div class="joy-stat-item">
        <div class="joy-stat-item__value">{item.value}</div>
        <div class="joy-stat-item__label">{item.label}</div>
        {#if item.description}
          <p class="joy-stat-item__desc">{item.description}</p>
        {/if}
        {#if item.change}
          <div
            class="joy-stat-item__change"
            class:joy-stat-item__change--positive={item.trend === 'up'}
            class:joy-stat-item__change--negative={item.trend === 'down'}
          >
            {#if item.trend === 'up' || item.trend === 'down'}
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points={item.trend === 'up' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}></polyline>
              </svg>
              <span class="joy-stat-item__sr">{item.trend === 'up' ? 'Trend up:' : 'Trend down:'}</span>
            {/if}
            <span class="joy-stat-item__change-text">{item.change}</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
