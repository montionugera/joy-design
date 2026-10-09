import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, FileText, Eye } from '@joymify/icons/react';
import { renderMermaidToSvg } from './mermaid-renderer.js';
import { CodeBlock } from './CodeBlock.js';

export interface MermaidViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  code?: string;
  title?: string;
  initialView?: 'diagram' | 'source';
  allowCopy?: boolean;
  allowToggle?: boolean;
}

export const MermaidViewer = forwardRef<HTMLDivElement, MermaidViewerProps>(
  (
    {
      code = '',
      title,
      initialView = 'diagram',
      allowCopy = true,
      allowToggle = true,
      className = '',
      ...rest
    },
    ref
  ) => {
    const [view, setView] = useState<'diagram' | 'source'>(initialView);
    const [copied, setCopied] = useState(false);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const mounted = useRef(true);

    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        clearTimeout(resetTimer.current);
      };
    }, []);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        return;
      }
      if (!mounted.current) return;
      setCopied(true);
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => {
        if (mounted.current) setCopied(false);
      }, 2000);
    };

    const renderResult = useMemo(() => {
      return renderMermaidToSvg(code);
    }, [code]);

    const displayTitle = title || renderResult.title || 'Diagram';

    return (
      <div
        ref={ref}
        className={`joy-mermaid ${className}`.trim()}
        role="region"
        aria-label={displayTitle}
        {...rest}
      >
        <div className="joy-mermaid__header">
          <div className="joy-mermaid__title">
            <span className="joy-mermaid__badge">MERMAID</span>
            <span>{displayTitle}</span>
          </div>
          <div className="joy-mermaid__actions">
            {allowToggle && (
              <button
                type="button"
                className="joy-mermaid__btn"
                onClick={() => setView((v) => (v === 'diagram' ? 'source' : 'diagram'))}
                aria-label={view === 'diagram' ? 'Show mermaid source code' : 'Show diagram preview'}
              >
                {view === 'diagram' ? <FileText size="14" /> : <Eye size="14" />}
                {view === 'diagram' ? 'Source' : 'Diagram'}
              </button>
            )}
            {allowCopy && (
              <>
                <button
                  type="button"
                  className="joy-mermaid__btn"
                  onClick={handleCopy}
                  aria-label="Copy mermaid definition"
                >
                  {copied ? <Check size="14" /> : <Copy size="14" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <span className="joy-markdown__status" role="status">
                  {copied ? 'Copied to clipboard' : ''}
                </span>
              </>
            )}
          </div>
        </div>

        {view === 'diagram' && renderResult.success && renderResult.svg ? (
          <div
            className="joy-mermaid__viewport"
            dangerouslySetInnerHTML={{ __html: renderResult.svg }}
          />
        ) : (
          <CodeBlock
            code={code}
            language="text"
            allowCopy={false}
            className="joy-mermaid__source"
          />
        )}
      </div>
    );
  }
);

MermaidViewer.displayName = 'MermaidViewer';
