import * as React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Close, Info } from '@joymify/icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface NotificationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  visible?: boolean;
  className?: string;
  onClose?: () => void;
}

const TYPE_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle
};

export const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  (
    { title, description, type = 'info', duration = 4500, visible = true, className = '', onClose, ...rest },
    ref
  ) => {
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

    const Icon = TYPE_ICONS[type] ?? Info;

    return (
      <div ref={ref} className={cx('joy-notification', className)} role="alert" aria-live="polite" {...rest}>
        <div className="joy-notification__notice">
          <div className="joy-notification__row">
            <div className="joy-notification__main">
              <span className={`joy-notification__icon joy-notification__icon--${type}`} aria-hidden="true">
                <Icon size="1em" />
              </span>
              <div>
                {title && <div className="joy-notification__title">{title}</div>}
                {description && <div className="joy-notification__desc">{description}</div>}
              </div>
            </div>
            <button
              type="button"
              className="joy-notification__close"
              aria-label="Dismiss notification"
              onClick={handleClose}
            >
              <Close size="1em" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Notification.displayName = 'Notification';
