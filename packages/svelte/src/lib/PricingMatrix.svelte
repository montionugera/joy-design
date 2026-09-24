<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Check, Minus } from '@joymify/icons';

	interface Props {
		columns?: string[];
		rows?: { label: string; values: Array<string | boolean> }[];
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
