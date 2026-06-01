// 2026-05-11 12:50:00 claude-opus-4-7[1m] セッションターン数：6
// Phase 12-Ruby: @ruby/wasm-wasi Worker
// 設計書: documents/design/craftica-editor-phase-12-ruby.md
//
// Pyodide / python.worker.js と同型のパターン:
// - webpackIgnore で bundle 除外、Worker 内で CDN ESM を直接動的 import
// - @ruby/wasm-wasi の DefaultRubyVM は stdout/stderr を console.log に流すだけで JS 側捕捉不可。
//   Evil Martians 事例どおり RubyVM + @bjorn3/browser_wasi_shim を直接組立て、
//   ConsoleStdout.lineBuffered() で fd_1 / fd_2 を JS callback 化して捕捉する。
//
// 2026-05-11 13:40:00 claude-opus-4-7[1m] セッションターン数：8 — CDN URL 修正
//   実際の npm version は 2.9.3-2.9.4（cheat sheet の 2.9.4 はハルシネーション）。
//   かつ @ruby/wasm-wasi の dist/esm/* は bare specifier (@bjorn3/browser_wasi_shim)
//   を含むため jsdelivr 直 import 不可。esm.sh 経由で全 dep を解決。
//   browser_wasi_shim も実 dep version 0.4.2 に追従。

const RUBY_WASM_CDN = 'https://esm.sh/@ruby/wasm-wasi@2.9.3-2.9.4';
const WASI_SHIM_CDN = 'https://esm.sh/@bjorn3/browser_wasi_shim@0.4.2';
const RUBY_BINARY_CDN = 'https://cdn.jsdelivr.net/npm/@ruby/4.0-wasm-wasi@2.9.3-2.9.4/dist/ruby+stdlib.wasm';

let vm = null;
let loadingPromise = null;
let stdoutBuf = [];
let stderrBuf = [];

function post(msg) {
  self.postMessage(msg);
}

async function ensureLoaded() {
  if (vm) return;
  if (!loadingPromise) {
    loadingPromise = (async () => {
      post({ type: 'progress', pct: 5, msg: 'Ruby WASM ローダーを取得中…' });
      const { RubyVM } = await import(/* webpackIgnore: true */ RUBY_WASM_CDN);
      const { WASI, OpenFile, File, ConsoleStdout } = await import(/* webpackIgnore: true */ WASI_SHIM_CDN);

      post({ type: 'progress', pct: 30, msg: 'Ruby ランタイムを取得中…' });
      const wasmResp = await fetch(RUBY_BINARY_CDN);
      if (!wasmResp.ok) {
        throw new Error(`Ruby WASM fetch failed: HTTP ${wasmResp.status}`);
      }
      const wasmBuf = await wasmResp.arrayBuffer();

      post({ type: 'progress', pct: 75, msg: 'Ruby ランタイムをコンパイル中…' });
      const wasmModule = await WebAssembly.compile(wasmBuf);

      // WASI fd セットアップ: stdin (空) / stdout / stderr を JS callback 化
      const fds = [
        new OpenFile(new File([])),
        ConsoleStdout.lineBuffered((line) => { stdoutBuf.push(line); }),
        ConsoleStdout.lineBuffered((line) => { stderrBuf.push(line); }),
      ];
      const wasi = new WASI([], [], fds, { debug: false });

      vm = new RubyVM();
      const imports = { wasi_snapshot_preview1: wasi.wasiImport };
      vm.addToImports(imports);
      const instance = await WebAssembly.instantiate(wasmModule, imports);
      await vm.setInstance(instance);
      wasi.initialize(instance);
      vm.initialize();

      post({ type: 'progress', pct: 95, msg: '準備完了…' });
    })();
  }
  await loadingPromise;
}

self.addEventListener('message', async (e) => {
  const msg = e.data;

  if (msg.type === 'load') {
    try {
      await ensureLoaded();
      post({ type: 'ready' });
    } catch (err) {
      post({
        type: 'error',
        message: err instanceof Error ? err.message : String(err),
        recoverable: false,
      });
    }
    return;
  }

  if (msg.type === 'run') {
    try {
      await ensureLoaded();
    } catch (err) {
      post({
        type: 'error',
        runId: msg.runId,
        message: err instanceof Error ? err.message : String(err),
        recoverable: false,
      });
      return;
    }
    if (!vm) {
      post({ type: 'error', runId: msg.runId, message: 'Ruby VM not loaded', recoverable: true });
      return;
    }

    // run 毎にバッファ初期化
    stdoutBuf = [];
    stderrBuf = [];

    const start = performance.now();
    try {
      vm.eval(msg.code);
      post({
        type: 'result',
        runId: msg.runId,
        result: {
          ok: true,
          stdout: stdoutBuf.join('\n') + (stdoutBuf.length ? '\n' : ''),
          stderr: stderrBuf.join('\n') + (stderrBuf.length ? '\n' : ''),
          durationMs: Math.round(performance.now() - start),
        },
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      post({
        type: 'result',
        runId: msg.runId,
        result: {
          ok: false,
          stdout: stdoutBuf.join('\n') + (stdoutBuf.length ? '\n' : ''),
          stderr: stderrBuf.join('\n') + (stderrBuf.length ? '\n' : '') + errMsg,
          durationMs: Math.round(performance.now() - start),
        },
      });
    }
    return;
  }

  if (msg.type === 'abort') {
    return;
  }
});
