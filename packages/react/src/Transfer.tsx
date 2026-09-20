import * as React from 'react';

export interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
}

export interface TransferProps {
  dataSource: TransferItem[];
  targetKeys?: string[];
  titles?: [string, string];
  className?: string;
  onChange?: (nextTargetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
}

export const Transfer = React.forwardRef<HTMLDivElement, TransferProps>(
  ({
    dataSource = [],
    targetKeys: controlledTargetKeys,
    titles = ['Source', 'Target'],
    className = '',
    onChange
  }, ref) => {
    const [internalTargetKeys, setInternalTargetKeys] = React.useState<string[]>([]);
    const [sourceSelected, setSourceSelected] = React.useState<string[]>([]);
    const [targetSelected, setTargetSelected] = React.useState<string[]>([]);

    const targetKeys = controlledTargetKeys !== undefined ? controlledTargetKeys : internalTargetKeys;

    const sourceItems = dataSource.filter(item => !targetKeys.includes(item.key));
    const targetItems = dataSource.filter(item => targetKeys.includes(item.key));

    const toggleSource = (key: string) => {
      setSourceSelected(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    };

    const toggleTarget = (key: string) => {
      setTargetSelected(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    };

    const moveToTarget = () => {
      if (sourceSelected.length === 0) return;
      const moveKeys = [...sourceSelected];
      const next = [...targetKeys, ...moveKeys];
      if (controlledTargetKeys === undefined) {
        setInternalTargetKeys(next);
      }
      setSourceSelected([]);
      onChange?.(next, 'right', moveKeys);
    };

    const moveToSource = () => {
      if (targetSelected.length === 0) return;
      const moveKeys = [...targetSelected];
      const next = targetKeys.filter(k => !moveKeys.includes(k));
      if (controlledTargetKeys === undefined) {
        setInternalTargetKeys(next);
      }
      setTargetSelected([]);
      onChange?.(next, 'left', moveKeys);
    };

    return (
      <div ref={ref} className={`joy-transfer ${className}`.trim()}>
        {/* Source List */}
        <div className="joy-transfer__list">
          <div className="joy-transfer__header">
            <span className="joy-transfer__header-title">{titles[0]}</span>
            <span className="joy-transfer__header-count">
              {sourceSelected.length}/{sourceItems.length} items
            </span>
          </div>
          <div className="joy-transfer__body">
            {sourceItems.map(item => (
              <label key={item.key} className="joy-transfer__item">
                <input
                  type="checkbox"
                  checked={sourceSelected.includes(item.key)}
                  disabled={item.disabled}
                  onChange={() => toggleSource(item.key)}
                />
                <span className="joy-transfer__item-text">{item.title}</span>
              </label>
            ))}
            {sourceItems.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--joy-color-text-muted, #94a3b8)', fontSize: '0.8125rem' }}>
                No items
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="joy-transfer__operations">
          <button
            type="button"
            className="joy-button joy-button--primary joy-button--sm"
            disabled={sourceSelected.length === 0}
            onClick={moveToTarget}
            aria-label="Move selected right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <button
            type="button"
            className="joy-button joy-button--primary joy-button--sm"
            disabled={targetSelected.length === 0}
            onClick={moveToSource}
            aria-label="Move selected left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Target List */}
        <div className="joy-transfer__list">
          <div className="joy-transfer__header">
            <span className="joy-transfer__header-title">{titles[1]}</span>
            <span className="joy-transfer__header-count">
              {targetSelected.length}/{targetItems.length} items
            </span>
          </div>
          <div className="joy-transfer__body">
            {targetItems.map(item => (
              <label key={item.key} className="joy-transfer__item">
                <input
                  type="checkbox"
                  checked={targetSelected.includes(item.key)}
                  disabled={item.disabled}
                  onChange={() => toggleTarget(item.key)}
                />
                <span className="joy-transfer__item-text">{item.title}</span>
              </label>
            ))}
            {targetItems.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--joy-color-text-muted, #94a3b8)', fontSize: '0.8125rem' }}>
                No items
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Transfer.displayName = 'Transfer';
