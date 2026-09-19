<script lang="ts">
  interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    name: string;
    value?: string;
    options?: RadioOption[];
    direction?: 'horizontal' | 'vertical';
    disabled?: boolean;
    onchange?: (val: string) => void;
  }

  let {
    name,
    value = $bindable(''),
    options = [],
    direction = 'horizontal',
    disabled = false,
    onchange
  }: Props = $props();

  function handleSelect(val: string) {
    if (disabled) return;
    value = val;
    onchange?.(val);
  }
</script>

<div
  class="joy-radio-group"
  class:joy-radio-group--vertical={direction === 'vertical'}
  role="radiogroup"
  aria-orientation={direction}
>
  {#each options as opt}
    <label
      class="joy-radio"
      class:joy-radio--disabled={disabled || opt.disabled}
    >
      <input
        type="radio"
        {name}
        value={opt.value}
        checked={value === opt.value}
        disabled={disabled || opt.disabled}
        onchange={() => handleSelect(opt.value)}
      />
      <span class="joy-radio__circle"></span>
      <span>{opt.label}</span>
    </label>
  {/each}
</div>
