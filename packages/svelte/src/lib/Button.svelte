<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'solid' | 'outline' | 'ghost' | 'danger' | 'link';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    /** Replaces the children text while `loading`. */
    loadingLabel?: string;
    block?: boolean;
    iconOnly?: boolean;
    type?: 'button' | 'submit' | 'reset';
    iconStart?: Snippet;
    iconEnd?: Snippet;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
    class?: string;
    ref?: HTMLButtonElement | null;
  }

  let {
    variant = 'solid',
    size = 'md',
    disabled = false,
    loading = false,
    loadingLabel,
    block = false,
    iconOnly = false,
    type = 'button',
    iconStart,
    iconEnd,
    onclick,
    children,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();
</script>

<button
  bind:this={ref}
  {type}
  class="joy-button joy-button--{variant} joy-button--{size} {loading ? 'joy-button--loading' : ''} {block ? 'joy-button--block' : ''} {iconOnly ? 'joy-button--icon-only' : ''} {className}"
  disabled={disabled || loading}
  aria-busy={loading || undefined}
  {onclick}
  {...rest}
>
  {#if iconStart}
    <span class="joy-button__icon">{@render iconStart()}</span>
  {/if}
  <span class="joy-button__label">{#if loading && loadingLabel}{loadingLabel}{:else}{@render children?.()}{/if}</span>
  {#if iconEnd}
    <span class="joy-button__icon">{@render iconEnd()}</span>
  {/if}
  {#if loading}
    <span class="joy-button__spinner" aria-hidden="true">
      <svg class="joy-button__spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </span>
  {/if}
</button>
