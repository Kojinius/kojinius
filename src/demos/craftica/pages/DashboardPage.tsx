// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// ダッシュボード — manager+ ホーム + member ホーム

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Flag, Sparkles, Calendar, Check, MessageSquare, Grid2x2, LayoutGrid, Users, BookOpen, TrendingUp, Heart, Lock, Globe, Star } from 'lucide-react'
import { useMockAuth } from '../MockAuthContext'
import { MOCK_BANKS, MOCK_COURSES, MOCK_PROGRESS, MEMBER_LIST, MOCK_CHATS, MOCK_DELIVERABLES, MOCK_TROPHIES_BY_UID } from '../mockData'
import { colorOf, COURSE_TYPE_EMOJI } from '../types'
import { TrophyShelf } from '../components/TrophyShelf'
import { CertificateSection } from '../components/CertificateSection'

function Avatar({ hex, name, size = 32 }: { hex: string; name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: hex, color: 'white',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
      boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.1), 0 1px 2px rgba(60,45,25,0.12)',
    }}>
      {name.charAt(0)}
    </div>
  )
}

function ProgressBar({ pct, color = 'var(--clay)', height = 6 }: { pct: number; color?: string; height?: number }) {
  return (
    <div style={{ width: '100%', height, background: 'var(--paper-3)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.6s' }} />
    </div>
  )
}

type Tone = 'leaf' | 'sun' | 'clay' | 'sky'
const TONE_MAP: Record<Tone, { bg: string; fg: string }> = {
  leaf: { bg: 'var(--leaf-soft)', fg: 'var(--leaf)' },
  sun:  { bg: 'var(--sun-soft)',  fg: '#8B6914' },
  clay: { bg: 'var(--clay-soft)', fg: 'var(--clay-deep)' },
  sky:  { bg: 'var(--sky-soft)',  fg: 'var(--sky)' },
}

