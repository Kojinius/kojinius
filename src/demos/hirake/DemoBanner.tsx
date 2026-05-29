import { useState } from 'react'
import { useLocation } from 'react-router-dom'

const BASE = '/demo/hirake'

interface ScreenInfo {
  title:    string
  features: string[]
}

const SCREEN_INFO: { pattern: RegExp; info: ScreenInfo }[] = [
  {
    pattern: /^\/demo\/hirake\/admin\/members/,
    info: {
      title:    '管理画面 — メンバー管理',
      features: ['メンバー一覧（アバター・名前・肩書き・BIO）', 'インライン編集モーダル', 'メンバー削除（作品・ファイルも一括）'],
    },
  },
  {
    pattern: /^\/demo\/hirake\/admin\/works/,
    info: {
      title:    '管理画面 — 全作品管理',
      features: ['全メンバーの作品を一覧表示', 'メンバー別フィルター・ステータスフィルター', 'ステータス切替（審査待ち ⇄ 公開中）', '作品削除'],
    },
  },
  {
    pattern: /^\/demo\/hirake\/admin\/users/,
    info: {
      title:    '管理画面 — ユーザー管理',
      features: ['ユーザー一覧（ロール・メールアドレス）', 'ロール変更（admin / manager / staff）', '新規ユーザー作成', 'ユーザー削除'],
    },
  },
  {
    pattern: /^\/demo\/hirake\/admin\/invites/,
    info: {
      title:    '管理画面 — 招待リンク',
      features: ['招待リンク生成（有効期限・使用上限設定）', 'リンクのクリップボードコピー', '招待リンクの無効化・削除'],
    },
  },
  {
    pattern: /^\/demo\/hirake\/admin/,
    info: {
      title:    '管理画面 — ダッシュボード',
      features: ['メンバー数・作品数・ユーザー数の統計カード', '各管理ページへのクイックアクション'],
    },
  },
  {
    pattern: /^\/demo\/hirake\/my\/profile/,
    info: {
      title:    'マイページ — プロフィール編集',
      features: ['アバター画像のD&Dおよびクリックアップロード', 'リアルタイムプレビュー', '名前・肩書き・自己紹介の編集'],
    },
  },
  {
    pattern: /^\/demo\/hirake\/my\/works/,
    info: {
      title:    'マイページ — 作品管理',
      features: ['作品の追加・削除', 'ステータス管理（審査待ち / 公開中）', 'PDFサムネイル自動生成（pdfjs-dist）', '画像 / PDF / 音声 / YouTube / URLに対応'],
    },
  },
  {
    pattern: /^\/demo\/hirake\/member\//,
    info: {
      title:    'メンバープロフィール・作品展示',
      features: ['スクロールリビールアニメーション（Intersection Observer）', '作品ライトボックス（FLIPズームイン）', '作品グリッド（画像 / 動画 / 音声 / PDF / Webサイト対応）', 'D&Dによる作品並び替え'],
    },
  },
  {
    pattern: /^\/demo\/hirake\/?$/,
    info: {
      title:    'メンバーギャラリー（トップ）',
      features: ['FLIPアニメーションによるカードシャッフル（8秒ごと自動）', '6パターンのグリッドレイアウトをランダム適用', 'クリックでメンバープロフィールへ遷移', 'ライト / ダークテーマ切替対応'],
    },
  },
]

function getScreenInfo(pathname: string): ScreenInfo {
  for (const { pattern, info } of SCREEN_INFO) {
    if (pattern.test(pathname)) return info
  }
  return { title: 'Hiraké デモ', features: [] }
}

export function DemoBanner() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(true)
  const { title, features } = getScreenInfo(pathname)

  const currentPath = pathname.replace(BASE, '') || '/'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--amber)]/30"
      style={{ background: 'rgba(10,9,5,0.96)', backdropFilter: 'blur(8px)' }}
    >
      {/* ── collapsed bar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none"
        onClick={() => setOpen(v => !v)}
      >
        <span className="flex-none bg-[var(--amber)] text-black text-[9px] font-mono font-bold tracking-[0.2em] px-2 py-0.5 uppercase">
          DEMO
        </span>
        <span className="flex-1 text-[var(--text-2)] text-xs font-mono truncate">{title}</span>
        <span className="flex-none text-[var(--text-3)] text-[10px] font-mono opacity-60">
          {currentPath}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`flex-none text-[var(--amber)] transition-transform duration-200 ${open ? 'rotate-0' : 'rotate-180'}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* ── expanded: feature list */}
      <div
        className="grid transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-3 flex flex-wrap gap-x-6 gap-y-1.5 border-t border-[var(--amber)]/10 pt-2.5">
            {features.map((f, i) => (
              <span key={i} className="flex items-start gap-1.5 text-[var(--text-3)] text-[11px] font-mono">
                <span className="text-[var(--amber)] mt-px flex-none">•</span>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
