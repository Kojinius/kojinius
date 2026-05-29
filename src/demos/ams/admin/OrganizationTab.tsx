// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { ALL_ATTENDANCE, EMPLOYEES, DEPARTMENTS, minutesToHHMM } from '../mockData'

export default function OrganizationTab() {
  const month = '2026-04'

  const deptStats = DEPARTMENTS.map(dept => {
    const emps = EMPLOYEES.filter(e => e.dept === dept && e.isActive)
    const records = ALL_ATTENDANCE.filter(r =>
      emps.some(e => e.id === r.uid) && r.date.startsWith(month) && r.workMinutes > 0
    )
    const totalMin = records.reduce((s, r) => s + r.workMinutes, 0)
    const overtimeMin = records.reduce((s, r) => s + Math.max(0, r.workMinutes - 480), 0)
    const workdays = new Set(records.map(r => `${r.uid}_${r.date}`)).size
    const possibleDays = emps.length * 18 // 月稼働日数概算
    const attRate = possibleDays > 0 ? Math.round((workdays / possibleDays) * 100) : 0
    return { dept, empCount: emps.length, totalMin, overtimeMin, attRate }
  })

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
        組織サマリー<span className="text-bauhaus-red">.</span>
      </h3>

      {/* 部署別カード */}
      <div className="grid grid-cols-1 gap-3">
        {deptStats.map(({ dept, empCount, totalMin, overtimeMin, attRate }) => (
          <div key={dept} className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-heading font-black text-sm text-bauhaus-black uppercase">{dept}</h4>
              <span className="text-[10px] font-mono bg-sumi-100 px-2 py-0.5 font-bold">{empCount}名</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[10px] font-heading font-black uppercase text-sumi-400 mb-1">出勤率</p>
                <p className={`text-xl font-mono font-black ${attRate >= 90 ? 'text-matsu' : attRate >= 70 ? 'text-amber-600' : 'text-shu'}`}>{attRate}<span className="text-sm">%</span></p>
              </div>
              <div>
                <p className="text-[10px] font-heading font-black uppercase text-sumi-400 mb-1">総実働</p>
                <p className="text-xl font-mono font-black text-bauhaus-black">{minutesToHHMM(totalMin)}</p>
              </div>
              <div>
                <p className="text-[10px] font-heading font-black uppercase text-sumi-400 mb-1">残業</p>
                <p className={`text-xl font-mono font-black ${overtimeMin > 0 ? 'text-shu' : 'text-sumi-400'}`}>{minutesToHHMM(overtimeMin)}</p>
              </div>
            </div>
            {/* 出勤率バー */}
            <div className="mt-3 h-1.5 bg-sumi-100">
              <div className={`h-full transition-all ${attRate >= 90 ? 'bg-matsu' : attRate >= 70 ? 'bg-amber-400' : 'bg-shu'}`}
                style={{ width: `${attRate}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* 全社サマリー */}
      <div className="bg-bauhaus-black text-white p-4">
        <p className="font-heading font-black text-[10px] uppercase text-white/60 mb-2">全社</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] text-white/60 mb-1">在籍人数</p>
            <p className="text-2xl font-mono font-black">{EMPLOYEES.filter(e => e.isActive).length}<span className="text-sm ml-0.5">名</span></p>
          </div>
          <div>
            <p className="text-[10px] text-white/60 mb-1">正社員</p>
            <p className="text-2xl font-mono font-black">{EMPLOYEES.filter(e => e.isActive && e.employmentType === '正社員').length}<span className="text-sm ml-0.5">名</span></p>
          </div>
          <div>
            <p className="text-[10px] text-white/60 mb-1">その他</p>
            <p className="text-2xl font-mono font-black">{EMPLOYEES.filter(e => e.isActive && e.employmentType !== '正社員').length}<span className="text-sm ml-0.5">名</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
