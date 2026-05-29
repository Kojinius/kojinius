// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'
import { DEPARTMENTS, EMPLOYMENT_TYPES, WORK_TYPES, HOLIDAYS_APR_2026 } from '../mockData'

type SubTab = 'dept' | 'employment' | 'workType' | 'holiday'

export default function MasterTab() {
  const [sub, setSub] = useState<SubTab>('dept')
  const [depts, setDepts] = useState(DEPARTMENTS)
  const [newDept, setNewDept] = useState('')

  const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: 'dept',       label: '部署' },
    { id: 'employment', label: '雇用形態' },
    { id: 'workType',   label: '勤務種別' },
    { id: 'holiday',    label: '祝日' },
  ]

  function addDept() {
    if (!newDept.trim()) return
    setDepts(prev => [...prev, newDept.trim()])
    setNewDept('')
  }

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-black text-sm uppercase text-bauhaus-black">
        マスタ管理<span className="text-bauhaus-red">.</span>
      </h3>

      {/* サブタブ */}
      <div className="flex border-2 border-bauhaus-black overflow-hidden">
        {SUB_TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setSub(t.id)}
            className={`flex-1 py-1.5 text-[10px] font-heading font-black uppercase transition-colors ${sub===t.id?'bg-bauhaus-black text-white':'bg-white text-sumi-500 hover:bg-sumi-50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'dept' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={newDept} onChange={e => setNewDept(e.target.value)}
              placeholder="新しい部署名"
              className="flex-1 border-2 border-sumi-200 px-2 py-1.5 text-sm focus:border-bauhaus-black outline-none"
              onKeyDown={e => e.key === 'Enter' && addDept()}
            />
            <button type="button" onClick={addDept}
              className="px-3 py-1.5 bg-bauhaus-black text-white text-[10px] font-heading font-black uppercase border-2 border-bauhaus-black">追加</button>
          </div>
          <div className="bg-white border-2 border-bauhaus-black divide-y divide-sumi-100">
            {depts.map((d, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-heading font-bold text-sumi-800">{d}</span>
                <button type="button" onClick={() => setDepts(prev => prev.filter((_, j) => j !== i))}
                  className="text-[10px] text-shu font-heading font-black uppercase hover:underline">削除</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sub === 'employment' && (
        <div className="bg-white border-2 border-bauhaus-black divide-y divide-sumi-100">
          {EMPLOYMENT_TYPES.map(t => (
            <div key={t} className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-heading font-bold text-sumi-800">{t}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-sumi-400 font-mono">
                  {t === '正社員' ? '所定 8h/休憩 60min' : t === 'パート' ? '所定 6h/休憩 45min' : '所定 7h/休憩 60min'}
                </span>
                <button type="button" className="text-[10px] text-matsu font-heading font-black uppercase hover:underline">編集</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {sub === 'workType' && (
        <div className="bg-white border-2 border-bauhaus-black divide-y divide-sumi-100">
          {WORK_TYPES.map(t => (
            <div key={t} className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm font-heading font-bold text-sumi-800">{t}</span>
              <span className={`text-[10px] font-heading font-black uppercase px-1.5 py-0.5 rounded-sm ${
                ['遅刻','早退','欠勤'].includes(t) ? 'bg-shu/10 text-shu' :
                ['有休','午前休','午後休'].includes(t) ? 'bg-matsu/10 text-matsu' : 'bg-sumi-100 text-sumi-600'
              }`}>{['有休','午前休','午後休'].includes(t) ? '有給' : ['遅刻','早退','欠勤'].includes(t) ? '特別' : '通常'}</span>
            </div>
          ))}
        </div>
      )}

      {sub === 'holiday' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-heading font-black uppercase text-sumi-500">2026年4月 祝日</span>
            <button type="button" className="px-2 py-0.5 border-2 border-bauhaus-black text-[10px] font-heading font-black uppercase hover:bg-sumi-50">一括取込</button>
          </div>
          <div className="bg-white border-2 border-bauhaus-black divide-y divide-sumi-100">
            {HOLIDAYS_APR_2026.map(h => (
              <div key={h.date} className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-mono text-sumi-800">{h.date}</span>
                <span className="text-sm font-heading font-bold text-bauhaus-black">{h.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
