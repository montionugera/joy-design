import * as React from 'react';
import { ChevronLeft, ChevronRight, Close, Minimize2, RefreshCw, ZoomIn, ZoomOut } from '@montionugera/joy-icons/react';
import { useDialog, useMergedRef } from './dialog-hooks.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface ImageItem {
  src: string;
  alt?: string;
}

export interface ImagePreviewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  open: boolean;
  src?: string;
  items?: (string | ImageItem)[];
  current?: number;
  onClose: () => void;
  onChange?: (current: number) => void;
  className?: string;
}

/** `ref` and `...rest` land on the mask/dialog (`.joy-image-preview-mask`), like the Svelte twin. Renders nothing when closed. */
export const ImagePreview = React.forwardRef<HTMLDivElement, ImagePreviewProps>(
  ({ open, src, items, current: controlledCurrent, onClose, onChange, className = '', onClick, ...rest }, ref) => {
    const normalizedItems: ImageItem[] = React.useMemo(() => {
      if (items && items.length > 0) {
        return items.map((item) => (typeof item === 'string' ? { src: item } : item));
      }
      if (src) {
        return [{ src }];
      }
      return [];
    }, [items, src]);

    const [internalCurrent, setInternalCurrent] = React.useState(0);
    // Clamped, so a stale `current` past the end never shows "5 / 2" next to the first image.
    const requestedIndex = controlledCurrent !== undefined ? controlledCurrent : internalCurrent;
    const currentIndex = Math.min(Math.max(0, requestedIndex), Math.max(0, normalizedItems.length - 1));
    const currentItem = normalizedItems[currentIndex] || normalizedItems[0] || { src: '' };

    const [scale, setScale] = React.useState(1);
    const [rotate, setRotate] = React.useState(0);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = React.useState(false);
    const dragStartRef = React.useRef({ x: 0, y: 0, posX: 0, posY: 0 });
    const dialogRef = React.useRef<HTMLDivElement | null>(null);
    const setDialogRef = useMergedRef(ref, dialogRef);

    const handleReset = () => {
      setScale(1);
      setRotate(0);
      setPosition({ x: 0, y: 0 });
    };

    // Reset transforms on image change
    React.useEffect(handleReset, [currentIndex, open]);

    const handlePrev = () => {
      if (normalizedItems.length <= 1) return;
      const nextIdx = (currentIndex - 1 + normalizedItems.length) % normalizedItems.length;
      setInternalCurrent(nextIdx);
      onChange?.(nextIdx);
    };

    const handleNext = () => {
      if (normalizedItems.length <= 1) return;
      const nextIdx = (currentIndex + 1) % normalizedItems.length;
      setInternalCurrent(nextIdx);
      onChange?.(nextIdx);
    };

    const handleZoomIn = () => setScale((s) => Math.min(5, s + 0.25));
    const handleZoomOut = () => setScale((s) => Math.max(0.2, s - 0.25));
    const handleRotateLeft = () => setRotate((r) => r - 90);
    const handleRotateRight = () => setRotate((r) => r + 90);
    // Body scroll lock, focus trap + restore, and the dialog stack (a preview inside a modal closes alone).
    // Closing mid-drag must not leave the window mousemove/mouseup listeners attached.
    useDialog(
      open,
      dialogRef,
      (e) => {
        if (e.key === 'Escape') onClose();
        else if (e.key === 'ArrowLeft') handlePrev();
        else if (e.key === 'ArrowRight') handleNext();
        else if (e.key === '+' || e.key === '=') handleZoomIn();
        else if (e.key === '-' || e.key === '_') handleZoomOut();
        else if (e.key === 'r' || e.key === 'R') handleRotateRight();
        else return;
        e.preventDefault();
      },
      () => setIsDragging(false)
    );

    // Drag-to-pan tracks the pointer on the window, so it keeps working when it leaves the stage.
    React.useEffect(() => {
      if (!isDragging) return;
      const onMove = (e: MouseEvent) => {
        const d = dragStartRef.current;
        setPosition({ x: d.posX + (e.clientX - d.x), y: d.posY + (e.clientY - d.y) });
      };
      const onUp = () => setIsDragging(false);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      return () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
    }, [isDragging]);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY, posX: position.x, posY: position.y };
    };

    if (!open) return null;

    return (
      <div
        {...rest}
        ref={setDialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={rest['aria-label'] ?? 'Image preview'}
        className={cx('joy-image-preview-mask', className)}
        onClick={(e) => {
          onClick?.(e);
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Operations Toolbar */}
        <div className="joy-image-preview-toolbar" role="toolbar" aria-label="Preview tools">
          <button type="button" onClick={handleZoomIn} title="Zoom in (+)" aria-label="Zoom in" className="joy-image-preview-btn">
            <ZoomIn size="1.25rem" />
          </button>
          <button type="button" onClick={handleZoomOut} title="Zoom out (-)" aria-label="Zoom out" className="joy-image-preview-btn">
            <ZoomOut size="1.25rem" />
          </button>
          <button type="button" onClick={handleRotateLeft} title="Rotate left" aria-label="Rotate left" className="joy-image-preview-btn">
            <span className="joy-image-preview-btn__icon--flip">
              <RefreshCw size="1.25rem" />
            </span>
          </button>
          <button type="button" onClick={handleRotateRight} title="Rotate right (R)" aria-label="Rotate right" className="joy-image-preview-btn">
            <RefreshCw size="1.25rem" />
          </button>
          <button type="button" onClick={handleReset} title="Reset" aria-label="Reset zoom and rotation" className="joy-image-preview-btn">
            <Minimize2 size="1.25rem" />
          </button>
          <button type="button" onClick={onClose} title="Close (Esc)" aria-label="Close preview" className="joy-image-preview-btn joy-image-preview-btn--close">
            <Close size="1.25rem" />
          </button>
        </div>

        {/* Gallery Indicators & Prev/Next */}
        {normalizedItems.length > 1 && (
          <>
            <div className="joy-image-preview-counter">{`${currentIndex + 1} / ${normalizedItems.length}`}</div>
            <button type="button" onClick={handlePrev} aria-label="Previous image" className="joy-image-preview-nav joy-image-preview-nav--prev">
              <ChevronLeft size="1.5rem" />
            </button>
            <button type="button" onClick={handleNext} aria-label="Next image" className="joy-image-preview-nav joy-image-preview-nav--next">
              <ChevronRight size="1.5rem" />
            </button>
          </>
        )}

        {/* Image Stage */}
        <div
          className={cx(
            'joy-image-preview-stage',
            scale > 1 && 'joy-image-preview-stage--zoomed',
            isDragging && 'joy-image-preview-stage--dragging'
          )}
          onMouseDown={handleMouseDown}
        >
          <img
            className="joy-image-preview-img"
            src={currentItem.src}
            alt={currentItem.alt || 'Preview image'}
            draggable={false}
            style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotate}deg)` }}
          />
        </div>
      </div>
    );
  }
);

ImagePreview.displayName = 'ImagePreview';
