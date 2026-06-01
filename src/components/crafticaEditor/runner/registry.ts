// 2026-05-11 [opus-4-7] Phase 6 fix: Runner REGISTRY を window singleton 化
//   useRunner.ts に REGISTRY を直接持つと、Webpack chunk splitting / HMR / 'use client' boundary
//   で module が複数評価された場合に Map が複数 instance 化し、register 側と get 側で異なる Map を
//   見るバグが発生する（PR #264 関数化だけでは解決しなかった）。
//   window object に singleton として保持することで、何度評価されても 1 つの Map に集約される。
import type { Runner } from './types';
import type { PrismLang } from '../core/languageDetection';

export type RunnerFactory = () => Runner;

declare global {
  interface Window {
    __crafticaRunnerRegistry?: Map<PrismLang, RunnerFactory>;
  }
}

function getRegistry(): Map<PrismLang, RunnerFactory> {
  if (typeof window === 'undefined') {
    // server-side では空 Map（client only 想定だが、SSR 評価 fallback）
    return new Map();
  }
  if (!window.__crafticaRunnerRegistry) {
    window.__crafticaRunnerRegistry = new Map();
  }
  return window.__crafticaRunnerRegistry;
}

export function registerRunner(lang: PrismLang, factory: RunnerFactory): void {
  const r = getRegistry();
  r.set(lang, factory);
  if (typeof window !== 'undefined') {
    // 診断ログ（preview / dev で identity check 可能）
    console.debug('[CrafticaEditor] registerRunner', lang, 'registry size:', r.size);
  }
}

export function getRunnerFactory(lang: PrismLang): RunnerFactory | undefined {
  const r = getRegistry();
  if (typeof window !== 'undefined') {
    console.debug('[CrafticaEditor] getRunnerFactory', lang, 'registry size:', r.size, 'has:', r.has(lang));
  }
  return r.get(lang);
}
