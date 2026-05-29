// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { ALL_ATTENDANCE, EMPLOYEES, minutesToHHMM } from '../mockData'

const LEGAL_LIMIT_MIN = 45 * 60 // 月45時間 (法定目安)

export default function OvertimeTab() {
  const month = '2026-04'

  const stats = EMPLOYEES.filter(e => e.isActive).map(emp => {
    const records = ALL_ATTENDANCE.filter(r => r.uid === emp.id && r.date.startsWith(month))
    const overtimeMin = records.reduce((s, r) => s + Math.max(0, r.workMinutes - 480), 0)
    return { emp, overtimeMin }
  })

  const maxMin = Math.max(...stats.map(s => s.overtimeMin), 1)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
          残業管理<span className="text-bauhaus-red">.</span>
        </h3>
        <span className="text-xs font-mono font-bold bg-white border-2 border-bauhaus-black px-2 py-0.5">2026年4月</span>
      </div>

      {/* 法定ライン注釈 */}
      <div className="bg-bauhaus-yellow/20 border-2 border-bauhaus-yellow p-3 text-[10px] font-heading font-black text-bauhaus-black uppercase">
        法定上限目安: 月45時間 / 年360時間（36協定）
      </div>

      {/* バーチャート */}
      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-5 space-y-4">
        {stats.map(({ emp, overtimeMin }) => {
          const overLimit = overtimeMin > LEGAL_LIMIT_MIN
          return (
            <div key={emp.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-heading font-bold text-sumi-700">{emp.displayName}</span>
                <span className={`text-xs font-mono font-black ${overLimit ? 'text-shu' : 'text-sumi-600'}`}>
                  {minutesToHHMM(overtimeMin)}
                  {overLimit && ' ⚠'}
                </span>
              </div>
              <div className="relative h-5 bg-sumi-100">
                {/* 法定ラインマーカー */}
                <div className="absolute top-0 bottom-0 w-px bg-bauhaus-red/40 z-10"
                  style={{ left: `${(LEGAL_LIMIT_MIN / maxMin) * 100}%` }} />
                <div
                  className={`h-full transition-all ${overLimit ? 'bg-shu' : 'bg-matsu'}`}
                  style={{ width: `${(overtimeMin / maxMin) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-sumi-400 mt-0.5">
                <span>0h</span>
                <span className="text-bauhaus-red/60">45h</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* テーブル */}
      <div className="bg-white border-2 border-bauhaus-black overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-sumi-100 text-sumi-600">
              <th className="px-3 py-2 text-left font-heading font-black uppercase text-[10px]">氏名</th>
              <th className="px-3 py-2 text-right font-heading font-black uppercase text-[10px]">残業時間</th>
              <th className="px-3 py-2 text-right font-heading font-black uppercase text-[10px]">法定比</th>
              <th className="px-3 py-2 text-center font-heading font-black uppercase text-[10px]">状況</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sumi-100">
            {stats.map(({ emp, overtimeMin }) => (
              <tr key={emp.id} className="hover:bg-sumi-50 transition-colors">
                <td className="px-3 py-2.5 font-heading font-bold text-sumi-800">{emp.displayName}</td>
                <td className="px-3 py-2.5 font-mono text-right">{minutesToHHMM(overtimeMin)}</td>
                <td className="px-3 py-2.5 font-mono text-right">{Math.round(overtimeMin / LEGAL_LIMIT_MIN * 100)}%</td>
                <td className="px-3 py-2.5 text-center">
                  {overtimeMin > LEGAL_LIMIT_MIN
                    ? <span className="text-[10px] font-heading font-black text-shu">⚠ 超過</span>
                    : overtimeMin > LEGAL_LIMIT_MIN * 0.8
                      ? <span className="text-[10px] font-heading font-black text-amber-600">注意</span>
                      : <span className="text-[10px] font-heading font-black text-matsu">正常</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
