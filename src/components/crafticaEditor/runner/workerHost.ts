// 2026-05-11 [opus-4-7] Phase 6: Web Worker host（spawn / 5s timeout / postMessage）
// Phase 7 以降の Pyodide / Univer / sql.js Runner はすべて WorkerHost を経由する
// 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace 拡張
import type {
  RunContext,
  RunResult,
  LintIssue,
  TraceStep,
  LoadProgressCallback,
  WorkerInbound,
  WorkerOutbound,
} from './types';

const DEFAULT_TIMEOUT_MS = 5000;

// 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: pending 型を拡張
type PendingValue = RunResult | LintIssue[] | TraceStep[];

interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout> | null;
}

export interface WorkerHostOptions {
  /** run / lint の単発タイムアウト（ms）。default 5000 */
  timeoutMs?: number;
  /** load 用のタイムアウト（ms）。default 60000 */
  loadTimeoutMs?: number;
  /** Tier 識別（cache 戦略に渡される、optional） */
  tier?: 'A' | 'B' | 'C' | 'D';
}

export class WorkerHost {
  private worker: Worker | null = null;
  private loadPromise: Promise<void> | null = null;
  private pending = new Map<string, PendingRequest<PendingValue>>();
  private destroyed = false;
  private runIdCounter = 0;

  // 2026-06-01 claude-opus-4-8[1m] セッションターン数：4 — kojinius 移植: erasableSyntaxOnly 対応で
  //   コンストラクタ引数プロパティ（private readonly 省略記法）を明示フィールドに展開。
  private readonly workerUrl: URL;
  private readonly opts: WorkerHostOptions;

  constructor(workerUrl: URL, opts: WorkerHostOptions = {}) {
    this.workerUrl = workerUrl;
    this.opts = opts;
  }

  load(onProgress?: LoadProgressCallback): Promise<void> {
    if (this.destroyed) return Promise.reject(new Error('WorkerHost destroyed'));
    if (this.loadPromise) return this.loadPromise;

    const loadTimeoutMs = this.opts.loadTimeoutMs ?? 60_000;
    this.loadPromise = new Promise((resolve, reject) => {
      const worker = this.ensureWorker();
      let progressHandler: ((e: MessageEvent<WorkerOutbound>) => void) | null = null;
      const timer = setTimeout(() => {
        if (progressHandler) worker.removeEventListener('message', progressHandler);
        reject(new Error(`Runner load timeout (${loadTimeoutMs}ms)`));
      }, loadTimeoutMs);

      progressHandler = (e: MessageEvent<WorkerOutbound>) => {
        const msg = e.data;
        if (msg.type === 'progress') {
          onProgress?.(msg.pct, msg.msg);
        } else if (msg.type === 'ready') {
          clearTimeout(timer);
          if (progressHandler) worker.removeEventListener('message', progressHandler);
          resolve();
        } else if (msg.type === 'error' && !msg.runId) {
          clearTimeout(timer);
          if (progressHandler) worker.removeEventListener('message', progressHandler);
          reject(new Error(msg.message));
        }
      };
      worker.addEventListener('message', progressHandler);

      const tier = this.opts.tier ?? 'B';
      this.postToWorker({ type: 'load', tier });
    });

    return this.loadPromise.catch((err) => {
      this.loadPromise = null;
      throw err;
    });
  }

  run(code: string, ctx?: RunContext): Promise<RunResult> {
    return this.postRequest<RunResult>('run', { code, ctx });
  }

  lint(code: string): Promise<LintIssue[]> {
    return this.postRequest<LintIssue[]>('lint', { code });
  }

  // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace 実装
  trace(code: string): Promise<TraceStep[]> {
    return this.postRequest<TraceStep[]>('trace', { code });
  }

  abort(runId?: string): void {
    if (!this.worker) return;
    if (runId) {
      this.postToWorker({ type: 'abort', runId });
      this.rejectPending(runId, new Error('aborted'));
    } else {
      // すべて abort
      for (const id of Array.from(this.pending.keys())) {
        this.postToWorker({ type: 'abort', runId: id });
        this.rejectPending(id, new Error('aborted'));
      }
    }
  }

