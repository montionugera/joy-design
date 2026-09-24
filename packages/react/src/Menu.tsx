import * as React from 'react';
import { rovingNextIndex, rovingTabbableIndex } from './roving-utils.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

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
    // Roving tabindex: exactly one item is in the tab order, the one that last had focus, else the selected one.
    const [focusIndex, setFocusIndex] = React.useState(-1);
    const disabledFlags = items.map((item) => !!item.disabled);
    const tabbable = rovingTabbableIndex(disabledFlags, [focusIndex, items.findIndex((item) => item.key === selectedKey)]);
    // A horizontal menu answers to Left/Right as well as Up/Down; vertical menus answer to Up/Down only.
    const orientation = mode === 'horizontal' ? 'both' : 'vertical';

    const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>, item: MenuItem, index: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!item.disabled) onSelect?.(item.key);
        return;
      }
      const next = rovingNextIndex(e.key, index, disabledFlags, orientation);
      if (next < 0) return;
      e.preventDefault();
      const els = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>(':scope > [role="menuitem"]');
      els?.[next]?.focus();
    };

    return (
      <ul
        ref={ref}
        className={cx('joy-menu', `joy-menu--${mode}`, className)}
        role="menu"
        aria-orientation={mode === 'horizontal' ? 'horizontal' : 'vertical'}
        {...rest}
      >
        {items.map((item, index) => {
          const isActive = selectedKey === item.key;
          return (
            <li
              key={item.key}
              className={cx('joy-menu__item', isActive && 'joy-menu__item--active', item.disabled && 'joy-menu__item--disabled')}
              role="menuitem"
              aria-current={isActive ? 'page' : undefined}
              aria-disabled={item.disabled}
              tabIndex={index === tabbable ? 0 : -1}
              onClick={() => {
                if (!item.disabled) onSelect?.(item.key);
              }}
              onFocus={() => setFocusIndex(index)}
              onKeyDown={(e) => handleKeyDown(e, item, index)}
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
