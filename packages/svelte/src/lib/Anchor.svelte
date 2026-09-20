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
  }

  let {
    items = [],
    activeKey = $bindable(''),
    onchange
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

<nav class="joy-anchor" role="navigation" aria-label="Anchor Navigation">
  <div class="joy-anchor__ink"></div>
  {#each items as item}
    <a
      href={item.href}
      class="joy-anchor__link"
      class:joy-anchor__link--active={activeKey === item.key}
      onclick={(e) => handleClick(e, item)}
    >
      {item.title}
    </a>
  {/each}
</nav>
