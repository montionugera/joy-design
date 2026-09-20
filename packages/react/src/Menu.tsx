import * as React from 'react';

export interface MenuItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: MenuItem[];
}

export interface MenuProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  items: MenuItem[];
  selectedKey?: string;
  mode?: 'horizontal' | 'vertical' | 'inline';
  onSelect?: (key: string) => void;
}

export const Menu = React.forwardRef<HTMLUListElement, MenuProps>(
  ({ items = [], selectedKey, mode = 'horizontal', onSelect, className = '', ...rest }, ref) => {
    return (
      <ul
        ref={ref}
        className={`joy-menu joy-menu--${mode} ${className}`.trim()}
        role="menu"
        {...rest}
      >
        {items.map((item) => {
          const isActive = selectedKey === item.key;
          return (
            <li
              key={item.key}
              className={`joy-menu__item ${isActive ? 'joy-menu__item--active' : ''} ${item.disabled ? 'joy-menu__item--disabled' : ''}`}
              role="menuitem"
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : 0}
              onClick={() => {
                if (!item.disabled) onSelect?.(item.key);
              }}
              onKeyDown={(e) => {
                if (!item.disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelect?.(item.key);
                }
              }}
            >
              {item.icon && <span className="joy-menu__item-icon">{item.icon}</span>}
              <span className="joy-menu__item-text">{item.label}</span>
            </li>
          );
        })}
      </ul>
    );
  }
);

Menu.displayName = 'Menu';
