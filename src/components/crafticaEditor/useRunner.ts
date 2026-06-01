// 2026-05-11 [opus-4-7] Phase 6: Runner hook
// Tier A（HTML/CSS/JS/SVG/TS/JSX/TSX/Markdown）は WorkerHost を経由せず iframe srcdoc 維持
// Tier B 以上は Phase 7 で個別 Runner を register、Phase 6 では未実装フラグで返す
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Runner, RunResult, TraceStep } from './runner/types';
import type { PrismLang } from './core/languageDetection';
// 2026-05-11 [opus-4-7] fix: REGISTRY を window singleton 化（Webpack chunk splitting / HMR 対策）
import { registerRunner as _registerRunner, getRunnerFactory } from './runner/registry';

const TIER_A_LANGS: ReadonlyArray<PrismLang> = [
  'markdown', 'markup', 'css', 'javascript', 'jsx', 'typescript', 'tsx',
];

export type RunnerTier = 'A' | 'B' | 'C' | 'D' | 'unknown';

// 2026-05-10 23:00:00 claude-opus-4-7[1m] セッションターン数：35 — 廃止言語を Tier から除外
//   設計書 + Web 検証 2026-05-10 で kotlin / csharp / rust は採用見送り（Phase バックログ）。
//   Tier 未分類 → 'unknown' → 実行ボタン disabled + ホバーチップ「準備中」表示。
// 2026-05-11 12:30:00 claude-opus-4-7[1m] セッションターン数：3 — PHP / Excel 関数 撤回
//   @php-wasm / Univer の不安定さで実用に耐えない判断。プレビュー不可言語に降格して
//   フォールバック「ブラウザで実行できません」表示に統一。
// 2026-05-11 12:50:00 claude-opus-4-7[1m] セッションターン数：6 — Java Phase バックログ送り
//   TeaVM が「コンパイル済み bytecode のみ実行」制約で source REPL 不可。
// 2026-05-11 14:00:00 claude-opus-4-7[1m] セッションターン数：10 — 未実装言語を全て 'unknown' 化
//   Go: yaegi の packaged npm 配布が不存在（自前 Go toolchain build が必要）。Phase バックログ送り。
//   方針確定: 「実装済 (python/sql/ruby) 以外は全て『ブラウザで実行できません』表示」（ボス判断）。
//   シンタックスハイライトは Prism 経由で維持（detectTier と無関係）。
//   将来 Phase 11-13 で復活させる時にこの関数の分類を戻す。
export function detectTier(lang: PrismLang): RunnerTier {
  if (TIER_A_LANGS.includes(lang)) return 'A';
  if (lang === 'python' || lang === 'sql') return 'B';
  if (lang === 'ruby') return 'C';
  return 'unknown';
}

/** Phase 7+ で各言語の Runner Factory を register する */
// 2026-05-11 [opus-4-7] fix: REGISTRY を runner/registry.ts の window singleton に切り出し
//   useRunner.ts に直接 Map を持つと chunk splitting / HMR で複数 instance 化する
export const registerRunner = _registerRunner;

interface RunnerHookValue {
  tier: RunnerTier;
  /** Tier A は常に true（iframe srcdoc 経路、load 不要）、Tier B+ は load 完了後 true */
  ready: boolean;
  loading: boolean;
  loadProgress: { pct: number; msg: string } | null;
  error: string | null;
  /** 結果 state（Tier A は使われない、iframe srcdoc 側で完結） */
  lastResult: RunResult | null;
  /** Tier B+ で実行。Tier A や未実装言語では reject */
  run: (code: string) => Promise<RunResult>;
  abort: () => void;
  // 2026-05-10 23:00:00 claude-opus-4-7[1m] セッションターン数：35 — 実装済み判定
  /**
   * この言語の Runner が実装済みか。
   * - Tier A: 常に true（iframe srcdoc 経路で動作）
   * - Tier B+: registerAll で REGISTRY に登録済みなら true
   * 実行ボタンの disabled 判定 / 「準備中」ホバーチップに使う。
   */
  isImplemented: boolean;
  // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace
  /** trace 対応言語か（Runner が trace メソッドを実装している場合 true） */
  isTraceable: boolean;
  /** 直近の trace 結果 */
  lastTraceSteps: TraceStep[] | null;
  /** Tier B+ で trace 実行。未対応言語では reject */
  trace: (code: string) => Promise<TraceStep[]>;
}

