import * as React from 'react';
import { Close } from '@montionugera/joy-icons/react';
import { useDialog, useMergedRef } from './dialog-hooks.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface ModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean;
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** `ref` and `...rest` land on the dialog element (`.joy-modal`), like the Svelte twin. */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open = false, title, onClose, children, footer, className = '', ...rest }, ref) => {
    // Unique per instance, so several modals (or a modal plus a drawer) never share a label id.
    const titleId = `${React.useId()}-title`;
    const dialogRef = React.useRef<HTMLDivElement | null>(null);
    const setDialogRef = useMergedRef(ref, dialogRef);
    // Only the topmost dialog answers Escape, and a popover/menu/tooltip inside claims it first
    // (preventDefault) so it closes alone; dialogs claim it too so an outer one does not also close.
    useDialog(open, dialogRef, (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    });

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
          {...rest}
          ref={setDialogRef}
          className={cx('joy-modal', className)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={rest['aria-labelledby'] ?? (title ? titleId : undefined)}
          aria-label={rest['aria-label'] ?? (title ? undefined : 'Dialog')}
        >
          <div className="joy-modal__header">
            {title ? (
              <h3 id={titleId} className="joy-modal__title">
                {title}
              </h3>
            ) : null}
            <button
              type="button"
              className="joy-modal__close"
              onClick={() => onClose?.()}
              aria-label="Close dialog"
            >
              <Close size="1.25rem" />
            </button>
          </div>

          <div className="joy-modal__body">{children}</div>

          {footer ? <div className="joy-modal__footer">{footer}</div> : null}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';
