import * as React from 'react';
import { Edit, Eye, Maximize2, Minimize2, Link, List } from '@montionugera/joy-icons/react';
import { MarkdownViewer } from './MarkdownViewer.js';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface MarkdownEditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  height?: number | string;
  mode?: 'split' | 'edit' | 'preview';
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const MarkdownEditor = React.forwardRef<HTMLDivElement, MarkdownEditorProps>(
  (
    {
      value: controlledValue,
      defaultValue = '',
      onChange,
      height = 480,
      mode: initialMode = 'split',
      placeholder = 'Write markdown here...',
      readOnly = false,
      className = '',
      style,
      ...rest
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [mode, setMode] = React.useState<'split' | 'edit' | 'preview'>(initialMode);
    const [isFullscreen, setIsFullscreen] = React.useState(false);

    const value = isControlled ? controlledValue : internalValue;
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const previewRef = React.useRef<HTMLDivElement | null>(null);
    const isSyncingScrollRef = React.useRef(false);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    };

    const insertFormat = (prefix: string, suffix = '', placeholderText = 'text') => {
      if (readOnly || !textareaRef.current) return;
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.slice(start, end) || placeholderText;
      const replacement = `${prefix}${selectedText}${suffix}`;

      const newValue = value.slice(0, start) + replacement + value.slice(end);
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selectedText.length
        );
      }, 0);
    };

    // Synchronized scroll from editor to preview
    const handleEditorScroll = () => {
      if (isSyncingScrollRef.current || !textareaRef.current || !previewRef.current) return;
      isSyncingScrollRef.current = true;

      const editor = textareaRef.current;
      const preview = previewRef.current;
      const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
      preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);

      requestAnimationFrame(() => {
        isSyncingScrollRef.current = false;
      });
    };

    // Synchronized scroll from preview to editor
    const handlePreviewScroll = () => {
      if (isSyncingScrollRef.current || !textareaRef.current || !previewRef.current) return;
      isSyncingScrollRef.current = true;

      const editor = textareaRef.current;
      const preview = previewRef.current;
      const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1);
      editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight);

      requestAnimationFrame(() => {
        isSyncingScrollRef.current = false;
      });
    };

    return (
      <div
        ref={ref}
        className={cx(
          'joy-markdown-editor',
          isFullscreen && 'joy-markdown-editor--fullscreen',
          readOnly && 'joy-markdown-editor--readonly',
          className
        )}
        style={{
          height: isFullscreen ? undefined : typeof height === 'number' ? `${height}px` : height,
          ...style
        }}
        {...rest}
      >
        {/* Toolbar */}
        <div
          className="joy-markdown-editor__toolbar"
          role="toolbar"
          aria-label="Markdown formatting tools"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <button
              type="button"
              title="Bold (**text**)"
              aria-label="Bold"
              className="joy-markdown-editor__tool"
              onClick={() => insertFormat('**', '**', 'bold text')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              </svg>
            </button>
            <button
              type="button"
              title="Italic (*text*)"
              aria-label="Italic"
              className="joy-markdown-editor__tool"
              onClick={() => insertFormat('*', '*', 'italic text')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="4" x2="10" y2="4" />
                <line x1="14" y1="20" x2="5" y2="20" />
                <line x1="15" y1="4" x2="9" y2="20" />
              </svg>
            </button>
            <button
              type="button"
              title="Heading (# Heading)"
              aria-label="Heading"
              className="joy-markdown-editor__tool"
              onClick={() => insertFormat('## ', '', 'Heading')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 4v16" />
                <path d="M18 4v16" />
                <path d="M6 12h12" />
              </svg>
            </button>
            <button
              type="button"
              title="Strikethrough (~~text~~)"
              aria-label="Strikethrough"
              className="joy-markdown-editor__tool"
              onClick={() => insertFormat('~~', '~~', 'strikethrough')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 4H9a3 3 0 0 0-2.83 4M14 12a4 4 0 0 1 0 8H6" />
                <line x1="4" y1="12" x2="20" y2="12" />
              </svg>
            </button>

            <button
              type="button"
              title="Code Block"
              aria-label="Code Block"
              className="joy-markdown-editor__tool"
              onClick={() => insertFormat('```ts\n', '\n```', 'console.log("hello");')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </button>

            <button
              type="button"
              title="Blockquote (> quote)"
              aria-label="Blockquote"
              className="joy-markdown-editor__tool"
              onClick={() => insertFormat('> ', '', 'Quote text')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
              </svg>
            </button>

            <button
              type="button"
              title="Bullet List (- item)"
              aria-label="Bullet List"
              className="joy-markdown-editor__tool"
              onClick={() => insertFormat('- ', '', 'List item')}
            >
              <List />
            </button>

            <button
              type="button"
              title="Link [text](url)"
              aria-label="Link"
              className="joy-markdown-editor__tool"
              onClick={() => insertFormat('[', '](https://example.com)', 'Link Title')}
            >
              <Link />
            </button>

            <button
              type="button"
              title="Table Template"
              aria-label="Table Template"
              className="joy-markdown-editor__tool"
              onClick={() =>
                insertFormat(
                  '| Header 1 | Header 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n',
                  '',
                  ''
                )
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
            </button>
          </div>

          {/* View mode & Fullscreen */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              title="Edit mode"
              aria-label="Edit mode"
              aria-pressed={mode === 'edit'}
              className="joy-markdown-editor__tool"
              onClick={() => setMode('edit')}
            >
              <Edit />
            </button>
            <button
              type="button"
              title="Split mode"
              aria-label="Split mode"
              aria-pressed={mode === 'split'}
              className="joy-markdown-editor__tool"
              onClick={() => setMode('split')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="3" x2="12" y2="21" />
              </svg>
            </button>
            <button
              type="button"
              title="Preview mode"
              aria-label="Preview mode"
              aria-pressed={mode === 'preview'}
              className="joy-markdown-editor__tool"
              onClick={() => setMode('preview')}
            >
              <Eye />
            </button>
            <button
              type="button"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-pressed={isFullscreen}
              className="joy-markdown-editor__tool"
              onClick={() => setIsFullscreen((f) => !f)}
            >
              {isFullscreen ? <Minimize2 /> : <Maximize2 />}
            </button>
          </div>
        </div>

        {/* Main Panes */}
        <div className={cx('joy-markdown-editor__panes', mode && `joy-markdown-editor__panes--${mode}`)}>
          {/* Editor Pane */}
          {(mode === 'split' || mode === 'edit') && (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextChange}
              onScroll={handleEditorScroll}
              placeholder={placeholder}
              readOnly={readOnly}
              aria-label="Markdown source editor"
              className="joy-textarea joy-markdown-editor__textarea"
            />
          )}

          {/* Sanitized Live Preview Pane */}
          {(mode === 'split' || mode === 'preview') && (
            <div
              ref={previewRef}
              onScroll={handlePreviewScroll}
              className="joy-markdown-editor__preview"
              role="region"
              aria-label="Markdown formatted preview"
            >
              <MarkdownViewer content={value} />
            </div>
          )}
        </div>
      </div>
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';
