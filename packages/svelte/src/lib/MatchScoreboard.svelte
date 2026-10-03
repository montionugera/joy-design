<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
		player1: string;
		player2: string;
		seed1?: string;
		seed2?: string;
		sets1?: Array<number | string>;
		sets2?: Array<number | string>;
		currentPoints1?: string | number;
		currentPoints2?: string | number;
		serving?: 1 | 2;
		surface?: string;
		status?: string;
		matchTime?: string;
		tournament?: string;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		player1,
		player2,
		seed1,
		seed2,
		sets1 = [],
		sets2 = [],
		currentPoints1 = '0',
		currentPoints2 = '0',
		serving = 1,
		surface = 'Center Court — Hard',
		status = 'LIVE',
		matchTime = '00:00',
		tournament,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	// Calculate maximum number of sets to align column count (minimum 3, up to 5)
	const maxSets = $derived(Math.max(sets1.length, sets2.length, 3));
	const setIndices = $derived(Array.from({ length: maxSets }, (_, i) => i));
</script>

<div bind:this={ref} class="joy-match-scoreboard {className}" {...rest}>
	<div class="joy-match-scoreboard__header">
		<span class="joy-match-scoreboard__surface">{surface}</span>
		<span class="joy-match-scoreboard__status">{status}</span>
	</div>

	<table class="joy-match-scoreboard__table">
		<thead>
			<tr>
				<th class="joy-match-scoreboard__cell" style="text-align: left;">Player</th>
				{#each setIndices as idx}
					<th class="joy-match-scoreboard__cell">{idx + 1}</th>
				{/each}
				<th class="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">PTS</th>
			</tr>
		</thead>
		<tbody>
			<!-- Player 1 row -->
			<tr class="joy-match-scoreboard__row">
				<td class="joy-match-scoreboard__player-cell">
					{#if serving === 1}
						<span class="joy-match-scoreboard__serving" aria-label="Serving"></span>
					{/if}
					<span>{player1}</span>
					{#if seed1}
						<span class="joy-match-scoreboard__seed">({seed1})</span>
					{/if}
				</td>
				{#each setIndices as idx}
					<td class="joy-match-scoreboard__cell">
						{sets1[idx] !== undefined ? sets1[idx] : '—'}
					</td>
				{/each}
				<td class="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">
					{currentPoints1}
				</td>
			</tr>

			<!-- Player 2 row -->
			<tr class="joy-match-scoreboard__row">
				<td class="joy-match-scoreboard__player-cell">
					{#if serving === 2}
						<span class="joy-match-scoreboard__serving" aria-label="Serving"></span>
					{/if}
					<span>{player2}</span>
					{#if seed2}
						<span class="joy-match-scoreboard__seed">({seed2})</span>
					{/if}
				</td>
				{#each setIndices as idx}
					<td class="joy-match-scoreboard__cell">
						{sets2[idx] !== undefined ? sets2[idx] : '—'}
					</td>
				{/each}
				<td class="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">
					{currentPoints2}
				</td>
			</tr>
		</tbody>
	</table>

	<div class="joy-match-scoreboard__footer">
		<span>{tournament ?? 'Official Match'}</span>
		<span>Elapsed: {matchTime}</span>
	</div>
</div>
