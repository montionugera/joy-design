<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    children?: Snippet;
  }

  let { title, children }: Props = $props();
  let visible = $state(false);
</script>

<div 
  class="joy-tooltip-wrapper"
  onmouseenter={() => visible = true}
  onmouseleave={() => visible = false}
  onfocusin={() => visible = true}
  onfocusout={() => visible = false}
>
  {#if children}
    {@render children()}
  {/if}

  {#if visible}
    <div class="joy-tooltip" role="tooltip">
      {title}
    </div>
  {/if}
</div>
