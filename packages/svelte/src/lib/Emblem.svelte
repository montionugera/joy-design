<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	interface Props extends Omit<SVGAttributes<SVGSVGElement>, 'class'> {
		size?: number;
		ringText?: string;
		centerText?: string;
		class?: string;
		ref?: SVGSVGElement | null;
	}

	let {
		size = 64,
		ringText = 'JOYMIFY DESSAU • 1919',
		centerText = 'DS',
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<svg
	bind:this={ref}
	class="joy-emblem {className}"
	width={size}
	height={size}
	viewBox="0 0 100 100"
	role="img"
	aria-label={ringText || centerText || 'Emblem'}
	{...rest}
>
	<defs>
		<path id="emblem-circle-path" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
	</defs>
	<circle class="joy-emblem__field" cx="50" cy="50" r="48" />
	<circle class="joy-emblem__ring" cx="50" cy="50" r="44" stroke-width="1.5" />
	<circle class="joy-emblem__disc" cx="50" cy="50" r="22" />
	{#if ringText}
		<text class="joy-emblem__text">
			<textPath href="#emblem-circle-path" startOffset="50%" text-anchor="middle">
				{ringText}
			</textPath>
		</text>
	{/if}
	{#if centerText}
		<text class="joy-emblem__text" x="50" y="54" text-anchor="middle" font-weight="700" font-size="12">
			{centerText}
		</text>
	{/if}
</svg>
