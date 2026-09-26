import React, { forwardRef, useEffect, useState } from 'react';
import {
  SPLIT_STACK_QUERY,
  barOrientation,
  clampSplit,
  effectiveLayout,
  resolveBounds,
  splitFromPointer,
  splitKeyNext,
  type SplitLayout
} from './splitter-utils.js';

export interface SplitterProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: SplitLayout;
  /** Initial share of the first pane, in percent (0 to 100). */
  defaultSplit?: number;
  min?: number;
  max?: number;
  firstPane?: React.ReactNode;
  secondPane?: React.ReactNode;
}

export const Splitter = forwardRef<HTMLDivElement, SplitterProps>(
  (
    {
      layout = 'horizontal',
      defaultSplit = 50,
      min = 10,
      max = 90,
      firstPane,
      secondPane,
      className = '',
      ...rest
    },
    ref
  ) => {
    // The panes' share of the container, in percent. Always read through `ratio` so a later min/max change re-clamps it.
    const [splitRatio, setSplitRatio] = useState(defaultSplit);
    const ratio = clampSplit(splitRatio, min, max);
    // aria-valuemin/max report the bounds actually enforced (a reversed or out-of-range min/max is repaired).
    const [boundMin, boundMax] = resolveBounds(min, max);
    const [isResizing, setIsResizing] = useState(false);

    // Phones stack the panes whatever `layout` says. The drag axis and arrow keys must flip with it, so this is
    // state, not just CSS. Desktop-first default keeps SSR output side by side.
    const [stacked, setStacked] = useState(false);
    useEffect(() => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
      const query = window.matchMedia(SPLIT_STACK_QUERY);
      setStacked(query.matches);
      const sync = (e: MediaQueryListEvent) => setStacked(e.matches);
      query.addEventListener('change', sync);
      return () => query.removeEventListener('change', sync);
    }, []);
    const arrangement = effectiveLayout(layout, stacked);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      setIsResizing(true);
      e.preventDefault();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      e.currentTarget.focus();
    };

    // The bar's parent is the splitter root: that is the box the ratio is measured against.
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      const root = e.currentTarget.parentElement;
      if (!isResizing || !root) return;
      const rect = root.getBoundingClientRect();
      const next =
        arrangement === 'horizontal'
          ? splitFromPointer(e.clientX - rect.left, rect.width, min, max)
          : splitFromPointer(e.clientY - rect.top, rect.height, min, max);
      if (next !== null) setSplitRatio(next);
    };

    const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
      setIsResizing(false);
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const next = splitKeyNext(e.key, ratio, arrangement, min, max, e.shiftKey);
      if (next === null) return;
      e.preventDefault();
      setSplitRatio(next);
    };

    return (
      <div
        ref={ref}
        className={`joy-splitter joy-splitter--${layout} ${className}`}
        role="group"
        aria-label="Resizable Splitter Panel"
        {...rest}
      >
        <div className="joy-splitter__pane" style={{ '--joy-splitter-size': ratio } as React.CSSProperties}>
          {firstPane}
        </div>

        <div
          className={`joy-splitter__bar ${isResizing ? 'joy-splitter__bar--active' : ''}`}
          role="separator"
          aria-label="Resize panes"
          aria-orientation={barOrientation(arrangement)}
          aria-valuenow={Math.round(ratio)}
          aria-valuemin={boundMin}
          aria-valuemax={boundMax}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onLostPointerCapture={handlePointerEnd}
          onKeyDown={handleKeyDown}
        />

        <div className="joy-splitter__pane" style={{ '--joy-splitter-size': 100 - ratio } as React.CSSProperties}>
          {secondPane}
        </div>
      </div>
    );
  }
);

Splitter.displayName = 'Splitter';
