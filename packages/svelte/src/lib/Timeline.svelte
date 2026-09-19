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
	}

	let {
		items = [],
		class: className = ''
	}: Props = $props();
</script>

<ul class="joy-timeline {className}" role="list">
	{#each items as item}
		<li class="joy-timeline__item">
			<div class="joy-timeline__dot joy-timeline__dot--{item.status || 'primary'}"></div>
			<div class="joy-timeline__content">
				<div style="font-weight: 600;">{item.title}</div>
				{#if item.description}
					<div style="color: var(--joy-color-text-muted, #64748b); font-size: 0.8125rem; margin-top: 2px;">
						{item.description}
					</div>
				{/if}
				{#if item.time}
					<div class="joy-timeline__time">{item.time}</div>
				{/if}
			</div>
		</li>
	{/each}
</ul>