function MetricCard({ label, big, sub, tone, icon, extra, trend }: {
  label: string; big: string; sub: string; tone: Tone; icon: React.ReactNode; extra?: React.ReactNode; trend?: boolean
}) {
  const t = TONE_MAP[tone]
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>{label}</span>
        <span style={{
          width: 30, height: 30, borderRadius: 10, background: t.bg, color: t.fg,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>{icon}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 6, color: 'var(--ink)' }}>{big}</div>
      {extra && <div style={{ marginBottom: 6 }}>{extra}</div>}
      <div style={{ fontSize: 12, color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {trend && <TrendingUp size={12} />}
        {sub}
      </div>
    </div>
  )
}

function Section({ title, subtitle, action, children, mb = 0 }: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; mb?: number
}) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: 20, marginBottom: mb }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>{title}</h2>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function ManagerDashboard() {
  const navigate = useNavigate()

  // KPI 計算
  const stats = useMemo(() => {
    const totalCourses = MOCK_PROGRESS.length
    const completed = MOCK_PROGRESS.filter(p => p.status === '完了').length
    const inProgress = MOCK_PROGRESS.filter(p => p.status === '着手中').length
    const weekCompleted = Math.round(completed * 0.18)
    const donePct = Math.round((completed / totalCourses) * 100)
    const aiMessages = MOCK_CHATS.reduce((s, c) => s + c.messages.length, 0) + 27
    const activeMembers = new Set(MOCK_PROGRESS.filter(p => p.status === '着手中').map(p => p.uid)).size
    return { totalCourses, completed, inProgress, weekCompleted, donePct, aiMessages, activeMembers }
  }, [])

  const memberRows = useMemo(() => {
    const courses = MOCK_COURSES
    return MEMBER_LIST.map(m => {
      const myProgs = MOCK_PROGRESS.filter(p => p.uid === m.uid)
      const total = myProgs.length || 1
      const done = myProgs.filter(p => p.status === '完了').length
      const pct = Math.round((done / total) * 100)
      const cells: number[] = []
      myProgs.slice(0, 17).forEach(p => cells.push(p.status === '完了' ? 2 : p.status === '着手中' ? 1 : 0))
      while (cells.length < 17) cells.push(0)
      return { ...m, color: colorOf(m.memberKey), done, total, pct, cells, courseCount: courses.length }
    })
  }, [])

  const activity = useMemo(() => {
    const items: { id: string; uid: string; displayName: string; memberKey: string; kind: 'done' | 'start' | 'reflect'; courseTitle: string; ago: string }[] = []
    MOCK_PROGRESS.slice(0, 16).forEach((p, i) => {
      const member = MEMBER_LIST.find(m => m.uid === p.uid)
      const course = MOCK_COURSES.find(c => c.id === p.courseId)
      if (!member || !course) return
      const kind = p.status === '完了' ? 'done' : p.status === '着手中' ? 'start' : 'reflect'
      items.push({
        id: `act-${i}`, uid: p.uid, displayName: member.displayName, memberKey: member.memberKey,
        kind, courseTitle: course.title, ago: `${(i % 6) + 1} 時間前`,
      })
    })
    return items.slice(0, 8)
  }, [])

  const gallery = useMemo(() => MOCK_DELIVERABLES.slice(0, 6).map(d => {
    const course = MOCK_COURSES.find(c => c.id === d.courseId)!
    const member = MEMBER_LIST.find(m => m.uid === d.uid)!
    return { ...d, course, member, color: colorOf(member.memberKey) }
  }), [])

  return (
    <div style={{ paddingBottom: 28 }}>
      {/* ヘッダー */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 12,
        alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28,
      }}>
        <div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500, marginBottom: 6 }}>
            おかえりなさい 🌱
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
            ダッシュボード
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="ck-btn-ghost">
            <Calendar size={15} /> 5月の振り返り
          </button>
          <button type="button" className="ck-btn-primary" onClick={() => navigate('/demo/craftica/dashboard/plan')}>
            <Sparkles size={15} /> AIで課題バンクを作る
          </button>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricCard label="完了率"      big={`${stats.donePct}%`}        tone="leaf" icon={<Check size={16} />} sub={`${stats.completed}/${stats.totalCourses} 課題`} extra={<ProgressBar pct={stats.donePct} color="var(--leaf)" />} />
        <MetricCard label="今週の完了"  big={String(stats.weekCompleted)} tone="sun"  icon={<Trophy size={16} />} sub="先週比 +3" trend />
        <MetricCard label="着手中"      big={String(stats.inProgress)}    tone="clay" icon={<Flag size={16} />} sub={`稼働メンバー ${stats.activeMembers}名`} />
        <MetricCard label="AIチャット"  big={String(stats.aiMessages)}    tone="sky"  icon={<MessageSquare size={16} />} sub="今週のメッセージ数" />
      </div>

      {/* メンバー + 動き */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 20, marginBottom: 24 }}>
        <Section title="みんなの様子" subtitle="メンバーの全体進捗">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {memberRows.map(m => (
              <div key={m.uid} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 4px' }}>
                <Avatar hex={m.color.hex} name={m.displayName} size={36} />
                <div style={{ minWidth: 70 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{m.displayName}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{m.done}/{m.total} 完了</div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <ProgressBar pct={m.pct} color={m.color.hex} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: m.color.hex, minWidth: 38, textAlign: 'right' }}>{m.pct}%</span>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {m.cells.map((v, i) => (
                    <div key={i} style={{
                      width: 6, height: 14, borderRadius: 2,
                      background: v === 2 ? m.color.hex : v === 1 ? m.color.soft : 'var(--paper-3)',
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="最近の動き" subtitle="この24時間">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activity.map((a, i, arr) => {
              const c = colorOf(a.memberKey)
              const kindStyle = a.kind === 'done'
                ? { bg: 'var(--leaf-soft)', fg: 'var(--leaf)', icon: <Check size={11} />, label: 'が完了' }
                : a.kind === 'start'
                ? { bg: 'var(--sun-soft)', fg: '#8B6914', icon: <Flag size={11} />, label: 'に着手' }
                : { bg: 'var(--berry-soft)', fg: 'var(--berry)', icon: <Heart size={11} />, label: 'に振り返り' }
              return (
                <div key={a.id} style={{ display: 'flex', gap: 12, position: 'relative', paddingBottom: i === arr.length - 1 ? 0 : 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <Avatar hex={c.hex} name={a.displayName} size={26} />
                    {i !== arr.length - 1 && <div style={{ flex: 1, width: 1, background: 'var(--line)' }} />}
                  </div>
                  <div style={{ flex: 1, paddingTop: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%', background: kindStyle.bg, color: kindStyle.fg,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>{kindStyle.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{a.displayName}</span>
                      <span style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 'auto' }}>{a.ago}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                      <strong style={{ fontWeight: 600 }}>{a.courseTitle}</strong>{kindStyle.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      </div>

      {/* 今週の作品 */}
      <Section title="今週の作品" subtitle="メンバーが完了した成果物" mb={24}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {gallery.map(g => {
            const seed = (g.course.title.charCodeAt(0) ?? 0)
            const deg = (seed * 7 + g.thumbColorIdx * 31) % 180
            const bg = `linear-gradient(${deg}deg, ${g.color.soft} 0%, ${g.color.hex}55 60%, ${g.color.soft} 100%)`
            return (
              <div key={g.id} style={{
                borderRadius: 16, overflow: 'hidden',
                background: 'var(--card)', border: '1px solid var(--line)',
              }}>
                <div style={{ aspectRatio: '4/5', background: bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                  {COURSE_TYPE_EMOJI[g.course.type]}
                  <div style={{
                    position: 'absolute', top: 8, left: 8,
                    padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: 'rgba(255,255,255,0.95)', color: 'var(--ink-2)',
                  }}>
                    {COURSE_TYPE_EMOJI[g.course.type]} {g.course.type}
                  </div>
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.course.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Avatar hex={g.color.hex} name={g.member.displayName} size={18} />
                      <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{g.member.displayName}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{g.completedAt}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* バンク */}
      <Section
        title="課題バンク"
        subtitle="公開中 / 非公開で分割"
        action={
          <button type="button" className="ck-btn-ghost" onClick={() => navigate('/demo/craftica/dashboard/plan')}>
            <Sparkles size={13} /> AIで作成
          </button>
        }
      >
        <BankSection title="🌐 公開中" banks={MOCK_BANKS.filter(b => b.isPublic)} />
        <div style={{ height: 18 }} />
        <BankSection title="🔒 非公開" banks={MOCK_BANKS.filter(b => !b.isPublic)} />
      </Section>
    </div>
  )
}

function BankSection({ title, banks }: { title: string; banks: typeof MOCK_BANKS }) {
  const navigate = useNavigate()
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {title}
        <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{banks.length}</span>
      </div>
      {banks.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--ink-4)', padding: '8px 0' }}>該当なし</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {banks.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => navigate(`/demo/craftica/dashboard/banks/${b.id}`)}
              className="ck-card ck-card-interactive"
              style={{
                padding: 18, textAlign: 'left',
                position: 'relative',
                borderColor: i === 0 && b.isPublic ? 'var(--clay)' : 'var(--line)',
              }}
            >
              {i === 0 && b.isPublic && (
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  padding: '2px 8px', borderRadius: 6,
                  background: 'var(--clay)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                }}>進行中</span>
              )}
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--clay-soft)', color: 'var(--clay-deep)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Grid2x2 size={18} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>{b.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, marginBottom: 12, lineHeight: 1.6 }}>{b.description}</p>
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--ink-3)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><LayoutGrid size={11} />{b.courseCount}課題</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Users size={11} />{b.memberUids.length}人</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><BookOpen size={11} />{b.difficultyLevels.length}難度</span>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  {b.isPublic ? <><Globe size={11} />公開</> : <><Lock size={11} />非公開</>}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MemberDashboard() {
  const { user } = useMockAuth()
  const navigate = useNavigate()

  const myBanks = useMemo(() => MOCK_BANKS.filter(b => b.memberUids.includes(user!.uid)), [user])
  const otherBanks = useMemo(() => MOCK_BANKS.filter(b => b.isPublic && !b.memberUids.includes(user!.uid)), [user])
  const myTrophies = MOCK_TROPHIES_BY_UID[user!.uid] || []

  return (
    <div style={{ paddingBottom: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500, marginBottom: 6 }}>
          こんにちは、{user!.displayName} さん 🌱
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
          マイページ
        </h1>
      </div>

      {/* Trophies */}
      <Section title="🏆 獲得トロフィー" subtitle="課題完了 + 振り返り記入で獲得" mb={24}>
        <TrophyShelf trophies={myTrophies} />
      </Section>

      {/* 受講中課題 */}
      <Section title="あなたの学習" subtitle="アサインされたバンク" mb={24}>
        {myBanks.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>まだバンクが割り当てられていません。</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {myBanks.map(b => {
              const myProgs = MOCK_PROGRESS.filter(p => p.uid === user!.uid && p.bankId === b.id)
              const total = myProgs.length || 1
              const done = myProgs.filter(p => p.status === '完了').length
              const pct = Math.round((done / total) * 100)
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => navigate(`/demo/craftica/dashboard/banks/${b.id}`)}
                  className="ck-card ck-card-interactive"
                  style={{ padding: 18, textAlign: 'left' }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'var(--clay-soft)', color: 'var(--clay-deep)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                    <Grid2x2 size={18} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>{b.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, marginBottom: 12, lineHeight: 1.6 }}>{b.description}</p>
                  <ProgressBar pct={pct} color="var(--clay)" />
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{done}/{total} 完了</span>
                    <strong style={{ color: 'var(--clay)' }}>{pct}%</strong>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Section>

      {/* 修了証 */}
      <Section title="📜 修了証" subtitle="バンク完走で発行" mb={24}>
        <CertificateSection trophies={myTrophies} />
      </Section>

      {/* おすすめ */}
      <Section title="受講可能な課題" subtitle="気になる課題は ★ を付けてあとで取り組もう">
        {otherBanks.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>新しい公開バンクはありません。</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {otherBanks.map(b => (
              <div key={b.id} className="ck-card" style={{ padding: 18, position: 'relative' }}>
                <button
                  type="button"
                  title="気になる"
                  style={{
                    position: 'absolute', top: 12, right: 12,
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: 'var(--ink-4)',
                  }}
                  onClick={(e) => { e.stopPropagation(); e.currentTarget.style.color = 'var(--sun)' }}
                >
                  <Star size={18} />
                </button>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--sky-soft)', color: 'var(--sky)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 12,
                }}>
                  <Grid2x2 size={18} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px' }}>{b.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0, marginBottom: 8, lineHeight: 1.6 }}>{b.description}</p>
                <div style={{ display: 'flex', gap: 8, fontSize: 11, color: 'var(--ink-3)' }}>
                  <span>{b.courseCount}課題</span>
                  <span>•</span>
                  <span>{b.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useMockAuth()
  if (!user) return null
  return user.role === 'member' ? <MemberDashboard /> : <ManagerDashboard />
}
