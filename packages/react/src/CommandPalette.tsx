import * as React from 'react';
import { Search, Close } from '@montionugera/joy-icons/react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface CommandPaletteItem {
  id: string;
  label: string;
  group?: string;
  shortcut?: string;
  description?: string;
}

export interface CommandPaletteProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  open?: boolean;
  items: CommandPaletteItem[];
  query?: string;
  placeholder?: string;
  emptyText?: string;
  onSelect?: (item: CommandPaletteItem) => void;
  onClose?: () => void;
  onQueryChange?: (query: string) => void;
  className?: string;
}

export const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      open = false,
      items = [],
      query: controlledQuery,
      placeholder = 'Type a command or search assets...',
      emptyText = 'No matching commands found.',
      onSelect,
      onClose,
      onQueryChange,
      className = '',
      ...rest
    },
    ref
  ) => {
    const [internalQuery, setInternalQuery] = React.useState(controlledQuery ?? '');
    const [activeIndex, setActiveIndex] = React.useState(0);

    const query = controlledQuery !== undefined ? controlledQuery : internalQuery;

    const filteredItems = React.useMemo(() => {
      if (query.trim() === '') return items;
      const q = query.toLowerCase();
      return items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          (item.group && item.group.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }, [items, query]);

    if (!open) return null;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredItems.length > 0) {
          setActiveIndex((prev) => (prev + 1) % filteredItems.length);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredItems.length > 0) {
          setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
        }
      } else if (e.key === 'Enter' && filteredItems[activeIndex]) {
        e.preventDefault();
        onSelect?.(filteredItems[activeIndex]);
        onClose?.();
      }
    };

    return (
      <div
        className="joy-command-palette-backdrop"
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div
          ref={ref}
          className={cx('joy-command-palette', className)}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onKeyDown={handleKeyDown}
          {...rest}
        >
          <div className="joy-command-palette__search">
            <span className="joy-command-palette__search-icon" aria-hidden="true">
              <Search size="1.125rem" />
            </span>
            <input
              type="text"
              className="joy-command-palette__input"
              value={query}
              placeholder={placeholder}
              aria-label={placeholder}
              onChange={(e) => {
                const next = e.currentTarget.value;
                setInternalQuery(next);
                setActiveIndex(0);
                onQueryChange?.(next);
              }}
            />
            <button
              type="button"
              className="joy-command-palette__close"
              aria-label="Close command palette"
              onClick={() => onClose?.()}
            >
              <Close size="1rem" />
            </button>
          </div>

          <div className="joy-command-palette__list" role="listbox" aria-label="Commands">
            {filteredItems.length === 0 ? (
              <div className="joy-command-palette__empty">{emptyText}</div>
            ) : (
              filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={cx(
                    'joy-command-palette__item',
                    idx === activeIndex && 'joy-command-palette__item--active'
                  )}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    onSelect?.(item);
                    onClose?.();
                  }}
                >
                  <div className="joy-command-palette__item-main">
                    {item.group ? (
                      <span className="joy-command-palette__group">{item.group}</span>
                    ) : null}
                    <span className="joy-command-palette__label">{item.label}</span>
                    {item.description ? (
                      <span className="joy-command-palette__desc">{item.description}</span>
                    ) : null}
                  </div>
                  {item.shortcut ? (
                    <kbd className="joy-command-palette__kbd">{item.shortcut}</kbd>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
);

CommandPalette.displayName = 'CommandPalette';
