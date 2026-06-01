// 2026-06-01 claude-opus-4-8[1m] セッションターン数：3
// kojinius /md-editor ルートのページ。旧 MdEditor.tsx を Craftica Editor（craftica から逆輸入）へ全面置換。
// URL パス /md-editor は PWA start_url / 外部リンク維持のため据え置き、中身のみ Craftica Editor。
// 2026-06-02 claude-opus-4-8[1m] セッションターン数：5 — review fix: document.title は CrafticaEditor 本体が
//   設定する（index.tsx）ため、二重設定を避けて page 側の title 制御は撤去。
// 設計書: documents/design/craftica-editor-port-to-kojinius.md
import CrafticaEditor from '@/components/crafticaEditor';

export default function CrafticaEditorPage() {
  // サイトヘッダ無しの全画面シェル。エディタ自身がダークテーマ・レイアウト・document.title を内包。
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#1e1e2e' }}>
      <CrafticaEditor />
    </div>
  );
}