  destroy(): void {
    this.destroyed = true;
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    for (const id of Array.from(this.pending.keys())) {
      this.rejectPending(id, new Error('destroyed'));
    }
    this.loadPromise = null;
  }

  private ensureWorker(): Worker {
    if (this.destroyed) throw new Error('WorkerHost destroyed');
    if (this.worker) return this.worker;
    const w = new Worker(this.workerUrl, { type: 'module' });
    w.addEventListener('message', this.handleMessage);
    // 2026-05-10 22:10:00 claude-opus-4-7[1m] セッションターン数：42 — error event 詳細展開
    //   Module worker の load 失敗時は ErrorEvent でなく素 Event が飛んでくる場合があり
    //   `e.message` が undefined になる。利用可能なプロパティを全部 dump して原因を見やすく。
    w.addEventListener('error', (e) => {
      const errEvent = e as ErrorEvent;
      console.error('[WorkerHost] worker error:', {
        message: errEvent.message ?? '(no message — likely module load failure)',
        filename: errEvent.filename,
        lineno: errEvent.lineno,
        colno: errEvent.colno,
        error: errEvent.error,
        type: e.type,
      });
      const detail = errEvent.message || `${e.type} (no message; likely worker module load failure — check Network tab for the worker URL)`;
      for (const id of Array.from(this.pending.keys())) {
        this.rejectPending(id, new Error(`Worker crashed: ${detail}`));
      }
      // 暴走時は worker を破棄、次の run で新規 spawn
      this.worker?.terminate();
      this.worker = null;
      this.loadPromise = null;
    });
    w.addEventListener('messageerror', (e) => {
      console.error('[WorkerHost] worker messageerror:', e);
    });
    this.worker = w;
    return w;
  }

  private postToWorker(msg: WorkerInbound): void {
    this.worker?.postMessage(msg);
  }

  private postRequest<T extends PendingValue>(
    type: 'run' | 'lint' | 'trace',
    payload: { code: string; ctx?: RunContext },
  ): Promise<T> {
    if (this.destroyed) return Promise.reject(new Error('WorkerHost destroyed'));
    const runId = `${Date.now()}-${++this.runIdCounter}`;
    const timeoutMs = this.opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.rejectPending(runId, new Error(`${type} timeout (${timeoutMs}ms)`));
        // timeout 時は worker terminate（暴走防止）
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
          this.loadPromise = null;
        }
      }, timeoutMs);

      this.pending.set(runId, {
        resolve: resolve as (v: PendingValue) => void,
        reject,
        timer,
      });

      this.ensureWorker();
      if (type === 'run') {
        this.postToWorker({ type: 'run', code: payload.code, ctx: payload.ctx, runId });
      } else if (type === 'lint') {
        this.postToWorker({ type: 'lint', code: payload.code, runId });
      } else {
        this.postToWorker({ type: 'trace', code: payload.code, runId });
      }
    });
  }

  private handleMessage = (e: MessageEvent<WorkerOutbound>) => {
    const msg = e.data;
    if (msg.type === 'result') {
      this.resolvePending(msg.runId, msg.result);
    } else if (msg.type === 'lintResult') {
      this.resolvePending(msg.runId, msg.issues);
    } else if (msg.type === 'traceResult') {
      this.resolvePending(msg.runId, msg.steps);
    } else if (msg.type === 'error' && msg.runId) {
      this.rejectPending(msg.runId, new Error(msg.message));
      if (!msg.recoverable) {
        this.worker?.terminate();
        this.worker = null;
        this.loadPromise = null;
      }
    }
  };

  private resolvePending(runId: string, value: PendingValue): void {
    const p = this.pending.get(runId);
    if (!p) return;
    if (p.timer) clearTimeout(p.timer);
    p.resolve(value);
    this.pending.delete(runId);
  }

  private rejectPending(runId: string, err: Error): void {
    const p = this.pending.get(runId);
    if (!p) return;
    if (p.timer) clearTimeout(p.timer);
    p.reject(err);
    this.pending.delete(runId);
  }
}
