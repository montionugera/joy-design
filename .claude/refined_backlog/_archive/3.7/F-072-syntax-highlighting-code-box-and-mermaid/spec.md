---
title: "Syntax highlighting code box and Mermaid diagram support in MarkdownViewer"
id: F-072
status: refined
from_idea: I-078
---

# Syntax highlighting code box and Mermaid diagram support in MarkdownViewer

## Problem

Developers and enterprise teams using Joy Design currently have a basic `MarkdownViewer` that displays code blocks as plain unhighlighted text and cannot render architectural or sequence diagrams (e.g. Mermaid ` ```mermaid ` blocks). In developer documentation and product guides, reading non-tokenized code in Rust, TypeScript, or Python decreases readability and violates the aesthetic and developer experience standards of enterprise design systems. Furthermore, Mermaid diagrams render as unparsed raw text rather than interactive SVG flowcharts and sequence diagrams.

## Why now

With Joy Design powering the Developer Portal (`dev.joymify.com`), documentation suites, and developer toolkits across Joymify, developer users need:
1. Syntax-highlighted code blocks for polyglot languages (Rust, TypeScript, JavaScript, Python, Bash, SQL, JSON) adhering strictly to Joy Design semantic tokens without arbitrary external theme bleed.
2. Direct Mermaid diagram visualization inside `MarkdownViewer` and `MarkdownEditor` with dark/light theme integration.
3. Standalone `CodeBlock` and `PolyglotCodeTabs` components in `@joymify/react` and `@joymify/svelte` allowing multi-language tabbed code switching.

## Sketch

1. **Lightweight Syntax Highlighter Engine (`syntax-highlighter.ts`)**:
   - Provide zero-heavy-dependency, stream-safe tokenizer supporting Rust, TypeScript, JavaScript, Python, JSON, SQL, Bash, and HTML/CSS.
   - Tokenize tokens into semantic CSS classes: `.joy-syntax-keyword`, `.joy-syntax-type`, `.joy-syntax-string`, `.joy-syntax-number`, `.joy-syntax-comment`, `.joy-syntax-fn`, `.joy-syntax-punct`.
   - CSS tokens mapped strictly to Joy semantic color tokens (`--joy-accent-*`, `--joy-text-*`, `--joy-status-*`).
2. **Enhanced Code Container (`CodeBlock` / `.joy-code-block`)**:
   - Header with language badge (`RUST`, `TYPESCRIPT`, `PYTHON`), optional file title, and 1-click Copy button with accessible checkmark.
   - Optional line numbers gutter (`.joy-code-block__line-numbers`).
   - Svelte 5 runes and React 19 forwardRef twin components.
3. **Polyglot Code Tabs (`PolyglotCodeTabs`)**:
   - Tab bar allowing user to toggle between languages (e.g. Rust, TypeScript, Python) with synchronized state and keyboard navigation.
4. **Mermaid Diagram Renderer (`MermaidViewer` / `MarkdownViewer` extension)**:
   - When a code block specifies `mermaid` (` ```mermaid `), render an SVG flowchart/diagram.
   - Embed lightweight theme-aware SVG renderer / Mermaid SVG pipeline with dark/light mode parity.
   - Include a "Diagram / Source" toggle so users can copy or view the raw diagram markup.
5. **Storybook Hub Showcase & Quality Contracts**:
   - New showcase view in Storybook Hub showing Markdown with Rust, TS, Python syntax highlighting, Polyglot tabs, and live Mermaid diagram.
   - Playwright contracts verifying DOM rendering, theme switching, contrast >= 4.5:1, and zero horizontal overflow.

## Acceptance criteria

- [ ] Syntax tokenizer generates semantic token spans for Rust, TypeScript, Python, JSON, Bash, and SQL without external CSS color bleed.
- [ ] Code block header renders uppercase language badge, copy button with live status announcement, and optional line numbers.
- [ ] `PolyglotCodeTabs` twin components (`.tsx` and `.svelte`) allow tabbed switching between multiple languages with ARIA tabs contract.
- [ ] `MarkdownViewer` automatically detects `mermaid` code blocks and renders SVG diagrams with theme parity and source toggle.
- [ ] All syntax highlighting and diagram elements comply strictly with Joy semantic tokens (`--joy-surface-*`, `--joy-text-*`, `--joy-accent-*`, `--joy-border-*`) in both light and dark modes with contrast >= 4.5:1.
- [ ] Storybook Hub showcases Markdown with syntax highlighting and Mermaid, passing Gate 1 with 0 violations.
