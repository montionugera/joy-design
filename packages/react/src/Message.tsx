import * as React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from '@joymify/icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface MessageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  content: React.ReactNode;
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

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ content, type = 'info', duration = 3000, visible = true, className = '', onClose, ...rest }, ref) => {
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

    const Icon = TYPE_ICONS[type] ?? Info;

    return (
      <div ref={ref} className={cx('joy-message', className)} role="alert" aria-live="polite" {...rest}>
        <div className="joy-message__notice">
          <span className={`joy-message__icon joy-message__icon--${type}`} aria-hidden="true">
            <Icon size="1em" />
          </span>
          <span className="joy-message__content">{content}</span>
        </div>
      </div>
    );
  }
);

Message.displayName = 'Message';
