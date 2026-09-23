import * as React from 'react';
import { useMergedRef } from './dialog-hooks.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const tokens = (value: string | null) => (value ?? '').split(/\s+/).filter(Boolean);

/** `ref` and `...rest` land on the wrapper (`.joy-tooltip-wrapper`), like the Svelte twin. */
export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    { title, children, className = '', onPointerEnter, onPointerLeave, onPointerDown, onFocus, onBlur, onClick, ...rest },
    ref
  ) => {
    const tooltipId = `${React.useId()}-tip`;
    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
    const setWrapperRef = useMergedRef(ref, wrapperRef);

    // Three independent reasons to be visible. Mouse hover and keyboard focus behave as before; a tap on a
    // touch/pen device has no hover, so it pins the tooltip until the next tap on the trigger, an outside
    // tap, or Escape.
    const [hovered, setHovered] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const [pinned, setPinned] = React.useState(false);
    const lastPointerType = React.useRef('mouse');
    const visible = hovered || focused || pinned;

    const dismiss = () => {
      setHovered(false);
      setFocused(false);
      setPinned(false);
    };

    React.useEffect(() => {
      const wrapper = wrapperRef.current;
      if (!visible || !wrapper) return;
      const first = wrapper.firstElementChild;
      const trigger = first && first.id !== tooltipId ? first : wrapper;
      const before = tokens(trigger.getAttribute('aria-describedby'));
      if (!before.includes(tooltipId)) trigger.setAttribute('aria-describedby', [...before, tooltipId].join(' '));
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        // Claim the key so a dialog around the trigger stays open: Escape dismisses the tooltip first.
        e.preventDefault();
        dismiss();
      };
      const onDocPointerDown = (e: PointerEvent) => {
        if (wrapper.contains(e.target as Node)) return;
        dismiss();
      };
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('pointerdown', onDocPointerDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('pointerdown', onDocPointerDown);
        const remaining = tokens(trigger.getAttribute('aria-describedby')).filter((t) => t !== tooltipId);
        if (remaining.length) trigger.setAttribute('aria-describedby', remaining.join(' '));
        else trigger.removeAttribute('aria-describedby');
      };
    }, [visible, tooltipId]);

    return (
      <div
        {...rest}
        ref={setWrapperRef}
        className={cx('joy-tooltip-wrapper', className)}
        onPointerEnter={(e) => {
          onPointerEnter?.(e);
          lastPointerType.current = e.pointerType;
          if (e.pointerType !== 'touch') setHovered(true);
        }}
        onPointerLeave={(e) => {
          onPointerLeave?.(e);
          if (e.pointerType !== 'touch') setHovered(false);
        }}
        onPointerDown={(e) => {
          onPointerDown?.(e);
          lastPointerType.current = e.pointerType;
        }}
        onFocus={(e) => {
          onFocus?.(e);
          setFocused(true);
        }}
        onBlur={(e) => {
          onBlur?.(e);
          setFocused(false);
        }}
        onClick={(e) => {
          onClick?.(e);
          if (lastPointerType.current === 'mouse') return;
          if (pinned) dismiss();
          else setPinned(true);
        }}
      >
        {children}
        {visible && (
          <div id={tooltipId} className="joy-tooltip" role="tooltip">
            {title}
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';
