// Holds the four published packages to the publish contract (spec I-077): names, versions,
// registry, repository link, licence, sideEffects, the files allowlist and that every path in
// `exports` is covered by it. Reading package.json is the behaviour under test.
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const readJson = (p) => JSON.parse(read(p));

const REGISTRY = 'https://npm.pkg.github.com';
const REPO_URL = 'git+https://github.com/montionugera/joy-design.git';

// Dependency order: this is also the order the workflow publishes in.
const PUBLISHED = [
  { dir: 'tokens', name: '@montionugera/joy-tokens', version: '0.2.1', license: 'MIT', sideEffects: ['**/*.css'], files: ['dist'] },
  { dir: 'icons', name: '@montionugera/joy-icons', version: '0.3.0', license: 'SEE LICENSE IN PROVENANCE.md', sideEffects: false, files: ['dist', 'src/index.ts', 'src/index.d.ts', 'src/*.svelte', 'PROVENANCE.md'] },
  { dir: 'brand', name: '@montionugera/joy-brand', version: '0.2.0', license: 'SEE LICENSE IN PROVENANCE.md', sideEffects: false, files: ['src', 'assets', 'PROVENANCE.md'] },
  { dir: 'react', name: '@montionugera/joy-react', version: '0.2.1', license: 'MIT', sideEffects: false, files: ['dist'] },
];

/** Every string leaf of an `exports` value. */
function exportTargets(value) {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(exportTargets);
  return [];
}

/** True when a package-relative path (`./dist/index.js`, `./assets/*`) is shipped by the allowlist. */
function covered(target, files) {
  const rel = target.replace(/^\.\//, '');
  return files.some((entry) => {
    if (entry.includes('*')) {
      const pattern = entry.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]+');
      return new RegExp(`^${pattern}$`).test(rel);
    }
    return rel === entry || rel.startsWith(`${entry}/`);
  });
}

for (const spec of PUBLISHED) {
  test(`${spec.name}: publish metadata matches the contract`, () => {
    const pkg = readJson(`packages/${spec.dir}/package.json`);
    assert.notStrictEqual(pkg.private, true, `${spec.name}: a published package must not be private`);
    const expected = {
      name: spec.name,
      version: spec.version,
      publishConfig: { registry: REGISTRY },
      repository: { type: 'git', url: REPO_URL, directory: `packages/${spec.dir}` },
      license: spec.license,
      sideEffects: spec.sideEffects,
      files: spec.files,
    };
    for (const [field, value] of Object.entries(expected)) {
      assert.deepStrictEqual(pkg[field], value, `${spec.name}: ${field} does not match the contract`);
    }
  });

  test(`${spec.name}: every exports, main, module and types path is inside files`, () => {
    const pkg = readJson(`packages/${spec.dir}/package.json`);
    const targets = [...exportTargets(pkg.exports), pkg.main, pkg.module, pkg.types].filter(Boolean);
    assert.ok(targets.length > 0, 'expected at least one entry point');
    for (const target of targets) {
      assert.ok(covered(target, pkg.files), `${target} is not shipped by files ${JSON.stringify(pkg.files)}`);
    }
  });
}

test('joy-react resolves to built output, not TypeScript source', () => {
  const pkg = readJson('packages/react/package.json');
  assert.strictEqual(pkg.main, './dist/index.js');
  assert.strictEqual(pkg.module, './dist/index.js');
  assert.strictEqual(pkg.types, './dist/index.d.ts');
  assert.deepStrictEqual(pkg.exports, {
    '.': { types: './dist/index.d.ts', import: './dist/index.js', default: './dist/index.js' },
  });
  assert.strictEqual(pkg.scripts.build, 'tsc -p tsconfig.build.json');
});

test('joy-icons builds only its React entry; the Svelte entry stays source', () => {
  const pkg = readJson('packages/icons/package.json');
  assert.deepStrictEqual(pkg.exports['./react'], { types: './dist/react.d.ts', default: './dist/react.js' });
  assert.deepStrictEqual(pkg.exports['.'], { types: './src/index.d.ts', svelte: './src/index.ts', default: './src/index.ts' });
  assert.strictEqual(pkg.scripts.build, 'tsc -p tsconfig.build.json');
  assert.match(read('packages/icons/src/react.ts'), /^export type \{ IconProps \} from "\.\/react\/Activity\.js";$/m);
});

