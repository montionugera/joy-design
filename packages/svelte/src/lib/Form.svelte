<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    layout?: 'vertical' | 'horizontal' | 'inline';
    colon?: boolean;
    labelAlign?: 'left' | 'right';
    labelWidth?: string | number;
    children?: Snippet;
    onsubmit?: (e: SubmitEvent) => void;
  }

  let {
    layout = 'vertical',
    colon = true,
    labelAlign = 'right',
    labelWidth,
    children,
    onsubmit
  }: Props = $props();

  setContext('joy-form', () => ({
    layout,
    colon,
    labelAlign,
    labelWidth
  }));

  function handleSubmit(e: SubmitEvent) {
    if (onsubmit) {
      onsubmit(e);
    }
  }
</script>

<form
  class="joy-form joy-form--{layout}"
  class:joy-form--no-colon={!colon}
  class:joy-form--label-left={labelAlign === 'left'}
  style={labelWidth ? `--joy-form-label-width: ${typeof labelWidth === 'number' ? labelWidth + 'px' : labelWidth};` : undefined}
  onsubmit={handleSubmit}
>
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
