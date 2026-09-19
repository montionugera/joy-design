import fs from 'node:fs';
import path from 'node:path';

const tokens = JSON.parse(fs.readFileSync('./src/tokens.json', 'utf8'));
const outDir = './dist';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function flattenTokens(obj, prefix = '') {
  let cssVars = [];
  let jsObj = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const newPrefix = prefix ? `${prefix}-${key}` : key;
    if (val && typeof val === 'object' && 'value' in val) {
      cssVars.push(`  --joy-${newPrefix}: ${val.value};`);
      jsObj[newPrefix] = val.value;
    } else if (val && typeof val === 'object') {
      const nested = flattenTokens(val, newPrefix);
      cssVars.push(...nested.cssVars);
      Object.assign(jsObj, nested.jsObj);
    }
  }
  return { cssVars, jsObj };
}

const { cssVars, jsObj } = flattenTokens(tokens);

// 1. theme.css
const themeCss = `:root {\n${cssVars.join('\n')}\n}\n`;
fs.writeFileSync(path.join(outDir, 'theme.css'), themeCss);

// 2. tailwind-theme.css (Tailwind v4 theme variables)
const twThemeCss = `@theme {\n${cssVars.map(v => v.replace('--joy-', '--color-joy-')).join('\n')}\n}\n`;
fs.writeFileSync(path.join(outDir, 'tailwind-theme.css'), twThemeCss);

// 3. index.js (ESM) & index.cjs (CJS) & index.d.ts
const jsContent = `export const tokens = ${JSON.stringify(jsObj, null, 2)};\nexport default tokens;\n`;
fs.writeFileSync(path.join(outDir, 'index.js'), jsContent);

const cjsContent = `exports.tokens = ${JSON.stringify(jsObj, null, 2)};\nexports.default = exports.tokens;\n`;
fs.writeFileSync(path.join(outDir, 'index.cjs'), cjsContent);

const dtsContent = `export declare const tokens: Record<string, string>;\nexport default tokens;\n`;
fs.writeFileSync(path.join(outDir, 'index.d.ts'), dtsContent);

console.log("Tokens compiled successfully to", outDir);
