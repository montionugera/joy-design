# Rename packages to `@joymify` and publish to the joymify organisation

**Status:** approved by the owner on 2026-10-09 (decision: "GitHub Packages, private, org token").

## Goal

Publish the design system as `@joymify/tokens`, `@joymify/icons`, `@joymify/brand` and `@joymify/react` on GitHub Packages, owned by the GitHub organisation `joymify`, private.

## Why

Release 3.7 published the packages as `@montionugera/joy-*`. The first consumer, the docs portal in the `cli-state-handler` repository, publishes its own libraries as `@montionugera/ucsa-*` to npmjs.com. One name prefix can map to only one registry in a project, so installing `@montionugera/joy-*` from GitHub Packages there would redirect that repository's library release. A separate prefix removes the clash.

## Scope

- Rename, everywhere they appear (package manifests, import specifiers, docs, scripts, hub samples):

| Now | Becomes | Version |
| --- | --- | --- |
| `@montionugera/joy-tokens` | `@joymify/tokens` | 0.2.0 |
| `@montionugera/joy-icons` | `@joymify/icons` | 0.3.0 |
| `@montionugera/joy-brand` | `@joymify/brand` | 0.2.0 |
| `@montionugera/joy-react` | `@joymify/react` | 0.2.0 |
| `@montionugera/joy-svelte` | `@joymify/svelte` | unchanged, stays `private: true` |

- Versions do not change: these are first releases under new names.
- `publishConfig.registry` stays `https://npm.pkg.github.com`. Every other manifest field set in release 3.7 (files allowlists, licence, `sideEffects`, peers, entry points) is unchanged.
- `.github/workflows/publish.yml`: authenticate with the repository secret `JOYMIFY_PACKAGES_TOKEN` instead of the built-in token, because the repository lives under the personal account `montionugera` and its built-in token cannot write to the `joymify` organisation. The job fails early with a clear message when the secret is empty. The trigger (tag `packages-v*`, or a manual run with `dry_run`), the `packages` environment and the "commit is on main" check are unchanged.
- `scripts/test/publish-contract.test.mjs` and `scripts/test/consumer-smoke.sh` pin the new names and the secret name.
- `README.md` "Install from the registry" and `AGENTS.md` describe the new names, the `.npmrc` line `@joymify:registry=https://npm.pkg.github.com`, and the token a consumer needs.

## Out of scope

- Deleting the four `@montionugera/joy-*` 0.2.0/0.3.0 packages already on GitHub Packages. They stay until the owner asks for their removal.
- Publishing to npmjs.com, or making anything public.
- Any component or token change.

## Owner actions (cannot be done by an agent)

1. Create a classic personal access token with the `write:packages` scope, authorised for the `joymify` organisation, and store it in the `joy-design` repository as the Actions secret `JOYMIFY_PACKAGES_TOKEN`.
2. For each consuming repository, store a token with `read:packages` as a secret there (covered by that repository's own spec).

## Risks

- A missed specifier breaks a build. The full gate (`scripts/precheck.sh` and `scripts/integration.sh`) and a repository-wide search for `@montionugera/joy-` returning nothing are the checks.
- `scripts/parity-check.mjs` once misread `joy-icons` in a specifier as a CSS class. The new names contain no `joy-` segment; the existing regression test stays.
- The longer hub install sample once overflowed at 375px. The new names are shorter; the Playwright overflow test stays as the check.
- The personal token is long-lived. It is scoped to packages only and used by one workflow behind the `packages` environment.

## Acceptance criteria

- [ ] `grep -rn "@montionugera/joy-" --include="*" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist` returns no match outside `CHANGELOG` or release history files.
- [ ] Each of the four published manifests has the name in the table above, the version in the table above, and `publishConfig.registry` equal to `https://npm.pkg.github.com`; `@joymify/svelte` has `private: true`. `node --test scripts/test/publish-contract.test.mjs` passes and pins these.
- [ ] `.github/workflows/publish.yml` reads `secrets.JOYMIFY_PACKAGES_TOKEN`, no longer uses the built-in token for publishing, and still declares `environment: packages`. `actionlint` exits 0.
- [ ] `scripts/test/consumer-smoke.sh` passes: it packs the four packages, installs them into a clean project by their new names and builds.
- [ ] `pnpm publish --dry-run` succeeds for each of the four packages and lists the expected files.
- [ ] `scripts/precheck.sh` and `scripts/integration.sh` exit 0 on the feature branch.
- [ ] `README.md` shows the new install instructions and names.
- [ ] After the owner's go-ahead and the secret being present: a `packages-v*` tag run succeeds and `npm view @joymify/<name> version --registry=https://npm.pkg.github.com` returns the table's version for all four.
