import * as React from 'react';

export interface NotificationProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  visible?: boolean;
  className?: string;
  onClose?: () => void;
}

export const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ title, description, type = 'info', duration = 4500, visible = true, className = '', onClose }, ref) => {
    const [isVisible, setIsVisible] = React.useState(visible);

    React.useEffect(() => {
      setIsVisible(visible);
      if (visible && duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [visible, duration, onClose]);

    if (!isVisible) return null;

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    return (
      <div
        ref={ref}
        className={`joy-notification ${className}`.trim()}
        role="alert"
        aria-live="polite"
      >
        <div className="joy-notification__notice">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="joy-notification__icon" style={{ marginTop: 2 }}>
                {type === 'success' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-success, #10b981)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                )}
                {type === 'error' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-danger, #ef4444)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                )}
                {type === 'warning' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-status-warning, #f59e0b)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                )}
                {type === 'info' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--joy-color-brand-primary, #7c3aed)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                )}
              </span>
              <div>
                {title && <div className="joy-notification__title">{title}</div>}
                {description && <div className="joy-notification__desc">{description}</div>}
              </div>
            </div>
            <button
              type="button"
              className="joy-notification__close"
              onClick={handleClose}
              aria-label="Close notification"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--joy-color-text-muted, #94a3b8)', padding: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Notification.displayName = 'Notification';
