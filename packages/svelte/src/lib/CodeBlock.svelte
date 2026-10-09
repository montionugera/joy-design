<script lang="ts">
	import { Check, Copy } from '@joymify/icons';
	import { normalizeLanguage, tokenizeCode } from './syntax-highlighter.js';

	interface Props {
		code?: string;
		language?: string;
		title?: string;
		showLineNumbers?: boolean;
		allowCopy?: boolean;
		class?: string;
		ref?: HTMLDivElement | null;
		[key: string]: any;
	}

	let {
		code = '',
		language = 'text',
		title,
		showLineNumbers = false,
		allowCopy = true,
		class: className = '',
		ref = $bindable(null),
		...rest
	}: Props = $props();

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

	const normLang = $derived(normalizeLanguage(language));
	const tokens = $derived(tokenizeCode(code, normLang));
	const lines = $derived(code.split('\n'));
	const showHeader = $derived(Boolean(title || (language && normLang !== 'text') || allowCopy));
</script>

<div
	bind:this={ref}
	class="joy-code-block {className}"
	role="region"
	aria-label={title || `${normLang} code block`}
	{...rest}
>
	{#if showHeader}
		<div class="joy-code-block__header">
			<div class="joy-code-block__meta">
				{#if normLang && normLang !== 'text'}
					<span class="joy-code-block__lang">{normLang.toUpperCase()}</span>
				{/if}
				{#if title}
					<span class="joy-code-block__title">{title}</span>
				{/if}
			</div>
			{#if allowCopy}
				<button
					type="button"
					class="joy-code-block__copy-btn"
					onclick={handleCopy}
					aria-label="Copy code to clipboard"
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
	{/if}

	<div class="joy-code-block__wrapper {showLineNumbers ? 'joy-code-block--with-lines' : ''}">
		{#if showLineNumbers}
			<div class="joy-code-block__lines" aria-hidden="true">
				{#each lines as _, idx}
					<div>{idx + 1}</div>
				{/each}
			</div>
		{/if}
		<pre class="joy-code-block__body"><code>{#each tokens as tok}{#if tok.type === 'text'}{tok.text}{:else}<span class="joy-syntax-{tok.type}">{tok.text}</span>{/if}{/each}</code></pre>
	</div>
</div>
