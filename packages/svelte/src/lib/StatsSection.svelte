<script lang="ts">
  interface StatItem {
    label: string;
    value: string | number;
    description?: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
  }

  interface Props {
    stats: StatItem[];
    class?: string;
  }

  let {
    stats,
    class: className = ''
  }: Props = $props();
</script>

<section class="joy-stats-section {className}">
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
            {#if item.trend === 'up'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            {:else if item.trend === 'down'}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            {/if}
            {item.change}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>
