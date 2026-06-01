// 2026-05-11 claude-opus-4-7[1m] セッションターン数：22
// 中身は @/lib/speech に移動。コース教材ライトボックスとの共通化のため。
// 既存 import 互換のため re-export のみ残す。
//
// 旧 (Phase 18b) コメント保持:
//   Phase 18b: TTS（音声読み上げ）共通ユーティリティ
//   設計書: documents/design/craftica-editor-phase-18b-tts.md

export {
  speak, stopSpeak, isSpeaking, isSpeechSupported,
  pauseSpeak, resumeSpeak, isPaused,
  type SpeakOptions,
} from '@/lib/speech';
