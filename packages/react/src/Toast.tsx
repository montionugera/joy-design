import * as React from 'react';

export interface ToastProps {
  open?: boolean;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  message?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  open = true,
  variant = 'info',
  message,
  onClose,
  children,
  className = ''
}) => {
  if (!open) return null;

  return (
    <div
      className={`joy-toast joy-toast--${variant} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div style={{ flex: 1 }}>{children || message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            color: 'var(--joy-color-text-muted, #64748b)'
          }}
          aria-label="Close notification"
        >
          &times;
        </button>
      )}
    </div>
  );
};

Toast.displayName = 'Toast';
