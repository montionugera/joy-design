<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@joymify/icons';
  import { clampPage, pageCount, pageItems } from './pagination-utils.js';

  interface Props {
    current?: number;
    pageSize?: number;
    total?: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
    onchange?: (page: number, pageSize: number) => void;
    class?: string;
    ref?: HTMLElement | null;
    [key: string]: any;
  }

  let {
    current = $bindable(1),
    pageSize = $bindable(10),
    total = 0,
    showSizeChanger = false,
    pageSizeOptions = [10, 20, 50],
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  let totalPages = $derived(pageCount(total, pageSize));
  // A parent can leave `current` stale when `total` shrinks: everything below works from the clamped page.
  let page = $derived(clampPage(current, totalPages));

  // Phones show only Previous, the current page and Next. Desktop-first default keeps SSR output full.
  let compact = $state(false);
  $effect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(max-width: 480px)');
    compact = query.matches;
    const sync = (e: MediaQueryListEvent) => (compact = e.matches);
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  });

  let pages = $derived(pageItems(page, totalPages, compact));

  function goToPage(p: number) {
    if (p < 1 || p > totalPages || p === page) return;
    current = p;
    onchange?.(current, pageSize);
  }

  function handlePageSizeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    pageSize = Number(target.value);
    current = 1;
    onchange?.(current, pageSize);
  }
</script>

<nav bind:this={ref} class="joy-pagination {className}" role="navigation" aria-label="Pagination" {...rest}>
  <button
    type="button"
    class="joy-pagination__btn"
    disabled={page <= 1}
    onclick={() => goToPage(page - 1)}
    aria-label="Previous page"
  >
    <ChevronLeft size="1em" />
  </button>

  {#each pages as p (p)}
    {#if typeof p === 'number'}
      <button
        type="button"
        class="joy-pagination__btn"
        class:joy-pagination__btn--active={p === page}
        onclick={() => goToPage(p)}
        aria-label="Page {p}"
        aria-current={p === page ? 'page' : undefined}
      >
        {p}
      </button>
    {:else}
      <span class="joy-pagination__ellipsis" aria-hidden="true">…</span>
    {/if}
  {/each}

  <button
    type="button"
    class="joy-pagination__btn"
    disabled={page >= totalPages}
    onclick={() => goToPage(page + 1)}
    aria-label="Next page"
  >
    <ChevronRight size="1em" />
  </button>

  {#if showSizeChanger}
    <select
      class="joy-select"
      style="width: auto; padding: 4px 28px 4px 8px; font-size: 0.8125rem; margin-left: 8px;"
      value={pageSize}
      onchange={handlePageSizeChange}
      aria-label="Items per page"
    >
      {#each pageSizeOptions as size}
        <option value={size}>{size} / page</option>
      {/each}
    </select>
  {/if}

  {#if !compact}
    <span class="joy-pagination__info">
      Total: {total} items
    </span>
  {/if}
</nav>
