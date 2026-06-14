// 2026-06-15 claude-opus-4-8[1m] セッションターン数：14
// meoscope デモ — MEO 競合・市場分析ダッシュボード（mock・自己完結・full-screen）。
// 実プロダクト meoscope.com の "Spy Dossier" 風 UI を軽量再現。インラインスタイル主体で
// kojinius のテーマ/Tailwind 設定に依存しない。
import { useState } from 'react'
import { DemoBanner } from './DemoBanner'

const C = {
  bg: '#0A0E14', panel: '#0F1620', panel2: '#131C28', line: 'rgba(255,255,255,0.08)',
  text: '#E6EEF6', muted: '#8595A8', cyan: '#22D3EE', green: '#34D399', amber: '#FBBF24', red: '#F87171', indigo: '#818CF8',
}

type Pos = 'リーダー' | 'チャレンジャー' | 'フォロワー' | 'ニッチャー'
const POS_COLOR: Record<Pos, string> = { 'リーダー': C.red, 'チャレンジャー': C.amber, 'フォロワー': C.muted, 'ニッチャー': C.indigo }

const TARGET = { name: 'あなたのカフェ', x: 51, y: 54, rating: 4.1, reviews: 86 }
const COMPETITORS: { id: string; name: string; x: number; y: number; rating: number; reviews: number; pos: Pos; web: boolean }[] = [
  { id: 'a', name: '珈琲 蔵', x: 30, y: 32, rating: 4.6, reviews: 412, pos: 'リーダー', web: true },
  { id: 'b', name: 'CAFE NORD', x: 68, y: 38, rating: 4.4, reviews: 268, pos: 'チャレンジャー', web: true },
  { id: 'c', name: '海辺の喫茶', x: 72, y: 66, rating: 4.2, reviews: 153, pos: 'チャレンジャー', web: false },
  { id: 'd', name: 'まちかど珈琲', x: 38, y: 70, rating: 3.9, reviews: 64, pos: 'フォロワー', web: false },
  { id: 'e', name: 'Roastery 11', x: 60, y: 22, rating: 4.5, reviews: 89, pos: 'ニッチャー', web: true },
  { id: 'f', name: '駅前カフェテラス', x: 22, y: 54, rating: 3.7, reviews: 121, pos: 'フォロワー', web: true },
]

const METRICS = [
  { label: '競合密度', value: 78, hint: '半径3kmに同業18件・やや過密' },
  { label: '市場飽和度', value: 64, hint: '伸び代はあるが差別化が必須' },
  { label: '平均評価（自店）', value: 82, hint: '★4.1 / 商圏平均 ★4.2' },
  { label: 'デジタル存在感', value: 34, hint: 'SNS・動画・予約導線が弱い＝伸び代大' },
]

const SWOT = [
  { k: 'S', label: '強み', color: C.green, items: ['駅から徒歩4分の立地', '★4.1 と一定の評価基盤'] },
  { k: 'W', label: '弱み', color: C.red, items: ['口コミ件数が商圏平均の1/3', 'Web/予約導線がほぼ無い'] },
  { k: 'O', label: '機会', color: C.cyan, items: ['動画掲載の実施店は商圏で18%のみ', 'ランチ層の需要が未開拓'] },
  { k: 'T', label: '脅威', color: C.amber, items: ['リーダー店が口コミを量産中', '大手チェーンの出店観測'] },
]

function MetricBar({ label, value, hint }: { label: string; value: number; hint: string }) {
  const color = value >= 70 ? C.green : value >= 45 ? C.amber : C.cyan
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: C.text }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 3, background: color }} />
      </div>
      <p style={{ margin: '5px 0 0', fontSize: 10.5, color: C.muted }}>{hint}</p>
    </div>
  )
}

