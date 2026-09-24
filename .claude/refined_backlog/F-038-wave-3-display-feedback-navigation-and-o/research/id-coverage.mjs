#!/usr/bin/env node
// Reproduces the F-038 issue-coverage numbers: every audit ID (SVD-001..098, RXD-001..105) must
// appear exactly once in research/issue-coverage.md with a known, non-empty status and the same
// severity as the audit; deferred rows must carry a reason in the Note column.
// Usage: node .claude/refined_backlog/F-038-wave-3-display-feedback-navigation-and-o/research/id-coverage.mjs
// Exit 0 when nothing is missing or inconsistent, 1 otherwise.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => fs.readFileSync(path.join(here, name), 'utf8');

const STATUSES = ['closed', 'verify-only (already clean)', 'deferred', 'n/a (out of scope)'];

// Audit rows look like: | SVD-001 | P0 | taste | `file:line` | issue | fix |
const auditRow = /^\|\s*((?:SVD|RXD)-\d{3})\s*\|\s*(P\d)\s*\|/;
const audit = new Map();
for (const file of ['audit-svelte-display.md', 'audit-react-display.md']) {
  for (const line of read(file).split('\n')) {
    const m = auditRow.exec(line);
    if (m) audit.set(m[1], m[2]);
  }
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

const problems = [];
const missing = [...audit.keys()].filter((id) => !coverage.has(id));
if (missing.length) problems.push(`missing from table: ${missing.join(', ')}`);
if (duplicates.length) problems.push(`listed more than once: ${duplicates.join(', ')}`);
const extra = [...coverage.keys()].filter((id) => !audit.has(id));
if (extra.length) problems.push(`not in either audit: ${extra.join(', ')}`);

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

const svd = [...audit.keys()].filter((id) => id.startsWith('SVD')).length;
const rxd = audit.size - svd;
console.log(`audit IDs: SVD ${svd}, RXD ${rxd}, total ${audit.size}; table rows ${coverage.size}`);
for (const [status, n] of Object.entries(counts)) console.log(`  ${status}: ${n}`);
console.log(
  `in-scope ${counts.closed} / verify-only ${counts['verify-only (already clean)']} / deferred ${counts.deferred} / missing ${missing.length}`
);
if (problems.length) {
  for (const p of problems) console.error(`PROBLEM: ${p}`);
  process.exit(1);
}
