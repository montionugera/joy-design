<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    title?: string;
    onclose?: () => void;
    children?: Snippet;
    footer?: Snippet;
  }

  let {
    open = false,
    title = '',
    onclose,
    children,
    footer
  }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      onclose?.();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div 
    class="joy-modal-backdrop" 
    role="presentation"
    onclick={(e) => { if (e.target === e.currentTarget) onclose?.(); }}
  >
    <div 
      class="joy-modal" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div class="joy-modal__header">
        <h3 id="modal-title" class="joy-modal__title">{title}</h3>
        <button 
          type="button" 
          class="joy-modal__close" 
          onclick={() => onclose?.()} 
          aria-label="Close dialog"
        >
          &times;
        </button>
      </div>

      <div class="joy-modal__body">
        {#if children}
          {@render children()}
        {/if}
      </div>

      {#if footer}
        <div class="joy-modal__footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}
