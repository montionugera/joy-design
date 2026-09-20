<script lang="ts">
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
  }

  let {
    items = [],
    selectedKey = $bindable(''),
    mode = 'horizontal',
    onselect
  }: Props = $props();

  function handleSelect(item: MenuItem) {
    if (item.disabled) return;
    selectedKey = item.key;
    onselect?.(item.key);
  }
</script>

<ul class="joy-menu joy-menu--{mode}" role="menu">
  {#each items as item}
    <li
      class="joy-menu__item"
      class:joy-menu__item--active={selectedKey === item.key}
      class:joy-menu__item--disabled={item.disabled}
      role="menuitem"
      aria-disabled={item.disabled}
      tabindex={item.disabled ? -1 : 0}
      onclick={() => handleSelect(item)}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(item); } }}
    >
      {#if item.icon}
        <span class="joy-menu__item-icon">{@html item.icon}</span>
      {/if}
      <span class="joy-menu__item-text">{item.label}</span>
    </li>
  {/each}
</ul>
