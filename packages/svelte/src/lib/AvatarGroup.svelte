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
		/** Maximum avatars rendered before collapsing the rest into a "+N" overflow avatar. */
		max?: number;
		/** Declarative avatars. When provided, `max` truncates this list. */
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
	const itemOverflow = $derived(items && limit !== undefined ? Math.max(0, items.length - limit) : 0);

	// Snippet children cannot be sliced, so in children mode extra avatars are hidden in the DOM
	// and their count is surfaced through the same overflow avatar.
	let childOverflow = $state(0);

	$effect(() => {
		if (!ref || items || limit === undefined) {
			childOverflow = 0;
			return;
		}
		const root = ref;
		const apply = () => {
			const avatars = Array.from(
				root.querySelectorAll<HTMLElement>(':scope > .joy-avatar:not(.joy-avatar-group__overflow)')
			);
			avatars.forEach((el, i) => {
				el.style.display = i >= limit ? 'none' : '';
			});
			childOverflow = Math.max(0, avatars.length - limit);
		};
		apply();
		const observer = new MutationObserver(apply);
		observer.observe(root, { childList: true });
		return () => observer.disconnect();
	});

	const overflow = $derived(items ? itemOverflow : childOverflow);
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
			class="joy-avatar joy-avatar--circle joy-avatar--md joy-avatar-group__overflow"
			role="img"
			aria-label="{overflow} more"
		>
			+{overflow}
		</div>
	{/if}
</div>
