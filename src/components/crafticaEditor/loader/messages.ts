// 2026-05-11 [opus-4-7] Phase 6: 21 言語ぶんの「かわいい load 中メッセージ」辞書
// アラートや無機質な spinner は使わない（ボス指示 2026-05-10、設計書記載）
import type { PrismLang } from '../core/languageDetection';

export type LoaderAnimation =
  | 'snake' | 'grid' | 'drawer' | 'sparkle' | 'footstep' | 'steam'
  | 'run' | 'sand' | 'bird' | 'bubble' | 'crab';

export interface LoaderMessage {
  emoji: string;
  text: string;
  animation?: LoaderAnimation;
}

interface LoaderSet {
  primary: LoaderMessage;       // pct < 30
  secondary: LoaderMessage[];   // pct >= 30 で順次切替
}

// 2026-05-11 14:00:00 claude-opus-4-7[1m] セッションターン数：10 — 未実装言語の loader 全削除
//   方針確定: 実装済 (python / sql / ruby) 以外は全て 'unknown' tier → loader 不要。
//   将来 Phase 11-13 で復活させる時に loader 辞書をここに復元する。
/** Tier B 以上の実装済言語。Tier A は load 不要なので含めない */
const PARTIAL: Partial<Record<PrismLang, LoaderSet>> = {
  python: {
    primary: { emoji: '🐍', text: 'Python のヘビちゃんが目を覚ましてるよ…', animation: 'snake' },
    secondary: [
      { emoji: '🌱', text: 'モジュールを呼び出してるよ…' },
      { emoji: '✨', text: 'もうちょっと、もうちょっと…', animation: 'sparkle' },
    ],
  },
  sql: {
    primary: { emoji: '🗄️', text: 'データベースを開いてるよ…', animation: 'drawer' },
    secondary: [
      { emoji: '📊', text: 'テーブルを並べてるよ…' },
      { emoji: '✨', text: 'もうちょっと、もうちょっと…', animation: 'sparkle' },
    ],
  },
  ruby: {
    primary: { emoji: '💎', text: 'ルビーを磨いてるよ…', animation: 'sparkle' },
    secondary: [{ emoji: '✨', text: 'もうちょっと、もうちょっと…', animation: 'sparkle' }],
  },
  // Tier A の言語はここに来ない想定だが、フォールバック対策で markdown のみ最低限
  markdown: {
    primary: { emoji: '📝', text: '準備中…' },
    secondary: [{ emoji: '✨', text: 'もうちょっと…', animation: 'sparkle' }],
  },
};

const FALLBACK: LoaderSet = {
  primary: { emoji: '📦', text: 'パッケージを準備中…', animation: 'sparkle' },
  secondary: [{ emoji: '✨', text: 'もうちょっと、もうちょっと…', animation: 'sparkle' }],
};

export function getLoaderMessages(lang: PrismLang): LoaderSet {
  return PARTIAL[lang] ?? FALLBACK;
}

export const COMPLETE_MESSAGE: LoaderMessage = { emoji: '✅', text: 'じゃーん！準備できたよ！' };
// 2026-05-17 13:00:00 claude-opus-4-7[1m] セッションターン数：10 — ⚠️→🔁（member 萎縮回避・再試行を示唆）
export const FAIL_MESSAGE: LoaderMessage = {
  emoji: '🔁',
  text: 'パッケージの準備ができなかったみたい。もう一度試すか、別の言語を選んでね',
};
export const OFFLINE_MESSAGE: LoaderMessage = {
  emoji: '📡',
  text: 'インターネットが切れたみたい。次のパッケージはあとで…',
};
export const SUPPORT_MESSAGE: LoaderMessage = {
  emoji: '🆘',
  text: '何度試してもうまくいかないみたい。サポートに連絡してね',
};

/** pct から表示すべきメッセージを選ぶ（5 秒以上同じメッセージにしないルール） */
export function pickMessageByProgress(set: LoaderSet, pct: number, secIdx: number): LoaderMessage {
  if (pct < 30 || set.secondary.length === 0) return set.primary;
  if (pct >= 70) return set.secondary[set.secondary.length - 1];
  return set.secondary[secIdx % set.secondary.length];
}
