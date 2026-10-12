<script lang="ts">
  import { onMount } from 'svelte';
  import { createAutoDismiss } from './auto-dismiss.js';
  import { AlertCircle, AlertTriangle, CheckCircle, Close, Info } from '@montionugera/joy-icons';

  interface Props {
    title?: string;
    description?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    visible?: boolean;
    onclose?: () => void;
    class?: string;
    ref?: HTMLDivElement | null;
    [key: string]: any;
  }

  let {
    title = '',
    description = '',
    type = 'info',
    duration = 4500,
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

  function close() {
    autoDismiss.dismiss();
  }
</script>

{#if visible}
  <div bind:this={ref} class="joy-notification {className}" role="alert" aria-live="polite" {...rest}>
    <div class="joy-notification__notice">
      <div class="joy-notification__row">
        <div class="joy-notification__main">
          <span class="joy-notification__icon joy-notification__icon--{type}" aria-hidden="true">
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
          <div>
            {#if title}
              <div class="joy-notification__title">{title}</div>
            {/if}
            {#if description}
              <div class="joy-notification__desc">{description}</div>
            {/if}
          </div>
        </div>
        <button type="button" class="joy-notification__close" aria-label="Dismiss notification" onclick={close}>
          <Close size="1em" />
        </button>
      </div>
    </div>
  </div>
{/if}
