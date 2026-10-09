<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Close } from '@montionugera/joy-icons';

  interface Props {
    open?: boolean;
    variant?: 'info' | 'success' | 'warning' | 'danger';
    message?: string;
    onclose?: () => void;
    children?: Snippet;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    open = true,
    variant = 'info',
    message = '',
    onclose,
    children,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();
</script>

{#if open}
  <div bind:this={ref} class="joy-toast joy-toast--{variant} {className}" role="status" aria-live="polite" {...rest}>
    <div class="joy-toast__body">
      {#if children}
        {@render children()}
      {:else}
        {message}
      {/if}
    </div>
    {#if onclose}
      <button type="button" class="joy-toast__close" aria-label="Dismiss notification" onclick={onclose}>
        <Close size="1em" />
      </button>
    {/if}
  </div>
{/if}
