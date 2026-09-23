<script lang="ts">
	import type { Snippet } from 'svelte';
	import Avatar from './Avatar.svelte';

	interface AvatarItem {
		src?: string;
		alt?: string;
		name?: string;
		shape?: 'circle' | 'square';
		size?: 'sm' | 'md' | 'lg';
		color?: string;
	}

	interface Props {
		/**
		 * Maximum avatars rendered before collapsing the rest into a "+N" overflow avatar.
		 * Applies to the `items` prop only; avatars passed as snippet `children` render as-is.
		 */
		max?: number;
		/** Declarative avatars (SSR-safe). `max` truncates this list; `children` is ignored when set. */
		items?: AvatarItem[];
		children?: Snippet;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		max,
		items,
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	const limit = $derived(max === undefined ? undefined : Math.max(0, Math.floor(max)));
	const visibleItems = $derived(items && limit !== undefined ? items.slice(0, limit) : (items ?? []));

	const overflowSize = $derived(items?.[0]?.size ?? 'md');
	const overflow = $derived(items && limit !== undefined ? Math.max(0, items.length - limit) : 0);
</script>

<div bind:this={ref} class="joy-avatar-group {className}" {...rest}>
	{#if items}
		{#each visibleItems as item, i (i)}
			<Avatar {...item} />
		{/each}
	{:else if children}
		{@render children()}
	{/if}
	{#if overflow > 0}
		<div
			class="joy-avatar joy-avatar--circle joy-avatar--{overflowSize} joy-avatar-group__overflow"
			role="img"
			aria-label="{overflow} more"
		>
			+{overflow}
		</div>
	{/if}
</div>
