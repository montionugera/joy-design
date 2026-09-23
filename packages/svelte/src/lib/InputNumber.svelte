<script lang="ts">
  interface Props {
    value?: number;
    defaultValue?: number | null;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    disabled?: boolean;
    readonly?: boolean;
    error?: boolean;
    size?: 'sm' | 'md' | 'lg';
    placeholder?: string;
    id?: string;
    name?: string;
    onchange?: (val: number) => void;
    class?: string;
    ref?: HTMLInputElement | null;
  }

  let {
    defaultValue = 0,
    value = $bindable(defaultValue ?? 0),
    min = -Infinity,
    max = Infinity,
    step = 1,
    precision,
    disabled = false,
    readonly = false,
    error = false,
    size = 'md',
    placeholder = '',
    id,
    name,
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  function clamp(val: number): number {
    let res = Math.max(min, Math.min(max, val));
    if (precision !== undefined) {
      res = Number(res.toFixed(precision));
    }
    return res;
  }

  function stepUp() {
    if (disabled || readonly) return;
    const next = clamp(value + step);
    value = next;
    onchange?.(next);
  }

  function stepDown() {
    if (disabled || readonly) return;
    const next = clamp(value - step);
    value = next;
    onchange?.(next);
  }

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const parsed = parseFloat(target.value);
    if (!isNaN(parsed)) {
      const next = clamp(parsed);
      value = next;
      onchange?.(next);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (disabled || readonly) return;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      stepUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      stepDown();
    }
  }
</script>

<div
  class="joy-input-number joy-input-number--{size} {disabled ? 'joy-input-number--disabled' : ''} {readonly ? 'joy-input-number--readonly' : ''} {error ? 'joy-input-number--error' : ''} {className}"
>
  <input bind:this={ref} type="text" inputmode="decimal" role="spinbutton" aria-valuenow={value} aria-valuemin={min !== -Infinity ? min : undefined} aria-valuemax={max !== Infinity ? max : undefined} aria-invalid={error || undefined} class="joy-input-number__input" {id} {name} {disabled} {readonly} {placeholder} value={value} oninput={handleInput} onkeydown={handleKeyDown} {...rest} />
  <div class="joy-input-number__handler-wrap">
    <button
      type="button"
      class="joy-input-number__handler-up"
      tabindex="-1"
      aria-label="Increase"
      disabled={disabled || readonly}
      onclick={stepUp}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
    <button
      type="button"
      class="joy-input-number__handler-down"
      tabindex="-1"
      aria-label="Decrease"
      disabled={disabled || readonly}
      onclick={stepDown}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  </div>
</div>