export function MeoscopeDemo() {
  const [sel, setSel] = useState<string | null>(null)
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'system-ui, sans-serif', paddingBottom: 96 }}>
      {/* 上部バー */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `1px solid ${C.line}`, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>🔭 meoscope</span>
        <span style={{ fontSize: 11, color: C.cyan, border: `1px solid ${C.cyan}55`, borderRadius: 4, padding: '2px 8px' }}>市場分析レポート</span>
        <span style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '6px 10px', minWidth: 280 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>🔎</span>
          <span style={{ fontSize: 13 }}>小田原市</span>
          <span style={{ color: C.muted }}>/</span>
          <span style={{ fontSize: 13 }}>カフェ・喫茶</span>
        </div>
        <button style={{ background: `linear-gradient(90deg, ${C.cyan}, ${C.green})`, color: '#06121d', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          再分析
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 16, padding: 16, maxWidth: 1280, margin: '0 auto' }}>
        {/* 左: マップ + 競合テーブル */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 13, color: C.muted, fontWeight: 600, letterSpacing: '0.08em' }}>競合マップ — 半径3km</h2>
            <div style={{
              position: 'relative', aspectRatio: '16 / 10', borderRadius: 10, overflow: 'hidden',
              background: 'radial-gradient(circle at 50% 50%, rgba(34,211,238,0.06), transparent 70%), #0B131C',
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
              backgroundSize: '34px 34px', border: `1px solid ${C.line}`,
            }}>
              {/* 商圏リング */}
              <div style={{ position: 'absolute', left: `${TARGET.x}%`, top: `${TARGET.y}%`, width: 220, height: 220, transform: 'translate(-50%,-50%)', border: `1px dashed ${C.cyan}44`, borderRadius: '50%' }} />
              {/* 競合ピン */}
              {COMPETITORS.map(c => {
                const active = sel === c.id
                return (
                  <button key={c.id} onClick={() => setSel(active ? null : c.id)} title={c.name}
                    style={{
                      position: 'absolute', left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%,-50%)',
                      display: 'flex', alignItems: 'center', gap: 5, background: active ? POS_COLOR[c.pos] : 'rgba(10,14,20,0.85)',
                      border: `1px solid ${POS_COLOR[c.pos]}`, color: active ? '#06121d' : C.text,
                      borderRadius: 999, padding: '3px 8px', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                    } as React.CSSProperties}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: POS_COLOR[c.pos] }} />
                    {c.name}
                  </button>
                )
              })}
              {/* 自店ピン */}
              <div style={{ position: 'absolute', left: `${TARGET.x}%`, top: `${TARGET.y}%`, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ background: C.cyan, color: '#06121d', fontWeight: 800, fontSize: 11, padding: '3px 9px', borderRadius: 999, boxShadow: `0 0 0 4px ${C.cyan}33` }}>★ 自店</span>
              </div>
            </div>
          </section>

          <section style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, overflow: 'hidden' }}>
            <h2 style={{ margin: 0, padding: '12px 16px', fontSize: 13, color: C.muted, fontWeight: 600, letterSpacing: '0.08em', borderBottom: `1px solid ${C.line}` }}>競合一覧（評価順）</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ color: C.muted, textAlign: 'left' }}>
                  <th style={{ padding: '8px 16px', fontWeight: 500 }}>店舗</th>
                  <th style={{ padding: '8px 8px', fontWeight: 500 }}>分類</th>
                  <th style={{ padding: '8px 8px', fontWeight: 500, textAlign: 'right' }}>★評価</th>
                  <th style={{ padding: '8px 8px', fontWeight: 500, textAlign: 'right' }}>口コミ</th>
                  <th style={{ padding: '8px 16px', fontWeight: 500, textAlign: 'center' }}>Web</th>
                </tr>
              </thead>
              <tbody>
                {[...COMPETITORS].sort((a, b) => b.rating - a.rating).map(c => {
                  const active = sel === c.id
                  return (
                    <tr key={c.id} onClick={() => setSel(active ? null : c.id)}
                      style={{ borderTop: `1px solid ${C.line}`, background: active ? 'rgba(34,211,238,0.08)' : 'transparent', cursor: 'pointer' }}>
                      <td style={{ padding: '9px 16px', fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '9px 8px' }}><span style={{ color: POS_COLOR[c.pos], border: `1px solid ${POS_COLOR[c.pos]}55`, borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>{c.pos}</span></td>
                      <td style={{ padding: '9px 8px', textAlign: 'right' }}>{c.rating.toFixed(1)}</td>
                      <td style={{ padding: '9px 8px', textAlign: 'right', color: C.muted }}>{c.reviews}</td>
                      <td style={{ padding: '9px 16px', textAlign: 'center' }}>{c.web ? '✓' : <span style={{ color: C.muted }}>—</span>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        </div>

        {/* 右: スコア + メトリクス + SWOT + 次の一手 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section style={{ background: `linear-gradient(180deg, ${C.panel2}, ${C.panel})`, border: `1px solid ${C.line}`, borderRadius: 12, padding: 18, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{TARGET.name} ／ 市場ポジションスコア</p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, margin: '6px 0 2px' }}>
              <span style={{ fontSize: 52, fontWeight: 800, color: C.cyan, lineHeight: 1 }}>62</span>
              <span style={{ fontSize: 16, color: C.muted }}>/100</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: C.amber, fontWeight: 600 }}>分類: チャレンジャー（伸び代大）</p>
          </section>

          <section style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 13, color: C.muted, fontWeight: 600, letterSpacing: '0.08em' }}>定量シグナル</h2>
            {METRICS.map(m => <MetricBar key={m.label} {...m} />)}
          </section>

          <section style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 13, color: C.muted, fontWeight: 600, letterSpacing: '0.08em' }}>SWOT（AI 生成）</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {SWOT.map(s => (
                <div key={s.k} style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: 11 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ background: s.color, color: '#06121d', fontWeight: 800, fontSize: 11, width: 18, height: 18, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{s.k}</span>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{s.label}</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 14 }}>
                    {s.items.map((it, i) => <li key={i} style={{ fontSize: 11, color: C.text, opacity: 0.85, marginBottom: 3 }}>{it}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section style={{ background: `linear-gradient(135deg, rgba(34,211,238,0.14), rgba(52,211,153,0.10))`, border: `1px solid ${C.cyan}55`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>🎯</span>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>次の一手</h2>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7 }}>
              <strong style={{ color: C.cyan }}>Google ビジネスプロフィールに「動画」を追加。</strong>
              商圏で動画を出している店は <strong>18%</strong> のみ。最小工数で視認性を確保でき、口コミ件数の差（商圏平均比 1/3）を補える最優先施策です。
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 11, color: C.muted }}>impact: 高 ／ 難易度: 低 ／ 推定リードタイム: 2週間</p>
          </section>
        </div>
      </div>

      <DemoBanner />
    </div>
  )
}
