// 2026-05-11 [opus-4-7] Phase 9: SQL Runner Worker（sql.js 1.14.1）
// 2026-05-10 21:55:00 claude-opus-4-7[1m] セッションターン数：40 — .ts → .js リネーム
// 2026-05-10 22:25:00 claude-opus-4-7[1m] セッションターン数：43 — webpack bundle 除外
//   sql.js は内部で `require("node:fs")` `require("node:crypto")` を含み、Worker module
//   bundle で webpack が解決失敗する。Pyodide と同じパターンで CDN ESM を直接動的 import。
//   `cdn.jsdelivr.net/npm/sql.js@1.14.1/+esm` はブラウザ向けに ESM 化された build。
//   WASM ファイル本体は公式 CDN (sql.js.org) から locateFile で取得。

// 2026-05-10 22:35:00 claude-opus-4-7[1m] セッションターン数：44 — WASM URL 修正
//   `+esm` は sql-wasm-browser.js (browser build) を返し、これは `sql-wasm-browser.wasm` を要求。
//   sql.js.org/dist は `sql-wasm.wasm` しか配信しておらず browser 版は 404 → HTML 返って
//   `WebAssembly.instantiate(): magic word 3c 21 44 4f` エラー。jsdelivr 配信に統一。
const SQLJS_VERSION = '1.14.1';
const SQLJS_ESM_CDN = `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/+esm`;
const SQLJS_WASM_CDN = `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/`;
let SQL = null;
let db = null;

function post(msg) {
  self.postMessage(msg);
}

async function ensureLoaded() {
  if (db) return;
  post({ type: 'progress', pct: 10, msg: 'sql.js ローダーを取得中…' });
  if (!SQL) {
    const mod = await import(/* webpackIgnore: true */ SQLJS_ESM_CDN);
    const initSqlJs = mod.default ?? mod;
    post({ type: 'progress', pct: 50, msg: 'SQLite ランタイムを起動中…' });
    SQL = await initSqlJs({
      locateFile: (file) => `${SQLJS_WASM_CDN}${file}`,
    });
  }
  post({ type: 'progress', pct: 80, msg: 'データベースを準備中…' });
  db = new SQL.Database();
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
    if (!db) {
      post({ type: 'error', runId: msg.runId, message: 'Database not initialized', recoverable: true });
      return;
    }

    const start = performance.now();
    let stdout = '';
    let stderr = '';
    const artifacts = [];
    try {
      const results = db.exec(msg.code);
      results.forEach((r, i) => {
        if (r.columns && r.values) {
          artifacts.push({
            kind: 'table',
            columns: r.columns,
            rows: r.values,
          });
          stdout += `[結果 ${i + 1}] ${r.values.length} 行返却\n`;
        }
      });
      if (results.length === 0) {
        stdout += 'OK（DDL/DML、SELECT 結果なし）\n';
      }
      post({
        type: 'result',
        runId: msg.runId,
        result: {
          ok: true,
          stdout,
          stderr,
          artifacts: artifacts.length > 0 ? artifacts : undefined,
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

  if (msg.type === 'abort') {
    return;
  }
});
