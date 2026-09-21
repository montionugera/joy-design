import * as React from 'react';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  density?: 'compact' | 'normal';
  responsive?: 'scroll' | 'stack' | boolean;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  density = 'compact',
  responsive = 'stack',
  sortKey: controlledSortKey,
  sortDirection: controlledSortDirection,
  onSort,
  className = ''
}: TableProps<T>) {
  const [internalSortKey, setInternalSortKey] = React.useState<string>('');
  const [internalSortDir, setInternalSortDir] = React.useState<'asc' | 'desc'>('asc');

  const activeSortKey = controlledSortKey !== undefined ? controlledSortKey : internalSortKey;
  const activeSortDir = controlledSortDirection !== undefined ? controlledSortDirection : internalSortDir;

  const isStack = responsive === 'stack' || responsive === true;

  const handleHeaderClick = (col: Column<T>) => {
    if (!col.sortable) return;
    const key = String(col.key);
    let nextDir: 'asc' | 'desc' = 'asc';
    if (activeSortKey === key) {
      nextDir = activeSortDir === 'asc' ? 'desc' : 'asc';
    }
    if (controlledSortKey === undefined) {
      setInternalSortKey(key);
      setInternalSortDir(nextDir);
    }
    onSort?.(key, nextDir);
  };

  return (
    <div className={`joy-table-container ${isStack ? 'joy-table-container--responsive-stack' : ''} ${className}`}>
      <table className={`joy-table joy-table--${density} ${isStack ? 'joy-table--responsive-stack' : ''}`}>
        <thead>
          <tr>
            {columns.map((col, idx) => {
              const key = String(col.key);
              const isSorted = activeSortKey === key;
              const thClass = [
                col.sortable ? 'joy-table-th--sortable' : '',
                isSorted && activeSortDir === 'asc' ? 'joy-table-th--sorted-asc' : '',
                isSorted && activeSortDir === 'desc' ? 'joy-table-th--sorted-desc' : ''
              ].filter(Boolean).join(' ');

              return (
                <th
                  key={key || idx}
                  className={thClass || undefined}
                  style={{
                    width: col.width,
                    textAlign: col.align || 'left'
                  }}
                  onClick={() => handleHeaderClick(col)}
                >
                  <span>{col.title}</span>
                  {col.sortable && (
                    <span className="joy-table-sort-icon">
                      {isSorted ? (
                        activeSortDir === 'asc' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Sorted ascending">
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Sorted descending">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        )
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Sortable">
                          <path d="m7 15 5 5 5-5" />
                          <path d="m7 9 5-5 5 5" />
                        </svg>
                      )}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIdx) => (
            <tr key={rIdx}>
              {columns.map((col, cIdx) => {
                const flash = row._flash?.[col.key];
                const tdClass = flash === 'up'
                  ? 'joy-table-cell--flash-up'
                  : flash === 'down'
                  ? 'joy-table-cell--flash-down'
                  : undefined;

                return (
                  <td
                    key={String(col.key) || cIdx}
                    data-label={col.title}
                    className={tdClass}
                    style={{ textAlign: col.align || 'left' }}
                  >
                    {row[col.key] ?? ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.displayName = 'Table';
