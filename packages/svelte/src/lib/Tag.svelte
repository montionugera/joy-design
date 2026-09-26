<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
		closable?: boolean;
		checkable?: boolean;
		checked?: boolean;
		onclose?: () => void;
		onchange?: (checked: boolean) => void;
		children?: Snippet;
		class?: string;
		ref?: HTMLSpanElement | null;
	}

	let {
		color = 'default',
		closable = false,
		checkable = false,
		checked = false,
		onclose,
		onchange,
		children,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	function handleClick() {
		if (checkable) {
			onchange?.(!checked);
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<span
	bind:this={ref}
	{...rest}
	class="joy-tag joy-tag--{color} {checkable ? 'joy-tag--checkable' : ''} {checked ? 'joy-tag--checked' : ''} {className}"
	role={checkable ? 'checkbox' : 'status'}
	aria-checked={checkable ? checked : undefined}
	tabindex={checkable ? 0 : undefined}
	onclick={handleClick}
	onkeydown={(e) => checkable && (e.key === ' ' || e.key === 'Enter') && handleClick()}
>
	{#if children}
		{@render children()}
	{/if}

	{#if closable}
		<button
			type="button"
			class="joy-tag__close"
			aria-label="Close tag"
			onclick={(e) => {
				e.stopPropagation();
				onclose?.();
			}}
		>
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	{/if}
</span>
