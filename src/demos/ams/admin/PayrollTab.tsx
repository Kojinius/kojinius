// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { ALL_ATTENDANCE, EMPLOYEES, minutesToHHMM } from '../mockData'

const HOURLY_RATES: Record<string, number> = {
  '正社員': 2800, 'パート': 1100, '契約社員': 2200, 'アルバイト': 1050,
}

export default function PayrollTab() {
  const month = '2026-04'

  const summary = EMPLOYEES.filter(e => e.isActive).map(emp => {
    const records = ALL_ATTENDANCE.filter(r => r.uid === emp.id && r.date.startsWith(month) && r.workMinutes > 0)
    const totalMin = records.reduce((s, r) => s + r.workMinutes, 0)
    const overtimeMin = records.reduce((s, r) => s + Math.max(0, r.workMinutes - 480), 0)
    const normalMin = totalMin - overtimeMin
    const rate = HOURLY_RATES[emp.employmentType] || 2000
    const normalPay = Math.floor((normalMin / 60) * rate)
    const overtimePay = Math.floor((overtimeMin / 60) * rate * 1.25)
    return { emp, records: records.length, totalMin, overtimeMin, normalMin, normalPay, overtimePay, totalPay: normalPay + overtimePay }
  })

  const grandTotal = summary.reduce((s, r) => s + r.totalPay, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
          給与計算<span className="text-bauhaus-red">.</span>
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-heading font-black uppercase text-sumi-500">対象月</span>
          <span className="text-xs font-mono font-bold bg-white border-2 border-bauhaus-black px-2 py-0.5">2026年4月</span>
        </div>
      </div>

      {/* 合計 */}
      <div className="bg-bauhaus-black text-white p-4 flex items-center justify-between">
        <span className="font-heading font-black text-[10px] uppercase">当月総支給額（概算）</span>
        <span className="font-mono font-black text-2xl">¥{grandTotal.toLocaleString()}</span>
      </div>

      {/* テーブル */}
      <div className="bg-white border-2 border-bauhaus-black shadow-bauhaus overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-sumi-100 text-sumi-600">
              {['氏名','雇用形態','勤務日数','総実働','残業','基本給（概算）','残業手当','支給合計'].map(h => (
                <th key={h} className="px-3 py-2 text-right first:text-left font-heading font-black uppercase text-[10px] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sumi-100">
            {summary.map((row, i) => (
              <tr key={row.emp.id} className={`hover:bg-sumi-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-sumi-50/50'}`}>
                <td className="px-3 py-2.5 font-heading font-bold text-sumi-800 whitespace-nowrap">{row.emp.displayName}</td>
                <td className="px-3 py-2.5 text-sumi-500 whitespace-nowrap">{row.emp.employmentType}</td>
                <td className="px-3 py-2.5 font-mono text-right">{row.records}<span className="text-sumi-400 text-[10px] ml-0.5">日</span></td>
                <td className="px-3 py-2.5 font-mono text-right">{minutesToHHMM(row.totalMin)}</td>
                <td className="px-3 py-2.5 font-mono text-right text-shu">{minutesToHHMM(row.overtimeMin)}</td>
                <td className="px-3 py-2.5 font-mono text-right">¥{row.normalPay.toLocaleString()}</td>
                <td className="px-3 py-2.5 font-mono text-right text-shu">¥{row.overtimePay.toLocaleString()}</td>
                <td className="px-3 py-2.5 font-mono font-black text-right text-bauhaus-black">¥{row.totalPay.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-bauhaus-black bg-sumi-50">
              <td colSpan={7} className="px-3 py-2.5 font-heading font-black uppercase text-sm text-right text-bauhaus-black">合計</td>
              <td className="px-3 py-2.5 font-mono font-black text-right text-lg text-bauhaus-black">¥{grandTotal.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-sumi-400">※ 概算金額。控除・交通費・手当は含みません。</p>
    </div>
  )
}
