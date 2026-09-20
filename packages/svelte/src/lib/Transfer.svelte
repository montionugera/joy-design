<script lang="ts">
  export interface TransferItem {
    key: string;
    title: string;
    description?: string;
    disabled?: boolean;
  }

  interface Props {
    dataSource: TransferItem[];
    targetKeys?: string[];
    titles?: [string, string];
    onchange?: (nextTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
  }

  let {
    dataSource = [],
    targetKeys = $bindable<string[]>([]),
    titles = ['Source', 'Target'],
    onchange
  }: Props = $props();

  let sourceSelected = $state<string[]>([]);
  let targetSelected = $state<string[]>([]);
  let sourceSearch = $state('');
  let targetSearch = $state('');

  let sourceItems = $derived(
    dataSource
      .filter(item => !targetKeys.includes(item.key))
      .filter(item => !sourceSearch || item.title.toLowerCase().includes(sourceSearch.toLowerCase()))
  );

  let targetItems = $derived(
    dataSource
      .filter(item => targetKeys.includes(item.key))
      .filter(item => !targetSearch || item.title.toLowerCase().includes(targetSearch.toLowerCase()))
  );

  function toggleSource(key: string) {
    sourceSelected = sourceSelected.includes(key)
      ? sourceSelected.filter(k => k !== key)
      : [...sourceSelected, key];
  }

  function toggleTarget(key: string) {
    targetSelected = targetSelected.includes(key)
      ? targetSelected.filter(k => k !== key)
      : [...targetSelected, key];
  }

  function moveToTarget() {
    if (sourceSelected.length === 0) return;
    const moveKeys = [...sourceSelected];
    const next = [...targetKeys, ...moveKeys];
    targetKeys = next;
    sourceSelected = [];
    onchange?.(next, 'right', moveKeys);
  }

  function moveToSource() {
    if (targetSelected.length === 0) return;
    const moveKeys = [...targetSelected];
    const next = targetKeys.filter(k => !moveKeys.includes(k));
    targetKeys = next;
    targetSelected = [];
    onchange?.(next, 'left', moveKeys);
  }
</script>

<div class="joy-transfer">
  <!-- Left Panel -->
  <div class="joy-transfer__list">
    <div class="joy-transfer__header">
      <span class="joy-transfer__header-title">{titles[0]}</span>
      <span class="joy-transfer__header-count">{sourceSelected.length}/{sourceItems.length} items</span>
    </div>
    <div class="joy-transfer__body">
      {#each sourceItems as item}
        <label class="joy-transfer__item">
          <input
            type="checkbox"
            checked={sourceSelected.includes(item.key)}
            disabled={item.disabled}
            onchange={() => toggleSource(item.key)}
          />
          <span class="joy-transfer__item-text">{item.title}</span>
        </label>
      {/each}
      {#if sourceItems.length === 0}
        <div style="padding: 24px; text-align: center; color: var(--joy-color-text-muted, #94a3b8); font-size: 0.8125rem;">
          No items
        </div>
      {/if}
    </div>
  </div>

  <!-- Middle Operations -->
  <div class="joy-transfer__operations">
    <button
      type="button"
      class="joy-button joy-button--primary joy-button--sm"
      disabled={sourceSelected.length === 0}
      onclick={moveToTarget}
      aria-label="Move selected right"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
    <button
      type="button"
      class="joy-button joy-button--primary joy-button--sm"
      disabled={targetSelected.length === 0}
      onclick={moveToSource}
      aria-label="Move selected left"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>
  </div>

  <!-- Right Panel -->
  <div class="joy-transfer__list">
    <div class="joy-transfer__header">
      <span class="joy-transfer__header-title">{titles[1]}</span>
      <span class="joy-transfer__header-count">{targetSelected.length}/{targetItems.length} items</span>
    </div>
    <div class="joy-transfer__body">
      {#each targetItems as item}
        <label class="joy-transfer__item">
          <input
            type="checkbox"
            checked={targetSelected.includes(item.key)}
            disabled={item.disabled}
            onchange={() => toggleTarget(item.key)}
          />
          <span class="joy-transfer__item-text">{item.title}</span>
        </label>
      {/each}
      {#if targetItems.length === 0}
        <div style="padding: 24px; text-align: center; color: var(--joy-color-text-muted, #94a3b8); font-size: 0.8125rem;">
          No items
        </div>
      {/if}
    </div>
  </div>
</div>
