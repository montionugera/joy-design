<script lang="ts">
  import { untrack } from 'svelte';
  import MarkdownViewer from './MarkdownViewer.svelte';
  import {
    Edit,
    Eye,
    Maximize2,
    Minimize2,
    Terminal,
    Link,
    List,
    Grid,
    FileText
  } from '@montionugera/joy-icons';

  interface Props {
    value?: string;
    defaultValue?: string;
    height?: number | string;
    mode?: 'split' | 'edit' | 'preview';
    placeholder?: string;
    readOnly?: boolean;
    class?: string;
    style?: string;
    ref?: HTMLDivElement | null;
    onchange?: (val: string) => void;
    [key: string]: any;
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
    ref = $bindable(null),
    onchange,
    ...rest
  }: Props = $props();

  // `defaultValue` and `mode` only seed internal state (uncontrolled props); untrack makes
  // the one-time read explicit.
  let content = $state(untrack(() => (value !== undefined ? value : defaultValue)));
  let currentMode = $state<'split' | 'edit' | 'preview'>(untrack(() => mode));
  let isFullscreen = $state(false);

  let textareaEl = $state<HTMLTextAreaElement>();
  let previewEl = $state<HTMLDivElement>();
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

    requestAnimationFrame(() => {
      if (textareaEl) {
        textareaEl.focus();
        textareaEl.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selected.length
        );
      }
    });
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

  let rootStyle = $derived.by(() => {
    if (isFullscreen) return style || undefined;
    const h = typeof height === 'number' ? `height: ${height}px;` : `height: ${height};`;
    return style ? `${h} ${style}` : h;
  });
</script>

<div
  bind:this={ref}
  class="joy-markdown-editor {isFullscreen ? 'joy-markdown-editor--fullscreen' : ''} {readOnly ? 'joy-markdown-editor--readonly' : ''} {className}"
  style={rootStyle}
  {...rest}
>
  <!-- Toolbar -->
  <div
    class="joy-markdown-editor__toolbar"
    role="toolbar"
    aria-label="Markdown formatting tools"
  >
    <button
      type="button"
      title="Code Block"
      aria-label="Code Block"
      aria-pressed="false"
      onclick={() => insertFormat('```ts\n', '\n```', 'console.log("hello");')}
      class="joy-markdown-editor__tool"
    >
      <Terminal size="16" />
    </button>
    <button
      type="button"
      title="Link"
      aria-label="Link"
      aria-pressed="false"
      onclick={() => insertFormat('[', '](https://example.com)', 'Link Title')}
      class="joy-markdown-editor__tool"
    >
      <Link size="16" />
    </button>
    <button
      type="button"
      title="List"
      aria-label="List"
      aria-pressed="false"
      onclick={() => insertFormat('- ', '', 'List item')}
      class="joy-markdown-editor__tool"
    >
      <List size="16" />
    </button>
    <button
      type="button"
      title="Table Template"
      aria-label="Table Template"
      aria-pressed="false"
      onclick={() => insertFormat('| Header 1 | Header 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n', '', '')}
      class="joy-markdown-editor__tool"
    >
      <Grid size="16" />
    </button>
    <button
      type="button"
      title="Edit mode"
      aria-label="Edit mode"
      aria-pressed={currentMode === 'edit'}
      onclick={() => (currentMode = 'edit')}
      class="joy-markdown-editor__tool"
    >
      <Edit size="16" />
    </button>
    <button
      type="button"
      title="Split mode"
      aria-label="Split mode"
      aria-pressed={currentMode === 'split'}
      onclick={() => (currentMode = 'split')}
      class="joy-markdown-editor__tool"
    >
      <FileText size="16" />
    </button>
    <button
      type="button"
      title="Preview mode"
      aria-label="Preview mode"
      aria-pressed={currentMode === 'preview'}
      onclick={() => (currentMode = 'preview')}
      class="joy-markdown-editor__tool"
    >
      <Eye size="16" />
    </button>
    <button
      type="button"
      title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      aria-pressed={isFullscreen}
      onclick={() => (isFullscreen = !isFullscreen)}
      class="joy-markdown-editor__tool"
    >
      {#if isFullscreen}
        <Minimize2 size="16" />
      {:else}
        <Maximize2 size="16" />
      {/if}
    </button>
  </div>

  <!-- Main Panes -->
  <div class="joy-markdown-editor__panes joy-markdown-editor__panes--{currentMode}">
    {#if currentMode === 'split' || currentMode === 'edit'}
      <textarea
        bind:this={textareaEl}
        value={content}
        oninput={handleInput}
        onscroll={handleEditorScroll}
        {placeholder}
        readonly={readOnly}
        aria-label="Markdown source editor"
        class="joy-textarea joy-markdown-editor__textarea"
      ></textarea>
    {/if}

    {#if currentMode === 'split' || currentMode === 'preview'}
      <div
        bind:this={previewEl}
        onscroll={handlePreviewScroll}
        class="joy-markdown-editor__preview"
        role="region"
        aria-label="Markdown formatted preview"
      >
        <MarkdownViewer content={content} />
      </div>
    {/if}
  </div>
</div>
