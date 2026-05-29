// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'
import { ALL_ATTENDANCE, EMPLOYEES, minutesToHHMM, ATTENDANCE_TYPE_COLORS } from '../mockData'

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${className}`}>{children}</span>
}

export default function AttendanceTab() {
  const [empFilter, setEmpFilter] = useState('all')
  const [from, setFrom] = useState('2026-04-01')
  const [to, setTo]     = useState('2026-04-30')

  const filtered = ALL_ATTENDANCE
    .filter(r => empFilter === 'all' || r.uid === empFilter)
    .filter(r => r.date >= from && r.date <= to)
    .sort((a, b) => b.date.localeCompare(a.date) || a.uid.localeCompare(b.uid))

  const totalWork = filtered.reduce((s, r) => s + r.workMinutes, 0)
  const overtimeCount = filtered.filter(r => r.workMinutes > 480).length

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
        勤怠管理<span className="text-bauhaus-red">.</span>
      </h3>

      {/* フィルター */}
      <div className="flex flex-wrap gap-2 items-end bg-white border-2 border-bauhaus-black p-3">
        <div>
          <label className="block text-[9px] font-heading font-black uppercase text-sumi-500 mb-0.5">社員</label>
          <select value={empFilter} onChange={e => setEmpFilter(e.target.value)}
            className="border-2 border-sumi-200 px-2 py-1 text-xs focus:border-bauhaus-black outline-none">
            <option value="all">全員</option>
            {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.displayName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[9px] font-heading font-black uppercase text-sumi-500 mb-0.5">開始</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="border-2 border-sumi-200 px-2 py-1 text-xs focus:border-bauhaus-black outline-none" />
        </div>
        <div>
          <label className="block text-[9px] font-heading font-black uppercase text-sumi-500 mb-0.5">終了</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="border-2 border-sumi-200 px-2 py-1 text-xs focus:border-bauhaus-black outline-none" />
        </div>
        <button type="button" onClick={() => { setFrom('2026-04-01'); setTo('2026-04-30') }}
          className="px-2 py-1 border-2 border-bauhaus-black text-[10px] font-heading font-black uppercase hover:bg-sumi-50 transition-colors">今月</button>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '件数',    value: filtered.length,   unit: '件',  color: 'text-bauhaus-black' },
          { label: '累計実働', value: minutesToHHMM(totalWork), unit: '',    color: 'text-matsu' },
          { label: '残業件数', value: overtimeCount,     unit: '件',  color: 'text-shu' },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="bg-white border-2 border-bauhaus-black p-3 text-center">
            <p className="text-[10px] font-heading font-black uppercase text-sumi-400 mb-1">{label}</p>
            <p className={`text-xl font-mono font-black ${color}`}>{value}<span className="text-xs ml-0.5 text-sumi-400">{unit}</span></p>
          </div>
        ))}
      </div>

      {/* テーブル */}
      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-bauhaus-black text-white">
              {['氏名','日付','種別','出勤','退勤','実働','備考'].map(h => (
                <th key={h} className="px-3 py-2 text-left font-heading font-black uppercase text-[10px] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sumi-100">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-sumi-400 font-heading font-black uppercase text-[10px]">データなし</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={r.id} className={`hover:bg-sumi-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-sumi-50/50'}`}>
                <td className="px-3 py-2 font-heading font-bold text-sumi-800 whitespace-nowrap">{r.displayName}</td>
                <td className="px-3 py-2 font-mono whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <Badge className={ATTENDANCE_TYPE_COLORS[r.attendanceType] || 'bg-sumi-100 text-sumi-600'}>{r.attendanceType}</Badge>
                </td>
                <td className="px-3 py-2 font-mono">{r.startTime === '--:--' ? '-' : r.startTime}</td>
                <td className="px-3 py-2 font-mono">
                  {r.endTime === '--:--'
                    ? <Badge className="bg-amber-100 text-amber-700">出勤中</Badge>
                    : r.endTime}
                </td>
                <td className="px-3 py-2 font-mono font-bold">{r.workMinutes > 0 ? minutesToHHMM(r.workMinutes) : '-'}</td>
                <td className="px-3 py-2 text-sumi-400 truncate max-w-[100px]">{r.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
