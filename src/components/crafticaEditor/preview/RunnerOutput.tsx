// 2026-05-11 [opus-4-7] Phase 6: 統一実行結果ペイン
// stdout / stderr 折りたたみ / artifact 種別ごとの簡易レンダ
// 2026-05-11 14:50:00 claude-opus-4-7[1m] セッションターン数：12
// fix: ダーク背景 (#1e1e2e) + Craftica パレットの var(--ink-2/3/4)（ライト前提の暗色）で
//   低コントラスト視認不能だった問題を解消。Catppuccin パレットに揃える:
//   --ink-2 → #cdd6f4（メインテキスト）/ --ink-3 → #a6adc8（subtext0）/ --ink-4 → #a6adc8（overlay1）
// 2026-05-11 14:30:00 claude-opus-4-7[1m] セッションターン数：11
// Phase 10: stderr に Lesson バナー（Mistake → Lesson）統合
//   設計書: documents/design/craftica-editor-phase-10-mistake-to-lesson.md
'use client';

import { useMemo, useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Lightbulb, SkipBack, ChevronLeft, SkipForward, Footprints, Volume2, Square } from 'lucide-react';
import type { RunResult, RunArtifact, TraceStep } from '../runner/types';
import type { PrismLang } from '../core/languageDetection';
import { mistakeToLesson } from '../educator/mistakeToLesson';
// 2026-05-11 18:15:00 claude-opus-4-7[1m] セッションターン数：21 — Phase 18b: TTS
import { speak, stopSpeak, isSpeechSupported } from '../educator/speak';

interface RunnerOutputProps {
  result: RunResult | null;
  loading: boolean;
  error: string | null;
  /** stderr 折りたたみ初期状態。default false（折りたたみ） */
  showStderrInitial?: boolean;
  /** Phase 10: 現在の言語（Lesson バナー言語別 pattern match に必要） */
  lang?: PrismLang;
  // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace 結果
  /** 直近の trace 結果（あれば stdout の上にステッパー表示） */
  traceSteps?: TraceStep[] | null;
}

