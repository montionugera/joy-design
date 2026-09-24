<script lang="ts">
  import { rovingNextIndex, rovingTabbableIndex } from './roving-utils.js';

  export interface MenuItem {
    key: string;
    label: string;
    icon?: string;
    disabled?: boolean;
    children?: MenuItem[];
  }

  interface Props {
    items: MenuItem[];
    selectedKey?: string;
    mode?: 'horizontal' | 'vertical' | 'inline';
    onselect?: (key: string) => void;
    class?: string;
    ref?: HTMLUListElement | null;
    [key: string]: any;
  }

  let {
    items = [],
    selectedKey = $bindable(''),
    mode = 'horizontal',
    onselect,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  // Roving tabindex: exactly one item is in the tab order, the one that last had focus, else the selected one.
  let focusIndex = $state(-1);
  let disabledFlags = $derived(items.map((item) => !!item.disabled));
  let tabbable = $derived(
    rovingTabbableIndex(disabledFlags, [focusIndex, items.findIndex((item) => item.key === selectedKey)])
  );
  // A horizontal menu answers to Left/Right as well as Up/Down; vertical menus answer to Up/Down only.
  let orientation = $derived<'both' | 'vertical'>(mode === 'horizontal' ? 'both' : 'vertical');

  function handleSelect(item: MenuItem) {
    if (item.disabled) return;
    selectedKey = item.key;
    onselect?.(item.key);
  }

  function handleKeydown(e: KeyboardEvent, item: MenuItem, index: number) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(item);
      return;
    }
    const next = rovingNextIndex(e.key, index, disabledFlags, orientation);
    if (next < 0) return;
    e.preventDefault();
    const els = (e.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>(':scope > [role="menuitem"]');
    els?.[next]?.focus();
  }
</script>

<ul
  bind:this={ref}
  class="joy-menu joy-menu--{mode} {className}"
  role="menu"
  aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
  {...rest}
>
  {#each items as item, index (item.key)}
    <li
      class="joy-menu__item"
      class:joy-menu__item--active={selectedKey === item.key}
      class:joy-menu__item--disabled={item.disabled}
      role="menuitem"
      aria-current={selectedKey === item.key ? 'page' : undefined}
      aria-disabled={item.disabled}
      tabindex={index === tabbable ? 0 : -1}
      onclick={() => handleSelect(item)}
      onfocus={() => (focusIndex = index)}
      onkeydown={(e) => handleKeydown(e, item, index)}
    >
      {#if item.icon}
        <span class="joy-menu__item-icon">{@html item.icon}</span>
      {/if}
      <span class="joy-menu__item-text">{item.label}</span>
    </li>
  {/each}
</ul>
