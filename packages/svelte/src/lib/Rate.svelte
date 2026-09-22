<script lang="ts">
  import { getContext } from 'svelte';

  interface Props {
    count?: number;
    value?: number;
    allowHalf?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    label?: string;
    onchange?: (val: number) => void;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    count = 5,
    value = $bindable(0),
    allowHalf = false,
    disabled = false,
    readonly = false,
    label,
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  const formCtx = getContext<any>('joy-form');
  const formDisabled = $derived(Boolean(typeof formCtx === 'function' ? formCtx()?.disabled : formCtx?.disabled));
  const effectiveDisabled = $derived(disabled || formDisabled);

  let hoverValue = $state<number | null>(null);
  let isHalfHover = $state(false);

  let displayValue = $derived(hoverValue !== null ? hoverValue : value);

  function handleClick(index: number, isHalf: boolean) {
    if (effectiveDisabled || readonly) return;
    const newVal = allowHalf && isHalf ? index + 0.5 : index + 1;
    value = newVal;
    onchange?.(newVal);
  }

  function handleMouseMove(e: MouseEvent, index: number) {
    if (effectiveDisabled || readonly) return;
    if (!allowHalf) {
      hoverValue = index + 1;
      isHalfHover = false;
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const half = (e.clientX - rect.left) < rect.width / 2;
    isHalfHover = half;
    hoverValue = half ? index + 0.5 : index + 1;
  }

  function handleMouseLeave() {
    if (effectiveDisabled || readonly) return;
    hoverValue = null;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (effectiveDisabled || readonly) return;
    const step = allowHalf ? 0.5 : 1;
    let nextVal = value;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextVal = Math.min(value + step, count);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextVal = Math.max(value - step, 0);
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextVal = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextVal = count;
    } else {
      return;
    }
    value = nextVal;
    onchange?.(value);
  }
</script>

<div
  bind:this={ref}
  class="joy-rate {effectiveDisabled ? 'joy-rate--disabled' : ''} {readonly ? 'joy-rate--readonly' : ''} {className}"
  role="radiogroup"
  aria-label={label || 'Rating'}
  aria-readonly={readonly ? 'true' : undefined}
  onmouseleave={handleMouseLeave}
  onkeydown={handleKeyDown}
  {...rest}
>
  {#each Array(count) as _, i}
    {@const starVal = i + 1}
    {@const isFull = displayValue >= starVal}
    {@const isHalf = !isFull && displayValue >= starVal - 0.5}
    {@const isChecked = value === starVal || (allowHalf && value === starVal - 0.5)}
    {@const activeStar = Math.ceil(value || 1)}
    {@const tabIndex = effectiveDisabled ? -1 : (starVal === activeStar ? 0 : -1)}
    <button
      type="button"
      role="radio"
      class="joy-rate__star {isFull ? 'joy-rate__star--full' : ''} {isHalf ? 'joy-rate__star--half' : ''}"
      aria-checked={isChecked}
      aria-label={`${starVal} of ${count}`}
      tabindex={tabIndex}
      disabled={effectiveDisabled}
      onmousemove={(e) => handleMouseMove(e, i)}
      onclick={() => {
        if (!allowHalf) {
          handleClick(i, false);
        } else {
          handleClick(i, isHalfHover);
        }
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={isFull ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        {#if isHalf}
          <defs>
            <linearGradient id={`star-grad-${i}`}>
              <stop offset="50%" stop-color="currentColor" />
              <stop offset="50%" stop-color="transparent" />
            </linearGradient>
          </defs>
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill={`url(#star-grad-${i})`}
          />
        {:else}
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        {/if}
      </svg>
    </button>
  {/each}
</div>
