<script lang="ts">
	type Shape = 'circle' | 'square';
	type Size = 'sm' | 'md' | 'lg';
	type Status = 'online' | 'offline' | 'none';

	interface Props {
		src?: string;
		alt?: string;
		name?: string;
		shape?: Shape;
		size?: Size;
		status?: Status;
		color?: string;
		class?: string;
		ref?: HTMLDivElement | null;
	}

	let {
		src,
		alt = 'Avatar',
		name = '',
		shape = 'circle',
		size = 'md',
		status = 'none',
		color,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let imgError = $state(false);

	const initials = $derived.by(() => {
		if (!name) return '';
		const parts = name.trim().split(/\s+/);
		if (parts.length >= 2) {
			return (parts[0][0] + parts[1][0]).toUpperCase();
		}
		return name.slice(0, 2).toUpperCase();
	});
</script>

<div
	bind:this={ref}
	class="joy-avatar joy-avatar--{shape} joy-avatar--{size} {className}"
	style={color ? `background-color: ${color};` : undefined}
	role="img"
	aria-label={name || alt}
	{...rest}
>
	{#if src && !imgError}
		<img
			class="joy-avatar__image"
			{src}
			{alt}
			onerror={() => (imgError = true)}
		/>
	{:else if initials}
		<span class="joy-avatar__fallback">{initials}</span>
	{:else}
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
			<circle cx="12" cy="7" r="4"></circle>
		</svg>
	{/if}

	{#if status !== 'none'}
		<span class="joy-avatar__badge joy-avatar__badge--{status}" aria-label="Status: {status}"></span>
	{/if}
</div>
