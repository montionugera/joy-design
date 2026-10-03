<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	export type CommandIslandPosition = 'bottom-floating' | 'bottom-fixed' | 'top-header';

	export interface CommandIslandItem {
		id: string;
		label: string;
		active?: boolean;
		kbd?: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		position?: CommandIslandPosition;
		items: CommandIslandItem[];
		onselect?: (id: string) => void;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		position = 'bottom-floating',
		items = [],
		onselect,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	function handleItemClick(id: string) {
		if (onselect) {
			onselect(id);
		}
	}
</script>

<div
	bind:this={ref}
	class="joy-command-island joy-command-island--{position} {className}"
	{...rest}
>
	<div class="joy-command-island__inner" role="toolbar" aria-label="Quick actions">
		{#each items as item (item.id)}
			<button
				type="button"
				class="joy-command-island__item {item.active ? 'joy-command-island__item--active' : ''}"
				onclick={() => handleItemClick(item.id)}
			>
				<span>{item.label}</span>
				{#if item.kbd}
					<span class="joy-command-island__kbd">{item.kbd}</span>
				{/if}
			</button>
		{/each}
	</div>
</div>
