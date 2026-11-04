<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Close, Filter } from '@montionugera/joy-icons';

	export interface FilterChipItem {
		key: string;
		label: string;
		value: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		chips: FilterChipItem[];
		clearLabel?: string;
		onremove?: (key: string) => void;
		onclear?: () => void;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		chips = [],
		clearLabel = 'Clear all',
		onremove,
		onclear,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<div
	bind:this={ref}
	class="joy-filter-chips {chips.length === 0 ? 'joy-filter-chips--empty' : ''} {className}"
	role="region"
	aria-label="Active filters"
	{...rest}
>
	<span class="joy-filter-chips__icon" aria-hidden="true">
		<Filter size="0.875rem" />
	</span>

	<div class="joy-filter-chips__list">
		{#each chips as chip (chip.key)}
			<span class="joy-filter-chips__chip">
				<span class="joy-filter-chips__label">{chip.label}:</span>
				<strong class="joy-filter-chips__value">{chip.value}</strong>
				<button
					type="button"
					class="joy-filter-chips__remove"
					aria-label={`Remove ${chip.label} filter`}
					onclick={() => onremove?.(chip.key)}
				>
					<Close size="0.75rem" />
				</button>
			</span>
		{/each}
	</div>

	{#if chips.length > 0 && onclear}
		<button
			type="button"
			class="joy-filter-chips__clear"
			onclick={() => onclear?.()}
		>
			{clearLabel}
		</button>
	{/if}
</div>
