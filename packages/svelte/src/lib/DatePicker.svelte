<script lang="ts">
  import { Calendar } from '@joymify/icons';

  interface Props {
    value?: string;
    min?: string;
    max?: string;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    size?: 'sm' | 'md' | 'lg';
    id?: string;
    onchange?: (e: Event) => void;
    class?: string;
    ref?: HTMLInputElement | null;
  }

  let {
    value = $bindable(''),
    min,
    max,
    placeholder,
    disabled = false,
    error = false,
    size = 'md',
    id,
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();
</script>

<div
  class="joy-date-picker joy-date-picker--{size} {disabled ? 'joy-date-picker--disabled' : ''} {error ? 'joy-date-picker--error' : ''} {className}"
>
  <input
    bind:this={ref}
    type="date"
    class="joy-date-picker__input"
    bind:value
    {id}
    {min}
    {max}
    {disabled}
    {placeholder}
    aria-invalid={error || undefined}
    {onchange}
    {...rest}
  />
  <span class="joy-date-picker__icon" aria-hidden="true">
    <Calendar size="16" />
  </span>
</div>
