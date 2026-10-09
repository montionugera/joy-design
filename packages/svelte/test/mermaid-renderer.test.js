import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMermaidToSvg } from '../src/lib/mermaid-renderer.ts';

test('svelte mermaid-renderer: renders flowchart and sequence diagrams', () => {
  const flowchart = `
flowchart TD
  A[Start] --> B[Finish]
`;
  const res1 = renderMermaidToSvg(flowchart);
  assert.equal(res1.success, true);
  assert.equal(res1.type, 'flowchart');
  assert.ok(res1.svg?.includes('Start'));
  assert.ok(res1.svg?.includes('Finish'));

  const sequence = `
sequenceDiagram
  Client->>Server: Ping
  Server-->>Client: Pong
`;
  const res2 = renderMermaidToSvg(sequence);
  assert.equal(res2.success, true);
  assert.equal(res2.type, 'sequence');
  assert.ok(res2.svg?.includes('Ping'));
  assert.ok(res2.svg?.includes('Pong'));
});
