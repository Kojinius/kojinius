// 2026-05-11 [opus-4-7] Phase 6: 言語検出 / Prism ハイライト / プレビュー srcdoc を抽出
// 元 src/components/CrafticaEditor.tsx L95-261 から純粋関数とデータを切り出し（挙動変化なし）
import { marked } from 'marked';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-visual-basic';
import 'prismjs/components/prism-excel-formula';
// 2026-05-11 17:30:00 claude-opus-4-7[1m] セッションターン数：18
// TS / JSX / TSX transpile 統合（設計書: documents/design/craftica-editor-tsx-jsx-transpile.md）
import { transform as sucraseTransform } from 'sucrase';

marked.use({ breaks: true, gfm: true });

export type PrismLang =
  | 'markdown' | 'markup' | 'css' | 'javascript' | 'jsx' | 'typescript' | 'tsx'
  | 'python' | 'json' | 'sql' | 'yaml' | 'bash'
  | 'c' | 'go' | 'java' | 'kotlin' | 'php' | 'ruby' | 'rust' | 'swift'
  | 'csharp' | 'cpp' | 'visual-basic' | 'vba' | 'excel-formula';

export function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const EXT_TO_LANG: Record<string, PrismLang> = {
  md: 'markdown', markdown: 'markdown', mdx: 'markdown', txt: 'markdown',
  html: 'markup', htm: 'markup', xml: 'markup', svg: 'markup',
  css: 'css', scss: 'css', sass: 'css', less: 'css',
  js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  py: 'python', pyi: 'python',
  json: 'json', jsonc: 'json',
  sql: 'sql',
  yaml: 'yaml', yml: 'yaml',
  sh: 'bash', bash: 'bash', zsh: 'bash',
  c: 'c', h: 'c',
  go: 'go',
  java: 'java',
  kt: 'kotlin', kts: 'kotlin',
  php: 'php',
  rb: 'ruby',
  rs: 'rust',
  swift: 'swift',
  cs: 'csharp', csx: 'csharp',
  cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', hh: 'cpp',
  vb: 'visual-basic', vbs: 'visual-basic',
  bas: 'vba', cls: 'vba', frm: 'vba',
  xls: 'excel-formula', xlsx: 'excel-formula',
};

export const LANG_LABEL: Record<PrismLang, string> = {
  markdown: 'Markdown（文書）',
  markup: 'HTML / XML（ウェブ・SVG）',
  css: 'CSS（スタイル）',
  javascript: 'JavaScript（ウェブ）',
  jsx: 'JSX（React）',
  typescript: 'TypeScript（型付き JS）',
  tsx: 'TSX（型付き React）',
  python: 'Python',
  json: 'JSON（データ）',
  sql: 'SQL（データベース）',
  yaml: 'YAML（設定）',
  bash: 'Bash（シェル）',
  c: 'C 言語',
  go: 'Go',
  java: 'Java',
  kotlin: 'Kotlin',
  php: 'PHP',
  ruby: 'Ruby',
  rust: 'Rust',
  swift: 'Swift',
  csharp: 'C#（CSharp）',
  cpp: 'C++（シープラスプラス）',
  'visual-basic': 'VB（Visual Basic）',
  vba: 'VBA（Excel マクロ）',
  'excel-formula': 'Excel 関数',
};

export const LANG_TO_EXT: Record<PrismLang, string> = {
  markdown: 'md', markup: 'html', css: 'css',
  javascript: 'js', jsx: 'jsx', typescript: 'ts', tsx: 'tsx',
  python: 'py', json: 'json', sql: 'sql', yaml: 'yaml', bash: 'sh',
  c: 'c', go: 'go', java: 'java', kotlin: 'kt',
  php: 'php', ruby: 'rb', rust: 'rs', swift: 'swift',
  csharp: 'cs', cpp: 'cpp', 'visual-basic': 'vb', vba: 'bas', 'excel-formula': 'xlsx',
};

// 2026-05-10 23:30:00 claude-opus-4-7[1m] セッションターン数：36 — 言語短縮ラベル
//   ボス指示: 「MD をコピー」を選択言語名に動的変更。
//   LANG_LABEL は括弧付き（例: 「Markdown（文書）」）→ ボタン用に短縮版を別定義。
export const LANG_SHORT_LABEL: Record<PrismLang, string> = {
  markdown: 'MD',
  markup: 'HTML',
  css: 'CSS',
  javascript: 'JS',
  jsx: 'JSX',
  typescript: 'TS',
  tsx: 'TSX',
  python: 'Python',
  json: 'JSON',
  sql: 'SQL',
  yaml: 'YAML',
  bash: 'Bash',
  c: 'C',
  go: 'Go',
  java: 'Java',
  kotlin: 'Kotlin',
  php: 'PHP',
  ruby: 'Ruby',
  rust: 'Rust',
  swift: 'Swift',
  csharp: 'C#',
  cpp: 'C++',
  'visual-basic': 'VB',
  vba: 'VBA',
  'excel-formula': 'Excel',
};

