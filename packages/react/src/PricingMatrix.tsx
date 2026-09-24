import React, { forwardRef } from 'react';
import { Check, Minus } from '@joymify/icons/react';

export interface PricingMatrixRow {
  label: string;
  values: Array<string | boolean>;
}

// `columns` and `rows` are a pair. Pass both for the data variant (a real table in a scroll region, `label` names that
// region; an `aria-label` passed through rest lands on the non-landmark wrapper). Pass only one, or neither, and the
// component renders the children card grid instead (the lone data prop is ignored). Each row's `values` should have one
// entry per column; a shorter or longer row renders a ragged table.
export interface PricingMatrixProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: string[];
  rows?: PricingMatrixRow[];
  rowHeaderLabel?: string;
  label?: string;
  children?: React.ReactNode;
}

export const PricingMatrix = forwardRef<HTMLDivElement, PricingMatrixProps>(
  (
    { columns, rows, rowHeaderLabel = 'Feature', label = 'Pricing plans', children, className = '', ...rest },
    ref
  ) => {
    if (columns === undefined || rows === undefined) {
      return (
        <div ref={ref} className={`joy-pricing-matrix ${className}`} role="region" aria-label={label} {...rest}>
          {children}
        </div>
      );
    }
    return (
      <div ref={ref} className={`joy-pricing-matrix joy-pricing-matrix--table ${className}`} {...rest}>
        <div className="joy-pricing-matrix__scroll" role="region" tabIndex={0} aria-label={label}>
          <table className="joy-table joy-table--scroll joy-pricing-matrix__table">
            <thead>
              <tr>
                <th scope="col">{rowHeaderLabel}</th>
                {columns.map((column, idx) => (
                  <th key={idx} scope="col">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  <th scope="row">{row.label}</th>
                  {row.values.map((value, idx) => (
                    <td key={idx}>
                      {value === true ? (
                        <span className="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included">
                          <Check size="18" />
                        </span>
                      ) : value === false ? (
                        <span className="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included">
                          <Minus size="18" />
                        </span>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
);

PricingMatrix.displayName = 'PricingMatrix';
