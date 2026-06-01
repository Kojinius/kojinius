// 2026-05-11 [opus-4-7] Phase 6: load 中のかわいいメッセージ表示コンポーネント
// 5 秒以上同じメッセージを表示しない / prefers-reduced-motion でアニメ無効
'use client';

import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2, WifiOff } from 'lucide-react';
import type { PrismLang } from '../core/languageDetection';
import {
  getLoaderMessages,
  pickMessageByProgress,
  COMPLETE_MESSAGE,
  FAIL_MESSAGE,
  OFFLINE_MESSAGE,
  SUPPORT_MESSAGE,
} from './messages';

export type LoaderState = 'loading' | 'complete' | 'failed' | 'offline';

interface LoaderMessagesProps {
  lang: PrismLang;
  state: LoaderState;
  /** 0-100 */
  pct: number;
  /** 失敗回数。3 回以上で「サポートに連絡してね」へエスカレーション */
  failCount?: number;
  onRetry?: () => void;
  /** Props 経由で reduced-motion 強制（CrafticaEditorProps.reducedMotion に連動） */
  reducedMotion?: boolean;
}

function useReducedMotion(force?: boolean): boolean {
  const [reduce, setReduce] = useState(force ?? false);
  useEffect(() => {
    if (force) {
      setReduce(true);
      return;
    }
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduce(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [force]);
  return reduce;
}

export default function LoaderMessages({
  lang,
  state,
  pct,
  failCount = 0,
  onRetry,
  reducedMotion,
}: LoaderMessagesProps) {
  const reduce = useReducedMotion(reducedMotion);
  const set = getLoaderMessages(lang);

  // 5 秒ごとに secondary index をローテート
  const [secIdx, setSecIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state !== 'loading') return;
    timerRef.current = setInterval(() => setSecIdx((i) => i + 1), 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  const message =
    state === 'complete' ? COMPLETE_MESSAGE
    : state === 'offline' ? OFFLINE_MESSAGE
    : state === 'failed' ? (failCount >= 3 ? SUPPORT_MESSAGE : FAIL_MESSAGE)
    : pickMessageByProgress(set, pct, secIdx);

  const wrapStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 28,
    background: 'rgba(30, 30, 46, 0.85)',
    borderRadius: 16,
    color: '#cdd6f4',
    minWidth: 280,
    fontSize: 14,
    lineHeight: 1.6,
    textAlign: 'center',
  };

  return (
    <div style={wrapStyle} role="status" aria-live="polite">
      <div
        style={{
          fontSize: 48,
          lineHeight: 1,
          ...(reduce ? {} : { animation: state === 'loading' ? 'craftica-loader-bob 2s ease-in-out infinite' : 'none' }),
        }}
        aria-hidden
      >
        {message.emoji}
      </div>
      <div>{message.text}</div>

      {state === 'loading' && (
        <div
          style={{
            width: 200,
            height: 6,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
          aria-label="読み込み進捗"
        >
          <div
            style={{
              width: `${Math.max(0, Math.min(100, pct))}%`,
              height: '100%',
              background: '#a6e3a1',
              transition: reduce ? 'none' : 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {state === 'complete' && (
        <CheckCircle2 size={20} style={{ color: '#a6e3a1' }} aria-hidden />
      )}

      {state === 'offline' && (
        <WifiOff size={20} style={{ color: '#f9e2af' }} aria-hidden />
      )}

      {state === 'failed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <AlertTriangle size={20} style={{ color: '#f38ba8' }} aria-hidden />
          {onRetry && failCount < 3 && (
            <button
              type="button"
              onClick={onRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                background: '#a6e3a1',
                color: '#1e1e2e',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={14} />
              もう一度試す
            </button>
          )}
        </div>
      )}

      {/* keyframes（reduce 時は無視される） */}
      <style>{`
        @keyframes craftica-loader-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
