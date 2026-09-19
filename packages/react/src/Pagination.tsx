import * as React from 'react';

export interface PaginationProps {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  onChange?: (page: number, pageSize: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  current = 1,
  pageSize = 10,
  total = 0,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50],
  onChange,
  className = ''
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages || p === current) return;
    onChange?.(p, pageSize);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    onChange?.(1, newSize);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={`joy-pagination ${className}`} role="navigation" aria-label="Pagination">
      <button
        type="button"
        className="joy-pagination__btn"
        disabled={current <= 1}
        onClick={() => goToPage(current - 1)}
        aria-label="Previous page"
      >
        &larr;
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`joy-pagination__btn ${p === current ? 'joy-pagination__btn--active' : ''}`}
          onClick={() => goToPage(p)}
          aria-current={p === current ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="joy-pagination__btn"
        disabled={current >= totalPages}
        onClick={() => goToPage(current + 1)}
        aria-label="Next page"
      >
        &rarr;
      </button>

      {showSizeChanger && (
        <select
          className="joy-select"
          style={{ width: 'auto', padding: '4px 28px 4px 8px', fontSize: '0.8125rem', marginLeft: '8px' }}
          value={pageSize}
          onChange={handlePageSizeChange}
          aria-label="Items per page"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      )}

      <span className="joy-pagination__info">Total: {total} items</span>
    </nav>
  );
};

Pagination.displayName = 'Pagination';
