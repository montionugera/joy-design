<script lang="ts">
	export interface TimelineItem {
		title: string;
		description?: string;
		time?: string;
		status?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
	}

	interface Props {
		items?: TimelineItem[];
		class?: string;
		ref?: HTMLUListElement | null;
		[key: string]: any;
	}

	let {
		items = [],
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<ul bind:this={ref} class="joy-timeline {className}" role="list" {...rest}>
	{#each items as item}
		<li class="joy-timeline__item">
			<div class="joy-timeline__dot joy-timeline__dot--{item.status || 'primary'}"></div>
			<div class="joy-timeline__content">
				<div class="joy-timeline__title">{item.title}</div>
				{#if item.description}
					<div class="joy-timeline__description">{item.description}</div>
				{/if}
				{#if item.time}
					<div class="joy-timeline__time">{item.time}</div>
				{/if}
			</div>
		</li>
	{/each}
</ul>
