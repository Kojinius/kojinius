// 2026-06-15 claude-opus-4-8[1m] セッションターン数：16
// knit デモ — schema-driven CMS（mock・自己完結・full-screen）。
// 左の AutoForm（スキーマ駆動フォーム）を編集すると右のライブプレビューへ即時反映。
// 下書き → 公開 → ロールバックのコンテンツフローを mock 再現。インラインスタイル主体。
import { useState } from 'react'
import { DemoBanner } from './DemoBanner'

type Form = {
  siteName: string
  headline: string
  tagline: string
  accent: string
  ctaLabel: string
  showWorks: boolean
}

const INITIAL: Form = {
  siteName: 'Hiraké',
  headline: '地域の「困った」を、デザインで解く。',
  tagline: '小田原・南足柄の店舗集客を、動画・LINE・デザインでまるごと。',
  accent: '#C66B3D',
  ctaLabel: '無料で相談する',
  showWorks: true,
}

const ACCENTS = ['#C66B3D', '#2563EB', '#059669', '#7C3AED', '#DB2777']
const FIELD_LABELS: Record<keyof Form, string> = {
  siteName: 'サイト名', headline: '見出し', tagline: 'サブコピー', accent: 'アクセントカラー', ctaLabel: 'CTA ラベル', showWorks: '実績セクションを表示',
}

const U = {
  bg: '#F4F5F8', panel: '#FFFFFF', line: '#E3E6EC', text: '#1F2430', muted: '#6B7280', indigo: '#6366F1',
}

function diffKeys(a: Form, b: Form): (keyof Form)[] {
  return (Object.keys(a) as (keyof Form)[]).filter(k => a[k] !== b[k])
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: U.muted, marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: 13,
  border: `1px solid ${U.line}`, borderRadius: 8, color: U.text, background: '#fff', fontFamily: 'inherit',
}

