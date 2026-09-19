<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface DropdownItem {
    key: string;
    label: string;
    disabled?: boolean;
    danger?: boolean;
  }

  interface Props {
    items: DropdownItem[];
    onselect?: (key: string) => void;
    children?: Snippet;
  }

  let { items, onselect, children }: Props = $props();
  let open = $state(false);

  function selectItem(item: DropdownItem) {
    if (item.disabled) return;
    open = false;
    onselect?.(item.key);
  }
</script>

<div class="joy-dropdown-wrapper">
  <div 
    class="joy-dropdown-trigger" 
    onclick={() => open = !open}
    role="button"
    tabindex="0"
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') open = !open; }}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if open}
    <div class="joy-dropdown" role="menu">
      {#each items as item (item.key)}
        <button
          type="button"
          role="menuitem"
          class="joy-dropdown__item {item.danger ? 'joy-dropdown__item--danger' : ''}"
          disabled={item.disabled}
          onclick={() => selectItem(item)}
        >
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
