<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    variant?: 'info' | 'success' | 'warning' | 'danger';
    message?: string;
    onclose?: () => void;
    children?: Snippet;
  }

  let {
    open = true,
    variant = 'info',
    message = '',
    onclose,
    children
  }: Props = $props();
</script>

{#if open}
  <div class="joy-toast joy-toast--{variant}" role="status" aria-live="polite">
    <div style="flex: 1;">
      {#if children}
        {@render children()}
      {:else}
        {message}
      {/if}
    </div>
    {#if onclose}
      <button
        type="button"
        onclick={onclose}
        style="background: transparent; border: none; cursor: pointer; font-size: 1.1rem; color: var(--joy-color-text-muted, #64748b);"
        aria-label="Close notification"
      >
        &times;
      </button>
    {/if}
  </div>
{/if}
