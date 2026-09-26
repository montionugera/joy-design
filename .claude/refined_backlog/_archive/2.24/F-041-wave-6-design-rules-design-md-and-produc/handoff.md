# F-041 handoff
Goal (verbatim, epic E-001): Audit joy-design's mobile + dark-mode design system for sloppiness, list all issues, create a full fix plan, update project rules + README, then execute the fixes via ps-release-workflow. Slice: implement F-041 "Wave 6: design rules, DESIGN.md and product docs".
Plan: .claude/refined_backlog/F-041-wave-6-design-rules-design-md-and-produc/plan.md (7 tasks).
State: Tasks 1-7 done and committed; Gate 1 green. Not shipped (orchestrator ships).
Next: orchestrator runs psrw ship F-041.
Hard rules: Gate 1 `PLAYWRIGHT_PORT=6124 bash scripts/precheck.sh`, no ship/push, no amend/stash, scratch in /tmp/f041-sdd/.
