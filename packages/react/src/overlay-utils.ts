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

export interface OverlayRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export interface OverlayNode {
  classList: { add(...c: string[]): void; remove(...c: string[]): void };
  style: Record<string, string>;
  getBoundingClientRect(): OverlayRect;
  contains(node: unknown): boolean;
  focus(): void;
}

export interface OverlayWindow extends EventTarget {
  innerWidth: number;
  innerHeight: number;
  matchMedia?(query: string): { matches: boolean };
}

export interface OverlayOptions {
  anchor: OverlayNode;
  panel: OverlayNode;
  onClose: () => void;
  win?: OverlayWindow;
  doc?: EventTarget;
  sheetMaxWidth?: number;
  gap?: number;
}

export interface OverlayHandle {
  update(): void;
  dispose(): void;
}

export const SHEET_MAX_WIDTH = 480;

export function positionPanel(
  anchor: OverlayRect,
  panel: OverlayRect,
  viewport: { width: number; height: number },
  gap = 4
): { top: number; left: number; above: boolean } {
  const maxLeft = Math.max(8, viewport.width - panel.width - 8);
  const left = Math.min(Math.max(anchor.left, 8), maxLeft);
  let top = anchor.bottom + gap;
  let above = false;
  if (top + panel.height > viewport.height - 8 && anchor.top - gap - panel.height >= 8) {
    top = anchor.top - gap - panel.height;
    above = true;
  }
  return { top, left, above };
}

export function isOutside(
  target: unknown,
  roots: Array<{ contains(node: unknown): boolean }>
): boolean {
  if (!target) return true;
  for (const root of roots) {
    if (root && typeof root.contains === 'function' && root.contains(target)) {
      return false;
    }
  }
  return true;
}

export function isSheet(
  win: OverlayWindow,
  sheetMaxWidth = SHEET_MAX_WIDTH
): boolean {
  if (!win) return false;
  const isNarrow = typeof win.innerWidth === 'number' && win.innerWidth < sheetMaxWidth;
  const isCoarse = Boolean(win.matchMedia?.('(pointer: coarse)').matches);
  return isNarrow || isCoarse;
}

export function openOverlay(opts: OverlayOptions): OverlayHandle {
  const { anchor, panel, onClose, gap = 4, sheetMaxWidth = SHEET_MAX_WIDTH } = opts;
  const win = opts.win ?? (typeof window !== 'undefined' ? (window as unknown as OverlayWindow) : undefined);
  const doc = opts.doc ?? (typeof document !== 'undefined' ? document : undefined);

  let disposed = false;

  function update() {
    if (disposed) return;
    const currentWin = win ?? (typeof window !== 'undefined' ? (window as unknown as OverlayWindow) : undefined);
    panel.classList.add('joy-overlay');
    panel.style.position = 'fixed';

    if (currentWin && isSheet(currentWin, sheetMaxWidth)) {
      panel.classList.add('joy-overlay--sheet');
      panel.classList.remove('joy-overlay--above');
      panel.style.top = '';
      panel.style.left = '';
      panel.style.minWidth = '';
    } else {
      panel.classList.remove('joy-overlay--sheet');
      if (
        currentWin &&
        typeof anchor.getBoundingClientRect === 'function' &&
        typeof panel.getBoundingClientRect === 'function'
      ) {
        const anchorRect = anchor.getBoundingClientRect();
        const panelRect = panel.getBoundingClientRect();
        const viewport = {
          width: currentWin.innerWidth ?? 0,
          height: currentWin.innerHeight ?? 0
        };
        const pos = positionPanel(anchorRect, panelRect, viewport, gap);
        panel.style.top = `${pos.top}px`;
        panel.style.left = `${pos.left}px`;
        panel.style.minWidth = `${anchorRect.width}px`;
        if (pos.above) {
          panel.classList.add('joy-overlay--above');
        } else {
          panel.classList.remove('joy-overlay--above');
        }
      }
    }
  }

  function dispose() {
    if (disposed) return;
    disposed = true;

    if (win && typeof win.removeEventListener === 'function') {
      win.removeEventListener('resize', handleResize);
      win.removeEventListener('scroll', handleScroll, { capture: true });
    }
    if (doc && typeof doc.removeEventListener === 'function') {
      doc.removeEventListener('keydown', handleKeyDown);
      doc.removeEventListener('pointerdown', handlePointerDown);
    }

    panel.classList.remove('joy-overlay', 'joy-overlay--sheet', 'joy-overlay--above');
  }

  function close() {
    if (disposed) return;
    dispose();
    if (anchor && typeof anchor.focus === 'function') {
      anchor.focus();
    }
    onClose();
  }

  function handleKeyDown(e: Event) {
    if ((e as KeyboardEvent).key === 'Escape') {
      // Claim the key: a dialog/drawer that also listens for Escape checks defaultPrevented, so one
      // press closes only the topmost overlay (e.g. a popconfirm inside a modal), not both.
      e.preventDefault?.();
      close();
    }
  }

  function handlePointerDown(e: Event) {
    const target = (e as MouseEvent | PointerEvent).target;
    if (isOutside(target, [anchor, panel])) {
      close();
    }
  }

  function handleResize() {
    update();
  }

  function handleScroll() {
    update();
  }

  if (doc && typeof doc.addEventListener === 'function') {
    doc.addEventListener('keydown', handleKeyDown);
    doc.addEventListener('pointerdown', handlePointerDown);
  }

  if (win && typeof win.addEventListener === 'function') {
    win.addEventListener('resize', handleResize);
    win.addEventListener('scroll', handleScroll, { capture: true });
  }

  update();

  return {
    update,
    dispose
  };
}
