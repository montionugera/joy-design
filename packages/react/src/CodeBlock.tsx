import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy } from '@montionugera/joy-icons/react';
import { normalizeLanguage, tokenizeCode } from './syntax-highlighter.js';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code?: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  allowCopy?: boolean;
}

export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code = '',
      language = 'text',
      title,
      showLineNumbers = false,
      allowCopy = true,
      className = '',
      ...rest
    },
    ref
  ) => {
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

    const normLang = useMemo(() => normalizeLanguage(language), [language]);

    const tokens = useMemo(() => {
      return tokenizeCode(code, normLang);
    }, [code, normLang]);

    const lines = useMemo(() => {
      return code.split('\n');
    }, [code]);

    const showHeader = Boolean(title || (language && normLang !== 'text') || allowCopy);

    return (
      <div
        ref={ref}
        className={`joy-code-block ${className}`.trim()}
        role="region"
        aria-label={title || `${normLang} code block`}
        {...rest}
      >
        {showHeader && (
          <div className="joy-code-block__header">
            <div className="joy-code-block__meta">
              {normLang && normLang !== 'text' && (
                <span className="joy-code-block__lang">{normLang.toUpperCase()}</span>
              )}
              {title && <span className="joy-code-block__title">{title}</span>}
            </div>
            {allowCopy && (
              <>
                <button
                  type="button"
                  className="joy-code-block__copy-btn"
                  onClick={handleCopy}
                  aria-label="Copy code to clipboard"
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
        )}

        <div className={`joy-code-block__wrapper ${showLineNumbers ? 'joy-code-block--with-lines' : ''}`.trim()}>
          {showLineNumbers && (
            <div className="joy-code-block__lines" aria-hidden="true">
              {lines.map((_, idx) => (
                <div key={idx}>{idx + 1}</div>
              ))}
            </div>
          )}
          <pre className="joy-code-block__body">
            <code>
              {tokens.map((tok, idx) =>
                tok.type === 'text' ? (
                  tok.text
                ) : (
                  <span key={idx} className={`joy-syntax-${tok.type}`}>
                    {tok.text}
                  </span>
                )
              )}
            </code>
          </pre>
        </div>
      </div>
    );
  }
);

CodeBlock.displayName = 'CodeBlock';
