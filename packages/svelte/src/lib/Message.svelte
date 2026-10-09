<script lang="ts">
  import { onMount } from 'svelte';
  import { createAutoDismiss } from './auto-dismiss.js';
  import { AlertCircle, AlertTriangle, CheckCircle, Info } from '@montionugera/joy-icons';

  interface Props {
    content?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    visible?: boolean;
    onclose?: () => void;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    content = '',
    type = 'info',
    duration = 3000,
    visible = $bindable(true),
    onclose,
    class: className = '',
    ref = $bindable(null),
    ...rest
  }: Props = $props();

  // dismiss() clears the pending timer, so onclose fires once (manual close or countdown, never both).
  const autoDismiss = createAutoDismiss(
    () => (visible = false),
    () => onclose
  );

  onMount(() => {
    autoDismiss.start(duration);
    return autoDismiss.cancel;
  });
</script>

{#if visible}
  <div bind:this={ref} class="joy-message {className}" role="alert" aria-live="polite" {...rest}>
    <div class="joy-message__notice">
      <span class="joy-message__icon joy-message__icon--{type}" aria-hidden="true">
        {#if type === 'success'}
          <CheckCircle size="1em" />
        {:else if type === 'error'}
          <AlertCircle size="1em" />
        {:else if type === 'warning'}
          <AlertTriangle size="1em" />
        {:else}
          <Info size="1em" />
        {/if}
      </span>
      <span class="joy-message__content">{content}</span>
    </div>
  </div>
{/if}
