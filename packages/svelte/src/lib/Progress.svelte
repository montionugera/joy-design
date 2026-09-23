<script lang="ts">
	type Status = 'normal' | 'active' | 'success' | 'exception';

	interface Props {
		percent?: number;
		status?: Status;
		showInfo?: boolean;
		strokeWidth?: number;
		strokeColor?: string;
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		percent = 0,
		status = 'normal',
		showInfo = true,
		strokeWidth = 8,
		strokeColor,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const computedStatus = $derived.by(() => {
		if (percent >= 100) return 'success';
		return status;
	});

	const valueNow = $derived(Math.min(100, Math.max(0, percent)));
</script>

<div
	bind:this={ref}
	class="joy-progress joy-progress--status-{computedStatus} {className}"
	role="progressbar"
	aria-valuenow={valueNow}
	aria-valuemin="0"
	aria-valuemax="100"
	{...rest}
>
	<div class="joy-progress__outer">
		<div class="joy-progress__inner">
			<div
				class="joy-progress__bg"
				style="width: {percent}%; height: {strokeWidth}px; background-color: {strokeColor || ''}"
			></div>
		</div>
	</div>
	{#if showInfo}
		<span class="joy-progress__text">
			{#if computedStatus === 'success'}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
			{:else if computedStatus === 'exception'}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			{:else}
				{percent}%
			{/if}
		</span>
	{/if}
</div>
