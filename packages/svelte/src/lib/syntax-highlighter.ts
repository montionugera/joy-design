/**
 * Joy Design System — Stream-Safe Semantic Syntax Highlighter
 * Tokenizes code into semantic spans styled with Joy Design tokens.
 * Zero external runtime dependencies.
 */

export type SyntaxTokenType =
  | 'keyword'
  | 'type'
  | 'string'
  | 'number'
  | 'comment'
  | 'fn'
  | 'macro'
  | 'variable'
  | 'operator'
  | 'punct'
  | 'tag'
  | 'attr';

export interface TokenSpan {
  type: SyntaxTokenType | 'text';
  text: string;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeLanguage(lang?: string): string {
  if (!lang) return 'text';
  const clean = lang.trim().toLowerCase();
  switch (clean) {
    case 'rs':
    case 'rust':
      return 'rust';
    case 'ts':
    case 'typescript':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'javascript':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'py':
    case 'python':
    case 'python3':
      return 'python';
    case 'json':
      return 'json';
    case 'bash':
    case 'sh':
    case 'shell':
    case 'zsh':
      return 'bash';
    case 'sql':
      return 'sql';
    case 'html':
    case 'xml':
    case 'svg':
      return 'html';
    case 'css':
    case 'scss':
      return 'css';
    case 'mermaid':
      return 'mermaid';
    default:
      return clean;
  }
}

interface LanguageDef {
  comments?: RegExp;
  strings?: RegExp;
  keywords?: RegExp;
  types?: RegExp;
  macros?: RegExp;
  numbers?: RegExp;
  functions?: RegExp;
  variables?: RegExp;
  operators?: RegExp;
}

const RUST_DEF: LanguageDef = {
  comments: /\/\/[^\n]*|\/\*[\s\S]*?\*\//,
  strings: /"([^"\\]|\\.)*"|r(#*)"[\s\S]*?"\1|'([^'\\]|\\.)*'/,
  keywords: /\b(as|async|await|break|const|continue|crate|dyn|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while)\b/,
  types: /\b(bool|char|i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|str|String|Option|Some|None|Result|Ok|Err|Vec|Box|Rc|Arc|Cell|RefCell|HashMap|HashSet|BTreeMap|BTreeSet|Path|PathBuf|Pin|Future|Stream|Send|Sync|Clone|Copy|Debug|Default)\b|'[a-z_][a-z0-9_]*\b/,
  macros: /\b[a-zA-Z_][a-zA-Z0-9_]*!/,
  numbers: /\b0x[0-9a-fA-F_]+\b|\b0b[01_]+\b|\b\d+[\d_]*(\.[\d_]+)?([eE][+-]?\d+)?(u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64)?\b/,
  functions: /\b([a-z_][a-z0-9_]*)(?=\s*\()/,
  operators: /(=>|->|::|\.\.=?|[-+*\/%&|^!=<>?:]+)/
};

