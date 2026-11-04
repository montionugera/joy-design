<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Close } from '@montionugera/joy-icons';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class' | 'title'> {
		open?: boolean;
		title?: string;
		subtitle?: string;
		closeLabel?: string;
		onclose?: () => void;
		headerActions?: Snippet;
		children?: Snippet;
		footer?: Snippet;
		class?: string;
		ref?: HTMLElement | null;
	}

	let {
		open = true,
		title = 'Inspector',
		subtitle = '',
		closeLabel = 'Close inspector',
		onclose,
		headerActions,
		children,
		footer,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<aside
	bind:this={ref}
	class="joy-inspector-pane {open ? 'joy-inspector-pane--open' : 'joy-inspector-pane--closed'} {className}"
	aria-label={title}
	aria-hidden={!open || undefined}
	{...rest}
>
	<header class="joy-inspector-pane__header">
		<div class="joy-inspector-pane__titles">
			<h3 class="joy-inspector-pane__title">{title}</h3>
			{#if subtitle}
				<p class="joy-inspector-pane__subtitle">{subtitle}</p>
			{/if}
		</div>

		<div class="joy-inspector-pane__header-actions">
			{#if headerActions}
				{@render headerActions()}
			{/if}
			{#if onclose}
				<button
					type="button"
					class="joy-inspector-pane__close"
					aria-label={closeLabel}
					onclick={() => onclose?.()}
				>
					<Close size="1rem" />
				</button>
			{/if}
		</div>
	</header>

	<div class="joy-inspector-pane__body">
		{#if children}
			{@render children()}
		{/if}
	</div>

	{#if footer}
		<footer class="joy-inspector-pane__footer">
			{@render footer()}
		</footer>
	{/if}
</aside>
