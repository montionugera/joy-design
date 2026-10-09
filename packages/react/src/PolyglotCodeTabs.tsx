import React, { forwardRef, useState } from 'react';
import { CodeBlock } from './CodeBlock.js';

export interface PolyglotCodeItem {
  key?: string;
  language: string;
  label?: string;
  code: string;
  filename?: string;
}

export interface PolyglotCodeTabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items?: PolyglotCodeItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  showLineNumbers?: boolean;
  allowCopy?: boolean;
}

export const PolyglotCodeTabs = forwardRef<HTMLDivElement, PolyglotCodeTabsProps>(
  (
    {
      items = [],
      activeKey: controlledActiveKey,
      defaultActiveKey,
      onChange,
      showLineNumbers = false,
      allowCopy = true,
      className = '',
      ...rest
    },
    ref
  ) => {
    const isControlled = controlledActiveKey !== undefined;
    const initialKey = defaultActiveKey || (items.length > 0 ? items[0].key || items[0].language : '');
    const [internalActiveKey, setInternalActiveKey] = useState<string>(initialKey);

    const currentKey = isControlled ? controlledActiveKey : internalActiveKey;

    const activeItem =
      items.find((it) => (it.key || it.language) === currentKey) || items[0] || null;

    const handleSelect = (key: string) => {
      if (!isControlled) {
        setInternalActiveKey(key);
      }
      onChange?.(key);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      if (items.length <= 1) return;
      let nextIndex = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + items.length) % items.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = items.length - 1;
      }

      if (nextIndex >= 0) {
        const nextKey = items[nextIndex].key || items[nextIndex].language;
        handleSelect(nextKey);
      }
    };

    return (
      <div
        ref={ref}
        className={`joy-polyglot-tabs ${className}`.trim()}
        role="region"
        aria-label="Code tabs"
        {...rest}
      >
        <div className="joy-polyglot-tabs__bar">
          <div className="joy-polyglot-tabs__list" role="tablist" aria-label="Programming languages">
            {items.map((item, idx) => {
              const itemKey = item.key || item.language;
              const isSelected = itemKey === currentKey;
              const displayLabel = item.label || item.language.toUpperCase();

              return (
                <button
                  key={itemKey}
                  type="button"
                  role="tab"
                  className="joy-polyglot-tabs__tab"
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => handleSelect(itemKey)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="joy-polyglot-tabs__panel" role="tabpanel">
          {activeItem && (
            <CodeBlock
              code={activeItem.code}
              language={activeItem.language}
              title={activeItem.filename}
              showLineNumbers={showLineNumbers}
              allowCopy={allowCopy}
            />
          )}
        </div>
      </div>
    );
  }
);

PolyglotCodeTabs.displayName = 'PolyglotCodeTabs';
