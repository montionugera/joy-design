# F-040 handoff

- Goal (verbatim, epic E-001): Audit joy-design's mobile + dark-mode design system for sloppiness and execute the fixes via ps-release-workflow. This slice: implement F-040 "Wave 5: Storybook hub — mobile layout, dark mode, hero, token-only colors, visual contracts".
- Plan: `.claude/refined_backlog/F-040-wave-5-storybook-hub-mobile-layout-dark/plan.md` (6 tasks, sequential, all touch `apps/storybook-hub/build.js`).
- Worktree: `.claude/worktrees/F-040-wave-5-storybook-hub-mobile-layout-dark`, branch `feat/F-040`, base `3ec91b2`.
- Scratch/progress: `/tmp/f040-sdd/progress.md` (never a `.superpowers/` dir in the worktree).
- Current state: plan written; next is self-grill-audit, then subagent-driven execution from Task 1.
- Gate 1: `PLAYWRIGHT_PORT=6122 bash scripts/precheck.sh > /tmp/f040-pre.log 2>&1; echo $?` must be 0 on a clean tree.
