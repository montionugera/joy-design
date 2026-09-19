<script lang="ts">
	interface Props {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		showTooltip?: boolean;
		onchange?: (val: number) => void;
	}

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		showTooltip = true,
		onchange
	}: Props = $props();

	let isDragging = $state(false);
	let sliderRef: HTMLDivElement | null = $state(null);

	const percentage = $derived.by(() => {
		const clamped = Math.min(Math.max(value, min), max);
		return ((clamped - min) / (max - min)) * 100;
	});

	function updateFromPointer(clientX: number) {
		if (disabled || !sliderRef) return;
		const rect = sliderRef.getBoundingClientRect();
		const raw = ((clientX - rect.left) / rect.width) * (max - min) + min;
		const stepped = Math.round(raw / step) * step;
		const clamped = Math.min(Math.max(stepped, min), max);
		value = clamped;
		onchange?.(value);
	}

	function handlePointerDown(e: PointerEvent) {
		if (disabled) return;
		isDragging = true;
		(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
		updateFromPointer(e.clientX);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		updateFromPointer(e.clientX);
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		try {
			(e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
		} catch {}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (disabled) return;
		if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			e.preventDefault();
			value = Math.min(value + step, max);
			onchange?.(value);
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			e.preventDefault();
			value = Math.max(value - step, min);
			onchange?.(value);
		}
	}
</script>

<div
	bind:this={sliderRef}
	class="joy-slider"
	class:joy-slider--disabled={disabled}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	role="presentation"
>
	<div class="joy-slider__rail"></div>
	<div class="joy-slider__track" style="width: {percentage}%;"></div>
	<div
		class="joy-slider__handle"
		style="left: {percentage}%;"
		role="slider"
		tabindex={disabled ? -1 : 0}
		aria-valuenow={value}
		aria-valuemin={min}
		aria-valuemax={max}
		aria-disabled={disabled}
		onkeydown={handleKeyDown}
	>
		{#if showTooltip && isDragging}
			<div class="joy-slider__tooltip">{value}</div>
		{/if}
	</div>
</div>
