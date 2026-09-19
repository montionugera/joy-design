# AGENTS.md — Joymify Design System (`joy-design`)

## Non-Negotiable Autonomous Execution Rules

1. **Keep Going, Zero Permission Checkpoints**:
   - Once a plan/spec is approved or a directive is given, work through ALL tasks to completion without pausing to ask "Shall I proceed?", "Want me to keep going?", or "Should I do the next step?".
   - NEVER ask permission mid-turn unless facing an irreversible R0 destruction (e.g. deleting production databases or branches with unmerged user work).
   - For any reversible choice: pick the standard default, state the assumption concisely in one line, and keep executing.

2. **Visual Verification Before Done (No Blind Claims)**:
   - "HTTP 200" or "unit test passed" is NOT visual verification.
   - For UI / design changes: actually verify the rendered DOM, check contrast in both Light AND Dark modes, verify that semantic tokens are used rather than hardcoded hex, and ensure zero unstyled FOUC defects.

3. **Domain & Palette Invariants**:
   - Ingest the canonical Joymify brand palette from `zen-ui` and `quant`:
     - `--navy-500: #14253e` (Primary surface anchor)
     - `--gold-400: #c49a3a` (Singular accent)
     - `--cream-100: #f8f3e8` (Warm parchment canvas)
     - `--ink-500: #1f1c13` (Primary readable text)
   - Dark mode must be fully token-driven (`--joy-surface-canvas`, `--joy-surface-card`, `--joy-border`, `--joy-text-primary`) — NEVER leave hardcoded `#ffffff` cards inside a dark canvas.
   - **Zero Emoji Policy**: Enterprise components must NEVER use raw OS emojis (`🟢`, `🔴`, `⏳`, `🌙`). Always use crisp, scalable vector SVG icons.

4. **Release Lifecycle (Git / PSRW)**:
   - Always work within isolated `psrw` worktrees.
   - Follow: `psrw new-release` → `psrw idea` → `psrw refine` → `psrw claim` → implement & test → `psrw ship` → `psrw promote --babysit`.
