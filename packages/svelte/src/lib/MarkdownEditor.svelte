<script lang="ts">
	import MarkdownViewer from './MarkdownViewer.svelte';

	interface Props {
		value?: string;
		defaultValue?: string;
		height?: number | string;
		mode?: 'split' | 'edit' | 'preview';
		placeholder?: string;
		readOnly?: boolean;
		class?: string;
		style?: string;
		onchange?: (val: string) => void;
	}

	let {
		value = $bindable(),
		defaultValue = '',
		height = 480,
		mode = 'split',
		placeholder = 'Write markdown here...',
		readOnly = false,
		class: className = '',
		style = '',
		onchange
	}: Props = $props();

	let content = $state(value !== undefined ? value : defaultValue);
	let currentMode = $state<'split' | 'edit' | 'preview'>(mode);
	let isFullscreen = $state(false);

	let textareaEl: HTMLTextAreaElement;
	let previewEl: HTMLDivElement;
	let isSyncing = false;

	$effect(() => {
		if (value !== undefined && value !== content) {
			content = value;
		}
	});

	function handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		content = target.value;
		value = content;
		onchange?.(content);
	}

	function insertFormat(prefix: string, suffix = '', placeholderText = 'text') {
		if (readOnly || !textareaEl) return;
		const start = textareaEl.selectionStart;
		const end = textareaEl.selectionEnd;
		const selected = content.slice(start, end) || placeholderText;
		const replacement = `${prefix}${selected}${suffix}`;

		content = content.slice(0, start) + replacement + content.slice(end);
		value = content;
		onchange?.(content);

		setTimeout(() => {
			textareaEl.focus();
			textareaEl.setSelectionRange(
				start + prefix.length,
				start + prefix.length + selected.length
			);
		}, 0);
	}

	function handleEditorScroll() {
		if (isSyncing || !textareaEl || !previewEl) return;
		isSyncing = true;
		const scrollPct = textareaEl.scrollTop / (textareaEl.scrollHeight - textareaEl.clientHeight || 1);
		previewEl.scrollTop = scrollPct * (previewEl.scrollHeight - previewEl.clientHeight);
		requestAnimationFrame(() => {
			isSyncing = false;
		});
	}

	function handlePreviewScroll() {
		if (isSyncing || !textareaEl || !previewEl) return;
		isSyncing = true;
		const scrollPct = previewEl.scrollTop / (previewEl.scrollHeight - previewEl.clientHeight || 1);
		textareaEl.scrollTop = scrollPct * (textareaEl.scrollHeight - textareaEl.clientHeight);
		requestAnimationFrame(() => {
			isSyncing = false;
		});
	}
</script>

<div
	class="joy-markdown-editor {isFullscreen ? 'joy-markdown-editor--fullscreen' : ''} {className}"
	style="display: flex; flex-direction: column; border: 1px solid var(--joy-border, #23354e); border-radius: {isFullscreen ? '0' : '8px'}; background-color: var(--joy-surface-card, #14253e); color: var(--joy-text-primary, #f8f3e8); height: {isFullscreen ? '100vh' : typeof height === 'number' ? `${height}px` : height}; position: {isFullscreen ? 'fixed' : 'relative'}; inset: {isFullscreen ? '0' : 'auto'}; z-index: {isFullscreen ? '1100' : 'auto'}; box-shadow: {isFullscreen ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.2)'}; overflow: hidden; {style}"
