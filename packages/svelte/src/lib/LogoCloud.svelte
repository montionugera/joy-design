<script lang="ts">
  import type { Snippet } from 'svelte';

  interface LogoItem {
    name: string;
    logo?: Snippet;
    svgHtml?: string;
    href?: string;
  }

  interface Props {
    title?: string;
    logos: LogoItem[];
    class?: string;
  }

  let {
    title,
    logos,
    class: className = ''
  }: Props = $props();
</script>

<section class="joy-logo-cloud {className}">
  {#if title}
    <p class="joy-logo-cloud__title">{title}</p>
  {/if}
  <div class="joy-logo-cloud__logos">
    {#each logos as item}
      {#if item.href}
        <a
          href={item.href}
          class="joy-logo-cloud__item"
          title={item.name}
          target="_blank"
          rel="noreferrer noopener"
        >
          {#if item.logo}
            {@render item.logo()}
          {:else if item.svgHtml}
            {@html item.svgHtml}
          {/if}
        </a>
      {:else}
        <div class="joy-logo-cloud__item" title={item.name}>
          {#if item.logo}
            {@render item.logo()}
          {:else if item.svgHtml}
            {@html item.svgHtml}
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</section>
