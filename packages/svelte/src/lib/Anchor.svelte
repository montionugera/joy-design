<script lang="ts">
  export interface AnchorItem {
    key: string;
    href: string;
    title: string;
  }

  interface Props {
    items: AnchorItem[];
    activeKey?: string;
    onchange?: (key: string) => void;
    class?: string;
    ref?: HTMLElement | null;
    [key: string]: any;
  }

  let {
    items = [],
    activeKey = $bindable(''),
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  function handleClick(e: MouseEvent, item: AnchorItem) {
    e.preventDefault();
    activeKey = item.key;
    onchange?.(item.key);

    const targetEl = document.querySelector(item.href);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<nav bind:this={ref} class="joy-anchor {className}" role="navigation" aria-label="Anchor Navigation" {...rest}>
  <div class="joy-anchor__ink"></div>
  {#each items as item (item.key)}
    <a
      href={item.href}
      class="joy-anchor__link"
      class:joy-anchor__link--active={activeKey === item.key}
      aria-current={activeKey === item.key ? 'location' : undefined}
      onclick={(e) => handleClick(e, item)}
    >
      {item.title}
    </a>
  {/each}
</nav>
