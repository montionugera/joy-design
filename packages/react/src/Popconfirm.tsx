import * as React from 'react';

export interface PopconfirmProps {
  title?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  open?: boolean;
  className?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
}

export const Popconfirm = React.forwardRef<HTMLDivElement, PopconfirmProps>(
  ({
    title = 'Are you sure?',
    okText = 'Confirm',
    cancelText = 'Cancel',
    open: controlledOpen,
    className = '',
    onConfirm,
    onCancel,
    children
  }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const handleConfirm = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (controlledOpen === undefined) setInternalOpen(false);
      onConfirm?.();
    };

    const handleCancel = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (controlledOpen === undefined) setInternalOpen(false);
      onCancel?.();
    };

    return (
      <div
        ref={ref}
        className={`joy-popconfirm ${className}`.trim()}
      >
        <div onClick={() => { if (controlledOpen === undefined) setInternalOpen(!isOpen); }}>
          {children}
        </div>

        {isOpen && (
          <div className="joy-popconfirm__panel" role="dialog" aria-modal="true">
            <div className="joy-popconfirm__title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-warning, #f59e0b)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{title}</span>
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
                className="joy-button joy-button--primary joy-button--sm"
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
