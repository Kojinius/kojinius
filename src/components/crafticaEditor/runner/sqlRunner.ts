// 2026-05-11 [opus-4-7] Phase 9: SQL Runner（sql.js ベース、Phase 6 Runner I/F 実装）
import type { Runner, RunResult, RunContext, LoadProgressCallback } from './types';
import { WorkerHost } from './workerHost';

export class SqlRunner implements Runner {
  readonly lang = 'sql' as const;
  private host: WorkerHost;

  constructor() {
    this.host = new WorkerHost(
      new URL('./sql.worker.js', import.meta.url),
      {
        tier: 'B',
        timeoutMs: 10_000,
        loadTimeoutMs: 30_000,
      },
    );
  }

  load(onProgress?: LoadProgressCallback): Promise<void> {
    return this.host.load(onProgress);
  }

  run(code: string, ctx?: RunContext): Promise<RunResult> {
    return this.host.run(code, ctx);
  }

  destroy(): void {
    this.host.destroy();
  }
}
