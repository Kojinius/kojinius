// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// 管理 — 先生管理：4 先生プリセットの編集 UI（デモ）

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { MOCK_TEACHERS } from '../../mockData'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState(MOCK_TEACHERS)

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          先生管理
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>
          4 先生プリセットの表示名・アイコンをカスタマイズできます。
          <strong style={{ color: 'var(--clay)' }}> AI のトーンプロンプトは不可変（システム保護）。</strong>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {teachers.map(t => (
          <div key={t.id} style={{
            background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16,
            padding: 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: t.color,
                  color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 700,
                }}>{t.initial}</div>
                <button type="button" style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--clay)', color: '#fff', border: '2px solid var(--card)',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }} title="アイコン変更">
                  <Camera size={11} />
                </button>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'monospace' }}>{t.id}</div>
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) => setTeachers(prev => prev.map(x => x.id === t.id ? { ...x, name: e.target.value } : x))}
                  style={{ marginTop: 4, fontSize: 16, fontWeight: 700, padding: '4px 8px', width: 180 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 4 }}>トーン</div>
              <div style={{
                padding: '8px 12px', borderRadius: 8, background: 'var(--paper-2)',
                fontSize: 12, color: 'var(--ink-2)', border: '1px dashed var(--line-2)',
              }}>
                {t.tone}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, marginBottom: 4 }}>tonePrompt（不可変）</div>
              <div style={{
                padding: '8px 12px', borderRadius: 8, background: 'var(--paper-3)',
                fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace',
                lineHeight: 1.55, opacity: 0.7,
              }}>
                あなたは「{t.name}」として、{t.tone}な口調で生徒の質問に答えてください。専門用語は最小限に、ステップバイステップで...
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
