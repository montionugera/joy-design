import * as React from 'react';
import { lockBodyScroll, trapFocus } from './overlay-utils.js';

export interface ImageItem {
  src: string;
  alt?: string;
}

export interface ImagePreviewProps {
  open: boolean;
  src?: string;
  items?: (string | ImageItem)[];
  current?: number;
  onClose: () => void;
  onChange?: (current: number) => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  open,
  src,
  items,
  current: controlledCurrent,
  onClose,
  onChange,
  className = ''
}) => {
  const normalizedItems: ImageItem[] = React.useMemo(() => {
    if (items && items.length > 0) {
      return items.map(item => (typeof item === 'string' ? { src: item } : item));
    }
    if (src) {
      return [{ src }];
    }
    return [];
  }, [items, src]);

  const [internalCurrent, setInternalCurrent] = React.useState(0);
  const currentIndex = controlledCurrent !== undefined ? controlledCurrent : internalCurrent;
  const currentItem = normalizedItems[currentIndex] || normalizedItems[0] || { src: '' };

  const [scale, setScale] = React.useState(1);
  const [rotate, setRotate] = React.useState(0);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const dialogRef = React.useRef<HTMLDivElement | null>(null);

  // Reset transforms on image change
  React.useEffect(() => {
    setScale(1);
    setRotate(0);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex, open]);

  // Body scroll lock & focus trap
  React.useEffect(() => {
    if (!open) return;
    const unlock = lockBodyScroll();
    let cleanupTrap = () => {};
    if (dialogRef.current) {
      cleanupTrap = trapFocus(dialogRef.current);
    }

    return () => {
      unlock();
      cleanupTrap();
    };
  }, [open]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotateRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, normalizedItems.length]);

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

  const handleZoomIn = () => setScale(s => Math.min(5, s + 0.25));
  const handleZoomOut = () => setScale(s => Math.max(0.2, s - 0.25));
  const handleRotateLeft = () => setRotate(r => r - 90);
  const handleRotateRight = () => setRotate(r => r + 90);
  const handleReset = () => {
    setScale(1);
    setRotate(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image Preview"
      className={`joy-image-preview-mask ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        backgroundColor: 'rgba(13, 24, 41, 0.88)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Operations Toolbar */}
      <div
        className="joy-image-preview-toolbar"
        role="toolbar"
        aria-label="Preview tools"
        style={{
          position: 'absolute',
          bottom: 24,
          zIndex: 1060,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
          borderRadius: 24,
          backgroundColor: 'rgba(20, 37, 62, 0.9)',
          border: '1px solid rgba(248, 243, 232, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (+)"
          aria-label="Zoom In"
          style={toolbarBtnStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          aria-label="Zoom Out"
          style={toolbarBtnStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleRotateLeft}
          title="Rotate Counterclockwise"
          aria-label="Rotate Counterclockwise"
          style={toolbarBtnStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleRotateRight}
          title="Rotate Clockwise (R)"
          aria-label="Rotate Clockwise"
          style={toolbarBtnStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleReset}
          title="Reset"
          aria-label="Reset Zoom and Rotation"
          style={toolbarBtnStyle}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close Preview"
          style={{ ...toolbarBtnStyle, color: '#f8f3e8', backgroundColor: 'rgba(196, 154, 58, 0.2)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Gallery Indicators & Prev/Next */}
      {normalizedItems.length > 1 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 24,
              color: 'var(--cream-100, #f8f3e8)',
              fontFamily: 'monospace',
              fontSize: 14,
              backgroundColor: 'rgba(20, 37, 62, 0.8)',
              padding: '4px 12px',
              borderRadius: 12
            }}
          >
            {currentIndex + 1} / {normalizedItems.length}
          </div>

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            style={{
              ...navBtnStyle,
              left: 24
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            style={{
              ...navBtnStyle,
              right: 24
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Image Stage */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        <img
          src={currentItem.src}
          alt={currentItem.alt || 'Preview image'}
          draggable={false}
          style={{
            maxWidth: '90vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotate}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)',
            borderRadius: 4
          }}
        />
      </div>
    </div>
  );
};

const toolbarBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  color: 'var(--cream-100, #f8f3e8)',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, transform 0.1s ease'
};

const navBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 1060,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  borderRadius: '50%',
  border: '1px solid rgba(248, 243, 232, 0.2)',
  backgroundColor: 'rgba(20, 37, 62, 0.85)',
  color: 'var(--cream-100, #f8f3e8)',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
};

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  preview?: boolean | { src?: string; mask?: React.ReactNode };
  fallback?: string;
  placeholder?: React.ReactNode;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  preview = true,
  fallback,
  placeholder,
  className = '',
  style,
  ...props
}) => {
  const [openPreview, setOpenPreview] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState(src);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(src);
  }, [src]);

  const handleError = () => {
    if (fallback) {
      setImgSrc(fallback);
    }
  };

  const previewSrc = typeof preview === 'object' && preview.src ? preview.src : imgSrc;

  return (
    <>
      <div
        className={`joy-image-wrapper ${className}`}
        style={{
          position: 'relative',
          display: 'inline-block',
          overflow: 'hidden',
          borderRadius: 6,
          cursor: preview ? 'pointer' : 'default',
          ...style
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (preview) setOpenPreview(true);
        }}
      >
        <img
          src={imgSrc}
          alt={alt}
          onError={handleError}
          style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
          {...props}
        />

        {preview && isHovered && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(20, 37, 62, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              color: 'var(--cream-100, #f8f3e8)',
              fontSize: 13,
              fontFamily: 'sans-serif',
              transition: 'opacity 0.2s ease'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Preview</span>
          </div>
        )}
      </div>

      {preview && (
        <ImagePreview
          open={openPreview}
          src={previewSrc}
          onClose={() => setOpenPreview(false)}
        />
      )}
    </>
  );
};
