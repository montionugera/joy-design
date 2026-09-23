<script lang="ts">
  import { getContext } from 'svelte';

  interface Props {
    value?: number;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    showTooltip?: boolean;
    label?: string;
    onchange?: (val: number) => void;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    defaultValue = 0,
    value = $bindable(defaultValue ?? 0),
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    showTooltip = true,
    label,
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const formCtx = getContext<any>('joy' + '-form');
  const formDisabled = $derived(Boolean(typeof formCtx === 'function' ? formCtx()?.disabled : formCtx?.disabled));
  const effectiveDisabled = $derived(disabled || formDisabled);

  let isDragging = $state(false);

  const percentage = $derived.by(() => {
    const clamped = Math.min(Math.max(value, min), max);
    return ((clamped - min) / (max - min)) * 100;
  });

  function updateFromPointer(clientX: number) {
    if (effectiveDisabled || !ref) return;
    const rect = ref.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * (max - min) + min;
    const stepped = Math.round(raw / step) * step;
    const clamped = Math.min(Math.max(stepped, min), max);
    value = clamped;
    onchange?.(value);
  }

  function handlePointerDown(e: PointerEvent) {
    if (effectiveDisabled) return;
    isDragging = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromPointer(e.clientX);
  }

  function handlePointerMove(e: PointerEvent) {
    if (!isDragging) return;
    updateFromPointer(e.clientX);
  }

  function handlePointerUp(e: PointerEvent) {
    if (!isDragging) return;
    isDragging = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (effectiveDisabled) return;
    const pageStep = step * 10;
    let nextVal = value;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextVal = Math.min(value + step, max);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextVal = Math.max(value - step, min);
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      nextVal = Math.min(value + pageStep, max);
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      nextVal = Math.max(value - pageStep, min);
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextVal = min;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextVal = max;
    } else {
      return;
    }
    value = nextVal;
    onchange?.(value);
  }
</script>

<div
  bind:this={ref}
  class="joy-slider {effectiveDisabled ? 'joy-slider--disabled' : ''} {className}"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  role="presentation"
  {...rest}
>
  <div class="joy-slider__rail"></div>
  <div class="joy-slider__track" style="width: {percentage}%;"></div>
  <div
    class="joy-slider__handle"
    style="left: {percentage}%;"
    role="slider"
    tabindex={effectiveDisabled ? -1 : 0}
    aria-valuenow={value}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-disabled={effectiveDisabled}
    aria-label={label}
    onkeydown={handleKeyDown}
  >
    {#if showTooltip && isDragging}
      <span class="joy-slider__tooltip">{value}</span>
    {/if}
  </div>
</div>
