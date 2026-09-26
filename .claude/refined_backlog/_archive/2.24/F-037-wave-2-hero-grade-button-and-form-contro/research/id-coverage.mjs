#!/usr/bin/env node
// Reproduces the F-037 issue-coverage numbers: every in-scope SVF-/RXF- ID must be
// assigned to at least one task in plan.md; deferred IDs must not be assigned.
// Usage: node .claude/refined_backlog/F-037-wave-2-hero-grade-button-and-form-contro/research/id-coverage.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const plan = fs.readFileSync(path.join(here, '..', 'plan.md'), 'utf8');

// Task sections only: from the first Phase heading up to "## Issue coverage".
const start = plan.indexOf('## Phase A');
const end = plan.indexOf('## Issue coverage');
const tasks = plan.slice(start, end);

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const inScope = {
  SVF: range(1, 115).filter((i) => i !== 83),
  RXF: [2, 8, 9, 12, 15, 16, 17, 24, 30, 31, 32, 34, ...range(46, 77), ...range(94, 106), ...range(123, 127), ...range(131, 147), 153, ...range(155, 159), 164, 165],
};
const deferred = {
  SVF: [83],
  RXF: range(1, 165).filter((i) => !inScope.RXF.includes(i)),
};

const assigned = { SVF: new Set(), RXF: new Set() };
for (const m of tasks.matchAll(/(SVF|RXF)-(\d{3})(?:\.\.(\d{3}))?/g)) {
  const a = Number(m[2]);
  const b = m[3] ? Number(m[3]) : a;
  for (let i = a; i <= b; i++) assigned[m[1]].add(i);
}

let failed = false;
for (const lane of ['SVF', 'RXF']) {
  const missing = inScope[lane].filter((i) => !assigned[lane].has(i));
  const leaked = deferred[lane].filter((i) => assigned[lane].has(i));
  console.log(`${lane}: in-scope ${inScope[lane].length}, deferred ${deferred[lane].length}, missing-from-tasks ${JSON.stringify(missing)}, deferred-but-assigned ${JSON.stringify(leaked)}`);
  if (missing.length || leaked.length) failed = true;
}
const total = inScope.SVF.length + inScope.RXF.length;
const totalDeferred = deferred.SVF.length + deferred.RXF.length;
console.log(`in-scope ${total} / deferred ${totalDeferred} / missing ${failed ? 'see above' : 0}`);
process.exit(failed ? 1 : 0);
