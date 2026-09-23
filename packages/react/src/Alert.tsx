import * as React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Close, Info } from '@joymify/icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: string;
  description?: string;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  /**
   * Show a dismiss button. Uncontrolled (same model as the Svelte twin): once dismissed the
   * alert stays hidden until remounted; `onClose` fires after hiding. To re-show an alert
   * for new content, remount it (change its `key`) or render it conditionally from `onClose`.
   * The close button unmounts with the alert, so `onClose` should move focus somewhere sensible.
   */
  closable?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      title,
      description,
      variant = 'info',
      closable = false,
      onClose,
      children,
      className = '',
      ...rest
    },
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false);

    // Hide first, then notify, so a throwing onClose still leaves the alert hidden.
    const dismiss = () => {
      setDismissed(true);
      onClose?.();
    };

    if (dismissed) return null;

    return (
      <div
        ref={ref}
        className={cx('joy-alert', `joy-alert--${variant}`, className)}
        role="alert"
        {...rest}
      >
        <span className="joy-alert__icon" aria-hidden="true">
          {variant === 'success' ? (
            <CheckCircle size="1em" />
          ) : variant === 'warning' ? (
            <AlertTriangle size="1em" />
          ) : variant === 'danger' ? (
            <AlertCircle size="1em" />
          ) : (
            <Info size="1em" />
          )}
        </span>
        <div className="joy-alert__body">
          {title && <div className="joy-alert__title">{title}</div>}
          {description && <div className="joy-alert__desc">{description}</div>}
          {children}
        </div>
        {closable && (
          <button type="button" className="joy-alert__close" aria-label="Dismiss alert" onClick={dismiss}>
            <Close size="1em" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
