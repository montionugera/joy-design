import React, { useState } from 'react';

export type AvatarShape = 'circle' | 'square';
export type AvatarSize = 'sm' | 'md' | 'lg';
export type AvatarStatus = 'online' | 'offline' | 'none';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  shape?: AvatarShape;
  size?: AvatarSize;
  status?: AvatarStatus;
  color?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({
  src,
  alt = 'Avatar',
  name = '',
  shape = 'circle',
  size = 'md',
  status = 'none',
  color,
  className = '',
  style,
  ...props
}, ref) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = () => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials();

  return (
    <div
      ref={ref}
      className={cx(`joy-avatar joy-avatar--${shape} joy-avatar--${size}`, className)}
      style={color ? { backgroundColor: color, ...style } : style}
      role="img"
      aria-label={name || alt}
      {...props}
    >
      {src && !imgError ? (
        <img
          className="joy-avatar__image"
          src={src}
          alt={alt}
          onError={() => setImgError(true)}
        />
      ) : initials ? (
        <span className="joy-avatar__fallback">{initials}</span>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )}

      {status !== 'none' && (
        <span
          className={`joy-avatar__badge joy-avatar__badge--${status}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
});

Avatar.displayName = 'Avatar';
