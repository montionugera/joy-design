<script lang="ts">
  interface Props {
    current?: number;
    pageSize?: number;
    total?: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
    onchange?: (page: number, pageSize: number) => void;
  }

  let {
    current = $bindable(1),
    pageSize = $bindable(10),
    total = 0,
    showSizeChanger = false,
    pageSizeOptions = [10, 20, 50],
    onchange
  }: Props = $props();

  let totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));

  function goToPage(p: number) {
    if (p < 1 || p > totalPages || p === current) return;
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

<nav class="joy-pagination" role="navigation" aria-label="Pagination">
  <button
    type="button"
    class="joy-pagination__btn"
    disabled={current <= 1}
    onclick={() => goToPage(current - 1)}
    aria-label="Previous page"
  >
    &larr;
  </button>

  {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
    <button
      type="button"
      class="joy-pagination__btn"
      class:joy-pagination__btn--active={p === current}
      onclick={() => goToPage(p)}
      aria-current={p === current ? 'page' : undefined}
    >
      {p}
    </button>
  {/each}

  <button
    type="button"
    class="joy-pagination__btn"
    disabled={current >= totalPages}
    onclick={() => goToPage(current + 1)}
    aria-label="Next page"
  >
    &rarr;
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

  <span class="joy-pagination__info">
    Total: {total} items
  </span>
</nav>
