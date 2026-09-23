<script lang="ts">
	export interface StepItem {
		title: string;
		description?: string;
		status?: 'wait' | 'process' | 'finish' | 'error';
	}

	interface Props {
		current?: number;
		items?: StepItem[];
		direction?: 'horizontal' | 'vertical';
		onchange?: (step: number) => void;
		class?: string;
		ref?: HTMLElement | null;
		[key: string]: any;
	}

	let {
		current = 0,
		items = [],
		direction = 'horizontal',
		onchange,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	function getItemStatus(item: StepItem, index: number): 'wait' | 'process' | 'finish' | 'error' {
		if (item.status) return item.status;
		if (index < current) return 'finish';
		if (index === current) return 'process';
		return 'wait';
	}
</script>

<div bind:this={ref} class="joy-steps joy-steps--{direction} {className}" role="navigation" aria-label="Steps progress" {...rest}>
	{#each items as item, index}
		{@const status = getItemStatus(item, index)}
		<div
			class="joy-steps__item joy-steps__item--{status}"
			role="button"
			tabindex="0"
			onclick={() => onchange?.(index)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onchange?.(index);
				}
			}}
			aria-current={index === current ? 'step' : undefined}
		>
			<div class="joy-steps__icon">
				{#if status === 'finish'}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<polyline points="20 6 9 17 4 12"></polyline>
					</svg>
				{:else if status === 'error'}
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				{:else}
					{index + 1}
				{/if}
			</div>
			<div class="joy-steps__content">
				<div class="joy-steps__title">{item.title}</div>
				{#if item.description}
					<div class="joy-steps__desc">{item.description}</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
