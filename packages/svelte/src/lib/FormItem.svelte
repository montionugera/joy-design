<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getFormContext } from './form-context.js';

  export interface ValidationRule {
    required?: boolean;
    message?: string;
    min?: number;
    max?: number;
    pattern?: RegExp;
    validator?: (value: any) => boolean | Promise<boolean>;
  }

  interface Props {
    label?: string;
    name?: string;
    required?: boolean;
    colon?: boolean;
    labelAlign?: 'left' | 'right';
    labelWidth?: string | number;
    error?: string;
    help?: string;
    rules?: ValidationRule[];
    layout?: 'vertical' | 'horizontal' | 'inline';
    children?: Snippet;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    label = '',
    name = '',
    required = false,
    colon,
    labelAlign,
    labelWidth,
    error = '',
    help = '',
    rules = [],
    layout,
    children,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const formCtxRaw = getFormContext();
  const formCtx = $derived(typeof formCtxRaw === 'function' ? formCtxRaw() : formCtxRaw);

  const effectiveLayout = $derived(layout ?? formCtx?.layout ?? 'vertical');
  const effectiveColon = $derived(colon ?? formCtx?.colon ?? true);
  const effectiveAlign = $derived(labelAlign ?? formCtx?.labelAlign ?? 'right');
  const effectiveWidth = $derived(labelWidth ?? formCtx?.labelWidth);

  let isRequired = $derived(required || rules.some((r) => r.required));

  const labelWidthProp = ['--', 'joy', '-form-label-width'].join('');
  let itemStyle = $derived(effectiveWidth ? `${labelWidthProp}: ${typeof effectiveWidth === 'number' ? `${effectiveWidth}px` : effectiveWidth}` : undefined);
</script>

<div
  bind:this={ref}
  class="joy-form-item {effectiveLayout === 'horizontal' ? 'joy-form-item--horizontal' : ''} {!effectiveColon ? 'joy-form-item--no-colon' : ''} {effectiveAlign === 'left' ? 'joy-form-item--label-left' : ''} {error ? 'joy-form-item--error' : ''} {className}"
  style={itemStyle}
  {...rest}
>
  {#if label}
    <label class="joy-form-item__label" for={name ? name : undefined}>
      {#if isRequired}
        <span class="joy-form-item__required" aria-hidden="true">*</span>
      {/if}
      {label}
    </label>
  {/if}

  <div class="joy-form-item__control">
    {#if children}
      {@render children()}
    {/if}
    {#if error}
      <p class="joy-form-item__explain" role="alert">{error}</p>
    {:else if help}
      <p class="joy-form-item__explain">{help}</p>
    {/if}
  </div>
</div>
