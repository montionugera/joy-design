<script lang="ts">
  interface Column<T> {
    key: keyof T | string;
    title: string;
    width?: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
  }

  interface Props<T> {
    columns: Column<T>[];
    data: T[];
    density?: 'compact' | 'normal';
    responsive?: 'scroll' | 'stack' | boolean;
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    onsort?: (key: string, direction: 'asc' | 'desc') => void;
    class?: string;
  }

  let {
    columns,
    data,
    density = 'compact',
    responsive = 'stack',
    sortKey = $bindable(''),
    sortDirection = $bindable<'asc' | 'desc'>('asc'),
    onsort,
    class: className = ''
  }: Props<any> = $props();

  let isStack = $derived(responsive === 'stack' || responsive === true);

  function handleHeaderClick(col: Column<any>) {
    if (!col.sortable) return;
    const key = String(col.key);
    let nextDir: 'asc' | 'desc' = 'asc';
    if (sortKey === key) {
      nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    sortKey = key;
    sortDirection = nextDir;
    onsort?.(key, nextDir);
  }
</script>

<div class="joy-table-container {isStack ? 'joy-table-container--responsive-stack' : ''} {className}">
  <table class="joy-table joy-table--{density} {isStack ? 'joy-table--responsive-stack' : ''}">
    <thead>
      <tr>
        {#each columns as col}
          <th
            style={col.width ? `width: ${col.width}; text-align: ${col.align || 'left'}` : `text-align: ${col.align || 'left'}`}
            class:joy-table-th--sortable={col.sortable}
            class:joy-table-th--sorted-asc={sortKey === String(col.key) && sortDirection === 'asc'}
            class:joy-table-th--sorted-desc={sortKey === String(col.key) && sortDirection === 'desc'}
            onclick={() => handleHeaderClick(col)}
          >
            <span>{col.title}</span>
            {#if col.sortable}
              <span class="joy-table-sort-icon">
                {#if sortKey === String(col.key)}
                  {#if sortDirection === 'asc'}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Sorted ascending">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  {:else}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Sorted descending">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  {/if}
                {:else}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Sortable">
                    <path d="m7 15 5 5 5-5"></path>
                    <path d="m7 9 5-5 5 5"></path>
                  </svg>
                {/if}
              </span>
            {/if}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as row}
        <tr>
          {#each columns as col}
            <td
              data-label={col.title}
              style="text-align: {col.align || 'left'};"
              class:joy-table-cell--flash-up={row._flash?.[col.key] === 'up'}
              class:joy-table-cell--flash-down={row._flash?.[col.key] === 'down'}
            >
              {row[col.key] ?? ''}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
