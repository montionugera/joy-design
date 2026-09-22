<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    error?: boolean;
    success?: boolean;
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    type?: string;
    id?: string;
    name?: string;
    prefix?: Snippet;
    suffix?: Snippet;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
    class?: string;
    ref?: HTMLInputElement | null;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    readonly = false,
    error = false,
    success = false,
    message,
    size = 'md',
    type = 'text',
    id,
    name,
    prefix,
    suffix,
    oninput,
    onchange,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();
</script>

<div
  class="joy-input-wrapper joy-input-wrapper--{size} {error ? 'joy-input-wrapper--error' : ''} {success ? 'joy-input-wrapper--success' : ''} {disabled ? 'joy-input-wrapper--disabled' : ''} {readonly ? 'joy-input-wrapper--readonly' : ''} {className}"
>
  {#if prefix}
    <span class="joy-input-wrapper__prefix">{@render prefix()}</span>
  {/if}
  <input
    bind:this={ref}
    {id}
    {name}
    {type}
    {disabled}
    {readonly}
    {placeholder}
    bind:value
    {oninput}
    {onchange}
    class="joy-input"
    aria-invalid={error || undefined}
    aria-describedby={message ? (id ? `${id}-message` : undefined) : undefined}
    {...rest}
  />
  {#if suffix}
    <span class="joy-input-wrapper__suffix">{@render suffix()}</span>
  {/if}
  {#if message}
    <p class="joy-input-wrapper__message" id={id ? `${id}-message` : undefined}>{message}</p>
  {/if}
</div>
