<script lang="ts">
  import type { Snippet } from 'svelte';

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
    error?: string;
    rules?: ValidationRule[];
    layout?: 'vertical' | 'horizontal' | 'inline';
    children?: Snippet;
  }

  let {
    label = '',
    name = '',
    required = false,
    error = '',
    rules = [],
    layout = 'vertical',
    children
  }: Props = $props();

  let isRequired = $derived(required || rules.some(r => r.required));
</script>

<div
  class="joy-form-item joy-form-item--{layout}"
  class:joy-form-item--error={!!error}
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
