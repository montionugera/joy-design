import * as React from 'react';
import { useOverlay } from './useOverlay.js';
import { rovingNextIndex } from './roving-utils.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface DropdownItem {
  key: string;
  label: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  items: DropdownItem[];
  searchable?: boolean | 'auto';
  searchPlaceholder?: string;
  onSelect?: (key: string) => void;
  children: React.ReactNode;
  className?: string;
}

/** `ref` and `...rest` land on the root (`.joy-dropdown-wrapper`), like the Svelte twin. */
export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  (
    {
      items,
      searchable = 'auto',
      searchPlaceholder = 'Search items...',
      onSelect,
      children,
      className = '',
      ...rest
    },
    ref
  ) => {
    const menuId = `${React.useId()}-menu`;
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const triggerRef = React.useRef<HTMLDivElement | null>(null);
    const panelRef = React.useRef<HTMLDivElement | null>(null);
    const searchInputRef = React.useRef<HTMLInputElement | null>(null);

    const isSearchable = searchable === true || (searchable === 'auto' && items.length >= 6);
    const filteredItems =
      isSearchable && searchQuery.trim()
        ? items.filter((item) =>
            String(item.label).toLowerCase().includes(searchQuery.trim().toLowerCase())
          )
        : items;

    // Which item the menu focuses when it opens by keyboard: ArrowUp opens on the last one.
    const openAtRef = React.useRef<'first' | 'last'>('first');
    const disabledFlags = filteredItems.map((item) => !!item.disabled);

    const menuItems = (): HTMLElement[] =>
      panelRef.current ? Array.from(panelRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]')) : [];

    // useOverlay gives Escape + outside-click dismissal (Escape returns focus to the trigger) and fixed
    // positioning, so the menu also escapes overflow:hidden ancestors.
    useOverlay(open, triggerRef, panelRef, () => {
      setOpen(false);
      setSearchQuery('');
    });

    // Keyed on `open` only: an `items` list changing while the menu is open must not re-focus.
    React.useEffect(() => {
      if (!open) return;
      if (isSearchable && searchInputRef.current) {
        searchInputRef.current.focus();
      } else {
        const start = rovingNextIndex(openAtRef.current === 'last' ? 'End' : 'Home', -1, disabledFlags, 'vertical');
        menuItems()[start]?.focus({ preventScroll: true });
      }
    }, [open, isSearchable]);

    const openMenu = (at: 'first' | 'last' = 'first') => {
      openAtRef.current = at;
      setSearchQuery('');
      setOpen(true);
    };

    const selectItem = (item: DropdownItem) => {
      if (item.disabled) return;
      setOpen(false);
      setSearchQuery('');
      triggerRef.current?.focus();
      onSelect?.(item.key);
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openMenu(e.key === 'ArrowUp' ? 'last' : 'first');
      } else if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
        // Only when the wrapper itself has focus: a real button inside turns Enter/Space into a click.
        e.preventDefault();
        if (open) setOpen(false);
        else openMenu();
      }
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const els = menuItems();
        const start = rovingNextIndex('Home', -1, disabledFlags, 'vertical');
        els[start]?.focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        setSearchQuery('');
        triggerRef.current?.focus();
      }
    };

    const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Tab') {
        // Tab leaves the menu: close it and let the browser move on from the trigger.
        setOpen(false);
        setSearchQuery('');
        triggerRef.current?.focus();
        return;
      }
      const els = menuItems();
      const current = els.indexOf(document.activeElement as HTMLElement);
      const next = rovingNextIndex(e.key, current, disabledFlags, 'vertical');
      if (next < 0) return;
      e.preventDefault();
      els[next]?.focus();
    };

    return (
      <div {...rest} ref={ref} className={cx('joy-dropdown-wrapper', className)}>
        <div
          ref={triggerRef}
          className="joy-dropdown-trigger"
          onClick={() => (open ? setOpen(false) : openMenu())}
          role="button"
          tabIndex={0}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          onKeyDown={handleTriggerKeyDown}
        >
          {children}
        </div>

        {open && (
          <div
            ref={panelRef}
            id={menuId}
            className="joy-dropdown"
            role="menu"
            tabIndex={-1}
            aria-orientation="vertical"
            onKeyDown={handleMenuKeyDown}
          >
            {isSearchable && (
              <div className="joy-dropdown__search-wrapper" role="presentation">
                <input
                  ref={searchInputRef}
                  type="search"
                  className="joy-dropdown__search"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  aria-label={searchPlaceholder}
                />
              </div>
            )}
            {filteredItems.length === 0 ? (
              <div className="joy-dropdown__empty" role="presentation">
                No items found
              </div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className={cx('joy-dropdown__item', item.danger && 'joy-dropdown__item--danger')}
                  onClick={() => selectItem(item)}
                >
                  {item.label}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
);

Dropdown.displayName = 'Dropdown';
