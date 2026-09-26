/**
 * Sortable-header logic shared by the Svelte and React Table (identical in both packages).
 * The sort cycle itself is unchanged: a new column starts ascending, the active column toggles.
 */
export type SortDirection = 'asc' | 'desc';
export type AriaSort = 'ascending' | 'descending' | 'none';

/** `aria-sort` value for the column `key`: the active column reports its direction, every other sortable column `none`. */
export function ariaSort(sortKey: string, sortDirection: SortDirection, key: string): AriaSort {
	if (sortKey !== key) return 'none';
	return sortDirection === 'desc' ? 'descending' : 'ascending';
}

/** Direction after activating the header of column `key`: ascending for a new column, toggled for the active one. */
export function nextSort(sortKey: string, sortDirection: SortDirection, key: string): SortDirection {
	if (sortKey !== key) return 'asc';
	return sortDirection === 'asc' ? 'desc' : 'asc';
}

/** True for the keys that activate a sortable header from the keyboard (Enter and Space, like a button). */
export function isSortActivationKey(key: string): boolean {
	return key === 'Enter' || key === ' ' || key === 'Spacebar';
}
