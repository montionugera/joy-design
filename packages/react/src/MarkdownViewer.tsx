import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy } from '@montionugera/joy-icons/react';

export interface MarkdownViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  content?: string;
  allowCopy?: boolean;
}

export const MarkdownViewer = forwardRef<HTMLDivElement, MarkdownViewerProps>(
  ({ content = '', allowCopy = true, className = '', ...rest }, ref) => {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const mounted = useRef(true);

    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        clearTimeout(resetTimer.current);
      };
    }, []);

    const handleCopy = async (text: string, index: number) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return; // no clipboard access (insecure context, permission denied): do not claim success
      }
      if (!mounted.current) return;
      setCopiedIndex(index);
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 2000);
    };

    const blocks = useMemo(() => {
      const raw = content || '';
      const lines = raw.split('\n');
      const parsed: Array<{
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
            parsed.push({
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
          parsed.push({ type: 'h3', content: trimmed.slice(4) });
        } else if (trimmed.startsWith('## ')) {
          parsed.push({ type: 'h2', content: trimmed.slice(3) });
        } else if (trimmed.startsWith('# ')) {
          parsed.push({ type: 'h1', content: trimmed.slice(2) });
        } else if (trimmed.startsWith('> ')) {
          parsed.push({ type: 'quote', content: trimmed.slice(2) });
        } else if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
          parsed.push({ type: 'hr', content: '' });
        } else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
          const rows: string[][] = [];
          let j = i;
          while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
            const rowCells = lines[j]
              .split('|')
              .slice(1, -1)
              .map((c) => c.trim());
            if (!rowCells.every((c) => /^:?-+:?$/.test(c))) {
              rows.push(rowCells);
            }
            j++;
          }
          i = j - 1;
          parsed.push({ type: 'table', content: '', rows });
        } else {
          parsed.push({ type: 'p', content: line });
        }
      }

      if (inCode) {
        parsed.push({
          type: 'code',
          content: codeBuffer.join('\n'),
          lang: codeLang || 'text'
        });
      }

      return parsed;
    }, [content]);

    const renderInline = (text: string) => {
      // Basic inline formatting: code, bold, italic
      const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
      });
    };

    return (
      <div ref={ref} className={`joy-markdown ${className}`} role="region" aria-label="Markdown content" {...rest}>
        {blocks.map((block, i) => {
          if (block.type === 'h1') return <h1 key={i}>{renderInline(block.content)}</h1>;
          if (block.type === 'h2') return <h2 key={i}>{renderInline(block.content)}</h2>;
          if (block.type === 'h3') return <h3 key={i}>{renderInline(block.content)}</h3>;
          if (block.type === 'p') return <p key={i}>{renderInline(block.content)}</p>;
          if (block.type === 'quote') return <blockquote key={i}>{renderInline(block.content)}</blockquote>;
          if (block.type === 'hr') return <hr key={i} />;
          if (block.type === 'code') {
            return (
              <pre key={i} className="joy-markdown__pre">
                <code>{block.content}</code>
                {allowCopy && (
                  <>
                    <button
                      type="button"
                      className="joy-markdown__copy-btn"
                      onClick={() => handleCopy(block.content, i)}
                      aria-label="Copy code to clipboard"
                    >
                      {copiedIndex === i ? <Check size="14" /> : <Copy size="14" />}
                      {copiedIndex === i ? 'Copied' : 'Copy'}
                    </button>
                    <span className="joy-markdown__status" role="status">
                      {copiedIndex === i ? 'Copied to clipboard' : ''}
                    </span>
                  </>
                )}
              </pre>
            );
          }
          if (block.type === 'table' && block.rows && block.rows.length > 0) {
            return (
              <div key={i} className="joy-markdown__table-wrap">
                <table className="joy-markdown__table">
                  <thead>
                    <tr>
                      {block.rows[0].map((cell, cIdx) => (
                        <th key={cIdx}>{renderInline(cell)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.slice(1).map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx}>{renderInline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }
);

MarkdownViewer.displayName = 'MarkdownViewer';
