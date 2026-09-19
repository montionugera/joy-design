import React, { forwardRef } from 'react';

export type ResultStatus = 'success' | 'error' | 'warning' | 'info' | '404' | '403';

export interface ResultProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: ResultStatus;
  title: string;
  subtitle?: string;
  primaryActionText?: string;
  secondaryActionText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  extra?: React.ReactNode;
}

export const Result = forwardRef<HTMLDivElement, ResultProps>(
  (
    {
      status = 'info',
      title,
      subtitle,
      primaryActionText,
      secondaryActionText,
      onPrimaryAction,
      onSecondaryAction,
      extra,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`joy-result joy-result--${status} ${className}`}
        role="alert"
        {...props}
      >
        <div className="joy-result__icon">
          {status === 'success' ? (
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : status === 'error' ? (
            <svg
              width="36"
              height="36"
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
          ) : status === 'warning' ? (
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : status === '404' ? (
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          ) : status === '403' ? (
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ) : (
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )}
        </div>

        <h2 className="joy-result__title">{title}</h2>
        {subtitle && <p className="joy-result__subtitle">{subtitle}</p>}

        {extra && <div style={{ marginBottom: '24px' }}>{extra}</div>}

        {(primaryActionText || secondaryActionText) && (
          <div className="joy-result__actions">
            {primaryActionText && (
              <button
                type="button"
                className="joy-button joy-button--solid joy-button--md"
                onClick={onPrimaryAction}
              >
                {primaryActionText}
              </button>
            )}
            {secondaryActionText && (
              <button
                type="button"
                className="joy-button joy-button--outline joy-button--md"
                onClick={onSecondaryAction}
              >
                {secondaryActionText}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

Result.displayName = 'Result';
