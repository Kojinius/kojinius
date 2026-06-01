// 2026-05-11 [opus-4-7] Phase 6: 共有型を抽出
import type { PrismLang } from './core/languageDetection';

export interface Tab {
  id: number;
  name: string;
  content: string;
  saved: boolean;
  fileHandle: FileSystemFileHandle | null;
  scrollTop: number;
}

// 2026-06-01 claude-opus-4-8[1m] セッションターン数：3 — kojinius 移植: 'translate'（日→英翻訳ペイン）追加
export type ViewMode = 'split' | 'editor' | 'preview' | 'translate';

export interface CrafticaEditorProps {
  learner?: {
    uid: string;
    role: 'admin' | 'manager' | 'member';
    level: 'beginner' | 'intermediate' | 'advanced';
  };
  course?: {
    bankId: string;
    courseId: string;
    title: string;
    type: string;
  };
  onMistake?: (lesson: { code: string; type: string; explanation: string }) => void;
  onMastery?: (symbol: string) => void;
  reducedMotion?: boolean;
  preferredLanguage?: PrismLang;
}

export type EmojiEntry = { e: string; k: string };
