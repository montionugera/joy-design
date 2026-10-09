import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenizeCode, highlightCodeToHtml, normalizeLanguage } from '../src/lib/syntax-highlighter.ts';

test('Svelte twin syntax-highlighter maps aliases correctly', () => {
  assert.equal(normalizeLanguage('rs'), 'rust');
  assert.equal(normalizeLanguage('ts'), 'typescript');
  assert.equal(normalizeLanguage('py'), 'python');
  assert.equal(normalizeLanguage('mermaid'), 'mermaid');
});

test('Svelte twin syntax-highlighter tokenizes code accurately', () => {
  const code = `pub fn main() { println!("Hello Joy"); }`;
  const tokens = tokenizeCode(code, 'rust');
  assert.ok(tokens.some(t => t.type === 'keyword'), 'has keywords');
  assert.ok(tokens.some(t => t.type === 'macro'), 'has macro');
  assert.ok(tokens.some(t => t.type === 'string'), 'has string');

  const html = highlightCodeToHtml(code, 'rust');
  assert.ok(html.includes('joy-syntax-keyword'));
  assert.ok(html.includes('joy-syntax-macro'));
  assert.ok(html.includes('joy-syntax-string'));
});
