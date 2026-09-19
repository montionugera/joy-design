<script lang="ts">
	type Status = 'normal' | 'active' | 'success' | 'exception';

	interface Props {
		percent?: number;
		status?: Status;
		showInfo?: boolean;
		strokeWidth?: number;
		strokeColor?: string;
	}

	let {
		percent = 0,
		status = 'normal',
		showInfo = true,
		strokeWidth = 8,
		strokeColor
	}: Props = $props();

	const computedStatus = $derived.by(() => {
		if (percent >= 100) return 'success';
		return status;
	});
</script>

<div class="joy-progress joy-progress--status-{computedStatus}">
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
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="20 6 9 17 4 12"></polyline>
				</svg>
			{:else if computedStatus === 'exception'}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			{:else}
				{percent}%
			{/if}
		</span>
	{/if}
</div>

<style>
	.joy-progress {
		display: flex;
		align-items: center;
		width: 100%;
		font-size: 14px;
		color: var(--joy-color-text, #0f172a);
	}

	:global(.dark) .joy-progress {
		color: var(--joy-color-text-dark, #f8fafc);
	}

	.joy-progress__outer {
		flex: 1;
		margin-right: 8px;
	}

	.joy-progress__inner {
		background-color: var(--joy-color-bg-muted, #f1f5f9);
		border-radius: 100px;
		overflow: hidden;
	}

	:global(.dark) .joy-progress__inner {
		background-color: var(--joy-color-surface-dark, #334155);
	}

	.joy-progress__bg {
		border-radius: 100px;
		transition: all 0.3s cubic-bezier(0.08, 0.82, 0.17, 1);
		background-color: var(--joy-color-primary, #14253e);
		position: relative;
	}

	:global(.dark) .joy-progress__bg {
		background-color: var(--joy-color-primary-light, #3b82f6);
	}

	.joy-progress--status-success .joy-progress__bg {
		background-color: var(--joy-color-success, #10b981) !important;
	}
	.joy-progress--status-success .joy-progress__text {
		color: var(--joy-color-success, #10b981);
	}

	.joy-progress--status-exception .joy-progress__bg {
		background-color: var(--joy-color-danger, #ef4444) !important;
	}
	.joy-progress--status-exception .joy-progress__text {
		color: var(--joy-color-danger, #ef4444);
	}

	.joy-progress__text {
		width: 2.5em;
		text-align: left;
		margin-left: 8px;
		white-space: nowrap;
		display: flex;
		align-items: center;
		font-size: 13px;
		font-weight: 500;
	}
</style>
