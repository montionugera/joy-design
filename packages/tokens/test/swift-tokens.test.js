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
  assert.ok(content.includes('public static let modernLight = JoyThemeTokens('), 'must emit JoyThemeTokens.modernLight');
  assert.ok(content.includes('public static let modernDark = JoyThemeTokens('), 'must emit JoyThemeTokens.modernDark');
  assert.ok(content.includes('public static func modern(isDark: Bool = false) -> JoyThemeTokens'), 'must emit JoyThemeTokens.modern(isDark:)');
  assert.ok(content.includes('public struct JoyModernModeTokens: Sendable'), 'must emit JoyModernModeTokens');
  assert.ok(content.includes('public enum JoyModernTokens'), 'must emit JoyModernTokens');
  for (const hexLiteral of [
    '0xF3F5F9', '0x14253E', '0x4E5F7B', '0xD5DBE6',
    '0x0A121F', '0x111B2B', '0xEEF2F8', '0xA9B4C6', '0x223250',
    '0xDAB362', '0xF4E6CA', '0x150B00', '0xA5802B', '0xAE7D0E',
    '0xE0B03A', '0xF0CC7A', '0xB8892B',
    '0x306D35', '0xAD4A00', '0x9F3331', '0x2C6193',
    '0x93C794', '0xF2884A', '0xFB9890', '0x8FBCEB',
    '0x0B1226', '0x101B38', '0x2A2014', '0x4A2A14', '0xC7743F', '0xF2C078', '0xFBF3E9',
  ]) {
    assert.ok(content.includes(`Color(joyHex: ${hexLiteral})`), `JoyTokens.g.swift must emit ${hexLiteral}`);
  }
});
