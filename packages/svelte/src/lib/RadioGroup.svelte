<script lang="ts">
  import { getContext } from 'svelte';

  export interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    name: string;
    value?: string;
    defaultValue?: string;
    options?: RadioOption[];
    direction?: 'horizontal' | 'vertical';
    disabled?: boolean;
    error?: boolean | string;
    message?: string;
    onchange?: (val: string) => void;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    name,
    defaultValue = '',
    value = $bindable(defaultValue),
    options = [],
    direction = 'horizontal',
    disabled = false,
    error,
    message,
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const formCtx = getContext<any>('joy' + '-form');
  const formDisabled = $derived(Boolean(typeof formCtx === 'function' ? formCtx()?.disabled : formCtx?.disabled));
  const effectiveDisabled = $derived(disabled || formDisabled);

  let inputRefs = $state<(HTMLInputElement | null)[]>([]);

  let checkedIndex = $derived(options.findIndex((opt) => opt.value === value));
  let rovingIndex = $derived.by(() => {
    if (checkedIndex !== -1 && !effectiveDisabled && !options[checkedIndex]?.disabled) {
      return checkedIndex;
    }
    const firstEnabled = options.findIndex((opt) => !effectiveDisabled && !opt.disabled);
    return firstEnabled !== -1 ? firstEnabled : 0;
  });

  function handleSelect(val: string) {
    if (effectiveDisabled) return;
    value = val;
    onchange?.(val);
  }

  function getEnabledIndices() {
    return options
      .map((opt, i) => (!effectiveDisabled && !opt.disabled ? i : -1))
      .filter((i) => i !== -1);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (effectiveDisabled) return;
    const enabled = getEnabledIndices();
    if (enabled.length === 0) return;

    let targetIndex = -1;
    const currentEnabledPos = enabled.indexOf(checkedIndex !== -1 ? checkedIndex : rovingIndex);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextPos = currentEnabledPos === -1 ? 0 : (currentEnabledPos + 1) % enabled.length;
      targetIndex = enabled[nextPos];
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevPos = currentEnabledPos === -1 ? enabled.length - 1 : (currentEnabledPos - 1 + enabled.length) % enabled.length;
      targetIndex = enabled[prevPos];
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = enabled[0];
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = enabled[enabled.length - 1];
    }

    if (targetIndex !== -1) {
      handleSelect(options[targetIndex].value);
      inputRefs[targetIndex]?.focus();
    }
  }
</script>

<div
  bind:this={ref}
  class="joy-radio-group {direction === 'vertical' ? 'joy-radio-group--vertical' : ''} {error ? 'joy-radio-group--error' : ''} {className}"
  role="radiogroup"
  aria-orientation={direction}
  aria-invalid={Boolean(error) || undefined}
  onkeydown={handleKeyDown}
  {...rest}
>
  {#each options as opt, i}
    {@const optDisabled = effectiveDisabled || Boolean(opt.disabled)}
    {@const isChecked = value === opt.value}
    {@const tabIndex = rovingIndex === i ? 0 : -1}
    <label
      class="joy-radio {optDisabled ? 'joy-radio--disabled' : ''}"
    >
      <input
        bind:this={inputRefs[i]}
        type="radio"
        {name}
        value={opt.value}
        checked={isChecked}
        disabled={optDisabled}
        tabindex={tabIndex}
        onchange={() => handleSelect(opt.value)}
      />
      <span class="joy-radio__circle"></span>
      <span>{opt.label}</span>
    </label>
  {/each}
  {#if message}
    <p class="joy-radio-group__message">{message}</p>
  {/if}
</div>
