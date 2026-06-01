// 2026-05-11 [opus-4-7] Phase 7+: Runner 登録の単一窓口
//   Phase 7: Python（Pyodide）
//   Phase 9: SQL（sql.js）
//   Phase 12-Ruby: Ruby（@ruby/wasm-wasi + browser_wasi_shim）
//
// 2026-05-11 fix: 副作用 import (`import './runner/registerAll'`) が Webpack tree-shaking
//   で除去され REGISTRY が空のまま ▶ 実行で「Runner 未登録」エラーになる問題を修正。
//   関数化して明示呼び出しに変える（tree-shake されない）。idempotent なので何度呼んでも OK。
// 2026-05-11 [opus-4-7] fix: registerRunner を window singleton 経由（runner/registry.ts）に切替
// 2026-05-11 12:30:00 claude-opus-4-7[1m] セッションターン数：3 — PHP / Excel 関数 Runner 撤回
//   @php-wasm / Univer の安定動作が確保できず、ボス判断で実装放棄。両言語は detectTier()
//   で 'unknown' に降格させて「ブラウザで実行できません」フォールバック表示に統一。
// 2026-05-11 12:50:00 claude-opus-4-7[1m] セッションターン数：6 — Phase 12-Ruby 追加
//   設計書: documents/design/craftica-editor-phase-12-ruby.md
import { registerRunner } from './registry';
import { PythonRunner } from './pythonRunner';
import { SqlRunner } from './sqlRunner';
import { RubyRunner } from './rubyRunner';

let registered = false;

export function registerAllRunners(): void {
  if (registered) return;
  registerRunner('python', () => new PythonRunner());
  registerRunner('sql', () => new SqlRunner());
  registerRunner('ruby', () => new RubyRunner());
  registered = true;
}
