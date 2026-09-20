<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    content?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    visible?: boolean;
    onclose?: () => void;
  }

  let {
    content = '',
    type = 'info',
    duration = 3000,
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
</script>

{#if visible}
  <div class="joy-message" role="alert" aria-live="polite">
    <div class="joy-message__notice">
      <span class="joy-message__icon">
        {#if type === 'success'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-success, #10b981)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        {:else if type === 'error'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-danger, #ef4444)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        {:else if type === 'warning'}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-warning, #f59e0b)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-brand-primary, #7c3aed)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        {/if}
      </span>
      <span class="joy-message__content">{content}</span>
    </div>
  </div>
{/if}
