<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  interface LogoItem {
    name: string;
    logo?: Snippet;
    svgHtml?: string;
    href?: string;
  }

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'children' | 'title'> {
    title?: string;
    logos: LogoItem[];
    class?: string;
    ref?: HTMLElement | null;
  }

  let {
    title,
    logos,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const uid = $props.id();
  const titleId = `joy-logo-cloud-title-${uid}`;
</script>

<section bind:this={ref} class="joy-logo-cloud {className}" aria-labelledby={title && !rest['aria-label'] ? titleId : undefined} {...rest}>
  {#if title}
    <p class="joy-logo-cloud__title" id={titleId}>{title}</p>
  {/if}
  <div class="joy-logo-cloud__logos">
    {#each logos as item}
      {#if item.href}
        <!-- The logo is a graphic, so the link's name comes from aria-label, and the new-tab behaviour is disclosed. -->
        <a
          href={item.href}
          class="joy-logo-cloud__item"
          title={item.name}
          aria-label="{item.name} (opens in a new tab)"
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
        <div class="joy-logo-cloud__item" title={item.name} role="img" aria-label={item.name}>
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
