import * as React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Close, Info } from '@montionugera/joy-icons/react';
import { createAutoDismiss, type AutoDismiss } from './auto-dismiss.js';

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
    // Latest-callback ref: an inline `onClose` must not restart the countdown on every parent render.
    const onCloseRef = React.useRef(onClose);
    onCloseRef.current = onClose;
    // Held in a ref (lazy-init), not useMemo: React may discard a memo cache, which would re-arm the timer.
    const autoDismissRef = React.useRef<AutoDismiss | null>(null);
    if (autoDismissRef.current === null) {
      autoDismissRef.current = createAutoDismiss(() => setIsVisible(false), () => onCloseRef.current);
    }
    const autoDismiss = autoDismissRef.current;

    React.useEffect(() => {
      setIsVisible(visible);
      if (!visible) return;
      autoDismiss.start(duration);
      return autoDismiss.cancel;
    }, [visible, duration, autoDismiss]);

    if (!isVisible) return null;

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
              onClick={autoDismiss.dismiss}
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