export default function RunnerOutput({ result, loading, error, showStderrInitial = false, lang, traceSteps }: RunnerOutputProps) {
  const [showStderr, setShowStderr] = useState(showStderrInitial);
  // 2026-05-11 18:15:00 claude-opus-4-7[1m] セッションターン数：21 — Phase 18b: mistake banner の TTS state
  const [mistakeSpeaking, setMistakeSpeaking] = useState(false);
  // mistake が変化（新エラー）したら読み上げ状態をリセット
  useEffect(() => {
    stopSpeak();
    setMistakeSpeaking(false);
  }, [lang, result]);
  // 2026-05-11 14:30:00 claude-opus-4-7[1m] — Phase 10: stderr → Lesson 変換（memo 化、stderr 変化時のみ再計算）
  const mistake = useMemo(() => {
    if (!result || result.ok || !result.stderr || !lang) return null;
    return mistakeToLesson(lang, result.stderr);
  }, [result, lang]);

  // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace 結果あれば優先表示
  const hasTrace = !!traceSteps && traceSteps.length > 0;

  if (loading && !result && !hasTrace) {
    return (
      <div style={containerStyle}>
        <div style={{ ...rowStyle, color: '#a6adc8' }}>
          <span>実行中…</span>
        </div>
      </div>
    );
  }

  if (error && !result && !hasTrace) {
    return (
      <div style={containerStyle}>
        <div style={{ ...rowStyle, color: '#f38ba8' }}>
          <AlertTriangle size={16} />
          <span style={{ whiteSpace: 'pre-wrap' }}>{error}</span>
        </div>
      </div>
    );
  }

  if (!result && !hasTrace) {
    return (
      <div style={{ ...containerStyle, color: '#a6adc8', fontSize: 13 }}>
        <span>▶ 実行 (Ctrl/Cmd + Enter) または 🐾 トレース (Ctrl/Cmd + Shift + Enter)</span>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace ステッパー（result 有無に関係なく表示可） */}
      {hasTrace && <TraceStepper steps={traceSteps!} />}
      {result && (<>
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontSize: 13,
          color: '#a6adc8',
        }}
      >
        <span>⏱ {result.durationMs}ms</span>
        {result.ok ? (
          <span style={{ color: '#a6e3a1', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={14} /> 成功
          </span>
        ) : (
          <span style={{ color: '#f38ba8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <AlertTriangle size={14} /> 失敗
          </span>
        )}
      </div>

      {/* 2026-05-11 14:30:00 claude-opus-4-7[1m] — Phase 10: Lesson バナー（hardcoded pattern match で stderr 解析） */}
      {mistake && (
        <div
          style={{
            margin: '8px 12px',
            padding: '10px 12px',
            borderRadius: 8,
            background: 'rgba(137, 180, 250, 0.10)',  // Catppuccin sapphire/blue 10%
            border: '1px solid rgba(137, 180, 250, 0.35)',
            color: '#cdd6f4',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Lightbulb size={14} color="#89dceb" />
            <strong style={{ color: '#89dceb' }}>気づきポイント</strong>
            <span style={{ color: '#a6adc8', fontSize: 13 }}>({mistake.type})</span>
            {/* 2026-05-11 18:15:00 claude-opus-4-7[1m] セッションターン数：21 — Phase 18b: TTS ボタン */}
            {isSpeechSupported() && (
              <button
                type="button"
                onClick={() => {
                  if (mistakeSpeaking) {
                    stopSpeak();
                    setMistakeSpeaking(false);
                  } else {
                    const txt = `${mistake.lesson.short}。${mistake.lesson.detail ?? ''}`;
                    setMistakeSpeaking(true);
                    speak(txt, {
                      onEnd: () => setMistakeSpeaking(false),
                      onError: () => setMistakeSpeaking(false),
                    });
                  }
                }}
                aria-label={mistakeSpeaking ? '読み上げを止める' : '読み上げる'}
                title={mistakeSpeaking ? '読み上げを止める' : '読み上げる'}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: '1px solid rgba(137, 180, 250, 0.30)',
                  color: '#89dceb',
                  borderRadius: 6,
                  width: 26,
                  height: 26,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {mistakeSpeaking ? <Square size={12} /> : <Volume2 size={12} />}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: mistake.lesson.detail || mistake.lesson.example ? 6 : 0 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }} aria-hidden="true">{mistake.lesson.emoji}</span>
            <span style={{ flex: 1 }}>{mistake.lesson.short}</span>
          </div>
          {mistake.lesson.detail && (
            <div style={{ color: '#a6adc8', marginTop: 2 }}>{mistake.lesson.detail}</div>
          )}
          {mistake.lesson.example && (
            <pre
              style={{
                marginTop: 6,
                padding: '6px 8px',
                background: 'rgba(0,0,0,0.25)',
                borderRadius: 4,
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {mistake.lesson.example}
            </pre>
          )}
        </div>
      )}

      {/* stdout */}
      {result.stdout && (
        <pre style={preStyle} aria-label="標準出力">
          {result.stdout}
        </pre>
      )}

      {/* stderr 折りたたみ */}
      {result.stderr && (
        <div>
          <button
            type="button"
            onClick={() => setShowStderr((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: 'transparent',
              border: 'none',
              color: '#f38ba8',
              fontSize: 13,
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
            aria-expanded={showStderr}
          >
            {showStderr ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            stderr ({result.stderr.split('\n').length} 行)
          </button>
          {showStderr && (
            <pre style={{ ...preStyle, color: '#f38ba8' }} aria-label="標準エラー出力">
              {result.stderr}
            </pre>
          )}
        </div>
      )}

      {/* artifacts */}
      {result.artifacts && result.artifacts.length > 0 && (
        <div style={{ padding: '8px 12px' }}>
          {result.artifacts.map((a, i) => (
            <ArtifactRenderer key={i} artifact={a} />
          ))}
        </div>
      )}

      {/* 完全に空（stdout も stderr も artifact も無い） */}
      {!result.stdout && !result.stderr && (!result.artifacts || result.artifacts.length === 0) && (
        <div style={{ padding: '12px', fontSize: 13, color: '#a6adc8' }}>
          （出力なし）
        </div>
      )}
      </>)}
    </div>
  );
}

// 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: Trace Stepper
function TraceStepper({ steps }: { steps: TraceStep[] }) {
  const [idx, setIdx] = useState(0);
  // ステップ数変化（新トレース実行）時にインデックスを 0 リセット
  useEffect(() => { setIdx(0); }, [steps]);
  if (steps.length === 0) {
    return (
      <div style={{ padding: '12px', fontSize: 13, color: '#a6adc8' }}>
        🐾 トレース対象なし（実行行がなかったよ）
      </div>
    );
  }
  const step = steps[Math.min(idx, steps.length - 1)];
  const varEntries = Object.entries(step.vars);
  const capped = steps.length >= 1000;
  return (
    <div
      style={{
        margin: '8px 12px',
        padding: '10px 12px',
        borderRadius: 8,
        background: 'rgba(166, 227, 161, 0.08)',
        border: '1px solid rgba(166, 227, 161, 0.30)',
        color: '#cdd6f4',
        fontSize: 13,
        lineHeight: 1.6,
      }}
      aria-label="トレースステップビューア"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Footprints size={14} color="#a6e3a1" />
        <strong style={{ color: '#a6e3a1' }}>トレース実行</strong>
        <span style={{ color: '#a6adc8', fontSize: 13 }}>
          {steps.length} ステップ{capped ? '（1000 で打ち切り）' : ''}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <button
          type="button"
          onClick={() => setIdx(0)}
          disabled={idx === 0}
          aria-label="先頭へ"
          style={traceBtnStyle(idx === 0)}
        >
          <SkipBack size={14} />
        </button>
        <button
          type="button"
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          aria-label="1 ステップ戻る"
          style={traceBtnStyle(idx === 0)}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ minWidth: 80, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace" }}>
          {idx + 1} / {steps.length}
        </span>
        <button
          type="button"
          onClick={() => setIdx(i => Math.min(steps.length - 1, i + 1))}
          disabled={idx === steps.length - 1}
          aria-label="1 ステップ進む"
          style={traceBtnStyle(idx === steps.length - 1)}
        >
          <ChevronRight size={14} />
        </button>
        <button
          type="button"
          onClick={() => setIdx(steps.length - 1)}
          disabled={idx === steps.length - 1}
          aria-label="末尾へ"
          style={traceBtnStyle(idx === steps.length - 1)}
        >
          <SkipForward size={14} />
        </button>
        <span style={{ marginLeft: 'auto', color: '#a6adc8' }}>行 {step.line}</span>
      </div>
      <div>
        {varEntries.length === 0 ? (
          <div style={{ color: '#a6adc8', fontStyle: 'italic' }}>（このステップでは変数なし）</div>
        ) : (
          <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: "'JetBrains Mono', monospace" }}>
            <tbody>
              {varEntries.map(([k, v]) => (
                <tr key={k}>
                  <td style={{ padding: '2px 8px 2px 0', color: '#89b4fa', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{k}</td>
                  <td style={{ padding: '2px 8px 2px 0', color: '#a6adc8', verticalAlign: 'top' }}>=</td>
                  <td style={{ padding: '2px 0', color: '#cdd6f4', wordBreak: 'break-all' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function traceBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(166, 227, 161, 0.15)',
    border: '1px solid ' + (disabled ? 'rgba(255,255,255,0.08)' : 'rgba(166, 227, 161, 0.35)'),
    color: disabled ? '#45475a' : '#a6e3a1',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.12s',
  };
}

function ArtifactRenderer({ artifact }: { artifact: RunArtifact }) {
  if (artifact.kind === 'image') {
    return <ImageArtifact artifact={artifact} />;
  }
  if (artifact.kind === 'table') {
    return <TableArtifact columns={artifact.columns} rows={artifact.rows} />;
  }
  // sheet / plot は Phase 7+ で個別実装
  return (
    <div style={{ fontSize: 13, color: '#a6adc8', padding: '6px 0' }}>
      [{artifact.kind} artifact — Phase 7+ で表示]
    </div>
  );
}

function ImageArtifact({ artifact }: { artifact: Extract<RunArtifact, { kind: 'image' }> }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (typeof artifact.data === 'string') {
      setUrl(artifact.data);
      return;
    }
    const objUrl = URL.createObjectURL(artifact.data);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [artifact.data]);
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="実行結果の画像"
      style={{ maxWidth: '100%', borderRadius: 8, marginTop: 4 }}
    />
  );
}

function TableArtifact({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 4 }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 13, color: '#cdd6f4' }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                style={{
                  textAlign: 'left',
                  padding: '4px 8px',
                  borderBottom: '1px solid rgba(255,255,255,0.15)',
                  fontWeight: 600,
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 200).map((row, i) => (
            <tr key={i}>
              {row.map((v, j) => (
                <td key={j} style={{ padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 200 && (
        <div style={{ fontSize: 13, color: '#a6adc8', padding: '6px 0' }}>
          （{rows.length} 行中 200 行のみ表示）
        </div>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  background: '#1e1e2e',
  borderRadius: 8,
  color: '#cdd6f4',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  overflow: 'auto',
  height: '100%',
};

const preStyle: React.CSSProperties = {
  padding: '8px 12px',
  margin: 0,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  lineHeight: 1.6,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '12px',
  fontSize: 13,
};