test('joy-react depends only on published workspace packages', () => {
  const pkg = readJson('packages/react/package.json');
  const publishedNames = PUBLISHED.map((p) => p.name);
  const workspaceDeps = Object.entries(pkg.dependencies).filter(([, range]) => String(range).startsWith('workspace:'));
  assert.deepStrictEqual(
    workspaceDeps.map(([name]) => name).sort(),
    ['@montionugera/joy-brand', '@montionugera/joy-icons', '@montionugera/joy-tokens'],
  );
  for (const [name] of workspaceDeps) assert.ok(publishedNames.includes(name), `${name} is not a published package`);
});

test('joy-svelte is renamed and private', () => {
  const pkg = readJson('packages/svelte/package.json');
  assert.strictEqual(pkg.name, '@montionugera/joy-svelte');
  assert.strictEqual(pkg.private, true);
  assert.strictEqual(pkg.publishConfig, undefined);
});

test('turbo builds dependencies before the type-check', () => {
  const turbo = readJson('turbo.json');
  assert.ok(turbo.tasks.check.dependsOn.includes('^build'), 'check must depend on ^build: joy-react reads joy-icons declarations from dist');
});

for (const [dir, peers] of [['react', ['react', 'react-dom']], ['icons', ['react']]]) {
  test(`joy-${dir} declares React 19 peer dependencies`, () => {
    const pkg = readJson(`packages/${dir}/package.json`);
    for (const peer of peers) assert.strictEqual(pkg.peerDependencies[peer], '^19.0.0', `joy-${dir}: peerDependencies.${peer}`);
  });
}

test('@montionugera/joy-tokens exports theme.css and tailwind entry points', () => {
  const pkg = readJson('packages/tokens/package.json');
  assert.strictEqual(pkg.exports['./theme.css'], './dist/theme.css');
  assert.strictEqual(pkg.exports['./tailwind'], './dist/tailwind-theme.css');
});

