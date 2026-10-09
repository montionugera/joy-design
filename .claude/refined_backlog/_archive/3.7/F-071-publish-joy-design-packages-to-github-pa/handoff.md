# Handoff: I-077 publish joy-design packages under @montionugera

- **Goal (verbatim):** "Plan how to publish the joy-design packages (tokens, icons, brand, react) to GitHub Packages under the @montionugera scope, so that the React docs portal in the sibling repo cli-state-handler can install them from the registry."
- **Spec (approved, audited):** `.claude/idea_backlog/I-077-publish-joy-design-packages-to-github-pa/spec.md`
- **Plan (written 2026-10-09, not yet independently audited):** `.claude/idea_backlog/I-077-publish-joy-design-packages-to-github-pa/plan.md`
- **Current state:** spec approved, plan written, nothing implemented. No rename, no package.json edit, no build, no workflow file exists yet. The idea is not yet refined into a feature and not claimed. Branch `release/3.7`.
- **Read first in the plan:** "Spec deviations found while planning" (eight items with evidence), then "Global Constraints".
- **Shape:** 9 tasks. Phase 1 is Tasks 1 to 2 (rename, then its gate). Phase 2 is Tasks 3 to 9 (declaration build of joy-react first, then icons build, metadata, tarball test, workflow, docs, local dry run).
- **Next step:** audit the plan (`self-grill-audit`), refine I-077 into a feature, claim the feature, then execute the plan task by task with `subagent-driven-development`. Phase 1 must be verified and gated before Phase 2 starts.
- **Stop before the real publish.** The plan ends at a local green dry run (`scripts/test/consumer-smoke.sh` passing, `pnpm publish --dry-run` inspected for the four packages).
- **After the plan, owner only:** the GitHub-hosted dry run can run only once the release branch is merged to `main`; pushing a `packages-v*` tag is irreversible and needs the owner's separate explicit go-ahead.
- **Unproven until the hosted dry run:** whether the gate leaves `packages/brand/assets/` and `apps/flutter-hub/pubspec.lock` byte-identical on the Linux runner (plan deviation 5).
