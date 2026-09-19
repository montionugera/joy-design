<script lang="ts" module>
	export interface DateRangeValue {
		start: string;
		end: string;
	}
</script>

<script lang="ts">
	import DatePicker from './DatePicker.svelte';

	interface Props {
		value?: DateRangeValue;
		min?: string;
		max?: string;
		disabled?: boolean;
		error?: boolean;
		startId?: string;
		endId?: string;
		onchange?: (v: DateRangeValue) => void;
	}

	let {
		value = $bindable({ start: '', end: '' }),
		min,
		max,
		disabled = false,
		error = false,
		startId,
		endId,
		onchange
	}: Props = $props();

	function commit(next: DateRangeValue) {
		if (next.start && next.end && next.start > next.end) {
			next = { start: next.end, end: next.start };
		}
		value = next;
		onchange?.(next);
	}

	function handleStartChange(e: Event) {
		const v = (e.currentTarget as HTMLInputElement).value;
		commit({ start: v, end: value.end });
	}

	function handleEndChange(e: Event) {
		const v = (e.currentTarget as HTMLInputElement).value;
		commit({ start: value.start, end: v });
	}

	const startMax = $derived(value.end || max);
	const endMin = $derived(value.start || min);
</script>

<div class="joy-date-range-picker" class:joy-date-range-picker--disabled={disabled}>
	<DatePicker
		value={value.start}
		{min}
		max={startMax}
		{disabled}
		{error}
		id={startId}
		onchange={handleStartChange}
	/>
	<span class="joy-date-range-picker__sep" aria-hidden="true">→</span>
	<DatePicker
		value={value.end}
		min={endMin}
		{max}
		{disabled}
		{error}
		id={endId}
		onchange={handleEndChange}
	/>
</div>

<style>
	.joy-date-range-picker {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.joy-date-range-picker :global(.joy-date-picker) {
		flex: 1 1 0;
		min-width: 0;
	}

	.joy-date-range-picker__sep {
		color: var(--joy-color-text-muted, #64748b);
		font-size: 14px;
		flex: 0 0 auto;
	}

	.joy-date-range-picker--disabled .joy-date-range-picker__sep {
		color: var(--joy-color-text-disabled, #94a3b8);
	}
</style>