// 2026-05-10 23:00:00 claude-opus-4-7[1m] セッションターン数：35 — 廃止言語削除 + アルファベット順
//   ボス確定（設計書 Notion + Web 検証 2026-05-10）:
//     ✅ 採用: Ruby / PHP / Java / Go / C / C++ / Swift（実 Runner は Phase 12-13 で順次実装）
//     ❌ 廃止: Kotlin（Beta）/ C#（教育 REPL 困難）/ Rust（experimental）
//   並びは lang フィールドのアルファベット順（一貫性、検索しやすさ）。
export const LANG_PICKER_OPTIONS: { lang: PrismLang; emoji: string; label: string }[] = [
  { lang: 'bash', emoji: '⌨️', label: 'Bash（シェル）' },
  { lang: 'c', emoji: '🔧', label: 'C 言語' },
  { lang: 'cpp', emoji: '🔧', label: 'C++（シープラスプラス）' },
  { lang: 'css', emoji: '🎨', label: 'CSS（スタイル）' },
  { lang: 'excel-formula', emoji: '📈', label: 'Excel 関数' },
  { lang: 'go', emoji: '🐹', label: 'Go' },
  { lang: 'java', emoji: '☕', label: 'Java' },
  { lang: 'javascript', emoji: '⚙️', label: 'JavaScript' },
  { lang: 'json', emoji: '🗂️', label: 'JSON（データ）' },
  { lang: 'jsx', emoji: '⚛️', label: 'JSX（React）' },
  { lang: 'markdown', emoji: '📝', label: 'Markdown（文書）' },
  { lang: 'markup', emoji: '🌐', label: 'HTML（ウェブ）' },
  { lang: 'php', emoji: '🐘', label: 'PHP' },
  { lang: 'python', emoji: '🐍', label: 'Python' },
  { lang: 'ruby', emoji: '💎', label: 'Ruby' },
  { lang: 'sql', emoji: '🗄️', label: 'SQL（DB）' },
  { lang: 'swift', emoji: '🦅', label: 'Swift' },
  { lang: 'tsx', emoji: '⚛️', label: 'TSX（React + TS）' },
  { lang: 'typescript', emoji: '🔷', label: 'TypeScript' },
  { lang: 'vba', emoji: '📊', label: 'VBA（Excel マクロ）' },
  { lang: 'visual-basic', emoji: '💙', label: 'VB（Visual Basic）' },
  { lang: 'yaml', emoji: '📋', label: 'YAML（設定）' },
];

export function detectLanguage(filename: string): PrismLang {
  const m = /\.([a-zA-Z0-9]+)$/.exec(filename || '');
  if (!m) return 'markdown';
  const ext = m[1].toLowerCase();
  return EXT_TO_LANG[ext] ?? 'markdown';
}

export function highlightCode(code: string, lang: PrismLang): string {
  const grammar = Prism.languages[lang] || Prism.languages.markdown;
  return Prism.highlight(code, grammar, lang);
}

export function isLivePreviewable(lang: PrismLang): boolean {
  return lang === 'markup' || lang === 'css' || lang === 'javascript' || lang === 'jsx' || lang === 'tsx' || lang === 'typescript';
}

