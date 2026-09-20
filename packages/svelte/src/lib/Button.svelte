<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'solid' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    variant = 'solid',
    size = 'md',
    disabled = false,
    loading = false,
    type = 'button',
    onclick,
    children
  }: Props = $props();
</script>

<button
  {type}
  class="joy-button joy-button--{variant} joy-button--{size}"
  disabled={disabled || loading}
  {onclick}
>
  {#if loading}
    <svg
      class="joy-button__spinner joy-button__spinner-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  .joy-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--joy-spacing-2, 8px);
    font-family: var(--joy-font-family-sans, sans-serif);
    font-weight: 600;
    border-radius: var(--joy-radius-md, 8px);
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    border: 1px solid transparent;
  }
  .joy-button--sm {
    padding: var(--joy-spacing-1, 4px) var(--joy-spacing-2, 8px);
    font-size: 0.875rem;
  }
  .joy-button--md {
    padding: var(--joy-spacing-2, 8px) var(--joy-spacing-4, 16px);
    font-size: 1rem;
  }
  .joy-button--lg {
    padding: var(--joy-spacing-3, 12px) var(--joy-spacing-6, 24px);
    font-size: 1.125rem;
  }
  .joy-button--solid {
    background-color: var(--joy-color-brand-primary, #7c3aed);
    color: var(--joy-color-text-inverse, #ffffff);
  }
  .joy-button--solid:hover:not(:disabled) {
    background-color: var(--joy-color-brand-primary-hover, #6d28d9);
  }
  .joy-button--outline {
    background-color: transparent;
    border-color: var(--joy-color-brand-primary, #7c3aed);
    color: var(--joy-color-brand-primary, #7c3aed);
  }
  .joy-button--ghost {
    background-color: transparent;
    color: var(--joy-color-text-primary, #0f172a);
  }
  .joy-button--danger {
    background-color: var(--joy-color-status-danger, #ef4444);
    color: var(--joy-color-text-inverse, #ffffff);
  }
  .joy-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
