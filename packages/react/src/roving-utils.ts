/**
 * Roving-tabindex helpers shared by Tabs and Menu (identical in the Svelte and React packages).
 * Pure functions on index arrays, so both frameworks move focus the same way.
 */
export type RovingOrientation = 'horizontal' | 'vertical' | 'both';

const PREV_KEYS: Record<RovingOrientation, string[]> = {
	horizontal: ['ArrowLeft'],
	vertical: ['ArrowUp'],
	both: ['ArrowLeft', 'ArrowUp']
};
const NEXT_KEYS: Record<RovingOrientation, string[]> = {
	horizontal: ['ArrowRight'],
	vertical: ['ArrowDown'],
	both: ['ArrowRight', 'ArrowDown']
};

/**
 * Index to move focus to for a key press, or -1 when the key is not a navigation key for this
 * orientation (or every item is disabled). Arrows wrap around, Home/End jump to the first/last
 * enabled item, and disabled items are always skipped.
 * `current` may be -1 (nothing focused): Next then lands on the first item, Previous on the last.
 */
export function rovingNextIndex(
	key: string,
	current: number,
	disabled: readonly boolean[],
	orientation: RovingOrientation = 'horizontal'
): number {
	const count = disabled.length;
	const firstEnabled = disabled.findIndex((d) => !d);
	if (count === 0 || firstEnabled === -1) return -1;

	if (key === 'Home') return firstEnabled;
	if (key === 'End') return disabled.lastIndexOf(false);

	let step = 0;
	if (NEXT_KEYS[orientation].includes(key)) step = 1;
	else if (PREV_KEYS[orientation].includes(key)) step = -1;
	else return -1;

	const valid = Number.isInteger(current) && current >= 0 && current < count;
	let i = valid ? current : step === 1 ? -1 : count;
	for (let n = 0; n < count; n++) {
		i = (i + step + count) % count;
		if (!disabled[i]) return i;
	}
	return -1;
}

/**
 * The single index that should carry tabindex="0". The first entry of `preferred` (e.g. the item that
 * last had focus, then the selected item) that is in range and enabled wins; otherwise the first
 * enabled item; -1 when there is none.
 */
export function rovingTabbableIndex(disabled: readonly boolean[], preferred: readonly number[] = []): number {
	for (const p of preferred) {
		if (Number.isInteger(p) && p >= 0 && p < disabled.length && !disabled[p]) return p;
	}
	return disabled.findIndex((d) => !d);
}