export function buildPreviewSrcdoc(code: string, lang: PrismLang): string {
  if (lang === 'markup') {
    const trimmed = code.trim();
    if (/^<svg[\s>]/i.test(trimmed)) {
      return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:24px;background:#1e1e2e;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui}svg{max-width:100%;max-height:90vh}</style></head><body>${trimmed}</body></html>`;
    }
    // 2026-05-11 19:00:00 claude-opus-4-7[1m] セッションターン数：23
    // 空の HTML タブはブラウザで empty index.html を開いた時と同じ「真っ白」にする（ボス指示）
    // 2026-05-11 19:30:00 — fix: iframe 要素自体に background:#1e1e2e があるため body 透明だと
    //   ダークが透ける。html/body に明示的に白背景を効かせて iframe ダーク背景を隠す。
    if (trimmed === '') {
      return '<!doctype html><html><head><meta charset="utf-8"><style>html,body{background:#fff;margin:0;height:100%}</style></head><body></body></html>';
    }
    return code;
  }
  if (lang === 'css') {
    const sample = `<!doctype html><html><head><meta charset="utf-8"><style>${code}</style></head><body><h1>見出し1（h1）</h1><h2>見出し2（h2）</h2><p>これは段落です。<a href="#">リンク</a> や <strong>強調</strong>、<em>斜体</em> も含まれます。</p><ul><li>リスト項目 1</li><li>リスト項目 2</li></ul><button>ボタン</button> <input placeholder="入力欄"><div class="card">クラス .card のサンプル要素</div></body></html>`;
    return sample;
  }
  if (lang === 'javascript' || lang === 'typescript' || lang === 'jsx' || lang === 'tsx') {
    // 2026-05-11 17:30:00 claude-opus-4-7[1m] セッションターン数：18
    // TS / JSX / TSX は sucrase で transpile（型注釈 strip + JSX → React.createElement 化）
    let userCode = code;
    let transpileError: string | null = null;
    if (lang !== 'javascript') {
      try {
        const transforms: Array<'typescript' | 'jsx'> = [];
        if (lang === 'typescript' || lang === 'tsx') transforms.push('typescript');
        if (lang === 'jsx' || lang === 'tsx') transforms.push('jsx');
        userCode = sucraseTransform(code, { transforms, production: false }).code;
      } catch (e) {
        transpileError = e instanceof Error ? e.message : String(e);
      }
    }
    const escaped = userCode.replace(/<\/script>/gi, '<\\/script>');
    const needsReact = lang === 'jsx' || lang === 'tsx';
    const reactImportMap = needsReact
      ? `<script type="importmap">{"imports":{"react":"https://esm.sh/react@19","react-dom/client":"https://esm.sh/react-dom@19/client"}}</script>`
      : '';
    const reactBootstrap = needsReact
      ? `<script type="module">import React from 'react';import { createRoot } from 'react-dom/client';window.React = React;window.__renderJSX = (el) => { const root = document.getElementById('__react_root'); if (root && el) createRoot(root).render(el); };<\/script>`
      : '';
    const reactRootDiv = needsReact ? `<div id="__react_root"></div>` : '';
    const errorHeader = transpileError
      ? `<pre class="err" style="white-space:pre-wrap;padding:10px;margin:0 0 10px;background:rgba(243,139,168,0.10);border:1px solid rgba(243,139,168,0.40);border-radius:6px">⚠ transpile error: ${transpileError.replace(/</g, '&lt;')}</pre>`
      : '';
    // 2026-05-11 17:30:00 — userCode のラッパー script は needsReact 時 type="module" にして
    // importmap で解決された React を直接 import できるようにする（既存 window.React 経由でも可）。
    const userScriptType = needsReact ? 'module' : '';
    return `<!doctype html><html><head><meta charset="utf-8">${reactImportMap}<style>html,body{margin:0;padding:16px;background:#1e1e2e;color:#cdd6f4;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.6}#__log{white-space:pre-wrap}.err{color:#f38ba8}#__react_root{margin-bottom:12px;font-family:system-ui,'Hiragino Sans','Noto Sans JP',sans-serif}</style></head><body>${errorHeader}${reactRootDiv}<div id="__log"></div><script>(function(){const out=document.getElementById('__log');const fmt=(v)=>{try{return typeof v==='object'?JSON.stringify(v,null,2):String(v)}catch(e){return String(v)}};const orig={log:console.log,error:console.error,warn:console.warn,info:console.info};console.log=(...a)=>{out.textContent+=a.map(fmt).join(' ')+'\\n';orig.log(...a)};console.error=(...a)=>{const n=document.createElement('div');n.className='err';n.textContent=a.map(fmt).join(' ');out.appendChild(n);orig.error(...a)};console.warn=console.log;console.info=console.log;window.addEventListener('error',e=>{const n=document.createElement('div');n.className='err';n.textContent='⚠ '+e.message;out.appendChild(n)})})();<\/script>${reactBootstrap}<script${userScriptType ? ' type="' + userScriptType + '"' : ''}>${transpileError ? '/* transpile failed — skip user code */' : `try{${escaped}}catch(e){const n=document.createElement('div');n.className='err';n.textContent='⚠ '+(e&&e.message||e);document.getElementById('__log').appendChild(n);}`}<\/script></body></html>`;
  }
  return '';
}

export function parseMd(md: string): string {
  if (!md.trim()) return '';
  let html = marked.parse(md) as string;
  html = html.replace(/<aside>([\s\S]*?)<\/aside>/gi, (_, inner) => {
    const text = inner.trim();
    const m = text.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u);
    const icon = m ? m[0] : '📝';
    const body = m ? text.slice(m[0].length).trim() : text;
    return `<div class="md-callout"><span>${icon}</span><div>${marked.parse(body)}</div></div>`;
  });
  return html;
}
