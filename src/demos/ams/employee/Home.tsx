// 2026-04-22 claude-sonnet-4-6 セッションターン数：1
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useMockAuth } from '../MockAuthContext'

type PunchState = 'idle' | 'working' | 'done'

function LiveClock() {
  const [time, setTime] = useState(() => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
  })
  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date()
      setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`)
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="bg-sumi-950 text-white flex flex-col items-center justify-center py-12 px-6">
      <p className="text-xs font-heading font-black uppercase tracking-widest text-sumi-400 mb-3">現在時刻</p>
      <div className="font-mono text-6xl font-bold tracking-widest tabular-nums">{time}</div>
    </div>
  )
}

const MENU = [
  { to: '/demo/ams/attendance', label: '勤怠照会', desc: '打刻履歴・修正申請', accent: 'bg-matsu',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={2}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" strokeLinecap="round" /></svg> },
  { to: '/demo/ams/shift',      label: 'シフト申請', desc: '申請・カレンダー確認', accent: 'bg-shu',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4" strokeLinecap="round" /></svg> },
  { to: '/demo/ams/leave',      label: '有給管理', desc: '残日数・申請フォーム', accent: 'bg-bauhaus-yellow',
    icon: <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M8 2v4M16 2v4M12 14v4M10 16h4" strokeLinecap="round" /></svg> },
]

export default function Home() {
  const { user } = useMockAuth()
  const [state, setState] = useState<PunchState>('idle')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime]     = useState('')
  const [confirm, setConfirm]     = useState<'in' | 'out' | null>(null)
  const [pendingTime, setPendingTime] = useState('')

  const today = new Date()
  const todayStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日（${['日','月','火','水','木','金','土'][today.getDay()]}）`

  function now() {
    const d = new Date()
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }
  function handleClockIn()  { setPendingTime(now()); setConfirm('in') }
  function handleClockOut() { setPendingTime(now()); setConfirm('out') }
  function confirmAction() {
    if (confirm === 'in') { setStartTime(pendingTime); setState('working') }
    else                  { setEndTime(pendingTime);   setState('done') }
    setConfirm(null)
  }
  const workMin = state === 'done' && startTime && endTime
    ? (() => {
        const [sh, sm] = startTime.split(':').map(Number)
        const [eh, em] = endTime.split(':').map(Number)
        return Math.max(0, (eh * 60 + em) - (sh * 60 + sm) - 60)
      })()
    : 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ウェルカムカード */}
      <div className="relative border-2 border-bauhaus-black shadow-bauhaus overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-24 h-full bg-bauhaus-yellow" />
        <div className="absolute top-0 right-24 w-4 h-full bg-bauhaus-red" />
        <div className="absolute top-1/2 right-4 w-16 h-16 rounded-full border-[3px] border-bauhaus-red flex items-center justify-center z-10"
          style={{ boxShadow: '3px 3px 0 #121212', transform: 'translateY(-50%) rotate(12deg)' }}>
          <span className="text-2xl font-heading font-black text-bauhaus-red" style={{ textShadow: '2px 2px 0 #121212' }}>勤</span>
        </div>
        <div className="relative z-10 px-8 py-8 pr-36">
          <p className="text-xs font-heading font-black uppercase tracking-widest text-sumi-400 mb-1">Welcome.</p>
          <h1 className="text-3xl font-heading font-black text-bauhaus-black leading-tight">
            {user.displayName}<span className="text-bauhaus-red">.</span>
          </h1>
          <p className="text-base text-sumi-500 mt-2">{todayStr}</p>
        </div>
      </div>

      {/* 打刻セクション */}
      <div className="border-2 border-bauhaus-black shadow-bauhaus overflow-hidden">
        <div className="bg-bauhaus-black text-white px-5 py-2.5 flex items-center gap-2">
          <span className="text-xs font-heading font-black uppercase tracking-widest">打刻</span>
        </div>
        <div className="lg:grid lg:grid-cols-2">
          <LiveClock />
          <div className="bg-white p-8 flex flex-col justify-center gap-4">
            {state === 'working' && (
              <div className="flex items-center gap-3 bg-matsu/10 border-l-4 border-matsu px-4 py-3">
                <span className="w-2 h-2 rounded-full bg-matsu animate-pulse" />
                <span className="text-sm font-heading font-bold text-matsu">{startTime} 出勤中</span>
              </div>
            )}
            {state === 'idle' && (
              <button type="button" onClick={handleClockIn}
                className="w-full py-6 font-heading font-black text-xl uppercase tracking-wide bg-matsu text-white border-2 border-bauhaus-black shadow-bauhaus-sm hover:shadow-bauhaus hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
                出勤打刻
              </button>
            )}
            {state === 'working' && (
              <button type="button" onClick={handleClockOut}
                className="w-full py-6 font-heading font-black text-xl uppercase tracking-wide bg-shu text-white border-2 border-bauhaus-black shadow-bauhaus-sm hover:shadow-bauhaus hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
                退勤打刻
              </button>
            )}
            {state === 'done' && (
              <div className="border-2 border-bauhaus-black p-6 text-center bg-sumi-50">
                <p className="font-heading font-black text-xl text-bauhaus-black">
                  お疲れ様でした<span className="text-bauhaus-red">.</span>
                </p>
                <p className="text-sm text-sumi-500 mt-2">
                  {startTime} — {endTime}　実働 {Math.floor(workMin / 60)}h{String(workMin % 60).padStart(2,'0')}m
                </p>
              </div>
            )}
            <p className="text-xs text-sumi-400 text-center font-heading">ボタンを押して打刻を記録してください</p>
          </div>
        </div>
      </div>

      {/* メニュー */}
      <div>
        <h2 className="font-heading font-black text-xs uppercase tracking-widest text-sumi-400 mb-3">メニュー</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MENU.map(m => (
            <Link key={m.to} to={m.to}
              className="flex sm:flex-col items-center sm:items-start gap-4 p-5 bg-white border-2 border-bauhaus-black shadow-bauhaus-sm hover:shadow-bauhaus hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all">
              <div className={`w-12 h-12 flex items-center justify-center shrink-0 text-white ${m.accent}`}>
                {m.icon}
              </div>
              <div>
                <div className="font-heading font-black text-base text-bauhaus-black uppercase tracking-tight">{m.label}</div>
                <div className="text-sm text-sumi-400 mt-0.5">{m.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 確認ダイアログ */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-8 max-w-sm w-full mx-4">
            <h3 className="font-heading font-black text-lg uppercase text-bauhaus-black mb-3">
              {confirm === 'in' ? '出勤確認' : '退勤確認'}<span className="text-bauhaus-red">.</span>
            </h3>
            <p className="text-base text-sumi-600 mb-6">
              {pendingTime} に{confirm === 'in' ? '出勤' : '退勤'}登録します。
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setConfirm(null)}
                className="flex-1 py-3 border-2 border-bauhaus-black font-heading font-black text-sm uppercase hover:bg-sumi-50 transition-colors">
                キャンセル
              </button>
              <button type="button" onClick={confirmAction}
                className="flex-1 py-3 bg-bauhaus-black text-white border-2 border-bauhaus-black font-heading font-black text-sm uppercase hover:bg-sumi-800 transition-colors">
                確定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
