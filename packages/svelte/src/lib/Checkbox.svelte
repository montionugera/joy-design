<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    id?: string;
    label?: string;
    onchange?: (checked: boolean) => void;
    children?: Snippet;
  }

  let {
    checked = $bindable(false),
    disabled = false,
    name,
    id,
    label = '',
    onchange,
    children
  }: Props = $props();

  function handleInput(e: Event) {
    if (disabled) return;
    const target = e.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

<label class="joy-checkbox" class:joy-checkbox--disabled={disabled}>
  <input
    type="checkbox"
    role="checkbox"
    aria-checked={checked}
    {id}
    {name}
    {checked}
    {disabled}
    onchange={handleInput}
  />
  <span class="joy-checkbox__box"></span>
  {#if children}
    {@render children()}
  {:else if label}
    <span>{label}</span>
  {/if}
</label>
