import * as React from 'react';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  density?: 'compact' | 'normal';
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  density = 'compact',
  className = ''
}: TableProps<T>) {
  return (
    <div className={`joy-table-container ${className}`}>
      <table className={`joy-table joy-table--${density}`}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={String(col.key) || idx} style={col.width ? { width: col.width } : undefined}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIdx) => (
            <tr key={rIdx}>
              {columns.map((col, cIdx) => (
                <td key={String(col.key) || cIdx}>{row[col.key] ?? ''}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.displayName = 'Table';
