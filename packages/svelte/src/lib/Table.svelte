<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Column<T> {
    key: keyof T | string;
    title: string;
    width?: string;
  }

  interface Props<T> {
    columns: Column<T>[];
    data: T[];
    density?: 'compact' | 'normal';
  }

  let { columns, data, density = 'compact' }: Props<any> = $props();
</script>

<div class="joy-table-container">
  <table class="joy-table joy-table--{density}">
    <thead>
      <tr>
        {#each columns as col}
          <th style={col.width ? `width: ${col.width}` : ''}>{col.title}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each data as row, idx}
        <tr>
          {#each columns as col}
            <td>{row[col.key] ?? ''}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .joy-table-container {
    width: 100%;
    overflow-x: auto;
    border: 1px solid var(--joy-color-surface-muted, #f1f5f9);
    border-radius: var(--joy-radius-md, 8px);
  }
  .joy-table {
    width: 100%;
    border-collapse: collapse;
    font-family: var(--joy-font-family-sans, sans-serif);
    font-size: 0.875rem;
    text-align: left;
  }
  th {
    background: var(--joy-color-surface-subtle, #f8fafc);
    color: var(--joy-color-text-muted, #64748b);
    font-weight: 600;
    border-bottom: 1px solid var(--joy-color-surface-muted, #e2e8f0);
  }
  td {
    border-bottom: 1px solid var(--joy-color-surface-muted, #f1f5f9);
    color: var(--joy-color-text-primary, #0f172a);
  }
  .joy-table--compact th, .joy-table--compact td {
    padding: var(--joy-spacing-1, 4px) var(--joy-spacing-2, 8px);
  }
  .joy-table--normal th, .joy-table--normal td {
    padding: var(--joy-spacing-2, 8px) var(--joy-spacing-4, 16px);
  }
  tbody tr:hover {
    background-color: var(--joy-color-surface-subtle, #f8fafc);
  }
</style>
