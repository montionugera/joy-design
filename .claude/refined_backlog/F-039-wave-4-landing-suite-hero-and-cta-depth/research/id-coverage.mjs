#!/usr/bin/env node
// Reproduces the F-039 issue-coverage numbers. The ID universe is every SVL row of
// audit-landing-svelte.md (SVL-001..090) plus the fixed list of 78 RXF rows below (the 77 landing
// rows Wave 2 deferred to this wave, plus RXF-002). The other RXF rows of
// audit-react-forms-landing.md belong to Wave 2 (forms) and are NOT part of this universe.
// Every universe ID must appear exactly once in research/issue-coverage.md with a known, non-empty
// status, a non-empty Where cell and the same severity as the audit; deferred rows must carry a
// reason in the Note column.
// Usage: node .claude/refined_backlog/F-039-wave-4-landing-suite-hero-and-cta-depth/research/id-coverage.mjs
// Exit 0 when nothing is missing or inconsistent, 1 otherwise.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => fs.readFileSync(path.join(here, name), 'utf8');

const STATUSES = ['closed', 'verify-only (already clean)', 'deferred', 'n/a (out of scope)'];

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const RXF_IN_SCOPE = [
  ...range(1, 7),
  10, 11, 13, 14,
  ...range(18, 23),
  ...range(25, 29),
  ...range(35, 45),
  ...range(78, 93),
  ...range(107, 122),
  ...range(128, 130),
  ...range(148, 152),
  154,
  ...range(160, 163),
].map((n) => `RXF-${String(n).padStart(3, '0')}`);
if (RXF_IN_SCOPE.length !== 78 || new Set(RXF_IN_SCOPE).size !== 78) {
  console.error(`PROBLEM: the embedded RXF list has ${RXF_IN_SCOPE.length} entries, expected 78 unique`);
  process.exit(1);
}

// Audit rows look like: | SVL-001 | P0 | color | `file:line` | issue | fix |
const auditRow = /^\|\s*((?:SVL|RXF)-\d{3})\s*\|\s*(P\d)\s*\|/;
const audit = new Map();
for (const line of read('audit-landing-svelte.md').split('\n')) {
  const m = auditRow.exec(line);
  if (m && m[1].startsWith('SVL')) audit.set(m[1], m[2]);
}
const rxfSeverity = new Map();
for (const line of read('audit-react-forms-landing.md').split('\n')) {
  const m = auditRow.exec(line);
  if (m && m[1].startsWith('RXF')) rxfSeverity.set(m[1], m[2]);
}
const problems = [];
for (const id of RXF_IN_SCOPE) {
  if (!rxfSeverity.has(id)) problems.push(`${id} is in the embedded list but not in audit-react-forms-landing.md`);
  else audit.set(id, rxfSeverity.get(id));
}

// Coverage rows look like: | ID | Sev | Status | Where | Note |
const coverage = new Map();
const duplicates = [];
for (const line of read('issue-coverage.md').split('\n')) {
  if (!auditRow.test(line)) continue;
  const cells = line.split('|').slice(1, -1).map((c) => c.trim());
  const [id, sev, status, where, note] = cells;
  if (coverage.has(id)) duplicates.push(id);
  coverage.set(id, { sev, status, where, note });
}

const missing = [...audit.keys()].filter((id) => !coverage.has(id));
if (missing.length) problems.push(`missing from table: ${missing.join(', ')}`);
if (duplicates.length) problems.push(`listed more than once: ${duplicates.join(', ')}`);
const extra = [...coverage.keys()].filter((id) => !audit.has(id));
if (extra.length) problems.push(`not in the F-039 universe: ${extra.join(', ')}`);

const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
for (const [id, row] of coverage) {
  if (!audit.has(id)) continue;
  if (!row.status) problems.push(`${id}: empty status`);
  else if (!STATUSES.includes(row.status)) problems.push(`${id}: unknown status "${row.status}"`);
  else counts[row.status] += 1;
  if (!row.where) problems.push(`${id}: empty Where`);
  if (row.sev !== audit.get(id)) problems.push(`${id}: severity ${row.sev} differs from the audit (${audit.get(id)})`);
  if (row.status === 'deferred' && !row.note) problems.push(`${id}: deferred without a reason`);
}

const svl = [...audit.keys()].filter((id) => id.startsWith('SVL')).length;
const rxf = audit.size - svl;
console.log(`universe IDs: SVL ${svl}, RXF ${rxf}, total ${audit.size}; table rows ${coverage.size}`);
for (const [status, n] of Object.entries(counts)) console.log(`  ${status}: ${n}`);
console.log(
  `closed ${counts.closed} / verify-only ${counts['verify-only (already clean)']} / deferred ${counts.deferred} / missing ${missing.length}`
);
if (problems.length) {
  for (const p of problems) console.error(`PROBLEM: ${p}`);
  process.exit(1);
}
