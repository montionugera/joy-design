<script lang="ts">
	import type { Snippet } from 'svelte';

	type ResultStatus = 'success' | 'error' | 'warning' | 'info' | '404' | '403';

	interface Props {
		status?: ResultStatus;
		title: string;
		subtitle?: string;
		primaryActionText?: string;
		secondaryActionText?: string;
		onprimaryaction?: () => void;
		onsecondaryaction?: () => void;
		extra?: Snippet;
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		status = 'info',
		title,
		subtitle,
		primaryActionText,
		secondaryActionText,
		onprimaryaction,
		onsecondaryaction,
		extra,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<div bind:this={ref} class="joy-result joy-result--{status} {className}" role="alert" {...rest}>
	<div class="joy-result__icon">
		{#if status === 'success'}
			<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
		{:else if status === 'error'}
			<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		{:else if status === 'warning'}
			<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
				<line x1="12" y1="9" x2="12" y2="13"></line>
				<line x1="12" y1="17" x2="12.01" y2="17"></line>
			</svg>
		{:else if status === '404'}
			<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<path d="m4.93 4.93 4.24 4.24"></path>
				<path d="m14.83 9.17 4.24-4.24"></path>
				<path d="m14.83 14.83 4.24 4.24"></path>
				<path d="m9.17 14.83-4.24 4.24"></path>
				<circle cx="12" cy="12" r="4"></circle>
			</svg>
		{:else if status === '403'}
			<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
				<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
			</svg>
		{:else}
			<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="16" x2="12" y2="12"></line>
				<line x1="12" y1="8" x2="12.01" y2="8"></line>
			</svg>
		{/if}
	</div>

	<h2 class="joy-result__title">{title}</h2>
	{#if subtitle}
		<p class="joy-result__subtitle">{subtitle}</p>
	{/if}

	{#if extra}
		<div style="margin-bottom: 24px;">
			{@render extra()}
		</div>
	{/if}

	{#if primaryActionText || secondaryActionText}
		<div class="joy-result__actions">
			{#if primaryActionText}
				<button
					type="button"
					class="joy-button joy-button--solid joy-button--md"
					onclick={onprimaryaction}
				>
					{primaryActionText}
				</button>
			{/if}
			{#if secondaryActionText}
				<button
					type="button"
					class="joy-button joy-button--outline joy-button--md"
					onclick={onsecondaryaction}
				>
					{secondaryActionText}
				</button>
			{/if}
		</div>
	{/if}
</div>
