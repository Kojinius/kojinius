// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// 課題詳細 — 進捗 + 振り返り + 成果物 + トロフィー演出

import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import { ChevronLeft, MessageSquare, Star, Send } from 'lucide-react'
import { useMockAuth } from '../MockAuthContext'
import { MOCK_BANKS, MOCK_COURSES, MOCK_REFLECTIONS, MOCK_DELIVERABLES, MEMBER_LIST, getProgressMap } from '../mockData'
import { COURSE_TYPE_EMOJI, colorOf } from '../types'
import type { ProgressStatus, Trophy } from '../types'
import { TrophyCelebrationModal } from '../components/TrophyCelebrationModal'
import { DeliverableCard } from '../components/DeliverableCard'

const STATUSES: ProgressStatus[] = ['未着手', '着手中', '完了']

export default function CourseDetailPage() {
  const { bankId, courseId } = useParams()
  const { user } = useMockAuth()
  const navigate = useNavigate()

  const bank = useMemo(() => MOCK_BANKS.find(b => b.id === bankId), [bankId])
  const course = useMemo(() => MOCK_COURSES.find(c => c.id === courseId), [courseId])
  const initialProgressMap = useMemo(() => getProgressMap(), [])

  // ローカル state（デモなので進捗・振り返りを画面上で書き換えられる）
  const [myStatus, setMyStatus] = useState<ProgressStatus>(() => {
    if (!user || user.role !== 'member') return '未着手'
    return initialProgressMap.get(`${user.uid}-${courseId}`)?.status ?? '未着手'
  })
  const [reflection, setReflection] = useState(() => {
    if (!user) return { goodPoints: '', improvements: '', nextActions: '' }
    const r = MOCK_REFLECTIONS.find(x => x.uid === user.uid && x.courseId === courseId)
    return r ? { goodPoints: r.goodPoints, improvements: r.improvements, nextActions: r.nextActions }
             : { goodPoints: '', improvements: '', nextActions: '' }
  })
  const [showTrophy, setShowTrophy] = useState<Trophy | null>(null)

  if (!bank || !course || !user) return <Navigate to="/demo/craftica/dashboard" replace />

  // メンバー進捗一覧（manager+ 向け）
  const memberProgress = MEMBER_LIST
    .filter(m => bank.memberUids.includes(m.uid))
    .map(m => ({ ...m, status: initialProgressMap.get(`${m.uid}-${course.id}`)?.status ?? '未着手', color: colorOf(m.memberKey) }))

  // 成果物一覧
  const deliverables = MOCK_DELIVERABLES.filter(d => d.courseId === course.id)

  const handleReflectionSubmit = () => {
    if (myStatus !== '完了') {
      alert('「完了」にしてから振り返りを保存してください。')
      return
    }
    if (!reflection.goodPoints.trim()) {
      alert('「よかった点」を入力してください。')
      return
    }
    setShowTrophy({
      bankId: bank.id,
      bankTitle: bank.title,
      courseId: course.id,
      courseTitle: course.title,
      tier: course.difficulty === '中級' ? 'gold' : course.difficulty === '初級' ? 'silver' : 'bronze',
      earnedAt: `${new Date().getMonth() + 1}/${new Date().getDate()}`,
    })
  }

  return (
    <div style={{ paddingBottom: 28 }}>
      <Link
        to={`/demo/craftica/dashboard/banks/${bank.id}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ink-3)', textDecoration: 'none', fontSize: 13, marginBottom: 12 }}
      >
        <ChevronLeft size={14} /> {bank.title} へ
      </Link>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: 24,
        marginBottom: 20, display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'var(--clay-soft)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          fontSize: 28,
        }}>
          {COURSE_TYPE_EMOJI[course.type]}
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <span className="ck-pill" style={{ background: 'var(--sky-soft)', color: 'var(--sky)', borderColor: 'transparent' }}>
              {course.type}
            </span>
            <span className="ck-pill" style={{ background: 'var(--sun-soft)', color: '#8B6914', borderColor: 'transparent' }}>
              {course.difficulty}
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: 'var(--ink)' }}>{course.title}</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0, lineHeight: 1.7 }}>{course.description}</p>
        </div>
        <button
          type="button"
          className="ck-btn-ghost"
          onClick={() => navigate('/demo/craftica/dashboard/chat')}
          style={{ flexShrink: 0 }}
        >
          <MessageSquare size={14} /> AI 講師に聞く
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 20 }}>
        {/* 左カラム */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 提出仕様 */}
          <section style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px', color: 'var(--ink)' }}>📝 提出仕様</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.7 }}>{course.deliverableSpec}</p>
          </section>

          {/* 進捗 */}
          <section style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: 'var(--ink)' }}>
              📊 進捗 {user.role !== 'member' && '（メンバー別）'}
            </h2>

            {user.role === 'member' ? (
              <div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMyStatus(s)}
                      style={{
                        flex: 1, padding: '8px 10px', borderRadius: 10,
                        border: '1.5px solid',
                        borderColor: myStatus === s ? 'var(--clay)' : 'var(--line)',
                        background: myStatus === s ? 'var(--clay)' : 'var(--card)',
                        color: myStatus === s ? '#fff' : 'var(--ink-2)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 8, marginBottom: 0 }}>
                  ※ デモ用に操作可能。実環境では自動更新（AI 提出検出）+ 手動切替の併用。
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {memberProgress.map(m => (
                  <div key={m.uid} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 10px', borderRadius: 10, background: 'var(--paper-2)',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: m.color.hex, color: '#fff',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                    }}>{m.initial}</div>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{m.displayName}</span>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                      background: m.status === '完了' ? 'var(--leaf-soft)' : m.status === '着手中' ? 'var(--sun-soft)' : 'var(--paper-3)',
                      color:      m.status === '完了' ? 'var(--leaf)'      : m.status === '着手中' ? '#8B6914'         : 'var(--ink-3)',
                    }}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* 右カラム — 振り返り */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: 'var(--ink)' }}>
              💭 振り返り（あなた）
            </h2>

            <Field label="よかった点" emoji="✨">
              <textarea
                value={reflection.goodPoints}
                onChange={(e) => setReflection(r => ({ ...r, goodPoints: e.target.value }))}
                placeholder="うまくできたこと、新しく学んだこと"
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </Field>
            <Field label="改善できる点" emoji="🔧">
              <textarea
                value={reflection.improvements}
                onChange={(e) => setReflection(r => ({ ...r, improvements: e.target.value }))}
                placeholder="もう少し意識したいこと"
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </Field>
            <Field label="次にやること" emoji="🎯">
              <textarea
                value={reflection.nextActions}
                onChange={(e) => setReflection(r => ({ ...r, nextActions: e.target.value }))}
                placeholder="次の課題で意識したいこと"
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </Field>

            <button
              type="button"
              onClick={handleReflectionSubmit}
              className="ck-btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
            >
              <Star size={14} />
              {myStatus === '完了' ? '振り返りを送信 → トロフィー獲得' : '完了 + 振り返りで獲得'}
            </button>
            <p style={{ fontSize: 11, color: 'var(--ink-4)', textAlign: 'center', marginTop: 8, marginBottom: 0 }}>
              <Send size={10} style={{ verticalAlign: 'middle' }} /> 先生にも自動共有
            </p>
          </section>
        </div>
      </div>

      {/* 成果物 */}
      {deliverables.length > 0 && (
        <section style={{
          background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 18, marginTop: 20,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: 'var(--ink)' }}>🎨 みんなの成果物</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {deliverables.map(d => {
              const member = MEMBER_LIST.find(m => m.uid === d.uid)
              if (!member) return null
              return (
                <DeliverableCard
                  key={d.id}
                  deliverable={d}
                  course={course}
                  memberKey={member.memberKey}
                  memberName={member.displayName}
                />
              )
            })}
          </div>
        </section>
      )}

      {showTrophy && (
        <TrophyCelebrationModal trophy={showTrophy} onClose={() => setShowTrophy(null)} />
      )}
    </div>
  )
}

function Field({ label, emoji, children }: { label: string; emoji: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'inline-flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
        <span>{emoji}</span>{label}
      </span>
      {children}
    </label>
  )
}
