<script lang="ts">
  import { getContext, type Snippet } from 'svelte';

  export interface ValidationRule {
    required?: boolean;
    message?: string;
    min?: number;
    max?: number;
    pattern?: RegExp;
    validator?: (value: any) => boolean | Promise<boolean>;
  }

  interface FormContext {
    layout: 'vertical' | 'horizontal' | 'inline';
    colon: boolean;
    labelAlign: 'left' | 'right';
    labelWidth?: string | number;
  }

  interface Props {
    label?: string;
    name?: string;
    required?: boolean;
    colon?: boolean;
    labelAlign?: 'left' | 'right';
    labelWidth?: string | number;
    error?: string;
    rules?: ValidationRule[];
    layout?: 'vertical' | 'horizontal' | 'inline';
    children?: Snippet;
  }

  let {
    label = '',
    name = '',
    required = false,
    colon,
    labelAlign,
    labelWidth,
    error = '',
    rules = [],
    layout,
    children
  }: Props = $props();

  const getFormCtx = getContext<() => FormContext>('joy-form');
  const formCtx = $derived(getFormCtx ? getFormCtx() : null);

  const effectiveLayout = $derived(layout ?? formCtx?.layout ?? 'vertical');
  const effectiveColon = $derived(colon ?? formCtx?.colon ?? true);
  const effectiveAlign = $derived(labelAlign ?? formCtx?.labelAlign ?? 'right');
  const effectiveWidth = $derived(labelWidth ?? formCtx?.labelWidth);

  let isRequired = $derived(required || rules.some(r => r.required));
</script>

<div
  class="joy-form-item joy-form-item--{effectiveLayout}"
  class:joy-form-item--no-colon={!effectiveColon}
  class:joy-form-item--label-left={effectiveAlign === 'left'}
  class:joy-form-item--error={!!error}
  style={effectiveWidth ? `--joy-form-label-width: ${typeof effectiveWidth === 'number' ? effectiveWidth + 'px' : effectiveWidth};` : undefined}
>
  {#if label}
    <label class="joy-form-item__label" for={name || undefined}>
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
      <div class="joy-form-item__explain" role="alert">{error}</div>
    {/if}
  </div>
</div>

<style>
  .joy-form-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
    width: 100%;
  }
  .joy-form-item--horizontal {
    flex-direction: row;
    align-items: flex-start;
  }
  .joy-form-item--inline {
    flex-direction: row;
    align-items: center;
    margin-bottom: 0;
    gap: 8px;
  }
</style>
