import React from 'react';

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  children?: React.ReactNode;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`joy-avatar-group ${className}`} {...props}>
      {children}
    </div>
  );
};

AvatarGroup.displayName = 'AvatarGroup';
