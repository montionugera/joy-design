# F-041 handoff
Goal (verbatim, epic E-001): Audit joy-design's mobile + dark-mode design system for sloppiness, list all issues, create a full fix plan, update project rules + README, then execute the fixes via ps-release-workflow. Slice: implement F-041 "Wave 6: design rules, DESIGN.md and product docs".
Plan: .claude/refined_backlog/F-041-wave-6-design-rules-design-md-and-produc/plan.md (7 tasks).
State: plan written; Task 1 prep (tsconfigs + devDeps) staged in working tree, uncommitted.
Next: self-grill-audit on the plan, then execute Task 1..7 with subagent-driven-development (foreground sub-agents only).
Hard rules: Gate 1 `PLAYWRIGHT_PORT=6124 bash scripts/precheck.sh`, no ship/push, no amend/stash, scratch in /tmp/f041-sdd/.
