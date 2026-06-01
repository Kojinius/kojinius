// 2026-05-11 [opus-4-7] Phase 6: Runner Framework 共通 I/F 型定義
// 設計書: documents/design/craftica-editor-phase-6.md §「Runner I/F 型定義」
import type { PrismLang } from '../core/languageDetection';

export interface Runner {
  readonly lang: PrismLang;
  load(onProgress?: LoadProgressCallback): Promise<void>;
  run(code: string, ctx?: RunContext): Promise<RunResult>;
  lint?(code: string): Promise<LintIssue[]>;
  complete?(code: string, pos: number): Promise<Completion[]>;
  trace?(code: string): Promise<TraceStep[]>;
  destroy(): void;
}

export type LoadProgressCallback = (pct: number, msg: string) => void;

export interface RunContext {
  stdin?: string;
  args?: string[];
  /** Phase 7 以降の言語固有 option（例: Python の packages, SQL の dialect） */
  options?: Record<string, unknown>;
}

export interface RunResult {
  ok: boolean;
  stdout: string;
  stderr: string;
  artifacts?: RunArtifact[];
  durationMs: number;
}

export type RunArtifact =
  | { kind: 'image'; mime: string; data: Blob | string }
  | { kind: 'table'; columns: string[]; rows: unknown[][] }
  | { kind: 'sheet'; data: unknown }
  | { kind: 'plot'; data: unknown };

export interface LintIssue {
  line: number;
  col: number;
  severity: 'info' | 'warn' | 'error';
  message: string;
  /** Phase 10 で lessons.ts に紐付けて popup 化 */
  lessonKey?: string;
}

export interface Completion {
  label: string;
  detail?: string;
  insertText?: string;
}

export interface TraceStep {
  line: number;
  vars: Record<string, string>;
}

/** Worker ↔ main スレッドの postMessage protocol */
// 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace 拡張
export type WorkerInbound =
  | { type: 'load'; tier: 'A' | 'B' | 'C' | 'D' }
  | { type: 'run'; code: string; ctx?: RunContext; runId: string }
  | { type: 'lint'; code: string; runId: string }
  | { type: 'trace'; code: string; runId: string }
  | { type: 'abort'; runId: string };

export type WorkerOutbound =
  | { type: 'progress'; pct: number; msg: string }
  | { type: 'ready' }
  | { type: 'result'; runId: string; result: RunResult }
  | { type: 'lintResult'; runId: string; issues: LintIssue[] }
  | { type: 'traceResult'; runId: string; steps: TraceStep[] }
  | { type: 'error'; runId?: string; message: string; recoverable: boolean };
