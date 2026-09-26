/**
 * Auto-dismiss timer shared by Message and Notification (identical in the Svelte and React packages).
 * `dismiss()` always clears the pending timer first, so `onClose` fires at most once per timer arm
 * (a manual dismiss can never be followed by the countdown firing it again). `onClose` is read through
 * a getter at fire time, so callers keep the latest callback without re-arming the timer.
 */
export interface AutoDismiss {
  /** (Re)arm the countdown; a non-positive duration only cancels. */
  start(duration: number): void;
  /** Hide, then notify. Clears the pending timer, so it is safe from both the timer and a close button. */
  dismiss(): void;
  /** Clear the pending timer without hiding or notifying (unmount / duration change). */
  cancel(): void;
}

export function createAutoDismiss(
  hide: () => void,
  getOnClose: () => (() => void) | undefined
): AutoDismiss {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const cancel = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  const dismiss = () => {
    cancel();
    hide();
    getOnClose()?.();
  };
  const start = (duration: number) => {
    cancel();
    if (duration > 0) timer = setTimeout(dismiss, duration);
  };
  return { start, dismiss, cancel };
}
