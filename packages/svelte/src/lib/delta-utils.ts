export type DeltaDirection = 'up' | 'down' | 'flat';

/**
 * Direction of a delta string, taken from its sign and never from its tone.
 * A leading "-" or U+2212 is down, a leading "+" is up, anything else is flat.
 */
export function deltaDirection(text: string | null | undefined): DeltaDirection {
	const first = (text ?? '').trim().charAt(0);
	if (first === '-' || first === '−') return 'down';
	if (first === '+') return 'up';
	return 'flat';
}
