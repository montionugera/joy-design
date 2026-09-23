<script lang="ts">
  import { ariaSort, isSortActivationKey, nextSort } from './table-utils.js';

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
    /** `stack` turns rows into label/value cards on phones; `scroll` keeps the table and pins its first column while scrolling sideways. Omitted: follows `responsive`. */
    variant?: 'stack' | 'scroll';
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    onsort?: (key: string, direction: 'asc' | 'desc') => void;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    columns,
    data,
    density = 'compact',
    responsive = 'stack',
    variant,
    sortKey = $bindable(''),
    sortDirection = $bindable<'asc' | 'desc'>('asc'),
    onsort,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props<any> = $props();

  let isScroll = $derived(variant === 'scroll');
  let isStack = $derived(variant ? variant === 'stack' : responsive === 'stack' || responsive === true);

  function handleHeaderClick(col: Column<any>) {
    if (!col.sortable) return;
    const key = String(col.key);
    const nextDir = nextSort(sortKey, sortDirection, key);
    sortKey = key;
    sortDirection = nextDir;
    onsort?.(key, nextDir);
  }

  function handleHeaderKeydown(e: KeyboardEvent, col: Column<any>) {
    if (!col.sortable || e.target !== e.currentTarget || !isSortActivationKey(e.key)) return;
    e.preventDefault();
    handleHeaderClick(col);
  }
</script>

<div
  bind:this={ref}
  class="joy-table-container {isStack ? 'joy-table-container--responsive-stack' : ''} {isScroll ? 'joy-table-container--scroll' : ''} {className}"
  {...rest}
>
  <table class="joy-table joy-table--{density} {isStack ? 'joy-table--responsive-stack' : ''} {isScroll ? 'joy-table--scroll' : ''}">
    <thead>
      <tr>
        {#each columns as col}
          <th
            style={col.width ? `width: ${col.width}; text-align: ${col.align || 'left'}` : `text-align: ${col.align || 'left'}`}
            class:joy-table-th--sortable={col.sortable}
            class:joy-table-th--sorted-asc={sortKey === String(col.key) && sortDirection === 'asc'}
            class:joy-table-th--sorted-desc={sortKey === String(col.key) && sortDirection === 'desc'}
            tabindex={col.sortable ? 0 : undefined}
            aria-sort={col.sortable ? ariaSort(sortKey, sortDirection, String(col.key)) : undefined}
            onclick={() => handleHeaderClick(col)}
            onkeydown={(e) => handleHeaderKeydown(e, col)}
          >
            <span>{col.title}</span>
            {#if col.sortable}
              <span class="joy-table-sort-icon">
                {#if sortKey === String(col.key)}
                  {#if sortDirection === 'asc'}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                  {:else}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  {/if}
                {:else}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
