import * as React from 'react';
import { Avatar } from './Avatar.js';
import type { AvatarProps } from './Avatar.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export type AvatarGroupItem = Pick<AvatarProps, 'src' | 'alt' | 'name' | 'shape' | 'size' | 'color'>;

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum avatars rendered before collapsing the rest into one "+N" overflow avatar. */
  max?: number;
  /** Declarative avatars. When set, `children` is ignored. `max` truncates this list. */
  items?: AvatarGroupItem[];
  children?: React.ReactNode;
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ max, items, children, className = '', ...rest }, ref) => {
    const limit = max === undefined ? undefined : Math.max(0, Math.floor(max));

    // `items` wins over `children` (same as the Svelte twin); otherwise slice children.
    const source: Array<AvatarGroupItem | React.ReactNode> = items ?? React.Children.toArray(children);
    const visible = limit === undefined ? source : source.slice(0, limit);
    const overflow = limit === undefined ? 0 : Math.max(0, source.length - limit);

    const first = source[0];
    const firstSize = items
      ? items[0]?.size
      : React.isValidElement<{ size?: AvatarGroupItem['size'] }>(first)
        ? first.props.size
        : undefined;
    const overflowSize = firstSize ?? 'md';

    return (
      <div ref={ref} className={cx('joy-avatar-group', className)} {...rest}>
        {items
          ? (visible as AvatarGroupItem[]).map((item, i) => <Avatar key={i} {...item} />)
          : visible}
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
