import { contrastRatio } from '../../scripts/color.mjs';

/** WCAG 2.x contrast ratio between two hex colours (re-exported so tests need one helper import). */
export { contrastRatio };

/**
 * Parse dist/theme.css into resolved light/dark token maps (var() chains resolved to hex where possible).
 * Returns { light, dark, darkBlockCount, duplicateDarkVars, mediaDarkVars }.
 */
export function parseCssTokens(css) {
  const lightVars = {};
  const darkVars = {};
  const darkVarCounts = {};
  const duplicateDarkVars = [];

  // 1. Extract and parse all :root blocks in document order
  const rootRegex = /:root\s*\{([^}]+)\}/g;
  let rootMatch;
  while ((rootMatch = rootRegex.exec(css)) !== null) {
    const lines = rootMatch[1].split(';');
    for (const line of lines) {
      const match = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
      if (match) {
        lightVars[match[1].trim()] = match[2].trim();
      }
    }
  }

  // 2. Extract and parse ALL [data-theme="dark"] blocks in document order (last wins)
  const darkBlockRegex = /\[data-theme="dark"\]\s*\{([^}]+)\}/g;
  let darkMatch;
  let darkBlockCount = 0;
  while ((darkMatch = darkBlockRegex.exec(css)) !== null) {
    darkBlockCount++;
    const lines = darkMatch[1].split(';');
    for (const line of lines) {
      const match = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
      if (match) {
        const varName = match[1].trim();
        const varVal = match[2].trim();
        if (varName.startsWith('--joy-')) {
          darkVarCounts[varName] = (darkVarCounts[varName] || 0) + 1;
        }
        darkVars[varName] = varVal;
      }
    }
  }

  for (const [varName, count] of Object.entries(darkVarCounts)) {
    if (count > 1) {
      duplicateDarkVars.push(`${varName} (declared ${count} times in dark theme)`);
    }
  }

  // 3. Extract and parse @media (prefers-color-scheme: dark) block
  const mediaDarkRegex = /@media\s*\(\s*prefers-color-scheme:\s*dark\s*\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{([^}]+)\}/g;
  let mediaMatch;
  const mediaDarkVars = {};
  while ((mediaMatch = mediaDarkRegex.exec(css)) !== null) {
    const lines = mediaMatch[1].split(';');
    for (const line of lines) {
      const match = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
      if (match) {
        mediaDarkVars[match[1].trim()] = match[2].trim();
      }
    }
  }

  function resolveValue(val, store, depth = 0) {
    if (depth > 10 || !val) return val;
    val = val.trim();
    // Handle focus ring: "2px solid #xxx" or "#xxx"
    const hexMatch = val.match(/#[0-9a-fA-F]{3,8}\b/);
    const varMatch = val.match(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/);
    if (varMatch) {
      const ref = varMatch[1];
      const fallback = varMatch[2];
      if (store[ref]) {
        return resolveValue(store[ref], store, depth + 1);
      } else if (lightVars[ref]) {
        return resolveValue(lightVars[ref], lightVars, depth + 1);
      } else if (fallback) {
        return resolveValue(fallback, store, depth + 1);
      }
    }
    if (hexMatch) {
      return hexMatch[0];
    }
    return val;
  }

  const resolveStore = (vars) => {
    const resolved = {};
    for (const k of Object.keys(vars)) {
      resolved[k] = resolveValue(vars[k], vars);
    }
    return resolved;
  };

  const resolvedLight = resolveStore(lightVars);
  // Dark inherits from light unless overridden
  const combinedDark = { ...lightVars, ...darkVars };
  const resolvedDark = resolveStore(combinedDark);

  return {
    light: resolvedLight,
    dark: resolvedDark,
    darkBlockCount,
    duplicateDarkVars,
    mediaDarkVars
  };
}
