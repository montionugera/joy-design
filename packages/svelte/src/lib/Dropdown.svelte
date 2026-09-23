<script lang="ts">
  import type { Snippet } from 'svelte';
  import { openOverlay } from './overlay-utils.js';
  import { rovingNextIndex } from './roving-utils.js';

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
    class?: string;
    /** The root element (`.joy-dropdown-wrapper`). */
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    items,
    onselect,
    children,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const menuId = `${uid}-menu`;

  let open = $state(false);
  let triggerEl = $state<HTMLDivElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);
  // Which item the menu focuses when it opens by keyboard: ArrowUp opens on the last one.
  let openAt: 'first' | 'last' = 'first';

  let disabledFlags = $derived(items.map((item) => !!item.disabled));

  function menuItems(): HTMLElement[] {
    return panelEl ? Array.from(panelEl.querySelectorAll<HTMLElement>('[role="menuitem"]')) : [];
  }

  // openOverlay gives Escape + outside-click dismissal (Escape returns focus to the trigger) and fixed
  // positioning, so the menu also escapes overflow:hidden ancestors.
  $effect(() => {
    if (!open || !triggerEl || !panelEl) return;
    const handle = openOverlay({ anchor: triggerEl, panel: panelEl, onClose: () => (open = false) });
    const els = menuItems();
    const start = rovingNextIndex(openAt === 'last' ? 'End' : 'Home', -1, disabledFlags, 'vertical');
    els[start]?.focus({ preventScroll: true });
    return () => handle.dispose();
  });

  function openMenu(at: 'first' | 'last' = 'first') {
    openAt = at;
    open = true;
  }

  function selectItem(item: DropdownItem) {
    if (item.disabled) return;
    open = false;
    triggerEl?.focus();
    onselect?.(item.key);
  }

  function handleTriggerKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      openMenu(e.key === 'ArrowUp' ? 'last' : 'first');
    } else if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
      // Only when the wrapper itself has focus: a real button inside turns Enter/Space into a click.
      e.preventDefault();
      if (open) open = false;
      else openMenu();
    }
  }

  function handleMenuKeydown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      // Tab leaves the menu: close it and let the browser move on from the trigger.
      open = false;
      triggerEl?.focus();
      return;
    }
    const els = menuItems();
    const current = els.indexOf(document.activeElement as HTMLElement);
    const next = rovingNextIndex(e.key, current, disabledFlags, 'vertical');
    if (next < 0) return;
    e.preventDefault();
    els[next]?.focus();
  }
</script>

<div bind:this={ref} class="joy-dropdown-wrapper {className}" {...rest}>
  <div
    bind:this={triggerEl}
    class="joy-dropdown-trigger"
    onclick={() => (open ? (open = false) : openMenu())}
    role="button"
    tabindex="0"
    aria-haspopup="menu"
    aria-expanded={open}
    aria-controls={open ? menuId : undefined}
    onkeydown={handleTriggerKeydown}
  >
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if open}
    <div
      bind:this={panelEl}
      id={menuId}
      class="joy-dropdown"
      role="menu"
      tabindex="-1"
      aria-orientation="vertical"
      onkeydown={handleMenuKeydown}
    >
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
