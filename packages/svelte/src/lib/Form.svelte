<script lang="ts">
  import { setContext, type Snippet } from 'svelte';

  interface Props {
    layout?: 'vertical' | 'horizontal' | 'inline';
    colon?: boolean;
    labelAlign?: 'left' | 'right';
    labelWidth?: string | number;
    disabled?: boolean;
    children?: Snippet;
    onsubmit?: (e: SubmitEvent) => void;
    class?: string;
    ref?: HTMLFormElement | null;
    [key: string]: any;
  }

  let {
    layout = 'vertical',
    colon = true,
    labelAlign = 'right',
    labelWidth,
    disabled = false,
    children,
    onsubmit,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  setContext('joy-form', {
    get layout() { return layout; },
    get colon() { return colon; },
    get labelAlign() { return labelAlign; },
    get labelWidth() { return labelWidth; },
    get disabled() { return disabled; }
  });

  const labelWidthProp = ['--', 'joy', '-form-label-width'].join('');
  let formStyle = $derived(labelWidth ? `${labelWidthProp}: ${typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth}` : undefined);

  function handleSubmit(e: SubmitEvent) {
    if (onsubmit) {
      onsubmit(e);
    }
  }
</script>

<form
  bind:this={ref}
  class="joy-form joy-form--{layout} {labelAlign === 'left' ? 'joy-form--label-left' : ''} {colon ? '' : 'joy-form--no-colon'} {className}"
  style={formStyle}
  onsubmit={handleSubmit}
  {...rest}
>
  {#if children}
    {@render children()}
  {/if}
</form>
