import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  separator?: string;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, separator = '/', className = '', ...rest }, ref) => {
    return (
      <nav ref={ref} className={cx('joy-breadcrumb', className)} aria-label="Breadcrumb" {...rest}>
        <ol>
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.label + i}>
                {isLast || !item.href ? (
                  <span className="joy-breadcrumb__current" aria-current={isLast ? 'page' : undefined}>
                    {item.label}
                  </span>
                ) : (
                  <a className="joy-breadcrumb__link" href={item.href}>
                    {item.label}
                  </a>
                )}
                {!isLast && (
                  <span className="joy-breadcrumb__sep" aria-hidden="true">
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';
