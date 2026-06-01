// 2026-05-11 12:50:00 claude-opus-4-7[1m] セッションターン数：6
// Phase 12-Ruby Runner（@ruby/wasm-wasi + @bjorn3/browser_wasi_shim ベース、Phase 6 Runner I/F 実装）
// 設計書: documents/design/craftica-editor-phase-12-ruby.md
import type { Runner, RunResult, RunContext, LoadProgressCallback } from './types';
import { WorkerHost } from './workerHost';

export class RubyRunner implements Runner {
  readonly lang = 'ruby' as const;
  private host: WorkerHost;

  constructor() {
    this.host = new WorkerHost(
      new URL('./ruby.worker.js', import.meta.url),
      {
        tier: 'C',
        timeoutMs: 30_000,        // 軽量 Hello world は 1s 以内、寛容めに 30s
        loadTimeoutMs: 120_000,   // 初回 WASM ~16MB fetch + compile は数十秒かかり得る
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
