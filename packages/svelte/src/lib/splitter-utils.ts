/**
 * Splitter arithmetic shared by the Svelte and React Splitter (identical in both packages).
 * All values are percentages (0-100) of the FIRST pane. Pure and dependency-free, so pointer drag and
 * keyboard nudging land on the same numbers in both frameworks.
 */
/** How the panes are arranged: `horizontal` = side by side (the bar is a vertical line), `vertical` = stacked. */
export type SplitLayout = 'horizontal' | 'vertical';

/** Arrow-key step, in percentage points. Shift (or any `large` request) uses the larger step. */
export const SPLIT_STEP = 5;
export const SPLIT_STEP_LARGE = 10;
/** Viewport width at or below which the Splitter stacks its panes (matches the CSS media query). */
export const SPLIT_STACK_QUERY = '(max-width: 640px)';

/** min/max as an ordered, finite pair inside [0, 100]; a reversed or non-finite pair is repaired, never thrown on. */
function bounds(min: number, max: number): [number, number] {
	const lo = Number.isFinite(min) ? Math.min(100, Math.max(0, min)) : 0;
	const hi = Number.isFinite(max) ? Math.min(100, Math.max(0, max)) : 100;
	return lo <= hi ? [lo, hi] : [hi, lo];
}

/** `value` clamped into [min, max]. NaN falls back to the middle of the range. */
export function clampSplit(value: number, min: number, max: number): number {
	const [lo, hi] = bounds(min, max);
	if (Number.isNaN(value)) return (lo + hi) / 2;
	return Math.min(hi, Math.max(lo, value));
}

/** The pane arrangement in effect: the `layout` prop, unless the viewport is narrow, when panes always stack. */
export function effectiveLayout(layout: SplitLayout, stacked: boolean): SplitLayout {
	return stacked ? 'vertical' : layout;
}

/** `aria-orientation` of the drag bar: side-by-side panes are divided by a vertical bar, stacked panes by a horizontal one. */
export function barOrientation(layout: SplitLayout): 'vertical' | 'horizontal' {
	return layout === 'horizontal' ? 'vertical' : 'horizontal';
}

/**
 * Percentage for a pointer at `offset` px from the container's start edge along the split axis,
 * in a container `size` px long. Returns null when the container has no size (nothing to compute).
 */
export function splitFromPointer(offset: number, size: number, min: number, max: number): number | null {
	if (!Number.isFinite(offset) || !Number.isFinite(size) || size <= 0) return null;
	return clampSplit((offset / size) * 100, min, max);
}

/**
 * Next percentage for a key press on the bar, or null when the key is not one this layout handles (so the
 * caller only calls preventDefault for handled keys). Along the split axis Left/Right (side by side) or
 * Up/Down (stacked) move the bar by SPLIT_STEP, or SPLIT_STEP_LARGE with `large`; Home/End jump to min/max.
 */
export function splitKeyNext(
	key: string,
	current: number,
	layout: SplitLayout,
	min: number,
	max: number,
	large = false
): number | null {
	const [lo, hi] = bounds(min, max);
	if (key === 'Home') return lo;
	if (key === 'End') return hi;
	const step = large ? SPLIT_STEP_LARGE : SPLIT_STEP;
	const back = layout === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
	const forward = layout === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
	if (key === back) return clampSplit(current - step, lo, hi);
	if (key === forward) return clampSplit(current + step, lo, hi);
	return null;
}
