<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface TabItem {
    key: string;
    label: string;
    content?: Snippet;
  }

  interface Props {
    items: TabItem[];
    activeKey?: string;
    onchange?: (key: string) => void;
  }

  let { items, activeKey = $bindable(items[0]?.key || ''), onchange }: Props = $props();

  function selectTab(key: string) {
    activeKey = key;
    onchange?.(key);
  }
</script>

<div class="joy-tabs-container">
  <div class="joy-tabs" role="tablist">
    {#each items as item (item.key)}
      <button
        type="button"
        role="tab"
        aria-selected={activeKey === item.key}
        class="joy-tab-btn {activeKey === item.key ? 'joy-tab-btn--active' : ''}"
        onclick={() => selectTab(item.key)}
      >
        {item.label}
      </button>
    {/each}
  </div>

  <div class="joy-tab-content" role="tabpanel">
    {#each items as item (item.key)}
      {#if activeKey === item.key && item.content}
        {@render item.content()}
      {/if}
    {/each}
  </div>
</div>
