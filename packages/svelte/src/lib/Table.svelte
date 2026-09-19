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
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    onsort?: (key: string, direction: 'asc' | 'desc') => void;
  }

  let {
    columns,
    data,
    density = 'compact',
    sortKey = $bindable(''),
    sortDirection = $bindable<'asc' | 'desc'>('asc'),
    onsort
  }: Props<any> = $props();

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

<div class="joy-table-container">
  <table class="joy-table joy-table--{density}">
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
                  {sortDirection === 'asc' ? '▲' : '▼'}
                {:else}
                  ⇅
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
