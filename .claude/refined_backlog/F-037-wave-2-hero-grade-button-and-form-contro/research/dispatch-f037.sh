#!/usr/bin/env bash
# usage: dispatch-f037.sh <TASK_ID> <agent: codex|agy|auto> [extra note]
set -uo pipefail
TASK="$1"; AGENT="${2:-codex}"; NOTE="${3:-}"
W="${LANE_W:-/Users/pasitnusso/workspace/repos/joy-design/.claude/worktrees/F-037-wave-2-hero-grade-button-and-form-contro}"
F=$W/.claude/refined_backlog/F-037-wave-2-hero-grade-button-and-form-contro
S=$(dirname "$0")
LOG=/tmp/f037-$TASK-$(date +%H%M%S).log
cd "$W" || exit 2
AI_AGENT_AUTO_DISPATCH_TIMEOUT=1800 dispatch-worker --agent "$AGENT" --cwd "$W" \
  --context "$F/spec.md" "$F/plan.md" \
  --task "You are implementing exactly ONE task of feature F-037 (Wave 2 of epic E-001) in the joy-design repo: task ${TASK} in the bundled plan.md. Work only in the current directory (claimed worktree, branch feat/F-037; Wave 1 tokens already exist in packages/tokens/dist/theme.css). First read plan.md sections 'Global Constraints' and 'Spec ambiguities resolved', then the '${TASK}' section, and obey its owned-file list: do not edit files outside it (never .release.json, _catalog.json, working-feature.json, pnpm-lock.yaml or package.json unless the task says so). Apply the design skills at ~/.codex/skills/impeccable and ~/.codex/skills/frontend-design for any visual judgement. Use ONLY semantic token names present in packages/tokens/dist/theme.css; no color literals, no var() fallbacks. Run the task's verify command(s) and show exit codes; then make ONE new git commit (never amend) with the commit message the task specifies, and tick the task's checkbox(es) in plan.md in the same commit. Time budget 25 minutes: commit working progress by minute 20 even if incomplete and list what remains at the end of the commit body. ${NOTE}" \
  < /dev/null > "$LOG" 2>&1
RC=$?
echo "exit $RC" >> "$LOG"
echo "LOG $LOG"; tail -12 "$LOG" | cut -c1-240
