// 2026-05-11 [opus-4-7] Phase 7: Python Runner（Pyodide ベース、Phase 6 Runner I/F 実装）
// 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace 実装
import type { Runner, RunResult, RunContext, TraceStep, LoadProgressCallback } from './types';
import { WorkerHost } from './workerHost';

export class PythonRunner implements Runner {
  readonly lang = 'python' as const;
  private host: WorkerHost;

  constructor() {
    this.host = new WorkerHost(
      new URL('./python.worker.js', import.meta.url),
      {
        tier: 'B',
        timeoutMs: 30_000,        // Pyodide は 5s だと Hello world でも timeout する余地あるので寛容に
        loadTimeoutMs: 90_000,    // 初回 WASM fetch は数十秒かかり得る
      },
    );
  }

  load(onProgress?: LoadProgressCallback): Promise<void> {
    return this.host.load(onProgress);
  }

  run(code: string, ctx?: RunContext): Promise<RunResult> {
    return this.host.run(code, ctx);
  }

  // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace 実装
  trace(code: string): Promise<TraceStep[]> {
    return this.host.trace(code);
  }

  destroy(): void {
    this.host.destroy();
  }
}
