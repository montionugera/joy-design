<script lang="ts">
  interface Option {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    value?: string;
    options?: Option[];
    placeholder?: string;
    disabled?: boolean;
    name?: string;
    id?: string;
    onchange?: (val: string) => void;
  }

  let {
    value = $bindable(''),
    options = [],
    placeholder = 'Select an option',
    disabled = false,
    name,
    id,
    onchange
  }: Props = $props();

  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    value = target.value;
    onchange?.(target.value);
  }
</script>

<div class="joy-select-wrapper">
  <select
    {id}
    {name}
    {disabled}
    class="joy-select"
    value={value}
    onchange={handleChange}
    aria-label={placeholder}
  >
    {#if placeholder}
      <option value="" disabled selected={!value}>{placeholder}</option>
    {/if}
    {#each options as opt}
      <option value={opt.value} disabled={opt.disabled}>
        {opt.label}
      </option>
    {/each}
  </select>
</div>
