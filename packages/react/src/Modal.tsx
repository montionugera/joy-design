import * as React from 'react';

export interface ModalProps {
  open?: boolean;
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open = false,
  title,
  onClose,
  children,
  footer,
  className = ''
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="joy-modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`joy-modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div class="joy-modal__header">
          <h3 id="modal-title" className="joy-modal__title">
            {title}
          </h3>
          <button
            type="button"
            className="joy-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div className="joy-modal__body">{children}</div>

        {footer && <div className="joy-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';