>
	<!-- Toolbar -->
	<div
		class="joy-markdown-editor__toolbar"
		role="toolbar"
		aria-label="Markdown formatting tools"
		style="display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid var(--joy-border, #23354e); background-color: rgba(20, 37, 62, 0.7); flex-wrap: wrap; gap: 6px;"
	>
		<div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
			<button type="button" title="Bold (**text**)" aria-label="Bold" onclick={() => insertFormat('**', '**', 'bold text')} class="joy-editor-btn">
				<strong>B</strong>
			</button>
			<button type="button" title="Italic (*text*)" aria-label="Italic" onclick={() => insertFormat('*', '*', 'italic text')} class="joy-editor-btn">
				<em>I</em>
			</button>
			<button type="button" title="Heading (# Heading)" aria-label="Heading" onclick={() => insertFormat('## ', '', 'Heading')} class="joy-editor-btn">
				H
			</button>
			<button type="button" title="Strikethrough (~~text~~)" aria-label="Strikethrough" onclick={() => insertFormat('~~', '~~', 'strikethrough')} class="joy-editor-btn">
				<s>S</s>
			</button>

			<div style="width: 1px; height: 16px; background-color: var(--joy-border, #23354e); margin: 0 4px;"></div>

			<button type="button" title="Code Block" aria-label="Code Block" onclick={() => insertFormat('```ts\n', '\n```', 'console.log("hello");')} class="joy-editor-btn">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="16 18 22 12 16 6" />
					<polyline points="8 6 2 12 8 18" />
				</svg>
			</button>

			<button type="button" title="Blockquote (> quote)" aria-label="Blockquote" onclick={() => insertFormat('> ', '', 'Quote text')} class="joy-editor-btn">
				&ldquo;
			</button>

			<button type="button" title="Bullet List (- item)" aria-label="Bullet List" onclick={() => insertFormat('- ', '', 'List item')} class="joy-editor-btn">
				&bull;
			</button>

			<button type="button" title="Ordered List (1. item)" aria-label="Ordered List" onclick={() => insertFormat('1. ', '', 'Numbered item')} class="joy-editor-btn">
				1.
			</button>

			<button type="button" title="Task List (- [ ] item)" aria-label="Task List" onclick={() => insertFormat('- [ ] ', '', 'Task item')} class="joy-editor-btn">
				[&check;]
			</button>

			<div style="width: 1px; height: 16px; background-color: var(--joy-border, #23354e); margin: 0 4px;"></div>

			<button type="button" title="Link [text](url)" aria-label="Link" onclick={() => insertFormat('[', '](https://example.com)', 'Link Title')} class="joy-editor-btn">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
				</svg>
			</button>

			<button
				type="button"
				title="Table Template"
				aria-label="Table Template"
				onclick={() => insertFormat('| Header 1 | Header 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n', '', '')}
				class="joy-editor-btn"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<line x1="3" y1="9" x2="21" y2="9" />
					<line x1="9" y1="21" x2="9" y2="9" />
				</svg>
			</button>
		</div>

		<!-- View mode & Fullscreen -->
		<div style="display: flex; align-items: center; gap: 6px;">
			<div style="display: flex; border-radius: 4px; overflow: hidden; border: 1px solid var(--joy-border, #23354e);">
				<button
					type="button"
					onclick={() => (currentMode = 'edit')}
					aria-pressed={currentMode === 'edit'}
					class="joy-mode-btn"
					style="background-color: {currentMode === 'edit' ? 'var(--gold-400, #c49a3a)' : 'transparent'}; color: {currentMode === 'edit' ? '#14253e' : 'inherit'};"
				>
					Edit
				</button>
				<button
					type="button"
					onclick={() => (currentMode = 'split')}
					aria-pressed={currentMode === 'split'}
					class="joy-mode-btn"
					style="background-color: {currentMode === 'split' ? 'var(--gold-400, #c49a3a)' : 'transparent'}; color: {currentMode === 'split' ? '#14253e' : 'inherit'};"
				>
					Split
				</button>
				<button
					type="button"
					onclick={() => (currentMode = 'preview')}
					aria-pressed={currentMode === 'preview'}
					class="joy-mode-btn"
					style="background-color: {currentMode === 'preview' ? 'var(--gold-400, #c49a3a)' : 'transparent'}; color: {currentMode === 'preview' ? '#14253e' : 'inherit'};"
				>
					Preview
				</button>
			</div>

			<button
				type="button"
				title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
				aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
				onclick={() => (isFullscreen = !isFullscreen)}
				class="joy-editor-btn"
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					{#if isFullscreen}
						<polyline points="4 14 10 14 10 20" />
						<polyline points="20 10 14 10 14 4" />
						<line x1="14" y1="10" x2="21" y2="3" />
						<line x1="3" y1="21" x2="10" y2="14" />
					{:else}
						<polyline points="15 3 21 3 21 9" />
						<polyline points="9 21 3 21 3 15" />
						<line x1="21" y1="3" x2="14" y2="10" />
						<line x1="3" y1="21" x2="10" y2="14" />
					{/if}
				</svg>
			</button>
		</div>
	</div>

	<!-- Main Panes -->
	<div style="display: flex; flex: 1; overflow: hidden; position: relative;">
		{#if currentMode === 'split' || currentMode === 'edit'}
			<div
				style="flex: {currentMode === 'split' ? '1 1 50%' : '1 1 100%'}; height: 100%; border-right: {currentMode === 'split' ? '1px solid var(--joy-border, #23354e)' : 'none'}; overflow: hidden;"
			>
				<textarea
					bind:this={textareaEl}
					value={content}
					oninput={handleInput}
					onscroll={handleEditorScroll}
					{placeholder}
					readonly={readOnly}
					aria-label="Markdown source editor"
					style="width: 100%; height: 100%; padding: 16px; border: none; outline: none; resize: none; font-family: monospace; fontSize: 14px; line-height: 1.6; background-color: transparent; color: inherit; box-sizing: border-box;"
				></textarea>
			</div>
		{/if}

		{#if currentMode === 'split' || currentMode === 'preview'}
			<div
				bind:this={previewEl}
				onscroll={handlePreviewScroll}
				class="joy-markdown-editor__preview"
				role="region"
				aria-label="Markdown formatted preview"
				style="flex: {currentMode === 'split' ? '1 1 50%' : '1 1 100%'}; height: 100%; padding: 16px; overflow-y: auto; background-color: rgba(13, 24, 41, 0.4); box-sizing: border-box;"
			>
				<MarkdownViewer content={content} />
			</div>
		{/if}
	</div>
</div>

<style>
	.joy-editor-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border-radius: 4px;
		border: none;
		background-color: transparent;
		color: var(--joy-text-primary, #f8f3e8);
		cursor: pointer;
		font-size: 13px;
	}
	.joy-editor-btn:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
	.joy-mode-btn {
		padding: 3px 8px;
		border: none;
		font-size: 12px;
		cursor: pointer;
		transition: background-color 0.15s ease;
	}
</style>
