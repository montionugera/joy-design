import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = ''
}) => {
  return (
    <nav className={`joy-breadcrumb ${className}`} aria-label="Breadcrumb">
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
};

Breadcrumb.displayName = 'Breadcrumb';
