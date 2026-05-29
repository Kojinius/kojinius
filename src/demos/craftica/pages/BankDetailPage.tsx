// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// バンク詳細 — 進捗グリッド（メンバー×課題マトリクス）

import { useMemo } from 'react'
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom'
import { Grid2x2, ChevronLeft, Globe, Lock, Users, BookOpen, LayoutGrid } from 'lucide-react'
import { MOCK_BANKS, MOCK_COURSES, MOCK_PROGRESS, MEMBER_LIST, getProgressMap } from '../mockData'
import { colorOf, COURSE_TYPE_EMOJI } from '../types'
import type { ProgressStatus } from '../types'
import { useMockAuth } from '../MockAuthContext'

const STATUS_LABEL: Record<ProgressStatus, string> = {
  未着手: '未着手',
  着手中: '着手中',
  完了:   '完了',
}

export default function BankDetailPage() {
  const { bankId } = useParams()
  const navigate = useNavigate()
  const { user } = useMockAuth()

  const bank = useMemo(() => MOCK_BANKS.find(b => b.id === bankId), [bankId])
  const courses = useMemo(() => MOCK_COURSES.filter(c => c.bankId === bankId).sort((a, b) => a.sortOrder - b.sortOrder), [bankId])
  const progressMap = useMemo(() => getProgressMap(), [])

  if (!bank) return <Navigate to="/demo/craftica/dashboard" replace />
  if (!user) return null

  // メンバー一覧。member は自分だけ、manager+ はバンクの member 全員
  const visibleMembers = user.role === 'member'
    ? MEMBER_LIST.filter(m => m.uid === user.uid)
    : MEMBER_LIST.filter(m => bank.memberUids.includes(m.uid))

  const completedCount = MOCK_PROGRESS.filter(p => p.bankId === bank.id && p.status === '完了').length
  const totalCells = bank.memberUids.length * courses.length
  const completionPct = totalCells > 0 ? Math.round((completedCount / totalCells) * 100) : 0

  return (
    <div style={{ paddingBottom: 28 }}>
      <Link
        to="/demo/craftica/dashboard"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ink-3)', textDecoration: 'none', fontSize: 13, marginBottom: 12 }}
      >
        <ChevronLeft size={14} /> ダッシュボードへ
      </Link>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: 24,
        marginBottom: 20, display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'var(--clay-soft)', color: 'var(--clay-deep)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Grid2x2 size={26} />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span className="ck-pill" style={{ background: 'var(--clay-soft)', color: 'var(--clay-deep)', borderColor: 'transparent' }}>
              {bank.category}
            </span>
            <span className="ck-pill" style={{
              background: bank.isPublic ? 'var(--leaf-soft)' : 'var(--paper-2)',
              color: bank.isPublic ? 'var(--leaf)' : 'var(--ink-3)',
              borderColor: 'transparent',
            }}>
              {bank.isPublic ? <><Globe size={11} />公開中</> : <><Lock size={11} />非公開</>}
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: 'var(--ink)' }}>{bank.title}</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0, lineHeight: 1.7 }}>{bank.description}</p>
          {bank.notes && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--sun-soft)', borderRadius: 8, fontSize: 12, color: '#8B6914' }}>
              💭 {bank.notes}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 18, padding: '0 8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Stat icon={<LayoutGrid size={14} />} label="課題数"     value={`${courses.length}`} />
          <Stat icon={<Users size={14} />}       label="メンバー" value={`${bank.memberUids.length}`} />
          <Stat icon={<BookOpen size={14} />}    label="難度"     value={`${bank.difficultyLevels.length}`} />
          <Stat icon={<span style={{ fontSize: 14 }}>📈</span>} label="完了率"    value={`${completionPct}%`} highlight />
        </div>
      </div>

      {/* 進捗グリッド */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: 18,
        overflowX: 'auto',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px', color: 'var(--ink)' }}>
          進捗グリッド <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>（クリックで課題詳細へ）</span>
        </h2>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4, minWidth: '100%' }}>
          <thead>
            <tr>
              <th style={{
                position: 'sticky', left: 0, background: 'var(--card)', zIndex: 1,
                padding: '8px 12px', minWidth: 100, textAlign: 'left',
                fontSize: 11, color: 'var(--ink-3)', fontWeight: 600,
              }}>
                メンバー / 課題
              </th>
              {courses.map(c => (
                <th key={c.id} style={{
                  padding: '8px 6px', minWidth: 100, maxWidth: 120, verticalAlign: 'bottom',
                  background: 'var(--paper-2)', borderRadius: 8,
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{COURSE_TYPE_EMOJI[c.type]}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.3, textAlign: 'center' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 4 }}>{c.difficulty}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleMembers.map(m => {
              const color = colorOf(m.memberKey)
              return (
                <tr key={m.uid}>
                  <td style={{
                    position: 'sticky', left: 0, background: 'var(--card)', zIndex: 1,
                    padding: '8px 12px', minWidth: 100,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', background: color.hex, color: '#fff',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700,
                      }}>{m.initial}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{m.displayName}</span>
                    </div>
                  </td>
                  {courses.map(c => {
                    const p = progressMap.get(`${m.uid}-${c.id}`)
                    const status = p?.status ?? '未着手'
                    const isDone = status === '完了'
                    const isWip = status === '着手中'
                    const cellBg = isDone
                      ? `linear-gradient(135deg, ${color.soft} 0%, ${color.hex}33 60%, ${color.soft} 100%)`
                      : isWip ? 'var(--sun-soft)' : 'var(--paper-2)'
                    return (
                      <td key={c.id} style={{ padding: 0 }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/demo/craftica/dashboard/banks/${bank.id}/courses/${c.id}`)}
                          style={{
                            width: 100, height: 80, borderRadius: 10,
                            background: cellBg,
                            border: isDone ? `2px solid ${color.hex}` : isWip ? '2px solid var(--sun)' : '1px solid var(--line)',
                            cursor: 'pointer', position: 'relative',
                            transition: 'transform 120ms',
                            padding: 0,
                          }}
                          title={`${m.displayName} × ${c.title}: ${STATUS_LABEL[status]}`}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = '' }}
                        >
                          {isDone && (
                            <div style={{ fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              {COURSE_TYPE_EMOJI[c.type]}
                            </div>
                          )}
                          {isWip && (
                            <div style={{
                              fontSize: 10, color: '#8B6914', fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
                            }}>
                              着手中
                            </div>
                          )}
                          {status === '未着手' && (
                            <div style={{ fontSize: 10, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              ー
                            </div>
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* 凡例 */}
        <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 12, color: 'var(--ink-3)', flexWrap: 'wrap' }}>
          <Legend swatch="linear-gradient(135deg, #DCEAD2 0%, #5B8C5A55 60%, #DCEAD2 100%)" label="完了（成果物あり）" borderColor="#5B8C5A" />
          <Legend swatch="var(--sun-soft)" label="着手中" borderColor="var(--sun)" />
          <Legend swatch="var(--paper-2)" label="未着手" borderColor="var(--line)" />
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
      <span style={{ fontSize: 11, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{icon}{label}</span>
      <span style={{ fontSize: 18, fontWeight: 700, color: highlight ? 'var(--clay)' : 'var(--ink)' }}>{value}</span>
    </div>
  )
}

function Legend({ swatch, label, borderColor }: { swatch: string; label: string; borderColor: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 18, height: 14, background: swatch, border: `1.5px solid ${borderColor}`, borderRadius: 4 }} />
      {label}
    </span>
  )
}