// ---- The publish workflow. It is read as text: its shape is the behaviour under test. ----
const NPMJS = 'https://registry.npmjs.org';
const wf = read('.github/workflows/publish.yml');
// Comment lines are dropped so that a rule cannot be satisfied, or broken, by prose.
const code = wf.split('\n').filter((line) => !/^\s*#/.test(line)).join('\n');
const [topLevel, jobsText] = code.split(/\njobs:\s*\n/);
const jobs = Object.fromEntries(jobsText.split(/^(?=  [\w-]+:\n)/m).map((block) => [block.match(/^  ([\w-]+):/)[1], block]));
const stepsOf = (job) => jobs[job].split('\n      - name:').slice(1).map((block) => ({ name: block.split('\n')[0].trim(), block }));
const permissionsOf = (text, indent) => {
  const m = text.match(new RegExp(`^${indent}permissions:\\n((?:${indent}  \\S.*\\n)+)`, 'm'));
  return m ? Object.fromEntries(m[1].trim().split('\n').map((line) => line.trim().split(/:\s*/))) : null;
};
const count = (text, re) => (text.match(re) || []).length;
const buildSteps = stepsOf('build');
const publishSteps = stepsOf('publish');
const step = (steps, pred, what) => {
  const found = steps.filter(pred);
  assert.strictEqual(found.length, 1, `expected exactly one step: ${what}`);
  return found[0];
};

test('the publish workflow triggers on a packages-v* tag or a manual run that defaults to a dry run', () => {
  assert.match(wf, /^\s+- 'packages-v\*'$/m, 'trigger must be a packages-v* tag');
  assert.match(wf, /^\s+dry_run:$/m, 'manual runs need a dry_run input');
  assert.match(wf, /dry_run:[\s\S]*?default:\s*true/, 'dry_run input must default to true');
  assert.ok(topLevel.includes("DRY_RUN: ${{ github.event_name == 'workflow_dispatch' && inputs.dry_run && 'true' || 'false' }}"), 'DRY_RUN must be true only for a manual run with the input on');
  assert.ok(!topLevel.includes('NODE_AUTH_TOKEN'), 'no top-level NODE_AUTH_TOKEN');
  assert.ok(!wf.includes('JOYMIFY_PACKAGES_TOKEN'), 'no organisation token: the packages live under the repository owner');
  assert.ok(!wf.includes('@joymify'), 'no old scope in the publish workflow');
});

test('publish permissions exist only on the publish job', () => {
  assert.deepStrictEqual(Object.keys(jobs), ['build', 'publish'], 'the workflow has exactly a build job and a publish job');
  assert.deepStrictEqual(permissionsOf(topLevel, ''), { contents: 'read' }, 'workflow-level permissions must be contents: read only');
  assert.deepStrictEqual(permissionsOf(jobs.build, '    '), { contents: 'read' }, 'the build job runs third-party code, so it gets contents: read only');
  assert.deepStrictEqual(
    permissionsOf(jobs.publish, '    '),
    { contents: 'read', packages: 'write', 'id-token': 'write' },
    'the publish job needs packages: write (GitHub Packages) and id-token: write (npmjs.org OIDC), nothing else',
  );
  for (const scope of ['packages: write', 'id-token: write']) {
    assert.strictEqual(count(code, new RegExp(scope, 'g')), 1, `${scope} must appear exactly once in the workflow`);
    assert.ok(jobs.publish.includes(scope) && !jobs.build.includes(scope) && !topLevel.includes(scope), `${scope} belongs to the publish job only`);
  }
  assert.strictEqual(count(code, /^\s*permissions:$/gm), 3, 'permissions are declared at the top and once per job, never on a step');
  assert.ok(!/write-all|permissions:[ \t]*\S/.test(code), 'no shorthand permissions such as write-all');
});

test('both jobs run in the packages environment, and publish waits for build on real runs only', () => {
  for (const job of ['build', 'publish']) {
    assert.match(jobs[job], /^    environment: packages$/m, `the ${job} job must run in the packages environment so the repository setting can restrict it`);
  }
  assert.match(jobs.publish, /^    needs: build$/m, 'publish must wait for build');
  assert.match(jobs.publish, /^    if: github\.event_name != 'workflow_dispatch' \|\| !inputs\.dry_run$/m, 'the publish job must be skipped on a dry run');
  assert.ok(!code.includes('continue-on-error'), 'no step may hide a failure');
});

test('the built-in token and NODE_AUTH_TOKEN are used only where intended', () => {
  // Both spellings name the same token.
  assert.strictEqual(count(code, /secrets\.GITHUB_TOKEN/g), 2, 'secrets.GITHUB_TOKEN is used only in the GitHub Packages publish and verify steps');
  assert.strictEqual(count(code, /github\.token/g), 1, 'github.token is used only by the gate');
  assert.strictEqual(count(code, /\bsecrets\./g), 2, 'no stored secret is used');
  assert.strictEqual(count(jobs.build, /secrets\.GITHUB_TOKEN/g), 0, 'the build job must not use secrets.GITHUB_TOKEN');
  assert.strictEqual(count(jobs.publish, /github\.token/g), 0, 'the publish job must not use github.token');

  const gate = step(buildSteps, (s) => s.block.includes('scripts/integration.sh'), 'gate');
  assert.ok(gate.block.includes('GH_TOKEN: ${{ github.token }}'), 'the gate downloads the portal docs with the read-only token');
  const githubPublish = step(publishSteps, (s) => s.name.startsWith('Publish to GitHub Packages'), 'GitHub Packages publish');
  const verify = step(publishSteps, (s) => s.name.startsWith('Verify'), 'verify');
  for (const s of [githubPublish, verify]) {
    assert.ok(s.block.includes('NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}'), `${s.name}: must authenticate with the built-in token`);
  }
  const dryRun = step(buildSteps, (s) => s.name.startsWith('Dry run'), 'dry run');
  assert.ok(dryRun.block.includes('NODE_AUTH_TOKEN: dry-run-no-auth'), 'a dry run must never receive the real publish token');
  assert.strictEqual(count(jobs.build, /NODE_AUTH_TOKEN/g), 1, 'the build job sets NODE_AUTH_TOKEN only to the dry-run placeholder');
  assert.strictEqual(count(jobs.publish, /NODE_AUTH_TOKEN/g), 2, 'the publish job sets NODE_AUTH_TOKEN only on the GitHub Packages publish and verify steps');

  const npmjs = step(publishSteps, (s) => s.name.startsWith('Publish to npmjs.org'), 'npmjs.org publish');
  assert.ok(!npmjs.block.includes('NODE_AUTH_TOKEN'), 'the npmjs.org publish step must have no NODE_AUTH_TOKEN: trusted publishing gets its token from OIDC');
  assert.ok(!/^\s+env:$/m.test(npmjs.block) && !npmjs.block.includes('secrets.'), 'the npmjs.org publish step takes no env block and no secret');
});

test('the build job checks out without credentials, gates, builds, tests and packs', () => {
  const checkout = step(buildSteps, (s) => s.block.includes('actions/checkout@'), 'checkout');
  assert.ok(checkout.block.includes('persist-credentials: false'), 'checkout must not leave credentials in the git config');
  assert.ok(checkout.block.includes('fetch-depth: 0'), 'checkout must fetch history so origin/main is present');
  assert.strictEqual(buildSteps[0], checkout, 'checkout is the first step');
  assert.ok(!code.includes('git fetch'), 'the workflow must not run git fetch: checkout dropped its credentials, and origin/main must stay as checked out');
  const onMain = step(buildSteps, (s) => s.block.includes('git merge-base --is-ancestor "$GITHUB_SHA" origin/main'), 'on-main check');
  assert.ok(onMain.block.includes("if: env.DRY_RUN == 'false'"), 'a real publish must refuse a commit that is not on main');
  for (const needle of ["flutter-version: '3.32.8'", 'playwright install --with-deps chromium', 'apt-get install -y -qq ripgrep', 'pnpm install --frozen-lockfile']) {
    assert.ok(jobs.build.includes(needle), `runner setup must include: ${needle}`);
  }
  assert.match(jobs.build, /scope: '@montionugera'/, 'setup-node must target the @montionugera scope');
  assert.match(jobs.build, /registry-url: 'https:\/\/npm\.pkg\.github\.com'/, 'setup-node must target GitHub Packages');

  const gate = step(buildSteps, (s) => s.block.includes('scripts/integration.sh'), 'gate');
  const smoke = step(buildSteps, (s) => s.block.includes('scripts/test/consumer-smoke.sh'), 'tarball test');
  const pack = step(buildSteps, (s) => s.name.startsWith('Pack'), 'pack');
  const upload = step(buildSteps, (s) => s.block.includes('actions/upload-artifact@'), 'upload');
  for (const s of [gate, smoke, pack, upload]) {
    assert.ok(!s.block.includes('if:'), `${s.name}: must have no if:`);
  }
  const tagStep = step(buildSteps, (s) => s.name === 'Check the tag matches the package versions', 'tag check');
  assert.ok(tagStep.block.includes("if: github.ref_type == 'tag'"), "tag check step must have if: github.ref_type == 'tag'");
  const dryRun = step(buildSteps, (s) => s.name.startsWith('Dry run'), 'dry run');
  assert.ok(dryRun.block.includes("if: env.DRY_RUN == 'true'"), "Dry run step must have if: env.DRY_RUN == 'true'");
  assert.strictEqual(count(dryRun.block, /npm publish "\$tgz"[^\n]* --dry-run$/gm), 2, 'the dry run must run npm publish --dry-run once per registry and nothing else');
  assert.strictEqual(count(dryRun.block, /npm publish/g), 2, 'the dry run has no npm publish without --dry-run');
  assert.ok(dryRun.block.includes(`"--@montionugera:registry=$NPMJS_URL" --dry-run`) && dryRun.block.includes(`NPMJS_URL=${NPMJS}`), 'the npmjs.org dry run must pin the scope to npmjs.org');
  assert.strictEqual(count(jobs.build, /npm publish/g), 2, 'the build job never publishes: its only npm publish calls are the dry run');
  assert.ok(dryRun.block.includes("curl -s -o /dev/null -w '%{http_code}'") && dryRun.block.includes('if [ "$status" = "200" ]; then'), 'the dry run must skip a version already on npmjs.org: npm refuses to dry-run it');

  // Pack: both sets from pnpm pack, publishConfig rewritten for the npmjs.org set only, tree restored.
  assert.ok(pack.block.includes('pnpm pack --pack-destination "$out/github"') && pack.block.includes('pnpm pack --pack-destination "$out/npmjs"'), 'both tarball sets must come from pnpm pack (it resolves workspace:*)');
  assert.ok(pack.block.indexOf('"$out/github"') < pack.block.indexOf('p.publishConfig='), 'the GitHub Packages set must be packed before publishConfig is rewritten');
  assert.ok(pack.block.includes(`NPMJS_URL=${NPMJS}`) && pack.block.includes("p.publishConfig={registry:'$NPMJS_URL'}"), 'the npmjs.org set must carry publishConfig.registry for npmjs.org');
  assert.ok(/trap 'git checkout -- packages\/tokens\/package\.json packages\/icons\/package\.json packages\/brand\/package\.json packages\/react\/package\.json' EXIT/.test(pack.block), 'the trap must restore the four package.json files');
  assert.ok(pack.block.indexOf('git status --porcelain') > pack.block.indexOf('trap '), 'packing must end by checking the tree is clean again');
  assert.ok(pack.block.includes('manifest.json') && pack.block.includes('.publishConfig.registry'), 'the pack step writes the manifest and checks each tarball registry');
  assert.ok(upload.block.includes('name: publish-tarballs') && upload.block.includes('if-no-files-found: error'), 'the tarballs and manifest are uploaded as the publish-tarballs artifact');
  assert.ok(!jobs.build.includes('packages/brand && node build.js') && !jobs.build.includes('joy-brand build'), 'the workflow must not run the brand build itself');

  const order = [
    'run: ./scripts/integration.sh',
    'pnpm --filter @montionugera/joy-icons build',
    'pnpm --filter @montionugera/joy-react build',
    'run: ./scripts/test/consumer-smoke.sh',
    'git status --porcelain',
    'name: Check the tag matches the package versions',
    'pnpm pack --pack-destination "$out/github"',
    'name: Dry run',
    'actions/upload-artifact@',
  ];
  const positions = order.map((needle) => jobs.build.indexOf(needle));
  for (const [i, pos] of positions.entries()) assert.ok(pos >= 0, `build job must contain: ${order[i]}`);
  assert.deepStrictEqual(positions, [...positions].sort((a, b) => a - b), 'build steps must run in gate, build, tarball-test, clean-tree, tag-check, pack, dry-run, upload order');
});

test('the publish job runs no repository code: it only downloads the tarballs and uploads them', () => {
  const uses = [...jobs.publish.matchAll(/uses:\s*(\S+)@/g)].map((m) => m[1]);
  assert.deepStrictEqual(uses, ['actions/download-artifact', 'actions/setup-node', 'actions/setup-node'], 'the publish job may use only download-artifact and setup-node');
  for (const [needle, why] of [
    ['actions/checkout', 'no checkout of the repository'],
    ['pnpm', 'no pnpm: no install, no build, no pack'],
    ['scripts/', 'no repository script'],
    ['git ', 'no git command'],
    ['npx', 'no npx'],
    ['node_modules', 'nothing from node_modules'],
    ['packages/', 'no path into the source tree'],
  ]) {
    assert.ok(!jobs.publish.includes(needle), `publish job: ${why} (found "${needle}")`);
  }
  assert.strictEqual(count(jobs.publish, /npm install/g), 1, 'the only install is npm itself');
  assert.ok(jobs.publish.includes("npm install -g 'npm@^11.5.1'"), 'trusted publishing needs npm >= 11.5.1');
  assert.strictEqual(publishSteps[0].block.includes('actions/download-artifact@'), true, 'the first step downloads the tarballs');
  assert.ok(publishSteps[0].block.includes('name: publish-tarballs'), 'publish must download the artifact that build uploaded');
  for (const s of publishSteps.filter((x) => x.block.includes('\n        run:'))) {
    assert.ok(s.block.includes("if: env.DRY_RUN == 'false'"), `${s.name}: every publish-job script must be a real-run step`);
  }
});

test('the publish job publishes to GitHub Packages, verifies, then npmjs.org, in dependency order', () => {
  const githubPublish = step(publishSteps, (s) => s.name.startsWith('Publish to GitHub Packages'), 'GitHub Packages publish');
  const verify = step(publishSteps, (s) => s.name.startsWith('Verify'), 'verify');
  const npmjs = step(publishSteps, (s) => s.name.startsWith('Publish to npmjs.org'), 'npmjs.org publish');
  const setups = publishSteps.filter((s) => s.block.includes('actions/setup-node@'));
  assert.strictEqual(setups.length, 2, 'one setup-node per registry');
  assert.ok(setups[0].block.includes("registry-url: 'https://npm.pkg.github.com'") && setups[0].block.includes("scope: '@montionugera'"), 'the first setup-node must target GitHub Packages and the @montionugera scope');
  assert.ok(setups[1].block.includes(`registry-url: '${NPMJS}'`), 'the second setup-node must target npmjs.org');
  assert.ok(!setups[1].block.includes('scope:'), 'the npmjs.org setup-node sets no scope');
  assert.strictEqual(count(code, /registry-url: 'https:\/\/registry\.npmjs\.org'/g), 1, 'the npmjs.org registry-url appears once, in the publish job');

  assert.deepStrictEqual(
    publishSteps.map((s) => s.name),
    [publishSteps[0].name, setups[0].name, githubPublish.name, verify.name, setups[1].name, npmjs.name, publishSteps.at(-1).name],
    'publish steps must run in download, setup, GitHub Packages publish, verify, npmjs.org setup, npmjs.org publish, final-check order',
  );

  // npm publish uploads only a tarball that pnpm pack made in the build job.
  assert.ok(!code.includes('pnpm publish'), 'pnpm publish is not used: it would need the source tree in the privileged job');
  assert.ok(!/\bnpm publish\b/.test(code.replace(/npm publish "\$tgz"/g, '')), 'npm publish may only upload a pnpm-packed tarball ("$tgz"), never a package directory');
  assert.ok(!jobs.publish.includes('--dry-run'), 'the publish job has no dry-run branch: it is skipped on a dry run');

  // GitHub Packages
  assert.ok(githubPublish.block.includes('npm view "$name@$version" version --registry "$REGISTRY_URL"'), 'must ask GitHub Packages before publishing each package');
  assert.ok(githubPublish.block.includes("grep -q 'E404'"), 'only a 404 means "not published yet"; any other lookup failure stops the run');
  assert.ok(githubPublish.block.includes('SCOPE_PIN="--@montionugera:registry=$REGISTRY_URL"'), 'the scope must be pinned to GitHub Packages');
  assert.strictEqual(count(githubPublish.block, /npm publish "\$tgz" --registry "\$REGISTRY_URL" "\$SCOPE_PIN"$/gm), 1, 'GitHub Packages publish uploads the github-set tarball');
  assert.ok(githubPublish.block.includes(".$dir.github") && !githubPublish.block.includes(".$dir.npmjs"), 'GitHub Packages gets the github set');
  assert.ok(topLevel.includes('REGISTRY_URL: https://npm.pkg.github.com'), 'REGISTRY_URL is GitHub Packages');
  assert.ok(verify.block.includes('npm view "$name@$version" version --registry "$REGISTRY_URL"') && verify.block.includes('exit 1'), 'verify must fail when a version is not on GitHub Packages');

  // npmjs.org
  assert.ok(npmjs.block.includes('SCOPE_PIN="--@montionugera:registry=$NPMJS_URL"') && npmjs.block.includes(`NPMJS_URL=${NPMJS}`), 'the @montionugera scope must be pinned to npmjs.org');
  assert.strictEqual(count(npmjs.block, /npm publish "\$tgz" --access public --registry "\$NPMJS_URL" "\$SCOPE_PIN"/g), 1, 'the npmjs.org publish must be public and carry the scope pin');
  assert.strictEqual(count(npmjs.block, /npm publish/g), 1, 'one npm publish call in the npmjs.org step');
  assert.ok(npmjs.block.includes(".$dir.npmjs") && !npmjs.block.includes(".$dir.github"), 'npmjs.org gets the npmjs set');
  assert.ok(npmjs.block.includes("curl -s -o /dev/null -w '%{http_code}'"), 'the already-published check must be an unauthenticated curl');
  assert.strictEqual(count(npmjs.block, /rc=1\s+break/g), 2, 'the npmjs.org loop must stop at the first failure (lookup or publish)');
  assert.ok(/exit "\$rc"$/.test(npmjs.block.trimEnd()), 'the npmjs.org step must exit with the failure code');
  assert.ok(npmjs.block.includes('::error::') && !npmjs.block.includes('::warning::'), 'an npmjs.org failure is an error, not a warning');
  assert.ok(npmjs.block.includes('22.14'), 'the npmjs.org step must check the Node version trusted publishing needs');

  // Dependency order, and the fixed names: nothing is taken from the artifact but versions and files.
  const loops = code.match(/for dir in ([a-z ]+); do/g) || [];
  assert.ok(loops.length >= 7, 'pack (two sets and a check), dry run, publish, verify and npmjs.org each loop over the packages');
  for (const loop of loops) assert.strictEqual(loop, 'for dir in tokens icons brand react; do', 'packages must be handled in dependency order');
  for (const s of [githubPublish, verify, npmjs]) {
    assert.ok(s.block.includes('name="@montionugera/joy-$dir"'), `${s.name}: the loop must use the fixed @montionugera/joy-* names`);
  }
});

test('a run fails as "nothing to publish" only when neither registry got a new version', () => {
  const githubPublish = step(publishSteps, (s) => s.name.startsWith('Publish to GitHub Packages'), 'GitHub Packages publish');
  const npmjs = step(publishSteps, (s) => s.name.startsWith('Publish to npmjs.org'), 'npmjs.org publish');
  const last = publishSteps.at(-1);
  assert.strictEqual(last.name, 'Fail when nothing was published to either registry');
  assert.strictEqual(count(code, /nothing to publish/g), 1, 'only the final step may fail the run for having nothing to publish');
  assert.ok(last.block.includes('nothing to publish') && last.block.includes('exit 1'), 'the final step fails the run');
  assert.ok(!/published" -eq 0/.test(githubPublish.block) && !/published" -eq 0/.test(npmjs.block), 'a registry step must not fail for publishing nothing: the other registry may still need it');
  assert.match(githubPublish.block, /^        id: github$/m);
  assert.match(npmjs.block, /^        id: npmjs$/m);
  for (const s of [githubPublish, npmjs]) {
    assert.ok(s.block.includes('echo "published=$published" >> "$GITHUB_OUTPUT"'), `${s.name}: must report how many versions it published`);
  }
  assert.ok(last.block.includes('GITHUB_PUBLISHED: ${{ steps.github.outputs.published }}') && last.block.includes('NPMJS_PUBLISHED: ${{ steps.npmjs.outputs.published }}'), 'the final step reads both counts');
  assert.ok(last.block.includes('total=$(( ${GITHUB_PUBLISHED:-0} + ${NPMJS_PUBLISHED:-0} ))') && last.block.includes('if [ "$total" -eq 0 ]; then'), 'the final step fails only when the sum is zero');
  assert.ok(last.block.includes("if: env.DRY_RUN == 'false'") && !last.block.includes('always()'), 'the final step is a real-run step and does not mask an earlier failure');
});
