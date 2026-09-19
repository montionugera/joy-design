import * as React from 'react';

export interface DrawerProps {
  open?: boolean;
  title?: string;
  placement?: 'right' | 'left';
  onClose?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  open = false,
  title,
  placement = 'right',
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
      className="joy-drawer-backdrop"
      role="presentation"
      style={{ justifyContent: placement === 'left' ? 'flex-start' : 'flex-end' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={`joy-drawer ${placement === 'left' ? 'joy-drawer--left' : ''} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className="joy-drawer__header">
          <h3 id="drawer-title" className="joy-drawer__title">
            {title}
          </h3>
          <button
            type="button"
            className="joy-drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            &times;
          </button>
        </div>

        <div className="joy-drawer__body">{children}</div>

        {footer && <div className="joy-drawer__footer">{footer}</div>}
      </div>
    </div>
  );
};

Drawer.displayName = 'Drawer';
