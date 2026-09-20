/**
 * Shared accessible overlay primitives: scroll locking, focus trapping, focus restoration
 */

let activeLockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

export function lockBodyScroll(): () => void {
  if (typeof document === 'undefined') return () => {};

  if (activeLockCount === 0) {
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
  }
  activeLockCount++;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeLockCount--;
    if (activeLockCount <= 0) {
      activeLockCount = 0;
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    }
  };
}

export function trapFocus(container: HTMLElement): () => void {
  const focusableSelector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter(el => el.offsetParent !== null);

    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown);

  // Set initial focus to first focusable element
  const initial = container.querySelector<HTMLElement>(focusableSelector);
  initial?.focus();

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}
