// 2026-05-11 15:00:00 claude-opus-4-7[1m] セッションターン数：13
// Phase 14: Guided Completion — Ctrl+Space で開く補完ピッカーのデータ供給
// 設計書: documents/design/craftica-editor-phase-14-guided-completion.md
//
// lessons.ts の既存辞書を読み込みのみで再利用（学習併用型補完）。
// pure function（副作用なし）。prefix 一致順にソートして上位を返す。
//
// 2026-05-11 17:50:00 claude-opus-4-7[1m] セッションターン数：19
// TS / JSX / TSX フォールバック辞書合流追加（lessons.ts には個別エントリーがなく、
// JS / markup から引いてくる）+ TS 専用キーワードを最小限同梱。
//
// 2026-05-11 19:45:00 claude-opus-4-7[1m] セッションターン数：25
// fix: compound-only キーワード（of / in / as / is 等、単独で意味成立せず
// 挿入すると ReferenceError になる語）を補完から除外。

import { LESSONS, type Lesson } from '../lessons';
import type { PrismLang } from '../core/languageDetection';

// 2026-05-11 19:45:00 — 単独挿入すると JS / TS / JSX / TSX でランタイムエラー（ReferenceError）を
// 起こす compound-only キーワード。教育的価値は cursor on keyword + Alt+H で別途取得可能。
const COMPOUND_ONLY_KEYS = new Set(['of', 'in', 'as', 'is', 'then']);

export type CompletionItem = {
  /** 挿入されるキーワード（lessons.ts のキー） */
  keyword: string;
  /** 表示・学習用 */
  lesson: Lesson;
  /** ソート用スコア（高いほど上位） */
  score: number;
};

const DEFAULT_LIMIT = 30;

// 2026-05-11 17:50:00 — TS 専用キーワード最小セット
//   lessons.ts は javascript / markup 等のキーをカバーするが TS 固有構文は未収録。
//   教育目的で頻出のものだけ補完候補として用意。
const TS_EXTRA: Record<string, Lesson> = {
  interface: { emoji: '📐', short: '「型の設計図」を作る', detail: 'interface でオブジェクトの形（プロパティと型）を定義するよ。class と違って実装はない、型情報だけ。', example: 'interface User { name: string; age: number }' },
  type: { emoji: '🏷️', short: '型の別名・合成', detail: 'type で型に別名をつけたり、複数の型を合成（&）したり、選択肢（|）にしたりできるよ。', example: 'type ID = string | number;' },
  enum: { emoji: '🎰', short: '名前付き定数の集合', detail: 'enum で関連する定数をひとまとめにできる。色の種類とか、状態の種類とかに便利。', example: 'enum Color { Red, Green, Blue }' },
  readonly: { emoji: '🔒', short: '書き換え禁止プロパティ', detail: 'readonly をつけたプロパティは初期化後に書き換えできない。const のオブジェクト版。', example: 'interface P { readonly id: number }' },
  as: { emoji: '🎯', short: '型アサーション', detail: '`as` で値の型を明示的に指定。コンパイラの型推論を上書きする時に使うけど、使いすぎは要注意。', example: 'const x = value as User;' },
  satisfies: { emoji: '✅', short: '型を満たすことを確認', detail: '`satisfies` は値が型を満たすか確認しつつ、値の具体的な型は維持する。`as` より型安全。', example: 'const config = { ... } satisfies Config;' },
  keyof: { emoji: '🔑', short: 'オブジェクト型のキー一覧', detail: '`keyof T` で T 型のプロパティ名（キー）のユニオン型を取り出すよ。', example: 'type Keys = keyof User;' },
  typeof: { emoji: '🔍', short: '値の型を取り出す', detail: 'TS の `typeof` は値から型を取り出す演算子。JS の typeof（実行時）とは別物。', example: 'type T = typeof someObj;' },
  unknown: { emoji: '❓', short: '何が来るか分からない型', detail: '`unknown` は `any` の安全版。型ガードを通さないと使えないので、間違いに気付きやすい。', example: 'function parse(x: unknown) { ... }' },
  never: { emoji: '🚫', short: '絶対に値を返さない型', detail: '`never` は到達しない場所の型。throw だけする関数の戻り値や、ありえない分岐に使う。', example: 'function err(): never { throw new Error() }' },
  void: { emoji: '⏹', short: '戻り値なしの関数の戻り型', detail: '`void` は「何も返さない」を表す。関数定義で戻り値型に明示する時に使うよ。', example: 'function log(): void { console.log("x") }' },
  abstract: { emoji: '🧱', short: '抽象クラス・抽象メソッド', detail: '`abstract` で「サブクラスで必ず実装する」を表す。直接 new はできない。', example: 'abstract class Shape { abstract area(): number }' },
  implements: { emoji: '🔗', short: 'インターフェース実装宣言', detail: 'class が interface を実装することを明示。型チェックが効いて安全。', example: 'class User implements Named { name = "" }' },
  declare: { emoji: '📣', short: '型宣言だけ（実装は別）', detail: '`declare` で「この型・変数は存在する」を宣言。グローバル型定義や型 d.ts でよく使う。', example: 'declare const __DEV__: boolean;' },
  namespace: { emoji: '📦', short: '名前空間でまとめる', detail: '関連する型や関数を 1 つの名前にまとめる。今は module 化が主流だが TS 内部用語で残る。', example: 'namespace App { export const v = 1 }' },
};

