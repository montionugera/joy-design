<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    layout?: 'vertical' | 'horizontal' | 'inline';
    children?: Snippet;
    onsubmit?: (e: SubmitEvent) => void;
  }

  let {
    layout = 'vertical',
    children,
    onsubmit
  }: Props = $props();

  function handleSubmit(e: SubmitEvent) {
    if (onsubmit) {
      onsubmit(e);
    }
  }
</script>

<form class="joy-form joy-form--{layout}" onsubmit={handleSubmit}>
  {#if children}
    {@render children()}
  {/if}
</form>

<style>
  .joy-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    box-sizing: border-box;
  }
  .joy-form--inline {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
  }
</style>
