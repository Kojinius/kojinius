// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'
import { SELF_ATTENDANCE, minutesToHHMM, ATTENDANCE_TYPE_COLORS, WORK_TYPES } from '../mockData'

type View = 'table' | 'chart'

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${className}`}>{children}</span>
}

function CorrectionModal({ date, onClose }: { date: string; onClose: () => void }) {
  const [type, setType] = useState('通常')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('18:00')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (submitted) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-6 max-w-sm w-full mx-4 text-center">
        <div className="text-3xl mb-3">✅</div>
        <p className="font-heading font-black text-base">修正申請を送信しました</p>
        <p className="text-xs text-sumi-500 mt-1">管理者の承認をお待ちください</p>
        <button type="button" onClick={onClose} className="mt-4 w-full py-2 bg-bauhaus-black text-white font-heading font-black text-sm uppercase border-2 border-bauhaus-black">閉じる</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-5 max-w-sm w-full mx-4">
        <h3 className="font-heading font-black text-sm uppercase mb-3">修正申請 — {date}<span className="text-bauhaus-red">.</span></h3>
        <div className="space-y-3 text-sm">
          <div>
            <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">勤務種別</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full border-2 border-sumi-200 px-2 py-1.5 text-sm font-body focus:border-bauhaus-black outline-none">
              {WORK_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">出勤時刻</label>
              <input type="time" value={start} onChange={e => setStart(e.target.value)}
                className="w-full border-2 border-sumi-200 px-2 py-1.5 text-sm focus:border-bauhaus-black outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">退勤時刻</label>
              <input type="time" value={end} onChange={e => setEnd(e.target.value)}
                className="w-full border-2 border-sumi-200 px-2 py-1.5 text-sm focus:border-bauhaus-black outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">修正理由 <span className="text-shu">*</span></label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              className="w-full border-2 border-sumi-200 px-2 py-1.5 text-sm resize-none focus:border-bauhaus-black outline-none" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border-2 border-bauhaus-black font-heading font-black text-xs uppercase hover:bg-sumi-50">キャンセル</button>
            <button type="button" onClick={() => setSubmitted(true)} disabled={!reason.trim()}
              className="flex-1 py-2 bg-bauhaus-black text-white border-2 border-bauhaus-black font-heading font-black text-xs uppercase disabled:opacity-40">申請</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AttendanceList() {
  const [view, setView] = useState<View>('table')
  const [from, setFrom] = useState('2026-04-01')
  const [to, setTo]     = useState('2026-04-30')
  const [corrDate, setCorrDate] = useState<string | null>(null)

  const filtered = SELF_ATTENDANCE.filter(r => r.date >= from && r.date <= to)
  const sorted   = [...filtered].sort((a, b) => b.date.localeCompare(a.date))

  // チャート用: 日別実働時間
  const maxMin = Math.max(...sorted.map(r => r.workMinutes), 1)

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-black uppercase text-bauhaus-black">
          勤怠照会<span className="text-bauhaus-red">.</span>
        </h2>
        <div className="flex rounded-sm border-2 border-bauhaus-black overflow-hidden">
          {(['table','chart'] as View[]).map(v => (
            <button key={v} type="button" onClick={() => setView(v)}
              className={`px-3 py-1 text-[10px] font-heading font-black uppercase transition-colors ${view === v ? 'bg-bauhaus-black text-white' : 'bg-white text-sumi-500 hover:bg-sumi-50'}`}>
              {v === 'table' ? '一覧' : 'グラフ'}
            </button>
          ))}
        </div>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-0.5">期間 開始</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border-2 border-sumi-200 px-2 py-1 text-xs focus:border-bauhaus-black outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-0.5">終了</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border-2 border-sumi-200 px-2 py-1 text-xs focus:border-bauhaus-black outline-none" />
        </div>
        <button type="button" onClick={() => { setFrom('2026-04-01'); setTo('2026-04-30') }}
          className="px-3 py-1 border-2 border-bauhaus-black text-[10px] font-heading font-black uppercase hover:bg-sumi-50 transition-colors">
          今月
        </button>
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-2 border-bauhaus-black">
            <thead>
              <tr className="bg-bauhaus-black text-white">
                {['日付','種別','出勤','退勤','実働','操作'].map(h => (
                  <th key={h} className="px-2 py-2 text-left font-heading font-black uppercase text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-sumi-400 font-heading font-black uppercase text-[10px]">データなし</td></tr>
              ) : sorted.map((r, i) => (
                <tr key={r.id} className={`border-t border-sumi-200 ${i % 2 === 0 ? 'bg-white' : 'bg-sumi-50'}`}>
                  <td className="px-2 py-2 font-mono">{r.date}</td>
                  <td className="px-2 py-2">
                    <Badge className={ATTENDANCE_TYPE_COLORS[r.attendanceType] || 'bg-sumi-100 text-sumi-600'}>{r.attendanceType}</Badge>
                  </td>
                  <td className="px-2 py-2 font-mono">{r.startTime === '--:--' ? '-' : r.startTime}</td>
                  <td className="px-2 py-2 font-mono">
                    {r.endTime === '--:--'
                      ? <Badge className="bg-amber-100 text-amber-700">出勤中</Badge>
                      : r.endTime === '--:--' ? '-' : r.endTime}
                  </td>
                  <td className="px-2 py-2 font-mono font-bold">{r.workMinutes > 0 ? minutesToHHMM(r.workMinutes) : '-'}</td>
                  <td className="px-2 py-2">
                    {r.endTime !== '--:--' && r.startTime !== '--:--' && (
                      <button type="button" onClick={() => setCorrDate(r.date)}
                        className="text-[10px] font-heading font-black uppercase text-matsu hover:underline">
                        修正申請
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // 横棒グラフ
        <div className="bg-white border-2 border-bauhaus-black p-4 space-y-2">
          {sorted.filter(r => r.workMinutes > 0).map(r => (
            <div key={r.id} className="flex items-center gap-2">
              <span className="text-[10px] font-mono w-20 text-sumi-500 shrink-0">{r.date.slice(5)}</span>
              <div className="flex-1 h-5 bg-sumi-100 relative">
                <div
                  className="h-full bg-matsu transition-all"
                  style={{ width: `${(r.workMinutes / maxMin) * 100}%` }}
                />
                {r.workMinutes > 480 && (
                  <div
                    className="absolute top-0 h-full bg-shu/70"
                    style={{ left: `${(480 / maxMin) * 100}%`, width: `${((r.workMinutes - 480) / maxMin) * 100}%` }}
                  />
                )}
              </div>
              <span className="text-[10px] font-mono w-10 text-right text-sumi-600">{minutesToHHMM(r.workMinutes)}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 text-[10px] text-sumi-400">
            <span className="w-3 h-3 bg-matsu inline-block" />通常
            <span className="w-3 h-3 bg-shu/70 inline-block ml-2" />残業
          </div>
        </div>
      )}

      {corrDate && <CorrectionModal date={corrDate} onClose={() => setCorrDate(null)} />}
    </div>
  )
}
