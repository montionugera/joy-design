<script lang="ts">
  import { getFormContext } from './form-context.js';

  interface Props {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    /** When true, toggling only calls `onchange(!checked)`; the parent owns `checked`. */
    controlled?: boolean;
    size?: 'sm' | 'md';
    id?: string;
    name?: string;
    onchange?: (checked: boolean) => void;
    class?: string;
    ref?: HTMLButtonElement | null;
    [key: string]: any;
  }

  let {
    checked = $bindable(false),
    disabled = false,
    label,
    controlled = false,
    size = 'md',
    id,
    name,
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const formCtx = getFormContext();
  const formDisabled = $derived(Boolean(typeof formCtx === 'function' ? formCtx()?.disabled : formCtx?.disabled));
  const effectiveDisabled = $derived(disabled || formDisabled);

  function toggle() {
    if (effectiveDisabled) return;
    if (controlled) {
      onchange?.(!checked);
      return;
    }
    checked = !checked;
    onchange?.(checked);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (effectiveDisabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  }
</script>

<button
  bind:this={ref}
  type="button"
  role="switch"
  aria-checked={checked}
  disabled={effectiveDisabled}
  {id}
  {name}
  class="joy-switch {size === 'sm' ? 'joy-switch--sm' : ''} {checked ? 'joy-switch--checked' : ''} {effectiveDisabled ? 'joy-switch--disabled' : ''} {className}"
  onclick={toggle}
  onkeydown={handleKeyDown}
  {...rest}
>
  <span class="joy-switch__thumb"></span>
  {#if label}
    <span class="joy-switch__label">{label}</span>
  {/if}
</button>
