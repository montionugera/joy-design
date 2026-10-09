# Implementation Plan: F-072 — Syntax Highlighting Code Box and Mermaid Diagram Support in MarkdownViewer

## Context & Objectives
Upgrade Joy Design's markdown and code presentation suite with:
1. Stream-safe syntax highlighting for Rust, TypeScript/JavaScript, Python, JSON, Bash, and SQL mapped to Joy semantic tokens.
2. Enhanced `CodeBlock` component with language badge, optional filename, line numbers, and accessible copy button.
3. `PolyglotCodeTabs` component for multi-language tabbed code switching.
4. Mermaid diagram SVG renderer inside `MarkdownViewer` and `MarkdownEditor` with dark/light theme parity and source toggle.
5. Svelte 5 / React 19 twin component parity and zero token/emoji violations.

---

## Phase 1: Semantic Syntax Highlighter Engine
- **Task 1.1**: Implement `syntax-highlighter.ts` tokenizer supporting Rust, TypeScript, Python, JSON, Bash, and SQL with regex lexing for keywords, types, strings, numbers, comments, functions, and punctuation.
- **Task 1.2**: Add `.joy-syntax-*` styles in `packages/tokens/build.js` using strict semantic tokens (`--joy-accent-*`, `--joy-text-*`, `--joy-status-*`) with WCAG 2.2 AA contrast >= 4.5:1.
- **Quality Gate 1**: Compile tokens (`node packages/tokens/build.js`), run tokens test (`node --test packages/tokens/test/tokens.test.js`), verify contrast in light and dark modes.

---

## Phase 2: Standalone `CodeBlock` & `MarkdownViewer` Integration
- **Task 2.1**: Implement `CodeBlock.tsx` and `CodeBlock.svelte` twin components with language header, filename, line numbering, and copy-to-clipboard.
- **Task 2.2**: Update `MarkdownViewer.tsx` and `MarkdownViewer.svelte` to tokenize code blocks using the syntax engine and render through `CodeBlock`.
- **Quality Gate 2**: Run Svelte & React component tests (`pnpm -r test`), run parity check (`node scripts/parity-check.mjs`).

---

## Phase 3: `PolyglotCodeTabs` Component
- **Task 3.1**: Implement `PolyglotCodeTabs.tsx` and `PolyglotCodeTabs.svelte` with tab switching, ARIA keyboard navigation, and language badges.
- **Task 3.2**: Export `CodeBlock` and `PolyglotCodeTabs` in `packages/react/src/index.ts` and `packages/svelte/src/lib/index.ts`.
- **Quality Gate 3**: Run type checks (`pnpm check`) and parity checks (`node scripts/parity-check.mjs`).

---

## Phase 4: Mermaid Diagram Engine in `MarkdownViewer`
- **Task 4.1**: Implement `mermaid-renderer.ts` supporting flowcharts and sequence diagrams rendered to clean vector SVGs themed with Joy design tokens.
- **Task 4.2**: Integrate Mermaid detection in `MarkdownViewer.tsx` and `MarkdownViewer.svelte` with "Diagram" / "Source" view switcher.
- **Quality Gate 4**: Unit test mermaid renderer across various flowchart and sequence definitions, ensure zero document overflow.

---

## Phase 5: Storybook Hub Showcase, Documentation & Full Verification
- **Task 5.1**: Add interactive demonstrations in `apps/storybook-hub/build.js` featuring Rust, TS, Python code blocks, Polyglot tabs, and Mermaid diagrams.
- **Task 5.2**: Update `README.md` and `DESIGN.md` with API references and code samples for `CodeBlock`, `PolyglotCodeTabs`, and Markdown diagram features.
- **Task 5.3**: Add Playwright contracts in `apps/storybook-hub/tests/markdown-syntax-mermaid.spec.ts` testing DOM rendering, copy button, language tab switching, and Mermaid diagram visibility.
- **Quality Gate 5**: Full Gate 1 precheck (`./scripts/precheck.sh`) exit 0.