/** 言語に応じた辞書を組み立てる（フォールバック合流） */
function buildDictFor(lang: PrismLang): Record<string, Lesson> {
  // 2026-05-11 17:50:00 — TS/JSX/TSX は lessons.ts にエントリ無し → JS / markup から拝借
  let dict: Record<string, Lesson>;
  switch (lang) {
    case 'typescript':
      dict = { ...(LESSONS.javascript ?? {}), ...TS_EXTRA };
      break;
    case 'jsx':
      // JSX は JS + HTML タグ（div / span 等は JSX 要素として頻出）
      dict = { ...(LESSONS.javascript ?? {}), ...(LESSONS.markup ?? {}) };
      break;
    case 'tsx':
      // TSX は TS + JS + HTML タグ
      dict = { ...(LESSONS.javascript ?? {}), ...(LESSONS.markup ?? {}), ...TS_EXTRA };
      break;
    default:
      dict = LESSONS[lang] ?? {};
  }
  // 2026-05-11 19:45:00 — JS 系言語では compound-only キーワード（of/in/as/is/then 等）を除外。
  //   単独挿入すると ReferenceError になり live preview がエラー表示になるため。
  if (lang === 'javascript' || lang === 'typescript' || lang === 'jsx' || lang === 'tsx') {
    const filtered: Record<string, Lesson> = {};
    for (const [k, v] of Object.entries(dict)) {
      if (!COMPOUND_ONLY_KEYS.has(k.toLowerCase())) {
        filtered[k] = v;
      }
    }
    return filtered;
  }
  return dict;
}

/**
 * 言語 + 入力中 prefix から補完候補を生成。
 * - prefix 空: 全候補を「短い順」で先頭 limit 件返す
 * - 大文字小文字区別しない
 * - ソート: 完全一致 > 先頭一致 > 部分一致 > 同スコア内は文字数 ASC（短い = 基本）
 */
export function getCompletions(
  lang: PrismLang,
  prefix: string,
  options: { limit?: number } = {},
): CompletionItem[] {
  const dict = buildDictFor(lang);
  if (Object.keys(dict).length === 0) return [];

  const lowerPrefix = prefix.toLowerCase();
  const items: CompletionItem[] = [];

  for (const [keyword, lesson] of Object.entries(dict)) {
    const lowerKey = keyword.toLowerCase();
    let score: number;
    if (lowerPrefix === '') {
      // 空 prefix: 短い keyword を優先（最大 10 文字までで比較）
      score = 10 - Math.min(keyword.length, 10);
    } else if (lowerKey === lowerPrefix) {
      score = 1000;
    } else if (lowerKey.startsWith(lowerPrefix)) {
      score = 100 - (keyword.length - lowerPrefix.length);
    } else if (lowerKey.includes(lowerPrefix)) {
      score = 50 - (keyword.length - lowerPrefix.length);
    } else {
      continue;
    }
    items.push({ keyword, lesson, score });
  }

  items.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.keyword.length - b.keyword.length;
  });

  return items.slice(0, options.limit ?? DEFAULT_LIMIT);
}
