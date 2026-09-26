/**
 * Windowed page list shared by Pagination (identical in the Svelte and React packages).
 * Large totals never render one button per page: `1 … 4 5 6 … 100`.
 */
export type PageItem = number | 'start-ellipsis' | 'end-ellipsis';

const range = (from: number, to: number): number[] =>
	Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

/** Number of pages for `total` items at `pageSize` per page: at least 1, and 1 for non-finite or non-positive input. */
export function pageCount(total: number, pageSize: number): number {
	const n = Math.ceil(total / pageSize);
	return Number.isFinite(n) && n >= 1 ? n : 1;
}

/** `current` clamped into [1, totalPages] (totalPages floored, at least 1); NaN and non-finite input give page 1. */
export function clampPage(current: number, totalPages: number): number {
	const last = Number.isFinite(totalPages) ? Math.max(1, Math.floor(totalPages)) : 1;
	return Number.isFinite(current) ? Math.min(last, Math.max(1, Math.floor(current))) : 1;
}

/**
 * Pages to render for `current` of `total`. Always the first and last page, `siblings` pages either
 * side of the current one, and an ellipsis in place of every gap of two or more pages, so a long list
 * keeps a constant `2 * siblings + 5` slots (7 by default) and never jumps width while paging.
 * A total that fits in those slots is returned in full. Out-of-range input is clamped.
 */
export function pageWindow(current: number, total: number, siblings = 1): PageItem[] {
	const last = Number.isFinite(total) ? Math.max(1, Math.floor(total)) : 1;
	const s = Math.max(0, Math.floor(siblings));
	const page = clampPage(current, last);
	if (last <= 2 * s + 5) return range(1, last);

	const left = Math.max(page - s, 1);
	const right = Math.min(page + s, last);
	const showStart = left > 3;
	const showEnd = right < last - 2;
	const edge = 3 + 2 * s;

	if (!showStart && showEnd) return [...range(1, edge), 'end-ellipsis', last];
	if (showStart && !showEnd) return [1, 'start-ellipsis', ...range(last - edge + 1, last)];
	return [1, 'start-ellipsis', ...range(left, right), 'end-ellipsis', last];
}

/** Compact (phone) rule: only the current page is shown between Previous and Next. */
export function pageItems(current: number, total: number, compact: boolean): PageItem[] {
	return compact ? [clampPage(current, total)] : pageWindow(current, total);
}
