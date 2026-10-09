import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenizeCode, highlightCodeToHtml, normalizeLanguage } from '../src/syntax-highlighter.ts';

test('normalizeLanguage maps aliases correctly', () => {
  assert.equal(normalizeLanguage('rs'), 'rust');
  assert.equal(normalizeLanguage('rust'), 'rust');
  assert.equal(normalizeLanguage('ts'), 'typescript');
  assert.equal(normalizeLanguage('tsx'), 'typescript');
  assert.equal(normalizeLanguage('js'), 'javascript');
  assert.equal(normalizeLanguage('py'), 'python');
  assert.equal(normalizeLanguage('sh'), 'bash');
  assert.equal(normalizeLanguage('mermaid'), 'mermaid');
  assert.equal(normalizeLanguage('unknown'), 'unknown');
  assert.equal(normalizeLanguage(''), 'text');
});

test('tokenizeCode tokenizes Rust code accurately', () => {
  const code = `// Compute hash
pub async fn calculate_hash(data: &str) -> Option<String> {
    let mut state = 42u64;
    println!("State: {}", state);
    Some(state.to_string())
}`;

  const tokens = tokenizeCode(code, 'rust');
  const types = tokens.map(t => t.type);

  assert.ok(types.includes('comment'), 'should detect comment');
  assert.ok(types.includes('keyword'), 'should detect keywords (pub, async, fn, let, mut)');
  assert.ok(types.includes('fn'), 'should detect function name calculate_hash');
  assert.ok(types.includes('type'), 'should detect types str, Option, String');
  assert.ok(types.includes('number'), 'should detect 42u64');
  assert.ok(types.includes('macro'), 'should detect println!');
  assert.ok(types.includes('string'), 'should detect format string');
});

test('tokenizeCode tokenizes TypeScript code accurately', () => {
  const code = `import { useState } from 'react';
// Async fetch
export async function fetchData(url: string): Promise<Record<string, any>> {
    const res = await fetch(url);
    return res.json();
}`;

  const tokens = tokenizeCode(code, 'typescript');
  const types = tokens.map(t => t.type);

  assert.ok(types.includes('keyword'), 'should detect keywords');
  assert.ok(types.includes('type'), 'should detect Promise, Record, string');
  assert.ok(types.includes('fn'), 'should detect function names fetchData, fetch');
  assert.ok(types.includes('string'), 'should detect strings');
});

test('tokenizeCode tokenizes Python code accurately', () => {
  const code = `@property
def get_total(self) -> float:
    # Calculate sum
    values = [1, 2, 3]
    return sum(values) * 1.5`;

  const tokens = tokenizeCode(code, 'python');
  const types = tokens.map(t => t.type);

  assert.ok(types.includes('macro'), 'should detect decorator @property');
  assert.ok(types.includes('keyword'), 'should detect def, return');
  assert.ok(types.includes('comment'), 'should detect comment');
  assert.ok(types.includes('number'), 'should detect float numbers');
  assert.ok(types.includes('type'), 'should detect float type');
});

test('highlightCodeToHtml escapes HTML and renders semantic classes', () => {
  const code = `fn test<T>() { if x < 10 && y > 20 { "safe & clean" } }`;
  const html = highlightCodeToHtml(code, 'rust');

  assert.ok(!html.includes('<T>'), 'must not contain unescaped <T>');
  assert.ok(html.includes('&lt;'), 'contains escaped &lt;');
  assert.ok(html.includes('&gt;'), 'contains escaped &gt;');
  assert.ok(html.includes('&amp;&amp;'), 'contains escaped &amp;&amp;');
  assert.ok(html.includes('joy-syntax-keyword'), 'has joy-syntax-keyword class');
  assert.ok(html.includes('joy-syntax-string'), 'has joy-syntax-string class');
});
