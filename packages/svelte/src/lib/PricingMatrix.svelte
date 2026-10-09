<script lang="ts" module>
	export interface PricingMatrixRow {
		label: string;
		values: Array<string | boolean>;
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Check, Minus } from '@montionugera/joy-icons';
	import type { HTMLAttributes } from 'svelte/elements';

	// `columns` and `rows` are a pair. Pass both for the data variant (a real table in a scroll region, `label` names that
	// region; an `aria-label` passed through rest lands on the non-landmark wrapper). Pass only one, or neither, and the
	// component renders the children card grid instead (the lone data prop is ignored). Each row's `values` should have one
	// entry per column; a shorter or longer row renders a ragged table.
	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'> {
		columns?: string[];
		rows?: PricingMatrixRow[];
		rowHeaderLabel?: string;
		label?: string;
		children?: Snippet;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		columns,
		rows,
		rowHeaderLabel = 'Feature',
		label = 'Pricing plans',
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const isTable = $derived(columns !== undefined && rows !== undefined);
</script>

{#if isTable}
	<div bind:this={ref} class="joy-pricing-matrix joy-pricing-matrix--table {className}" {...rest}>
		<!-- A scrollable region must be keyboard-focusable (WCAG 2.1.1) or its off-screen columns are unreachable. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="joy-pricing-matrix__scroll" role="region" tabindex="0" aria-label={label}>
			<table class="joy-table joy-table--scroll joy-pricing-matrix__table">
				<thead>
					<tr>
						<th scope="col">{rowHeaderLabel}</th>
						{#each columns ?? [] as column}
							<th scope="col">{column}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each rows ?? [] as row}
						<tr>
							<th scope="row">{row.label}</th>
							{#each row.values as value}
								<td>
									{#if value === true}
										<span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><Check size="18" /></span>
									{:else if value === false}
										<span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><Minus size="18" /></span>
									{:else}
										{value}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{:else}
	<div bind:this={ref} class="joy-pricing-matrix {className}" role="region" aria-label={label} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
