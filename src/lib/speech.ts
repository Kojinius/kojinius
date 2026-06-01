// 2026-05-11 claude-opus-4-7[1m] セッションターン数：22
// TTS（音声読み上げ）共通ユーティリティ
// 設計書: documents/design/course-teaching-material.md §5 + documents/design/craftica-editor-phase-18b-tts.md
//
// 方針: Web Speech API（ブラウザ標準）使用、外部 API 不要・ネット接続不要・完全無料。
//       OS の TTS エンジン（Windows ナレーター / macOS Say / iOS Siri 等）を利用。
//
// 元: src/components/crafticaEditor/educator/speak.ts (Phase 18b)
//     コース教材ライトボックス (Phase D) でも流用するため src/lib に共通化。
//     旧パスは re-export のみ残し、既存 import 互換。

export interface SpeakOptions {
  /** 言語コード（default 'ja-JP'） */
  lang?: string;
  /** 読み上げ速度（0.1〜10、default 1.0） */
  rate?: number;
  /** 音程（0〜2、default 1.0） */
  pitch?: number;
  /** 音量（0〜1、default 1.0） */
  volume?: number;
  /** 読み上げ完了時コールバック */
  onEnd?: () => void;
  /** エラー時コールバック */
  onError?: () => void;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * テキストを音声で読み上げる。既に読み上げ中の場合は中断してから新規再生。
 * 非対応ブラウザでは no-op。
 *
 * 2026-05-11 claude-opus-4-7[1m] セッションターン数：23 — code review #338 対応
 * Chrome の cancel() → speak() 同期実行で稀に synthesizer が黙る既知問題を
 * 回避するため、cancel() 直後に setTimeout(0) を挟む。
 */
export function speak(text: string, options: SpeakOptions = {}): void {
  if (!isSpeechSupported()) return;
  if (!text || !text.trim()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = options.lang ?? 'ja-JP';
  u.rate = options.rate ?? 1.0;
  u.pitch = options.pitch ?? 1.0;
  u.volume = options.volume ?? 1.0;
  u.onend = () => { options.onEnd?.(); };
  u.onerror = () => { options.onError?.(); };
  // Chrome の同期 cancel→speak バグ回避
  setTimeout(() => {
    window.speechSynthesis.speak(u);
  }, 0);
}

/** 現在の読み上げを中断 */
export function stopSpeak(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

/** 読み上げ中か */
export function isSpeaking(): boolean {
  return isSpeechSupported() && window.speechSynthesis.speaking;
}

// 2026-05-11 claude-opus-4-7[1m] セッションターン数：24 — Phase E pause/resume
/** 現在の読み上げを一時停止（再開可） */
export function pauseSpeak(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.pause();
}

/** 一時停止中の読み上げを再開 */
export function resumeSpeak(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.resume();
}

/** 一時停止中か */
export function isPaused(): boolean {
  return isSpeechSupported() && window.speechSynthesis.paused;
}
