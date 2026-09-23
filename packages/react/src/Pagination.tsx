import * as React from 'react';
import { ChevronLeft, ChevronRight } from '@joymify/icons/react';
import { clampPage, pageCount, pageItems } from './pagination-utils.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  onChange?: (page: number, pageSize: number) => void;
}

export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      current = 1,
      pageSize = 10,
      total = 0,
      showSizeChanger = false,
      pageSizeOptions = [10, 20, 50],
      onChange,
      className = '',
      ...rest
    },
    ref
  ) => {
    const totalPages = pageCount(total, pageSize);
    // A parent can leave `current` stale when `total` shrinks: everything below works from the clamped page.
    const page = clampPage(current, totalPages);

    // Phones show only Previous, the current page and Next. Desktop-first default keeps SSR output full.
    const [compact, setCompact] = React.useState(false);
    React.useEffect(() => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
      const query = window.matchMedia('(max-width: 480px)');
      setCompact(query.matches);
      const sync = (e: MediaQueryListEvent) => setCompact(e.matches);
      query.addEventListener('change', sync);
      return () => query.removeEventListener('change', sync);
    }, []);

    const pages = pageItems(page, totalPages, compact);

    const goToPage = (p: number) => {
      if (p < 1 || p > totalPages || p === page) return;
      onChange?.(p, pageSize);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = Number(e.target.value);
      onChange?.(1, newSize);
    };

    return (
      <nav ref={ref} className={cx('joy-pagination', className)} role="navigation" aria-label="Pagination" {...rest}>
        <button
          type="button"
          className="joy-pagination__btn"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size="1em" />
        </button>

        {pages.map((p) =>
          typeof p === 'number' ? (
            <button
              key={p}
              type="button"
              className={cx('joy-pagination__btn', p === page && 'joy-pagination__btn--active')}
              onClick={() => goToPage(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ) : (
            <span key={p} className="joy-pagination__ellipsis" aria-hidden="true">
              …
            </span>
          )
        )}

        <button
          type="button"
          className="joy-pagination__btn"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size="1em" />
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

        {!compact && <span className="joy-pagination__info">Total: {total} items</span>}
      </nav>
    );
  }
);

Pagination.displayName = 'Pagination';
