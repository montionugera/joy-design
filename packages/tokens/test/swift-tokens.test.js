import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.join(__dirname, '../scripts/gen-swift-tokens.mjs');
const generatedPath = path.join(__dirname, '../../swift/Sources/JoyDesign/JoyTokens.g.swift');

test('Swift token generator produces JoyTokens.g.swift and passes --check', () => {
  execFileSync('node', [scriptPath, '--check'], { stdio: 'pipe' });
  assert.ok(fs.existsSync(generatedPath), 'JoyTokens.g.swift must exist');
  const content = fs.readFileSync(generatedPath, 'utf8');
  assert.ok(content.includes('public enum JoyColorRamps'), 'must emit JoyColorRamps');
  assert.ok(content.includes('public struct JoyThemeTokens: Sendable'), 'must emit JoyThemeTokens');
  assert.ok(content.includes('public enum JoyDesign'), 'must emit JoyDesign namespace');
  assert.ok(content.includes('public static let gold500 = Color(joyHex: 0xFFD700)'), 'must emit canonical gold500');
});
