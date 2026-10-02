import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export type MonoChipVariant = 'default' | 'active' | 'court' | 'danger';

export interface MonoChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  variant?: MonoChipVariant;
  className?: string;
}

export const MonoChip = React.forwardRef<HTMLSpanElement, MonoChipProps>(
  ({ label, variant = 'default', className = '', ...rest }, ref) => {
    return (
      <span ref={ref} className={cx('joy-mono-chip', `joy-mono-chip--${variant}`, className)} {...rest}>
        {label}
      </span>
    );
  }
);

MonoChip.displayName = 'MonoChip';