const TS_JS_DEF: LanguageDef = {
  comments: /\/\/[^\n]*|\/\*[\s\S]*?\*\//,
  strings: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`/,
  keywords: /\b(abstract|any|as|asserts|async|await|boolean|break|case|catch|class|const|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|is|keyof|let|module|namespace|never|new|null|number|object|of|package|private|protected|public|readonly|return|set|static|string|super|switch|symbol|this|throw|true|try|type|typeof|undefined|unique|unknown|var|void|while|with|yield)\b/,
  types: /\b(Array|Promise|Record|Partial|Required|Readonly|Pick|Omit|Exclude|Extract|NonNullable|Parameters|ReturnType|InstanceType|Map|Set|WeakMap|WeakSet|Date|RegExp|Error|Console|Math|JSON|HTML[a-zA-Z]+Element|Element|Document|Window)\b/,
  numbers: /\b0x[0-9a-fA-F]+\b|\b0b[01]+\b|\b\d+(\.\d+)?([eE][+-]?\d+)?n?\b/,
  functions: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/,
  operators: /(=>|[-+*\/%&|^!=<>?:]+|\.{3})/
};

const PYTHON_DEF: LanguageDef = {
  comments: /#[^\n]*/,
  strings: /"""[\s\S]*?"""|'''[\s\S]*?'''|[fFrRuUbB]?"([^"\\]|\\.)*"|[fFrRuUbB]?'([^'\\]|\\.)*'/,
  keywords: /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\b/,
  types: /\b(int|float|str|bool|list|dict|set|tuple|bytes|bytearray|range|len|print|open|enumerate|zip|map|filter|sum|min|max|isinstance|issubclass|type|id|input|iter|next|super|property|classmethod|staticmethod|Exception)\b/,
  macros: /@[a-zA-Z_][a-zA-Z0-9_.]*/, // Decorators
  numbers: /\b0x[0-9a-fA-F_]+\b|\b0b[01_]+\b|\b\d+[\d_]*(\.[\d_]+)?([eE][+-]?\d+)?j?\b/,
  functions: /\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/,
  operators: /([-+*\/%&|^!=<>:]+|\/\/|\*\*)/
};

const JSON_DEF: LanguageDef = {
  strings: /"([^"\\]|\\.)*"/,
  keywords: /\b(true|false|null)\b/,
  numbers: /-?\b\d+(\.\d+)?([eE][+-]?\d+)?\b/
};

const BASH_DEF: LanguageDef = {
  comments: /#[^\n]*/,
  strings: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/,
  keywords: /\b(if|then|else|elif|fi|case|esac|for|while|until|do|done|in|function|select|return|exit)\b/,
  types: /\b(echo|printf|cd|pwd|ls|cat|mkdir|rm|cp|mv|chmod|chown|grep|sed|awk|curl|wget|git|pnpm|npm|npx|yarn|cargo|rustc|python3?|node|bash|sh|zsh|docker|kubectl)\b/,
  variables: /\$[a-zA-Z_0-9]+|\$\{[^}]+\}/,
  macros: /-{1,2}[a-zA-Z0-9_-]+/, // Flags
  operators: /(\|{1,2}|&{1,2}|;|>>?|<<?)/
};

const SQL_DEF: LanguageDef = {
  comments: /--[^\n]*|\/\*[\s\S]*?\*\//,
  strings: /'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/,
  keywords: /\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|UNION|ALL|CREATE|TABLE|ALTER|DROP|INDEX|VIEW|TRIGGER|DATABASE|SCHEMA|AS|DISTINCT|CASE|WHEN|THEN|ELSE|END|AND|OR|NOT|IN|IS|NULL|LIKE|ILIKE|BETWEEN|EXISTS|PRIMARY|KEY|FOREIGN|REFERENCES|CHECK|UNIQUE|DEFAULT|WITH|RECURSIVE)\b/i,
  types: /\b(INT|INTEGER|BIGINT|SMALLINT|TINYINT|VARCHAR|CHAR|TEXT|BOOLEAN|BOOL|DATE|TIME|TIMESTAMP|TIMESTAMPTZ|NUMERIC|DECIMAL|FLOAT|DOUBLE|PRECISION|JSON|JSONB|UUID|SERIAL|BIGSERIAL|BYTEA|ARRAY)\b/i,
  functions: /\b(COUNT|SUM|AVG|MIN|MAX|COALESCE|NULLIF|NOW|ROUND|EXTRACT|LOWER|UPPER|LENGTH|SUBSTRING|CONCAT)(?=\s*\()/i,
  numbers: /\b\d+(\.\d+)?\b/
};

function getLanguageDef(lang: string): LanguageDef | null {
  switch (lang) {
    case 'rust':
      return RUST_DEF;
    case 'typescript':
    case 'javascript':
      return TS_JS_DEF;
    case 'python':
      return PYTHON_DEF;
    case 'json':
      return JSON_DEF;
    case 'bash':
      return BASH_DEF;
    case 'sql':
      return SQL_DEF;
    default:
      return null;
  }
}

/**
 * Tokenizes source code into structured tokens.
 */
export function tokenizeCode(code: string, lang: string): TokenSpan[] {
  const norm = normalizeLanguage(lang);
  const def = getLanguageDef(norm);
  if (!def) {
    return [{ type: 'text', text: code }];
  }

  const tokens: TokenSpan[] = [];
  let pos = 0;
  const len = code.length;

  // Build ordered rule set for current language
  const rules: Array<{ type: SyntaxTokenType; regex: RegExp }> = [];
  if (def.comments) rules.push({ type: 'comment', regex: def.comments });
  if (def.strings) rules.push({ type: 'string', regex: def.strings });
  if (def.macros) rules.push({ type: 'macro', regex: def.macros });
  if (def.keywords) rules.push({ type: 'keyword', regex: def.keywords });
  if (def.types) rules.push({ type: 'type', regex: def.types });
  if (def.functions) rules.push({ type: 'fn', regex: def.functions });
  if (def.variables) rules.push({ type: 'variable', regex: def.variables });
  if (def.numbers) rules.push({ type: 'number', regex: def.numbers });
  if (def.operators) rules.push({ type: 'operator', regex: def.operators });

  while (pos < len) {
    const slice = code.slice(pos);
    let matched = false;

    // Check if any rule matches at the start of slice
    for (let r = 0; r < rules.length; r++) {
      const { type, regex } = rules[r];
      const match = slice.match(regex);
      if (match && match.index === 0) {
        tokens.push({ type, text: match[0] });
        pos += match[0].length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Consume non-matching characters up to next token start or newline/space
      const nextChar = code[pos];
      // Collect contiguous plain text
      let nextPos = pos + 1;
      while (nextPos < len) {
        const nextSlice = code.slice(nextPos);
        let wouldMatch = false;
        for (let r = 0; r < rules.length; r++) {
          const m = nextSlice.match(rules[r].regex);
          if (m && m.index === 0) {
            wouldMatch = true;
            break;
          }
        }
        if (wouldMatch) break;
        nextPos++;
      }

      tokens.push({ type: 'text', text: code.slice(pos, nextPos) });
      pos = nextPos;
    }
  }

  return tokens;
}

/**
 * Highlights code and returns safe HTML with semantic token classes.
 */
export function highlightCodeToHtml(code: string, lang: string): string {
  const tokens = tokenizeCode(code, lang);
  return tokens
    .map((tok) => {
      const esc = escapeHtml(tok.text);
      if (tok.type === 'text') return esc;
      return `<span class="joy-syntax-${tok.type}">${esc}</span>`;
    })
    .join('');
}
