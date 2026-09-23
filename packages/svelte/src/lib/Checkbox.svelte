<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getFormContext } from './form-context.js';

  interface Props {
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    name?: string;
    id?: string;
    value?: string;
    label?: string;
    onchange?: (checked: boolean) => void;
    children?: Snippet;
    class?: string;
    ref?: HTMLInputElement | null;
    [key: string]: any;
  }

  let {
    checked = $bindable(false),
    indeterminate = false,
    disabled = false,
    name,
    id,
    value,
    label = '',
    onchange,
    children,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const formCtx = getFormContext();
  const formDisabled = $derived(Boolean(typeof formCtx === 'function' ? formCtx()?.disabled : formCtx?.disabled));
  const effectiveDisabled = $derived(disabled || formDisabled);

  $effect(() => {
    if (ref) {
      ref.indeterminate = indeterminate;
    }
  });

  function handleInput(e: Event) {
    if (effectiveDisabled) return;
    const target = e.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

<label class="joy-checkbox {effectiveDisabled ? 'joy-checkbox--disabled' : ''} {className}">
  <input
    bind:this={ref}
    type="checkbox"
    {id}
    {name}
    {value}
    {checked}
    disabled={effectiveDisabled}
    onchange={handleInput}
    {...rest}
  />
  <span class="joy-checkbox__box"></span>
  {#if children}
    {@render children()}
  {:else if label}
    <span>{label}</span>
  {/if}
</label>
