import React, { useState, useRef } from 'react';

export interface SliderProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showTooltip?: boolean;
  className?: string;
  onChange?: (val: number) => void;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(({
  value: controlledValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showTooltip = true,
  className = '',
  onChange
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);
  const internalRef = useRef<HTMLDivElement | null>(null);

  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const clamped = Math.min(Math.max(currentValue, min), max);
  const percentage = ((clamped - min) / (max - min)) * 100;

  const updateFromPointer = (clientX: number) => {
    const el = internalRef.current;
    if (disabled || !el) return;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * (max - min) + min;
    const stepped = Math.round(raw / step) * step;
    const nextVal = Math.min(Math.max(stepped, min), max);
    if (controlledValue === undefined) {
      setInternalValue(nextVal);
    }
    onChange?.(nextVal);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {}
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const nextVal = Math.min(currentValue + step, max);
      if (controlledValue === undefined) setInternalValue(nextVal);
      onChange?.(nextVal);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextVal = Math.max(currentValue - step, min);
      if (controlledValue === undefined) setInternalValue(nextVal);
      onChange?.(nextVal);
    }
  };

  return (
    <div
      ref={(node) => {
        internalRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={`joy-slider ${disabled ? 'joy-slider--disabled' : ''} ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="presentation"
    >
      <div className="joy-slider__rail" />
      <div className="joy-slider__track" style={{ width: `${percentage}%` }} />
      <div
        className="joy-slider__handle"
        style={{ left: `${percentage}%` }}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuenow={currentValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-disabled={disabled}
        onKeyDown={handleKeyDown}
      >
        {showTooltip && isDragging && (
          <div className="joy-slider__tooltip">{currentValue}</div>
        )}
      </div>
    </div>
  );
});

Slider.displayName = 'Slider';
