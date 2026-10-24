<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Close } from '@montionugera/joy-icons';
  import { lockBodyScroll, registerDialog, trapFocus, type DialogHandle } from './overlay-utils.js';
  import { createOpenerTracker } from './dialog-opener.js';

  interface Props {
    open?: boolean;
    title?: string;
    onclose?: () => void;
    role?: 'dialog' | 'alertdialog';
    closeLabel?: string;
    /** Focus target on close; used when connected, else the tracked opener. */
    returnFocusTo?: HTMLElement | null;
    children?: Snippet;
    footer?: Snippet;
    class?: string;
    /** The dialog element (`.joy-modal`). */
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    open = false,
    title = '',
    onclose,
    role = 'dialog',
    closeLabel = 'Close dialog',
    returnFocusTo = null,
    children,
    footer,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  // Unique per instance, so several modals (or a modal plus a drawer) never share a label id.
  const uid = $props.id();
  const titleId = `${uid}-title`;

  // Set while open; only the topmost dialog answers Escape (a modal opened from a drawer closes alone).
  let dialog: DialogHandle | null = null;

  function handleKeydown(e: KeyboardEvent) {
    // A popover/menu/tooltip inside the dialog claims Escape (preventDefault) to close itself first, and so do
    // dialogs: the claim keeps an outer dialog listening later in the same event from closing too.
    if (e.key === 'Escape' && open && !e.defaultPrevented && dialog?.isTopmost()) {
      e.preventDefault();
      onclose?.();
    }
  }

  // Captured before the dialog's children mount, so an autofocused child cannot become the "opener" (see dialog-opener.ts).
  const opener = createOpenerTracker();
  $effect.pre(() => opener.sync(open));

  $effect(() => {
    if (!open || !ref) return;
    const previouslyFocused = opener.current;
    const unlock = lockBodyScroll();
    const handle = registerDialog();
    dialog = handle;
    const cleanupTrap = trapFocus(ref);
    return () => {
      cleanupTrap();
      handle.unregister();
      if (dialog === handle) dialog = null;
      unlock();
      if (returnFocusTo?.isConnected) returnFocusTo.focus();
      else if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="joy-modal-backdrop"
    role="presentation"
    onclick={(e) => { if (e.target === e.currentTarget) onclose?.(); }}
  >
    <div
      {...rest}
      bind:this={ref}
      class="joy-modal {className}"
      role={role === 'alertdialog' ? 'alertdialog' : 'dialog'}
      aria-modal="true"
      aria-labelledby={rest['aria-labelledby'] ?? (title ? titleId : undefined)}
      aria-label={rest['aria-label'] ?? (title ? undefined : 'Dialog')}
    >
      <div class="joy-modal__header">
        {#if title}
          <h3 id={titleId} class="joy-modal__title">{title}</h3>
        {/if}
        <button
          type="button"
          class="joy-modal__close"
          onclick={() => onclose?.()}
          aria-label={closeLabel}
        >
          <Close size="1.25rem" />
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