export function useRunner(lang: PrismLang): RunnerHookValue {
  const tier = detectTier(lang);
  const isTierA = tier === 'A';

  const runnerRef = useRef<Runner | null>(null);
  const [ready, setReady] = useState(isTierA);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState<{ pct: number; msg: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RunResult | null>(null);
  // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace state
  const [lastTraceSteps, setLastTraceSteps] = useState<TraceStep[] | null>(null);

  // 言語切替時に古い Runner を destroy
  useEffect(() => {
    setReady(isTierA);
    setLoading(false);
    setError(null);
    setLastResult(null);
    setLastTraceSteps(null);
    setLoadProgress(null);
    if (runnerRef.current) {
      runnerRef.current.destroy();
      runnerRef.current = null;
    }
    return () => {
      if (runnerRef.current) {
        runnerRef.current.destroy();
        runnerRef.current = null;
      }
    };
  }, [lang, isTierA]);

  const ensureLoaded = useCallback(async () => {
    if (isTierA) return null;
    if (runnerRef.current) return runnerRef.current;
    const factory = getRunnerFactory(lang);
    if (!factory) {
      throw new Error(`${lang} の Runner はまだ登録されていません（Phase 7 以降で順次対応予定）`);
    }
    const runner = factory();
    runnerRef.current = runner;
    setLoading(true);
    setError(null);
    try {
      await runner.load((pct, msg) => setLoadProgress({ pct, msg }));
      setReady(true);
      return runner;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      runner.destroy();
      runnerRef.current = null;
      throw e;
    } finally {
      setLoading(false);
    }
  }, [lang, isTierA]);

  const run = useCallback(async (code: string): Promise<RunResult> => {
    if (isTierA) {
      throw new Error('Tier A の言語は iframe srcdoc プレビュー経路で実行されます（▶ ボタン経路は使いません）');
    }
    const runner = await ensureLoaded();
    if (!runner) throw new Error('Runner unavailable');
    setError(null);
    try {
      const result = await runner.run(code);
      setLastResult(result);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    }
  }, [isTierA, ensureLoaded]);

  const abort = useCallback(() => {
    // workerHost.abort() は Runner 個別実装に委譲。Phase 7 で接続
    runnerRef.current?.destroy();
    runnerRef.current = null;
    setReady(isTierA);
    setLoading(false);
  }, [isTierA]);

  // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace 実装
  const trace = useCallback(async (code: string): Promise<TraceStep[]> => {
    if (isTierA) {
      throw new Error('Tier A の言語は trace 対象外');
    }
    const runner = await ensureLoaded();
    if (!runner) throw new Error('Runner unavailable');
    if (!runner.trace) {
      throw new Error('この言語の Runner は trace 未対応');
    }
    setError(null);
    try {
      const steps = await runner.trace(code);
      setLastTraceSteps(steps);
      return steps;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      throw e;
    }
  }, [isTierA, ensureLoaded]);

  // 2026-05-10 23:00:00 claude-opus-4-7[1m] セッションターン数：35 — 実装済み判定
  //   Tier A は iframe srcdoc 経路で常に動作。Tier B+ は REGISTRY に factory が登録されている時のみ。
  const isImplemented = isTierA || getRunnerFactory(lang) != null;
  // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace 可否
  //   Python のみ（Pyodide sys.settrace）。SQL / Ruby は v2 / v3 で対応予定。
  const isTraceable = isImplemented && lang === 'python';

  return {
    tier,
    ready,
    loading,
    loadProgress,
    error,
    lastResult,
    run,
    abort,
    isImplemented,
    isTraceable,
    lastTraceSteps,
    trace,
  };
}
