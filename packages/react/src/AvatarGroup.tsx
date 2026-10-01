import * as React from 'react';
import { Avatar } from './Avatar.js';
import type { AvatarProps } from './Avatar.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export type AvatarGroupItem = Pick<AvatarProps, 'src' | 'alt' | 'name' | 'shape' | 'size' | 'variant' | 'color'>;

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars rendered before collapsing the rest into one "+N" overflow avatar. */
  max?: number;
  /** Declarative avatars. When set, `children` is ignored. `max` truncates this list. */
  items?: AvatarGroupItem[];
  children?: React.ReactNode;
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max, items, children, className = '', ...rest }, ref) => {
    const limit = max === undefined ? Infinity : Math.max(0, Math.floor(max));

    // `items` wins over `children` (same as the Svelte twin); otherwise use children.
    const avatars = items?.map((item, i) => <Avatar key={i} {...item} />) ?? React.Children.toArray(children);
    const visible = avatars.slice(0, limit);
    const overflow = Math.max(0, avatars.length - limit);

    // The overflow avatar matches the size of the first avatar.
    const first = avatars[0];
    const overflowSize =
      (React.isValidElement<{ size?: AvatarGroupItem['size'] }>(first) ? first.props.size : undefined) ?? 'md';

    return (
      <div ref={ref} className={cx('joy-avatar-group', className)} {...rest}>
        {visible}
        {overflow > 0 && (
          <div
            className={`joy-avatar joy-avatar--circle joy-avatar--${overflowSize} joy-avatar-group__overflow`}
            role="img"
            aria-label={`${overflow} more`}
          >
            +{overflow}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
