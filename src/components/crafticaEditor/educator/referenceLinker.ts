// 2026-05-11 16:00:00 claude-opus-4-7[1m] セッションターン数：15
// Phase 15: Reference Linker — Lesson detail popup から公式 doc に飛ぶリンクを生成
// 設計書: documents/design/craftica-editor-phase-15-reference-linker.md
//
// 方針: pure function。維持コスト削減のため大半は検索 URL で統一。
// HTML タグ / CSS プロパティのみ MDN 直 URL を curated（URL 構造が安定で、最頻出のため）。

import type { PrismLang } from '../core/languageDetection';

export type ReferenceLinkKind =
  | 'mdn'
  | 'python-docs'
  | 'ruby-docs'
  | 'sqlite-docs'
  | 'commonmark';

export type ReferenceLink = {
  /** 表示ラベル */
  label: string;
  /** 開く URL */
  url: string;
  /** カテゴリ */
  kind: ReferenceLinkKind;
};

// ── HTML タグ → MDN 直 URL（curated、URL 構造の例外を吸収） ─────────────────
//   見出しタグ群はまとめて Heading_Elements、その他はキーワードそのまま
const HTML_TAG_MAP: Record<string, string> = {
  h1: 'Heading_Elements',
  h2: 'Heading_Elements',
  h3: 'Heading_Elements',
  h4: 'Heading_Elements',
  h5: 'Heading_Elements',
  h6: 'Heading_Elements',
};

// ── HTML タグらしいキーワード判定（小文字 + 1-15 文字 + ASCII） ─────────────
function isHtmlTag(keyword: string): boolean {
  return /^[a-z][a-z0-9]{0,14}$/.test(keyword);
}

function htmlReference(keyword: string): ReferenceLink {
  const seg = HTML_TAG_MAP[keyword] ?? keyword;
  if (isHtmlTag(keyword)) {
    return {
      label: 'MDN で詳しく見る',
      url: `https://developer.mozilla.org/ja/docs/Web/HTML/Element/${encodeURIComponent(seg)}`,
      kind: 'mdn',
    };
  }
  return {
    label: 'MDN で検索',
    url: `https://developer.mozilla.org/ja/search?q=${encodeURIComponent(keyword)}`,
    kind: 'mdn',
  };
}

// ── CSS プロパティ / at-rule ───────────────────────────────────────────────
const CSS_AT_RULES = new Set([
  '@media', '@keyframes', '@import', '@font-face', '@supports', '@charset',
  '@namespace', '@page', '@property', '@layer', '@container',
]);

function cssReference(keyword: string): ReferenceLink {
  if (CSS_AT_RULES.has(keyword)) {
    return {
      label: 'MDN で詳しく見る',
      url: `https://developer.mozilla.org/ja/docs/Web/CSS/${encodeURIComponent(keyword)}`,
      kind: 'mdn',
    };
  }
  // 一般的な CSS プロパティ（color / font-size / display 等）は URL 直結
  if (/^[a-z-]+$/.test(keyword)) {
    return {
      label: 'MDN で詳しく見る',
      url: `https://developer.mozilla.org/ja/docs/Web/CSS/${encodeURIComponent(keyword)}`,
      kind: 'mdn',
    };
  }
  return {
    label: 'MDN で検索',
    url: `https://developer.mozilla.org/ja/search?q=${encodeURIComponent(keyword)}`,
    kind: 'mdn',
  };
}

// ── JS / TS / JSX / TSX ────────────────────────────────────────────────────
//   個別 URL マッピングは膨大なため検索で統一
function jsReference(keyword: string): ReferenceLink {
  return {
    label: 'MDN で詳しく見る',
    url: `https://developer.mozilla.org/ja/search?q=${encodeURIComponent(`JavaScript ${keyword}`)}`,
    kind: 'mdn',
  };
}

// ── Markdown → CommonMark help（keyword 別 URL なし） ─────────────────────
function markdownReference(): ReferenceLink {
  return {
    label: 'Markdown 構文を見る',
    url: 'https://commonmark.org/help/',
    kind: 'commonmark',
  };
}

// ── Python → 公式 doc 検索 ─────────────────────────────────────────────────
function pythonReference(keyword: string): ReferenceLink {
  return {
    label: 'Python 公式で詳しく',
    url: `https://docs.python.org/ja/3/search.html?q=${encodeURIComponent(keyword)}`,
    kind: 'python-docs',
  };
}

// ── Ruby → 公式 doc 検索（site: 指定で精度向上） ──────────────────────────
function rubyReference(keyword: string): ReferenceLink {
  return {
    label: 'Ruby 公式で詳しく',
    url: `https://www.google.com/search?q=${encodeURIComponent(`Ruby ${keyword} site:docs.ruby-lang.org`)}`,
    kind: 'ruby-docs',
  };
}

// ── SQL → SQLite 公式 ──────────────────────────────────────────────────────
//   SQL キーワードは大文字なので URL 用に小文字化
function sqlReference(keyword: string): ReferenceLink {
  const lower = keyword.toLowerCase();
  // SQLite docs の主要構文ページ（SELECT / INSERT / UPDATE / DELETE / CREATE 等）
  const SQL_SPECIFIC = new Set([
    'select', 'insert', 'update', 'delete', 'create', 'drop', 'alter',
    'createtable', 'createindex', 'createview', 'createtrigger',
    'with', 'aggfunc', 'corefunc', 'datefunc', 'mathfunc',
  ]);
  if (SQL_SPECIFIC.has(lower)) {
    return {
      label: 'SQLite 公式で詳しく',
      url: `https://www.sqlite.org/lang_${encodeURIComponent(lower)}.html`,
      kind: 'sqlite-docs',
    };
  }
  return {
    label: 'SQLite 公式',
    url: 'https://www.sqlite.org/lang.html',
    kind: 'sqlite-docs',
  };
}

/**
 * 言語 + keyword から公式 doc リンクを返す。
 * 対象外言語 / 空 keyword では null。
 */
export function getReferenceLink(lang: PrismLang, keyword: string): ReferenceLink | null {
  if (!keyword || !keyword.trim()) return null;

  switch (lang) {
    case 'markup':
      return htmlReference(keyword.toLowerCase());
    case 'css':
      return cssReference(keyword.toLowerCase());
    case 'javascript':
    case 'typescript':
    case 'jsx':
    case 'tsx':
      return jsReference(keyword);
    case 'markdown':
      return markdownReference();
    case 'python':
      return pythonReference(keyword);
    case 'ruby':
      return rubyReference(keyword);
    case 'sql':
      return sqlReference(keyword);
    default:
      return null;
  }
}
