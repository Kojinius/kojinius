import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { cpSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 2026-05-04 claude-sonnet-4-6 セッションターン数：8
// ChromeはPWAのorientationをJavaScriptより前にネイティブ適用するため
// 動的manifest注入では向き制御が効かない。
// ビルド後にdist/md-editor.htmlを生成し、manifest linkを静的に埋め込む。
function generateMdEditorHtml() {
  return {
    name: 'generate-md-editor-html',
    closeBundle() {
      const indexPath = resolve(__dirname, 'dist/index.html');
      const outPath   = resolve(__dirname, 'dist/md-editor.html');
      if (!existsSync(indexPath)) return;
      const html = readFileSync(indexPath, 'utf-8').replace(
        '<head>',
        '<head>\n  <link rel="manifest" href="/md-editor-manifest.json">'
      );
      writeFileSync(outPath, html);
      console.log('✓ dist/md-editor.html を生成しました');
    },
  };
}

/** ビルド後にレガシーアプリ（CVCreator/ResumeCreator等）をdistにコピー */
function copyLegacyApps() {
  return {
    name: 'copy-legacy-apps',
    closeBundle() {
      const src = resolve(__dirname, '../apps');
      const dest = resolve(__dirname, 'dist/apps');
      if (existsSync(src)) {
        cpSync(src, dest, { recursive: true });
        console.log('✓ レガシーアプリを dist/apps/ にコピーしました');
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), generateMdEditorHtml(), copyLegacyApps()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  build: {
    // 2026-06-01 claude-opus-4-8[1m] セッションターン数：4 — kojinius 移植:
    //   crafticaEditor の Web Worker は `new URL('./x.worker.js', import.meta.url)` 経由で
    //   アセット扱いになる。4KB 未満（sql.worker.js=4045B）だと data URL にインライン化され、
    //   module worker として起動できず SQL 実行が壊れる。*.worker.js は常にファイル出力させる。
    assetsInlineLimit: (filePath: string) => (filePath.endsWith('.worker.js') ? false : undefined),
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'vendor';
          if (id.includes('node_modules/pdf-lib') || id.includes('fontkit')) return 'pdf';
        },
      },
    },
  },
});
