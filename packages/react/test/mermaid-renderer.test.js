import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMermaidToSvg } from '../src/mermaid-renderer.ts';

test('mermaid-renderer: handles empty definition gracefully', () => {
  const res = renderMermaidToSvg('');
  assert.equal(res.success, false);
  assert.equal(res.type, 'unknown');
  assert.ok(res.error);
});

test('mermaid-renderer: renders flowchart TD with nodes and edges', () => {
  const code = `
flowchart TD
  A[Start Process] --> B{Is Valid?}
  B -->|Yes| C[Proceed]
  B -->|No| D[(Audit DB)]
  C --> E((Done))
`;
  const res = renderMermaidToSvg(code);
  assert.equal(res.success, true);
  assert.equal(res.type, 'flowchart');
  assert.ok(res.svg?.includes('<svg'));
  assert.ok(res.svg?.includes('class="joy-mermaid__svg"'));
  assert.ok(res.svg?.includes('Start Process'));
  assert.ok(res.svg?.includes('Is Valid?'));
  assert.ok(res.svg?.includes('Audit DB'));
  assert.ok(res.svg?.includes('Done'));
  assert.ok(res.svg?.includes('Yes'));
  assert.ok(res.svg?.includes('No'));
  assert.ok(res.svg?.includes('class="joy-mermaid-node"'));
  assert.ok(res.svg?.includes('class="joy-mermaid-edge"'));
  assert.ok(res.svg?.includes('class="joy-mermaid-arrow"'));
});

test('mermaid-renderer: renders flowchart LR with stadium and rounded nodes', () => {
  const code = `
graph LR
  Client([Web Browser]) --> Server(Joy Gateway)
  Server ==> Cache[(Redis Cache)]
`;
  const res = renderMermaidToSvg(code);
  assert.equal(res.success, true);
  assert.equal(res.type, 'flowchart');
  assert.ok(res.svg?.includes('Web Browser'));
  assert.ok(res.svg?.includes('Joy Gateway'));
  assert.ok(res.svg?.includes('Redis Cache'));
});

test('mermaid-renderer: renders sequence diagram with participants and messages', () => {
  const code = `
sequenceDiagram
  participant User as Customer
  participant API as API Server
  participant DB as Database
  User->>API: GET /account
  API->>DB: Query account details
  DB-->>API: Return row
  API-->>User: 200 OK (JSON)
`;
  const res = renderMermaidToSvg(code);
  assert.equal(res.success, true);
  assert.equal(res.type, 'sequence');
  assert.ok(res.svg?.includes('<svg'));
  assert.ok(res.svg?.includes('Customer'));
  assert.ok(res.svg?.includes('API Server'));
  assert.ok(res.svg?.includes('Database'));
  assert.ok(res.svg?.includes('GET /account'));
  assert.ok(res.svg?.includes('200 OK (JSON)'));
  assert.ok(res.svg?.includes('class="joy-mermaid-arrow"'));
  assert.ok(res.svg?.includes('stroke-dasharray="4 4"'));
});
