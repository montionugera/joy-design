import * as React from 'react';
import { Close } from '@montionugera/joy-icons/react';
import { useDialog, useMergedRef } from './dialog-hooks.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface DrawerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  open?: boolean;
  title?: string;
  placement?: 'right' | 'left';
  onClose?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** `ref` and `...rest` land on the drawer panel (`.joy-drawer`), like the Svelte twin. */
export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    { open = false, title, placement = 'right', onClose, children, footer, className = '', ...rest },
    ref
  ) => {
    // Unique per instance, so several drawers/modals never share a label id.
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

    const left = placement === 'left';

    return (
      <div
        className={cx('joy-drawer-backdrop', left && 'joy-drawer-backdrop--left')}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          {...rest}
          ref={setDialogRef}
          className={cx('joy-drawer', className, left && 'joy-drawer--left')}
          role="dialog"
          aria-modal="true"
          aria-labelledby={rest['aria-labelledby'] ?? (title ? titleId : undefined)}
          aria-label={rest['aria-label'] ?? (title ? undefined : 'Drawer')}
        >
          <div className="joy-drawer__header">
            {title ? (
              <h3 id={titleId} className="joy-drawer__title">
                {title}
              </h3>
            ) : null}
            <button
              type="button"
              className="joy-drawer__close"
              onClick={() => onClose?.()}
              aria-label="Close drawer"
            >
              <Close size="1.25rem" />
            </button>
          </div>

          <div className="joy-drawer__body">{children}</div>

          {footer ? <div className="joy-drawer__footer">{footer}</div> : null}
        </div>
      </div>
    );
  }
);

Drawer.displayName = 'Drawer';
