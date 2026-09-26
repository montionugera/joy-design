import React, { forwardRef } from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface TagProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onChange'> {
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
  closable?: boolean;
  checkable?: boolean;
  checked?: boolean;
  onClose?: () => void;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  (
    {
      color = 'default',
      closable = false,
      checkable = false,
      checked = false,
      onClose,
      onChange,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (checkable) {
        onChange?.(!checked);
      }
    };

    return (
      <span
        ref={ref}
        className={cx(
          `joy-tag joy-tag--${color}`,
          checkable && 'joy-tag--checkable',
          checked && 'joy-tag--checked',
          className
        )}
        role={checkable ? 'checkbox' : 'status'}
        aria-checked={checkable ? checked : undefined}
        tabIndex={checkable ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (checkable && (e.key === ' ' || e.key === 'Enter')) {
            e.preventDefault();
            handleClick();
          }
        }}
        {...props}
      >
        {children}
        {closable && (
          <button
            type="button"
            className="joy-tag__close"
            aria-label="Close tag"
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Tag.displayName = 'Tag';
