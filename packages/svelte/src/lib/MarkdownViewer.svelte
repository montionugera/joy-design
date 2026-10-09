<script lang="ts">
	import { Check, Copy } from '@montionugera/joy-icons';
	import { tokenizeCode } from './syntax-highlighter.js';
	import MermaidViewer from './MermaidViewer.svelte';

	interface Props {
		content?: string;
		allowCopy?: boolean;
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		content = '',
		allowCopy = true,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

	let copiedBlockIndex = $state<number | null>(null);
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyToClipboard(text: string, index: number) {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			return; // no clipboard access (insecure context, permission denied): do not claim success
		}
		copiedBlockIndex = index;
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => {
			if (copiedBlockIndex === index) copiedBlockIndex = null;
		}, 2000);
	}

	$effect(() => () => clearTimeout(resetTimer));

	// Minimal high-performance, stream-safe Markdown tokenizer inspired by Tencent Cherry Markdown
	const parsedBlocks = $derived.by(() => {
		const raw = content || '';
		const lines = raw.split('\n');
		const blocks: Array<{
			type: 'p' | 'h1' | 'h2' | 'h3' | 'code' | 'quote' | 'table' | 'hr';
			content: string;
			lang?: string;
			rows?: string[][];
		}> = [];

		let inCode = false;
		let codeLang = '';
		let codeBuffer: string[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];

			if (line.trim().startsWith('```')) {
				if (inCode) {
					blocks.push({
						type: 'code',
						content: codeBuffer.join('\n'),
						lang: codeLang || 'text'
					});
					codeBuffer = [];
					inCode = false;
					codeLang = '';
				} else {
					inCode = true;
					codeLang = line.trim().slice(3).trim();
				}
				continue;
			}

			if (inCode) {
				codeBuffer.push(line);
				continue;
			}

			const trimmed = line.trim();
			if (!trimmed) continue;

			if (trimmed.startsWith('### ')) {
				blocks.push({ type: 'h3', content: trimmed.slice(4) });
			} else if (trimmed.startsWith('## ')) {
				blocks.push({ type: 'h2', content: trimmed.slice(3) });
			} else if (trimmed.startsWith('# ')) {
				blocks.push({ type: 'h1', content: trimmed.slice(2) });
			} else if (trimmed.startsWith('> ')) {
				blocks.push({ type: 'quote', content: trimmed.slice(2) });
			} else if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
				blocks.push({ type: 'hr', content: '' });
			} else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
				// Simple table parsing
				const rows: string[][] = [];
				let j = i;
				while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
					const rowCells = lines[j]
						.split('|')
						.slice(1, -1)
						.map((c) => c.trim());
					// Skip separator line |---|---|
					if (!rowCells.every((c) => /^:?-+:?$/.test(c))) {
						rows.push(rowCells);
					}
					j++;
				}
				i = j - 1;
				blocks.push({ type: 'table', content: '', rows });
			} else {
				blocks.push({ type: 'p', content: line });
			}
		}

		if (inCode) {
			// Unclosed streaming code fence safe handling
			blocks.push({
				type: 'code',
				content: codeBuffer.join('\n'),
				lang: codeLang || 'text'
			});
		}

		return blocks;
	});

	function formatInline(text: string): string {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
			.replace(/\*([^*]+)\*/g, '<em>$1</em>')
			.replace(/`([^`]+)`/g, '<code>$1</code>');
	}
</script>

<div bind:this={ref} class="joy-markdown {className}" role="region" aria-label="Markdown content" {...rest}>
	{#each parsedBlocks as block, i}
		{#if block.type === 'h1'}
			<h1>{@html formatInline(block.content)}</h1>
		{:else if block.type === 'h2'}
			<h2>{@html formatInline(block.content)}</h2>
		{:else if block.type === 'h3'}
			<h3>{@html formatInline(block.content)}</h3>
		{:else if block.type === 'p'}
			<p>{@html formatInline(block.content)}</p>
		{:else if block.type === 'quote'}
			<blockquote>{@html formatInline(block.content)}</blockquote>
		{:else if block.type === 'hr'}
			<hr />
		{:else if block.type === 'code'}
			{#if block.lang?.toLowerCase() === 'mermaid'}
				<MermaidViewer code={block.content} {allowCopy} />
			{:else}
				<pre class="joy-markdown__pre"><code>{#each tokenizeCode(block.content, block.lang || 'text') as tok}{#if tok.type === 'text'}{tok.text}{:else}<span class="joy-syntax-{tok.type}">{tok.text}</span>{/if}{/each}</code>{#if allowCopy}<button
						type="button"
						class="joy-markdown__copy-btn"
						onclick={() => copyToClipboard(block.content, i)}
						aria-label="Copy code to clipboard"
					>{#if copiedBlockIndex === i}<Check size="14" />Copied{:else}<Copy size="14" />Copy{/if}</button><span class="joy-markdown__status" role="status">{copiedBlockIndex === i ? 'Copied to clipboard' : ''}</span>{/if}</pre>
			{/if}
		{:else if block.type === 'table' && block.rows && block.rows.length > 0}
			<div class="joy-markdown__table-wrap">
				<table class="joy-markdown__table">
					<thead>
						<tr>
							{#each block.rows[0] as headerCell}
								<th>{@html formatInline(headerCell)}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each block.rows.slice(1) as row}
							<tr>
								{#each row as cell}
									<td>{@html formatInline(cell)}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/each}
</div>
