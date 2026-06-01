// 2026-05-11 [opus-4-7] Phase 7: Pyodide Worker
// 2026-05-10 21:55:00 claude-opus-4-7[1m] セッションターン数：40 — .ts → .js リネーム
// 2026-05-10 22:10:00 claude-opus-4-7[1m] セッションターン数：42 — webpack bundle 除外
//   pyodide パッケージは `import("node:url")` 等の Node.js 動的 import を含み、Worker module
//   bundle で webpack が node: prefix を解決失敗 → Worker 起動エラー / load timeout になる。
//   webpackIgnore で bundle から除外し、Worker 内で CDN ESM を直接動的 import する。
//   ブラウザ native の dynamic import は node: 系を try で評価 → false で早期 return できる。

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/';
let pyodide = null;
let loadingPromise = null;

function post(msg) {
  self.postMessage(msg);
}

async function ensureLoaded() {
  if (pyodide) return;
  if (!loadingPromise) {
    loadingPromise = (async () => {
      post({ type: 'progress', pct: 5, msg: 'Pyodide ローダーを取得中…' });
      const { loadPyodide } = await import(/* webpackIgnore: true */ `${PYODIDE_CDN}pyodide.mjs`);
      post({ type: 'progress', pct: 30, msg: 'Pyodide ランタイムを起動中…' });
      pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });
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
    if (!pyodide) {
      post({ type: 'error', runId: msg.runId, message: 'Pyodide not loaded', recoverable: true });
      return;
    }

    let stdout = '';
    let stderr = '';
    pyodide.setStdout({ batched: (s) => { stdout += s + '\n'; } });
    pyodide.setStderr({ batched: (s) => { stderr += s + '\n'; } });

    const start = performance.now();
    try {
      await pyodide.runPythonAsync(msg.code);
      post({
        type: 'result',
        runId: msg.runId,
        result: {
          ok: true,
          stdout,
          stderr,
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
          stdout,
          stderr: stderr + errMsg,
          durationMs: Math.round(performance.now() - start),
        },
      });
    }
    return;
  }

  // 2026-05-11 17:00:00 claude-opus-4-7[1m] セッションターン数：17 — Phase 16: trace
  //   sys.settrace で line event を捕捉、pyodide.globals.get で JS 側に渡す。
  //   無限ループ保険として 1000 ステップ上限。
  if (msg.type === 'trace') {
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
    if (!pyodide) {
      post({ type: 'error', runId: msg.runId, message: 'Pyodide not loaded', recoverable: true });
      return;
    }

    const userCodeJson = JSON.stringify(msg.code);
    const wrappedCode = `
import sys
__craftica_trace = []
def __craftica_trace_hook(frame, event, arg):
    if event == 'line' and frame.f_code.co_filename == '<trace>':
        try:
            vars_snapshot = {}
            for k, v in frame.f_locals.items():
                if k.startswith('__craftica_'):
                    continue
                try:
                    r = repr(v)
                    if len(r) > 200:
                        r = r[:200] + '…'
                    vars_snapshot[k] = r
                except Exception:
                    vars_snapshot[k] = '<repr error>'
            __craftica_trace.append({'line': frame.f_lineno, 'vars': vars_snapshot})
            if len(__craftica_trace) >= 1000:
                sys.settrace(None)
        except Exception:
            pass
    return __craftica_trace_hook

sys.settrace(__craftica_trace_hook)
try:
    exec(compile(${userCodeJson}, '<trace>', 'exec'))
finally:
    sys.settrace(None)
`;

    try {
      await pyodide.runPythonAsync(wrappedCode);
      const stepsProxy = pyodide.globals.get('__craftica_trace');
      // Pyodide PyProxy → JS plain object
      const stepsRaw = stepsProxy.toJs({ dict_converter: Object.fromEntries });
      stepsProxy.destroy?.();
      // stepsRaw は Map | Array of Map / object — 統一化
      const steps = (Array.isArray(stepsRaw) ? stepsRaw : []).map((s) => ({
        line: typeof s.line === 'number' ? s.line : Number(s.line ?? 0),
        vars: s.vars && typeof s.vars === 'object' ? s.vars : {},
      }));
      post({ type: 'traceResult', runId: msg.runId, steps });
    } catch (err) {
      post({
        type: 'error',
        runId: msg.runId,
        message: err instanceof Error ? err.message : String(err),
        recoverable: true,
      });
    }
    return;
  }

  if (msg.type === 'abort') {
    return;
  }
});
