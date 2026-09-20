import * as React from 'react';
import { MarkdownViewer } from './MarkdownViewer.js';

export interface MarkdownEditorProps {
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

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value: controlledValue,
  defaultValue = '',
  onChange,
  height = 480,
  mode: initialMode = 'split',
  placeholder = 'Write markdown here...',
  readOnly = false,
  className = '',
  style
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [mode, setMode] = React.useState<'split' | 'edit' | 'preview'>(initialMode);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const isSyncingScrollRef = React.useRef(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setInternalValue(next);
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
    setInternalValue(newValue);
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
      className={`joy-markdown-editor ${isFullscreen ? 'joy-markdown-editor--fullscreen' : ''} ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--joy-border, #23354e)',
        borderRadius: isFullscreen ? 0 : 8,
        backgroundColor: 'var(--joy-surface-card, #14253e)',
        color: 'var(--joy-text-primary, #f8f3e8)',
        height: isFullscreen ? '100vh' : typeof height === 'number' ? `${height}px` : height,
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : undefined,
        zIndex: isFullscreen ? 1100 : undefined,
        boxShadow: isFullscreen ? 'none' : '0 4px 16px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Toolbar */}
      <div
        className="joy-markdown-editor__toolbar"
        role="toolbar"
        aria-label="Markdown formatting tools"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderBottom: '1px solid var(--joy-border, #23354e)',
          backgroundColor: 'rgba(20, 37, 62, 0.7)',
          flexWrap: 'wrap',
          gap: 6
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <button
            type="button"
            title="Bold (**text**)"
            aria-label="Bold"
            onClick={() => insertFormat('**', '**', 'bold text')}
            style={btnStyle}
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            title="Italic (*text*)"
            aria-label="Italic"
            onClick={() => insertFormat('*', '*', 'italic text')}
            style={btnStyle}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            title="Heading (# Heading)"
            aria-label="Heading"
            onClick={() => insertFormat('## ', '', 'Heading')}
            style={btnStyle}
          >
            H
          </button>
          <button
            type="button"
            title="Strikethrough (~~text~~)"
            aria-label="Strikethrough"
            onClick={() => insertFormat('~~', '~~', 'strikethrough')}
            style={btnStyle}
          >
            <s>S</s>
          </button>
          <div style={separatorStyle} />

          <button
            type="button"
            title="Code Block"
            aria-label="Code Block"
            onClick={() => insertFormat('```ts\n', '\n```', 'console.log("hello");')}
            style={btnStyle}
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
            onClick={() => insertFormat('> ', '', 'Quote text')}
            style={btnStyle}
          >
            &ldquo;
          </button>

          <button
            type="button"
            title="Bullet List (- item)"
            aria-label="Bullet List"
            onClick={() => insertFormat('- ', '', 'List item')}
            style={btnStyle}
          >
            &bull;
          </button>

          <button
            type="button"
            title="Ordered List (1. item)"
            aria-label="Ordered List"
            onClick={() => insertFormat('1. ', '', 'Numbered item')}
            style={btnStyle}
          >
            1.
          </button>

          <button
            type="button"
            title="Task List (- [ ] item)"
            aria-label="Task List"
            onClick={() => insertFormat('- [ ] ', '', 'Task item')}
            style={btnStyle}
          >
            [&check;]
          </button>

          <div style={separatorStyle} />

          <button
            type="button"
            title="Link [text](url)"
            aria-label="Link"
            onClick={() => insertFormat('[', '](https://example.com)', 'Link Title')}
            style={btnStyle}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>

          <button
            type="button"
            title="Table Template"
            aria-label="Table Template"
            onClick={() =>
              insertFormat(
                '| Header 1 | Header 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n',
                '',
                ''
              )
            }
            style={btnStyle}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </button>
        </div>

        {/* View mode & Fullscreen */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--joy-border, #23354e)' }}>
            <button
              type="button"
              onClick={() => setMode('edit')}
              aria-pressed={mode === 'edit'}
              style={{ ...modeBtnStyle, backgroundColor: mode === 'edit' ? 'var(--gold-400, #c49a3a)' : 'transparent', color: mode === 'edit' ? '#14253e' : 'inherit' }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMode('split')}
              aria-pressed={mode === 'split'}
              style={{ ...modeBtnStyle, backgroundColor: mode === 'split' ? 'var(--gold-400, #c49a3a)' : 'transparent', color: mode === 'split' ? '#14253e' : 'inherit' }}
            >
              Split
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              aria-pressed={mode === 'preview'}
              style={{ ...modeBtnStyle, backgroundColor: mode === 'preview' ? 'var(--gold-400, #c49a3a)' : 'transparent', color: mode === 'preview' ? '#14253e' : 'inherit' }}
            >
              Preview
            </button>
          </div>

          <button
            type="button"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            onClick={() => setIsFullscreen(f => !f)}
            style={btnStyle}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {isFullscreen ? (
                <>
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              ) : (
                <>
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Main Panes */}
      <div
        className="joy-markdown-editor__panes"
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Editor Pane */}
        {(mode === 'split' || mode === 'edit') && (
          <div
            style={{
              flex: mode === 'split' ? '1 1 50%' : '1 1 100%',
              height: '100%',
              borderRight: mode === 'split' ? '1px solid var(--joy-border, #23354e)' : 'none',
              overflow: 'hidden'
            }}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextChange}
              onScroll={handleEditorScroll}
              placeholder={placeholder}
              readOnly={readOnly}
              aria-label="Markdown source editor"
              style={{
                width: '100%',
                height: '100%',
                padding: 16,
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontFamily: 'monospace',
                fontSize: 14,
                lineHeight: 1.6,
                backgroundColor: 'transparent',
                color: 'inherit',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* Sanitized Live Preview Pane */}
        {(mode === 'split' || mode === 'preview') && (
          <div
            ref={previewRef}
            onScroll={handlePreviewScroll}
            className="joy-markdown-editor__preview"
            role="region"
            aria-label="Markdown formatted preview"
            style={{
              flex: mode === 'split' ? '1 1 50%' : '1 1 100%',
              height: '100%',
              padding: 16,
              overflowY: 'auto',
              backgroundColor: 'rgba(13, 24, 41, 0.4)',
              boxSizing: 'border-box'
            }}
          >
            <MarkdownViewer content={value} />
          </div>
        )}
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  padding: 0,
  borderRadius: 4,
  border: 'none',
  backgroundColor: 'transparent',
  color: 'var(--joy-text-primary, #f8f3e8)',
  cursor: 'pointer',
  fontSize: 13
};

const modeBtnStyle: React.CSSProperties = {
  padding: '3px 8px',
  border: 'none',
  fontSize: 12,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease'
};

const separatorStyle: React.CSSProperties = {
  width: 1,
  height: 16,
  backgroundColor: 'var(--joy-border, #23354e)',
  margin: '0 4px'
};
