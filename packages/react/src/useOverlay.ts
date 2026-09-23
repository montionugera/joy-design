import { useEffect, useRef, type RefObject } from 'react';
import { openOverlay } from './overlay-utils.js';

export function useOverlay(
  open: boolean,
  anchorRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLElement | null>,
  onClose: () => void
): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open || !anchorRef.current || !panelRef.current) return;
    const handle = openOverlay({
      anchor: anchorRef.current,
      panel: panelRef.current,
      onClose: () => onCloseRef.current()
    });
    return () => handle.dispose();
  }, [open]);
}
