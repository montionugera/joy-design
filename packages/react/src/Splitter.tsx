import React, { forwardRef, useState } from 'react';

export interface SplitterProps extends React.HTMLAttributes<HTMLDivElement> {
  layout?: 'horizontal' | 'vertical';
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
      ...props
    },
    ref
  ) => {
    const [splitRatio, setSplitRatio] = useState(defaultSplit);
    const [isResizing, setIsResizing] = useState(false);

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsResizing(true);
      e.preventDefault();

      const startX = e.clientX;
      const startY = e.clientY;
      const initialRatio = splitRatio;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = layout === 'horizontal' ? moveEvent.clientX - startX : moveEvent.clientY - startY;
        const total = layout === 'horizontal' ? window.innerWidth : window.innerHeight;
        const newRatio = initialRatio + (delta / (total * 0.5)) * 100;
        setSplitRatio(Math.max(min, Math.min(max, newRatio)));
      };

      const onMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    return (
      <div
        ref={ref}
        className={`joy-splitter joy-splitter--${layout} ${className}`}
        role="group"
        aria-label="Resizable Splitter Panel"
        {...props}
      >
        <div
          className="joy-splitter__pane"
          style={layout === 'horizontal' ? { width: `${splitRatio}%` } : { height: `${splitRatio}%` }}
        >
          {firstPane}
        </div>

        <div
          className={`joy-splitter__bar ${isResizing ? 'joy-splitter__bar--active' : ''}`}
          role="separator"
          tabIndex={0}
          onMouseDown={handleMouseDown}
          aria-valuenow={Math.round(splitRatio)}
          aria-valuemin={min}
          aria-valuemax={max}
        />

        <div
          className="joy-splitter__pane"
          style={layout === 'horizontal' ? { width: `${100 - splitRatio}%` } : { height: `${100 - splitRatio}%` }}
        >
          {secondPane}
        </div>
      </div>
    );
  }
);

Splitter.displayName = 'Splitter';
