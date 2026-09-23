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
		defaultValue?: DateRangeValue;
		min?: string;
		max?: string;
		disabled?: boolean;
		error?: boolean;
		startId?: string;
		endId?: string;
		onchange?: (v: DateRangeValue) => void;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		defaultValue = { start: '', end: '' },
		value = $bindable(defaultValue),
		min,
		max,
		disabled = false,
		error = false,
		startId,
		endId,
		onchange,
		class: className = '',
		ref = $bindable(null),
		...rest
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

<div
	bind:this={ref}
	class="joy-date-range-picker {disabled ? 'joy-date-range-picker--disabled' : ''} {className}"
	{...rest}
>
	<DatePicker
		value={value.start}
		{min}
		max={startMax}
		{disabled}
		{error}
		id={startId}
		onchange={handleStartChange}
	/>
	<span class="joy-date-range-picker__sep" aria-hidden="true">to</span>
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
