import * as React from 'react';
import { AlertCircle } from '@joymify/icons/react';
import { useOverlay } from './useOverlay.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export interface PopconfirmProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  /** Controlled open state. Leave undefined for an uncontrolled popconfirm. */
  open?: boolean;
  /**
   * Called with the next open state whenever the panel wants to open or close: trigger click,
   * Escape, outside click, confirm and cancel. Required to drive a controlled `open`
   * (the Svelte twin's bindable `open`): the panel stays rendered until the parent sets `open` to false,
   * so a controlled popconfirm without `onOpenChange` cannot be dismissed by Escape or an outside click.
   */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
}

/** `ref` and `...rest` land on the root (`.joy-popconfirm`), like the Svelte twin. */
export const Popconfirm = React.forwardRef<HTMLDivElement, PopconfirmProps>(
  (
    {
      title = 'Are you sure?',
      okText = 'Confirm',
      cancelText = 'Cancel',
      open: controlledOpen,
      onOpenChange,
      className = '',
      onConfirm,
      onCancel,
      children,
      ...rest
    },
    ref
  ) => {
    const titleId = `${React.useId()}-title`;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;
    const triggerRef = React.useRef<HTMLDivElement | null>(null);
    const panelRef = React.useRef<HTMLDivElement | null>(null);

    const setOpen = (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    };

    // The trigger wrapper is not focusable itself; focus goes back to the control inside it.
    const focusTrigger = () => {
      triggerRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    };

    // useOverlay gives Escape + outside-click dismissal and fixed positioning (above the trigger's
    // overflow:hidden ancestors, in the popover layer). It does not focus anything, so focus the first
    // button on open and hand focus back to the trigger on every way out.
    useOverlay(isOpen, triggerRef, panelRef, () => {
      setOpen(false);
      focusTrigger();
    });

    React.useEffect(() => {
      if (!isOpen) return;
      panelRef.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    }, [isOpen]);

    const settle = (callback?: () => void) => (e: React.MouseEvent) => {
      e.stopPropagation();
      setOpen(false);
      focusTrigger();
      callback?.();
    };
    const handleConfirm = settle(onConfirm);
    const handleCancel = settle(onCancel);

    return (
      <div {...rest} ref={ref} className={cx('joy-popconfirm', className)}>
        <div ref={triggerRef} className="joy-popconfirm__trigger" onClick={() => setOpen(!isOpen)}>
          {children}
        </div>

        {isOpen && (
          <div ref={panelRef} className="joy-popconfirm__panel" role="alertdialog" aria-labelledby={titleId}>
            <div className="joy-popconfirm__title">
              <span className="joy-popconfirm__icon">
                <AlertCircle size="1rem" />
              </span>
              <span id={titleId}>{title}</span>
            </div>
            <div className="joy-popconfirm__buttons">
              <button
                type="button"
                className="joy-button joy-button--ghost joy-button--sm"
                onClick={handleCancel}
              >
                {cancelText}
              </button>
              <button
                type="button"
                className="joy-button joy-button--solid joy-button--sm"
                onClick={handleConfirm}
              >
                {okText}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Popconfirm.displayName = 'Popconfirm';
