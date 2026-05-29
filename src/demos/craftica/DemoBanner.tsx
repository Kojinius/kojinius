// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// Craftica デモバナー — 画面下部固定。画面説明 + ロール切替 + ポートフォリオへ戻るリンク。

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMockAuth } from './MockAuthContext'
import type { Role } from './types'

interface ScreenInfo { title: string; features: string[] }

const SCREEN_INFO: { pattern: RegExp; info: ScreenInfo }[] = [
  { pattern: /\/admin\/teachers/,        info: { title: '管理 — 先生管理',         features: ['4 先生プリセット（優子・金七・滝沢・ボス）', 'アイコン・表示名のカスタマイズ', 'AI のトーンプロンプトは不可変'] } },
  { pattern: /\/admin\/courses/,         info: { title: '管理 — 課題管理',         features: ['全バンク・全コースの俯瞰', '進捗率・着手率の可視化（準備中）'] } },
  { pattern: /\/admin\/users/,           info: { title: '管理 — ユーザー管理',     features: ['ロール変更（admin/manager/member）', 'メール許可リスト', '無効化・要監視フラグ（準備中）'] } },
  { pattern: /\/admin\/audit/,           info: { title: '管理 — 監査ログ',         features: ['ユーザー操作・公開フロー・課題削除の監査', '90日間保持・CSV エクスポート（準備中）'] } },
  { pattern: /\/admin\/settings/,        info: { title: '管理 — アプリ設定',       features: ['外部連携 ON/OFF', 'AI 利用上限の調整（準備中）'] } },
  { pattern: /\/dashboard\/consult/,     info: { title: '先生に相談',              features: ['左ペイン: 自分の課題一覧（バンク単位）', '右ペイン: 課題ごとのスレッド', 'Enter 送信 / Shift+Enter 改行', 'manager+ は全件閲覧'] } },
  { pattern: /\/dashboard\/plan/,        info: { title: 'AI — プランモード',       features: ['対話で課題バンクを設計', 'プレビューカードで構成確認', '「このバンクを作成」で1クリック投入'] } },
  { pattern: /\/dashboard\/chat/,        info: { title: 'AI — チャットモード',     features: ['Sonnet / Opus 切替', '会話履歴の日付グルーピング', 'Markdown + コード行クリックで AI 質問', 'Web 検索 / 画像生成 / 動画生成（fal.ai）'] } },
  { pattern: /\/banks\/[^/]+\/courses/,  info: { title: '課題詳細',                features: ['進捗状態の更新（未着手 → 着手中 → 完了）', '振り返り（goodPoints / improvements / nextActions）', 'トロフィー獲得演出', 'AI 講師との連携（チャット起動）'] } },
  { pattern: /\/banks\/[^/]+/,           info: { title: 'バンク詳細 — 進捗グリッド', features: ['行=メンバー / 列=課題のマトリクス', '完了セルは成果物サムネ表示', 'クリックで課題詳細へ遷移', 'manager+ は全員、member は自分のみ表示'] } },
  { pattern: /\/dashboard$/,             info: { title: 'ダッシュボード',          features: ['KPI 4指標（完了率 / 今週完了 / 着手中 / AI チャット）', 'メンバーロスター + 最近の動き + 今週の作品', '公開/非公開バンクの 2 セクション分割', '右クリックメニューで公開状態切替'] } },
  { pattern: /\/dashboard/,              info: { title: 'ダッシュボード',          features: ['メンバー向けホーム — 受講中課題 + TrophyShelf', '受講可能な課題 / お気に入り（★）', '修了証セクション'] } },
  { pattern: /\/demo\/craftica$/,        info: { title: 'ログイン',                features: ['Google サインイン（飾り）', '開発用ロール切替（admin / manager / member）', 'プライバシーポリシー・利用規約への同意'] } },
]

function getScreenInfo(pathname: string): ScreenInfo {
  for (const { pattern, info } of SCREEN_INFO) {
    if (pattern.test(pathname)) return info
  }
  return { title: 'Craftica デモ', features: [] }
}

const ROLES: { value: Role; label: string }[] = [
  { value: 'admin',   label: '管理者' },
  { value: 'manager', label: 'マネージャー' },
  { value: 'member',  label: 'メンバー' },
]

export function DemoBanner() {
  const { pathname } = useLocation()
  const { user, setRole, isLoggedIn } = useMockAuth()
  const [open, setOpen] = useState(true)
  const { title, features } = getScreenInfo(pathname)

  return (
    <div
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(42, 37, 32, 0.96)', backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(198, 107, 61, 0.5)',
        color: '#F5E8D0',
      }}
    >
      {/* 折り畳みヘッダー */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <span style={{
          background: '#C66B3D', color: '#fff',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
          padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase',
        }}>DEMO</span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>🪴 Craftica — {title}</span>
        <span style={{ flex: 1 }} />
        {isLoggedIn && (
          <div style={{ display: 'flex', gap: 4 }}>
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={(e) => { e.stopPropagation(); setRole(r.value) }}
                style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  border: '1px solid', cursor: 'pointer',
                  background: user?.role === r.value ? '#C66B3D' : 'transparent',
                  color: user?.role === r.value ? '#fff' : '#F5E8D0',
                  borderColor: user?.role === r.value ? '#C66B3D' : 'rgba(245,232,208,0.3)',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
        <Link
          to="/"
          onClick={(e) => e.stopPropagation()}
          style={{ fontSize: 11, color: '#F5E8D0', opacity: 0.75, textDecoration: 'underline' }}
        >
          ← ポートフォリオに戻る
        </Link>
        <span style={{
          display: 'inline-block', transition: 'transform 200ms',
          transform: open ? 'rotate(0deg)' : 'rotate(180deg)', fontSize: 10,
        }}>▼</span>
      </div>

      {/* 展開: 機能リスト */}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 200ms ease',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px 18px',
            padding: '4px 14px 10px',
            borderTop: '1px solid rgba(198,107,61,0.18)',
          }}>
            {features.map((f, i) => (
              <span key={i} style={{ fontSize: 11, opacity: 0.85, display: 'inline-flex', gap: 4, alignItems: 'baseline' }}>
                <span style={{ color: '#E8B547' }}>•</span>{f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
