<script lang="ts">
  import { getContext } from 'svelte';

  export interface SegmentedOption {
    label: string;
    value: string | number;
    disabled?: boolean;
  }

  interface Props {
    options?: (string | number | SegmentedOption)[];
    value?: string | number;
    defaultValue?: string | number;
    disabled?: boolean;
    size?: 'sm' | 'md';
    onchange?: (value: string | number) => void;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    options = [],
    defaultValue,
    value = $bindable(defaultValue),
    disabled = false,
    size = 'md',
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const formCtx = getContext<any>('joy' + '-form');
  const formDisabled = $derived(Boolean(typeof formCtx === 'function' ? formCtx()?.disabled : formCtx?.disabled));
  const effectiveDisabled = $derived(disabled || formDisabled);

  let buttonRefs = $state<(HTMLButtonElement | null)[]>([]);

  let normalizedOptions = $derived(
    options.map((opt) =>
      typeof opt === 'object' && opt !== null
        ? opt
        : { label: String(opt), value: opt, disabled: false }
    )
  );

  let checkedIndex = $derived(normalizedOptions.findIndex((opt) => opt.value === value));
  let rovingIndex = $derived.by(() => {
    if (checkedIndex !== -1 && !effectiveDisabled && !normalizedOptions[checkedIndex]?.disabled) {
      return checkedIndex;
    }
    const firstEnabled = normalizedOptions.findIndex((opt) => !effectiveDisabled && !opt.disabled);
    return firstEnabled !== -1 ? firstEnabled : 0;
  });

  function handleSelect(val: string | number) {
    if (effectiveDisabled) return;
    value = val;
    onchange?.(val);
  }

  function getEnabledIndices() {
    return normalizedOptions
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
      handleSelect(normalizedOptions[targetIndex].value);
      buttonRefs[targetIndex]?.focus();
    }
  }
</script>

<div
  bind:this={ref}
  class="joy-segmented {size === 'sm' ? 'joy-segmented--sm' : ''} {className}"
  role="radiogroup"
  onkeydown={handleKeyDown}
  {...rest}
>
  {#each normalizedOptions as opt, i}
    {@const optDisabled = effectiveDisabled || Boolean(opt.disabled)}
    {@const isChecked = value === opt.value}
    {@const tabIndex = rovingIndex === i ? 0 : -1}
    <button
      bind:this={buttonRefs[i]}
      type="button"
      class="joy-segmented__item {isChecked ? 'joy-segmented__item--active' : ''}"
      role="radio"
      aria-checked={isChecked}
      disabled={optDisabled}
      tabindex={tabIndex}
      onclick={() => handleSelect(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>
