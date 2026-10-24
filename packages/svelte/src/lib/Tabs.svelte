<script lang="ts">
  import type { Snippet } from 'svelte';
  import { rovingNextIndex, rovingTabbableIndex } from './roving-utils.js';

  export interface TabItem {
    key: string;
    label: string;
    content?: Snippet;
  }

  interface Props {
    items: TabItem[];
    activeKey?: string;
    onchange?: (key: string) => void;
    /** Accessible name for the tablist. */
    label?: string;
    class?: string;
    ref?: HTMLElement | null;
    [key: string]: any;
  }

  let {
    items,
    activeKey = $bindable(items[0]?.key || ''),
    onchange,
    label,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const uid = $props.id();

  let activeIndex = $derived(items.findIndex((item) => item.key === activeKey));
  // Tabs are never disabled; the helper still owns "which tab is in the tab order" so both twins agree.
  let noneDisabled = $derived(items.map(() => false));
  let tabbable = $derived(rovingTabbableIndex(noneDisabled, [activeIndex]));

  function selectTab(key: string) {
    activeKey = key;
    onchange?.(key);
  }

  // WAI-ARIA tablist with automatic activation: arrows/Home/End move focus AND select.
  function handleKeydown(e: KeyboardEvent, index: number) {
    const next = rovingNextIndex(e.key, index, noneDisabled, 'horizontal');
    if (next < 0) return;
    e.preventDefault();
    selectTab(items[next].key);
    const tabs = (e.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>('[role="tab"]');
    tabs?.[next]?.focus();
  }
</script>

<div bind:this={ref} class="joy-tabs-container {className}" {...rest}>
  <div class="joy-tabs" role="tablist" aria-orientation="horizontal" aria-label={label}>
    {#each items as item, index (item.key)}
      <button
        type="button"
        role="tab"
        id="{uid}-tab-{index}"
        aria-selected={activeKey === item.key}
        aria-controls={activeKey === item.key ? `${uid}-panel` : undefined}
        tabindex={index === tabbable ? 0 : -1}
        class="joy-tab-btn {activeKey === item.key ? 'joy-tab-btn--active' : ''}"
        onclick={() => selectTab(item.key)}
        onkeydown={(e) => handleKeydown(e, index)}
      >
        {item.label}
      </button>
    {/each}
  </div>

  <div class="joy-tab-content" role="tabpanel" id="{uid}-panel" aria-labelledby={activeIndex >= 0 ? `${uid}-tab-${activeIndex}` : undefined}>
    {#each items as item (item.key)}
      {#if activeKey === item.key && item.content}
        {@render item.content()}
      {/if}
    {/each}
  </div>
</div>
