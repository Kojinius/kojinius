// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// 管理 — 課題管理：全バンク・全コースの俯瞰

import { MOCK_BANKS, MOCK_COURSES, MOCK_PROGRESS } from '../../mockData'
import { COURSE_TYPE_EMOJI } from '../../types'

export default function CoursesPage() {
  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          課題管理
        </h1>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>
          全バンク・全コースの俯瞰。詳細編集はバンクカードからの個別画面で。
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {MOCK_BANKS.map(bank => {
          const courses = MOCK_COURSES.filter(c => c.bankId === bank.id)
          const total = courses.length * bank.memberUids.length
          const done = MOCK_PROGRESS.filter(p => p.bankId === bank.id && p.status === '完了').length
          const pct = total > 0 ? Math.round((done / total) * 100) : 0

          return (
            <div key={bank.id} style={{
              background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 18,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>{bank.title}</h2>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '4px 0 0' }}>{bank.description}</p>
                </div>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <Stat label="課題数"     value={`${courses.length}`} />
                  <Stat label="メンバー"   value={`${bank.memberUids.length}`} />
                  <Stat label="完了率"     value={`${pct}%`} highlight />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {courses.map(c => {
                  const courseProgs = MOCK_PROGRESS.filter(p => p.courseId === c.id)
                  const cTotal = courseProgs.length || 1
                  const cDone = courseProgs.filter(p => p.status === '完了').length
                  const cPct = Math.round((cDone / cTotal) * 100)
                  return (
                    <div key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 8, background: 'var(--paper-2)',
                    }}>
                      <span style={{ fontSize: 18 }}>{COURSE_TYPE_EMOJI[c.type]}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.title}</span>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{c.type}</span>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{c.difficulty}</span>
                      <div style={{ width: 80, height: 6, background: 'var(--paper-3)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${cPct}%`, height: '100%', background: 'var(--leaf)' }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--leaf)', fontWeight: 700, minWidth: 36, textAlign: 'right' }}>
                        {cPct}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color: highlight ? 'var(--clay)' : 'var(--ink)' }}>{value}</span>
    </div>
  )
}
