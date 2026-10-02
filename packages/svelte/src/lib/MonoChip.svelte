<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	export type MonoChipVariant = 'default' | 'active' | 'court' | 'danger';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'class'> {
		label: string;
		variant?: MonoChipVariant;
		class?: string;
		ref?: HTMLSpanElement | null;
	}

	let {
		label,
		variant = 'default',
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<span bind:this={ref} class="joy-mono-chip joy-mono-chip--{variant} {className}" {...rest}>
	{label}
</span>