export function KnitDemo() {
  const [form, setForm] = useState<Form>(INITIAL)
  const [published, setPublished] = useState<Form>(INITIAL)
  const [version, setVersion] = useState(7)
  const [history, setHistory] = useState<string[]>(['v7 公開 — 初期コンテンツ'])

  const changed = diffKeys(form, published)
  const dirty = changed.length > 0
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(f => ({ ...f, [k]: v }))

  const publish = () => {
    if (!dirty) return
    const nv = version + 1
    setPublished(form); setVersion(nv)
    setHistory(h => [`v${nv} 公開 — ${changed.map(k => FIELD_LABELS[k]).join('・')} を変更`, ...h])
  }
  const rollback = () => setForm(published)

  return (
    <div style={{ minHeight: '100vh', background: U.bg, color: U.text, fontFamily: 'system-ui, sans-serif', paddingBottom: 96 }}>
      {/* トップツールバー */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: U.panel, borderBottom: `1px solid ${U.line}`, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 17, fontWeight: 800 }}>🧶 Knit</span>
        <span style={{ fontSize: 11, color: U.muted, border: `1px solid ${U.line}`, borderRadius: 4, padding: '2px 8px' }}>site: lienrapport</span>
        <span style={{
          fontSize: 11.5, fontWeight: 700, borderRadius: 999, padding: '3px 10px',
          background: dirty ? '#FEF3C7' : '#DCFCE7', color: dirty ? '#92400E' : '#166534',
        }}>
          {dirty ? `● 下書きの変更あり（${changed.length}項目）` : '✓ 公開済み'}
        </span>
        <span style={{ fontSize: 11.5, color: U.muted }}>現在: v{version}</span>
        <span style={{ flex: 1 }} />
        <button onClick={rollback} disabled={!dirty}
          style={{ padding: '7px 14px', fontSize: 12.5, fontWeight: 600, borderRadius: 8, border: `1px solid ${U.line}`, background: '#fff', color: dirty ? U.text : '#B5BAC4', cursor: dirty ? 'pointer' : 'default' }}>
          ↺ 変更を破棄
        </button>
        <button onClick={publish} disabled={!dirty}
          style={{ padding: '7px 16px', fontSize: 12.5, fontWeight: 700, borderRadius: 8, border: 'none', background: dirty ? U.indigo : '#C7CBD6', color: '#fff', cursor: dirty ? 'pointer' : 'default' }}>
          公開する
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 360px) minmax(0, 1fr)', gap: 16, padding: 16, maxWidth: 1200, margin: '0 auto', alignItems: 'start' }}>
        {/* 左: スキーマ駆動フォーム */}
        <section style={{ background: U.panel, border: `1px solid ${U.line}`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>AutoForm</h2>
            <span style={{ fontSize: 10.5, color: U.indigo, background: '#EEF0FE', borderRadius: 4, padding: '1px 6px' }}>schema 駆動</span>
          </div>

          <Field label={FIELD_LABELS.siteName}>
            <input style={inputStyle} value={form.siteName} onChange={e => set('siteName', e.target.value)} />
          </Field>
          <Field label={FIELD_LABELS.headline}>
            <input style={inputStyle} value={form.headline} onChange={e => set('headline', e.target.value)} />
          </Field>
          <Field label={FIELD_LABELS.tagline}>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} value={form.tagline} onChange={e => set('tagline', e.target.value)} />
          </Field>
          <Field label={FIELD_LABELS.accent}>
            <div style={{ display: 'flex', gap: 8 }}>
              {ACCENTS.map(c => (
                <button key={c} onClick={() => set('accent', c)} aria-label={c}
                  style={{ width: 26, height: 26, borderRadius: 7, background: c, cursor: 'pointer', border: form.accent === c ? '2px solid #1F2430' : `1px solid ${U.line}`, outline: form.accent === c ? `2px solid ${c}55` : 'none' }} />
              ))}
            </div>
          </Field>
          <Field label={FIELD_LABELS.ctaLabel}>
            <input style={inputStyle} value={form.ctaLabel} onChange={e => set('ctaLabel', e.target.value)} />
          </Field>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
            <input type="checkbox" checked={form.showWorks} onChange={e => set('showWorks', e.target.checked)} />
            {FIELD_LABELS.showWorks}
          </label>

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px solid ${U.line}` }}>
            <p style={{ margin: '0 0 8px', fontSize: 11.5, fontWeight: 700, color: U.muted }}>バージョン履歴</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {history.slice(0, 4).map((h, i) => (
                <li key={i} style={{ fontSize: 11, color: i === 0 ? U.text : U.muted, display: 'flex', gap: 6 }}>
                  <span style={{ color: U.indigo }}>◷</span>{h}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 右: ライブプレビュー */}
        <section style={{ border: `1px solid ${U.line}`, borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#F8F9FB', borderBottom: `1px solid ${U.line}` }}>
            <span style={{ display: 'flex', gap: 5 }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            </span>
            <span style={{ fontSize: 11.5, color: U.muted, marginLeft: 6 }}>ライブプレビュー — lienrapport.jp</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 10.5, color: U.indigo }}>編集が即時反映 ↻</span>
          </div>

          {/* プレビュー本体（form の値で描画） */}
          <div style={{ padding: '0' }}>
            <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${U.line}` }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>{form.siteName || 'Untitled'}</span>
              <span style={{ background: form.accent, color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '6px 14px', borderRadius: 8 }}>{form.ctaLabel || 'CTA'}</span>
            </div>
            <div style={{ padding: '44px 22px 52px', background: `linear-gradient(180deg, ${form.accent}0F, transparent)` }}>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, lineHeight: 1.3, maxWidth: 620 }}>{form.headline || '見出しを入力'}</h1>
              <p style={{ margin: '16px 0 0', fontSize: 14.5, color: U.muted, maxWidth: 560, lineHeight: 1.7 }}>{form.tagline}</p>
              <button style={{ marginTop: 26, background: form.accent, color: '#fff', border: 'none', borderRadius: 9, padding: '12px 26px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                {form.ctaLabel || 'CTA'} →
              </button>
            </div>
            {form.showWorks && (
              <div style={{ padding: '24px 22px 36px', borderTop: `1px solid ${U.line}` }}>
                <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: form.accent }}>WORKS</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {['動画制作', 'LINE構築', 'チラシ'].map(w => (
                    <div key={w} style={{ border: `1px solid ${U.line}`, borderRadius: 10, padding: 14 }}>
                      <div style={{ height: 56, borderRadius: 6, background: `${form.accent}1A`, marginBottom: 8 }} />
                      <span style={{ fontSize: 12.5, fontWeight: 600 }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <DemoBanner />
    </div>
  )
}
