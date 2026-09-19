import * as React from 'react';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  content?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey: controlledKey,
  onChange,
  className = ''
}) => {
  const [internalKey, setInternalKey] = React.useState(items[0]?.key || '');
  const activeKey = controlledKey !== undefined ? controlledKey : internalKey;

  const handleTabClick = (key: string) => {
    setInternalKey(key);
    onChange?.(key);
  };

  const activeItem = items.find((item) => item.key === activeKey);

  return (
    <div className={`joy-tabs-container ${className}`}>
      <div className="joy-tabs" role="tablist">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={activeKey === item.key}
            className={`joy-tab-btn ${activeKey === item.key ? 'joy-tab-btn--active' : ''}`}
            onClick={() => handleTabClick(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="joy-tab-content" role="tabpanel">
        {activeItem?.content}
      </div>
    </div>
  );
};

Tabs.displayName = 'Tabs';
