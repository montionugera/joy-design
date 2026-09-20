<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    title?: string;
    description?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    visible?: boolean;
    onclose?: () => void;
  }

  let {
    title = '',
    description = '',
    type = 'info',
    duration = 4500,
    visible = $bindable(true),
    onclose
  }: Props = $props();

  onMount(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        visible = false;
        onclose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  });

  function close() {
    visible = false;
    onclose?.();
  }
</script>

{#if visible}
  <div class="joy-notification" role="alert" aria-live="polite">
    <div class="joy-notification__notice">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;">
        <div style="display: flex; gap: 10px;">
          <span class="joy-notification__icon" style="margin-top: 2px;">
            {#if type === 'success'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-success, #10b981)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            {:else if type === 'error'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-danger, #ef4444)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            {:else if type === 'warning'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-warning, #f59e0b)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            {:else}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-brand-primary, #7c3aed)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            {/if}
          </span>
          <div>
            {#if title}
              <div class="joy-notification__title">{title}</div>
            {/if}
            {#if description}
              <div class="joy-notification__desc">{description}</div>
            {/if}
          </div>
        </div>
        <button
          type="button"
          class="joy-notification__close"
          onclick={close}
          aria-label="Close notification"
          style="background: transparent; border: none; cursor: pointer; color: var(--joy-color-text-muted, #94a3b8); padding: 0;"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
  </div>
{/if}
