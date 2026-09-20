<script lang="ts">
  interface Props {
    count?: number;
    value?: number;
    allowHalf?: boolean;
    disabled?: boolean;
    onchange?: (val: number) => void;
  }

  let {
    count = 5,
    value = $bindable(0),
    allowHalf = false,
    disabled = false,
    onchange
  }: Props = $props();

  let hoverValue = $state<number | null>(null);

  let displayValue = $derived(hoverValue !== null ? hoverValue : value);

  function handleClick(index: number, isHalf: boolean) {
    if (disabled) return;
    const newVal = allowHalf && isHalf ? index + 0.5 : index + 1;
    value = newVal;
    onchange?.(newVal);
  }

  function handleMouseMove(e: MouseEvent, index: number) {
    if (disabled) return;
    if (!allowHalf) {
      hoverValue = index + 1;
      return;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isHalf = (e.clientX - rect.left) < rect.width / 2;
    hoverValue = isHalf ? index + 0.5 : index + 1;
  }

  function handleMouseLeave() {
    if (disabled) return;
    hoverValue = null;
  }
</script>

<div
  class="joy-rate"
  class:joy-rate--disabled={disabled}
  role="radiogroup"
  aria-label="Rating"
  onmouseleave={handleMouseLeave}
>
  {#each Array(count) as _, i}
    {@const isFull = displayValue >= i + 1}
    {@const isHalf = !isFull && displayValue >= i + 0.5}
    <div
      class="joy-rate__star"
      class:joy-rate__star--full={isFull}
      class:joy-rate__star--half={isHalf}
      role="radio"
      aria-checked={value === i + 1 || (allowHalf && value === i + 0.5)}
      aria-label={`${i + 1} star${i > 0 ? 's' : ''}`}
      tabindex={disabled ? -1 : 0}
      onmousemove={(e) => handleMouseMove(e, i)}
      onclick={(e) => {
        if (!allowHalf) {
          handleClick(i, false);
        } else {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const half = (e.clientX - rect.left) < rect.width / 2;
          handleClick(i, half);
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
    </div>
  {/each}
</div>
