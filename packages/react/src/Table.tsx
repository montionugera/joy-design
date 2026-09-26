import * as React from 'react';
import { ariaSort, isSortActivationKey, nextSort } from './table-utils.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  columns: Column<T>[];
  data: T[];
  density?: 'compact' | 'normal';
  responsive?: 'scroll' | 'stack' | boolean;
  /** `stack` turns rows into label/value cards on phones; `scroll` keeps the table and pins its first column while scrolling sideways. Omitted: follows `responsive`. */
  variant?: 'stack' | 'scroll';
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

function TableInner<T extends Record<string, any>>(
  {
    columns,
    data,
    density = 'compact',
    responsive = 'stack',
    variant,
    sortKey: controlledSortKey,
    sortDirection: controlledSortDirection,
    onSort,
    className = '',
    ...rest
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [internalSortKey, setInternalSortKey] = React.useState<string>('');
  const [internalSortDir, setInternalSortDir] = React.useState<'asc' | 'desc'>('asc');

  const activeSortKey = controlledSortKey !== undefined ? controlledSortKey : internalSortKey;
  const activeSortDir = controlledSortDirection !== undefined ? controlledSortDirection : internalSortDir;

  const isScroll = variant === 'scroll';
  const isStack = variant ? variant === 'stack' : responsive === 'stack' || responsive === true;

  const handleHeaderClick = (col: Column<T>) => {
    if (!col.sortable) return;
    const key = String(col.key);
    const nextDir = nextSort(activeSortKey, activeSortDir, key);
    if (controlledSortKey === undefined) {
      setInternalSortKey(key);
      setInternalSortDir(nextDir);
    }
    onSort?.(key, nextDir);
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent<HTMLTableCellElement>, col: Column<T>) => {
    if (!col.sortable || e.target !== e.currentTarget || !isSortActivationKey(e.key)) return;
    e.preventDefault();
    handleHeaderClick(col);
  };

  return (
    // A scrollable region must be keyboard-focusable (WCAG 2.1.1) or its off-screen columns are unreachable.
    // These attributes come before {...rest} so a consumer can override the label or role.
    <div
      ref={ref}
      tabIndex={isScroll ? 0 : undefined}
      role={isScroll ? 'region' : undefined}
      aria-label={isScroll ? 'Scrollable table' : undefined}
      className={cx('joy-table-container', isStack && 'joy-table-container--responsive-stack', isScroll && 'joy-table-container--scroll', className)}
      {...rest}
    >
      <table className={cx('joy-table', `joy-table--${density}`, isStack && 'joy-table--responsive-stack', isScroll && 'joy-table--scroll')}>
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
                  tabIndex={col.sortable ? 0 : undefined}
                  aria-sort={col.sortable ? ariaSort(activeSortKey, activeSortDir, key) : undefined}
                  onClick={() => handleHeaderClick(col)}
                  onKeyDown={(e) => handleHeaderKeyDown(e, col)}
                >
                  <span>{col.title}</span>
                  {col.sortable && (
                    <span className="joy-table-sort-icon">
                      {isSorted ? (
                        activeSortDir === 'asc' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        )
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

// forwardRef erases the generic row type; this cast restores it for consumers.
export const Table = React.forwardRef(TableInner) as <T extends Record<string, any>>(
  props: TableProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null;

(Table as { displayName?: string }).displayName = 'Table';
