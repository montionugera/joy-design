import * as React from 'react';
import { Close } from '@montionugera/joy-icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface InspectorPaneProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  open?: boolean;
  title?: string;
  subtitle?: string;
  closeLabel?: string;
  onClose?: () => void;
  headerActions?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const InspectorPane = React.forwardRef<HTMLElement, InspectorPaneProps>(
  (
    {
      open = true,
      title = 'Inspector',
      subtitle = '',
      closeLabel = 'Close inspector',
      onClose,
      headerActions,
      children,
      footer,
      className = '',
      ...rest
    },
    ref
  ) => {
    return (
      <aside
        ref={ref}
        className={cx(
          'joy-inspector-pane',
          open ? 'joy-inspector-pane--open' : 'joy-inspector-pane--closed',
          className
        )}
        aria-label={title}
        aria-hidden={!open || undefined}
        {...rest}
      >
        <header className="joy-inspector-pane__header">
          <div className="joy-inspector-pane__titles">
            <h3 className="joy-inspector-pane__title">{title}</h3>
            {subtitle ? <p className="joy-inspector-pane__subtitle">{subtitle}</p> : null}
          </div>

          <div className="joy-inspector-pane__header-actions">
            {headerActions}
            {onClose ? (
              <button
                type="button"
                className="joy-inspector-pane__close"
                aria-label={closeLabel}
                onClick={() => onClose()}
              >
                <Close size="1rem" />
              </button>
            ) : null}
          </div>
        </header>

        <div className="joy-inspector-pane__body">{children}</div>

        {footer ? <footer className="joy-inspector-pane__footer">{footer}</footer> : null}
      </aside>
    );
  }
);

InspectorPane.displayName = 'InspectorPane';
