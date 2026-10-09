<script lang="ts">
	import { Check, Copy, FileText, Eye } from '@joymify/icons';
	import { renderMermaidToSvg } from './mermaid-renderer.js';
	import CodeBlock from './CodeBlock.svelte';

	interface Props {
		code?: string;
		title?: string;
		initialView?: 'diagram' | 'source';
		allowCopy?: boolean;
		allowToggle?: boolean;
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		code = '',
		title,
		initialView = 'diagram',
		allowCopy = true,
		allowToggle = true,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let view = $state<'diagram' | 'source'>(initialView);
	let copied = $state(false);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(code);
		} catch {
			return;
		}
		copied = true;
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	$effect(() => () => clearTimeout(resetTimer));

	const renderResult = $derived(renderMermaidToSvg(code));
	const displayTitle = $derived(title || renderResult.title || 'Diagram');
</script>

<div
	bind:this={ref}
	class="joy-mermaid {className}"
	role="region"
	aria-label={displayTitle}
	{...rest}
>
	<div class="joy-mermaid__header">
		<div class="joy-mermaid__title">
			<span class="joy-mermaid__badge">MERMAID</span>
			<span>{displayTitle}</span>
		</div>
		<div class="joy-mermaid__actions">
			{#if allowToggle}
				<button
					type="button"
					class="joy-mermaid__btn"
					onclick={() => (view = view === 'diagram' ? 'source' : 'diagram')}
					aria-label={view === 'diagram' ? 'Show mermaid source code' : 'Show diagram preview'}
				>
					{#if view === 'diagram'}
						<FileText size="14" />
						Source
					{:else}
						<Eye size="14" />
						Diagram
					{/if}
				</button>
			{/if}
			{#if allowCopy}
				<button
					type="button"
					class="joy-mermaid__btn"
					onclick={handleCopy}
					aria-label="Copy mermaid definition"
				>
					{#if copied}
						<Check size="14" />
						Copied
					{:else}
						<Copy size="14" />
						Copy
					{/if}
				</button>
				<span class="joy-markdown__status" role="status">
					{copied ? 'Copied to clipboard' : ''}
				</span>
			{/if}
		</div>
	</div>

	{#if view === 'diagram' && renderResult.success && renderResult.svg}
		<div class="joy-mermaid__viewport">
			{@html renderResult.svg}
		</div>
	{:else}
		<CodeBlock
			{code}
			language="text"
			allowCopy={false}
			class="joy-mermaid__source"
		/>
	{/if}
</div>
