import * as React from 'react';
import { rovingNextIndex, rovingTabbableIndex } from './roving-utils.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface TabItem {
  key: string;
  label: React.ReactNode;
  content?: React.ReactNode;
}

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  /** aria-label of the tablist. */
  label?: string;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ items, activeKey: controlledKey, onChange, label, className = '', ...rest }, ref) => {
    const uid = React.useId();
    const [internalKey, setInternalKey] = React.useState(items[0]?.key || '');
    const activeKey = controlledKey !== undefined ? controlledKey : internalKey;

    const activeIndex = items.findIndex((item) => item.key === activeKey);
    // Tabs are never disabled; the helper still owns "which tab is in the tab order" so both twins agree.
    const noneDisabled = items.map(() => false);
    const tabbable = rovingTabbableIndex(noneDisabled, [activeIndex]);

    const selectTab = (key: string) => {
      setInternalKey(key);
      onChange?.(key);
    };

    // WAI-ARIA tablist with automatic activation: arrows/Home/End move focus AND select.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const next = rovingNextIndex(e.key, index, noneDisabled, 'horizontal');
      if (next < 0) return;
      e.preventDefault();
      selectTab(items[next].key);
      const tabs = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="tab"]');
      tabs?.[next]?.focus();
    };

    const activeItem = items[activeIndex];

    return (
      <div ref={ref} className={cx('joy-tabs-container', className)} {...rest}>
        <div className="joy-tabs" role="tablist" aria-orientation="horizontal" aria-label={label}>
          {items.map((item, index) => {
            const isActive = activeKey === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                id={`${uid}-tab-${index}`}
                aria-selected={isActive}
                aria-controls={isActive ? `${uid}-panel` : undefined}
                tabIndex={index === tabbable ? 0 : -1}
                className={cx('joy-tab-btn', isActive && 'joy-tab-btn--active')}
                onClick={() => selectTab(item.key)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div
          className="joy-tab-content"
          role="tabpanel"
          id={`${uid}-panel`}
          aria-labelledby={activeIndex >= 0 ? `${uid}-tab-${activeIndex}` : undefined}
        >
          {activeItem?.content}
        </div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';
