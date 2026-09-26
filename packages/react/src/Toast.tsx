import * as React from 'react';
import { Close } from '@joymify/icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  message?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ open = true, variant = 'info', message, onClose, children, className = '', ...rest }, ref) => {
    if (!open) return null;

    return (
      <div
        ref={ref}
        className={cx('joy-toast', `joy-toast--${variant}`, className)}
        role="status"
        aria-live="polite"
        {...rest}
      >
        <div className="joy-toast__body">{children ?? message}</div>
        {onClose && (
          <button type="button" className="joy-toast__close" aria-label="Dismiss notification" onClick={onClose}>
            <Close size="1em" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';
