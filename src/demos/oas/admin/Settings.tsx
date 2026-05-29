// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useState } from 'react'
import { AdminLayout } from '../layout/AdminLayout'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { MOCK_BUSINESS_HOURS } from '../mockData'
import type { BusinessHours, BusinessDaySchedule } from '../types'

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土']
const DOW_COLORS = ['bg-red-100 text-red-600', 'bg-[#EEF3FA] text-[#1B3664]', 'bg-[#EEF3FA] text-[#1B3664]', 'bg-[#EEF3FA] text-[#1B3664]', 'bg-[#EEF3FA] text-[#1B3664]', 'bg-[#EEF3FA] text-[#1B3664]', 'bg-blue-100 text-blue-600']

export function Settings() {
  const [hours, setHours] = useState<BusinessHours>({ ...MOCK_BUSINESS_HOURS })
  const [saved, setSaved]  = useState(false)

  const patch = (dow: string, updates: Partial<BusinessDaySchedule>) => {
    setHours(h => ({ ...h, [dow]: { ...h[dow], ...updates } }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <AdminLayout>
      <div className="p-6 flex flex-col gap-6 max-w-2xl">
        <div>
          <h1 className="text-xl font-bold text-[#1C2E45] oas-heading">診療時間設定</h1>
          <p className="text-sm text-[#8A9BAC] mt-0.5">曜日ごとの診療時間を設定します。</p>
        </div>

        {saved && <Alert type="success">設定を保存しました（デモ）。</Alert>}

        <div className="oas-card divide-y divide-[#E4DDD2]">
          {['0','1','2','3','4','5','6'].map(dow => {
            const bh = hours[dow]
            return (
              <div key={dow} className="px-6 py-5">
                <div className="flex items-center gap-4 mb-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${DOW_COLORS[Number(dow)]}`}>
                    {DOW_LABELS[Number(dow)]}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="accent-[#1B3664]"
                      checked={bh.open}
                      onChange={e => patch(dow, { open: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-[#1C2E45]">
                      {bh.open ? '診療あり' : '休診'}
                    </span>
                  </label>
                </div>

                {bh.open && (
                  <div className="ml-12 flex flex-col gap-3">
                    {/* 午前 */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer w-16">
                        <input
                          type="checkbox"
                          className="accent-[#1B3664]"
                          checked={bh.amOpen ?? false}
                          onChange={e => patch(dow, { amOpen: e.target.checked })}
                        />
                        <span className="text-xs text-[#4E6073]">午前</span>
                      </label>
                      {bh.amOpen && (
                        <div className="flex items-center gap-2">
                          <input type="time" value={bh.amStart ?? '09:00'}
                            className="px-2 py-1.5 rounded border border-[#E4DDD2] text-xs focus:outline-none focus:border-[#1B3664]"
                            onChange={e => patch(dow, { amStart: e.target.value })} />
                          <span className="text-xs text-[#8A9BAC]">〜</span>
                          <input type="time" value={bh.amEnd ?? '12:00'}
                            className="px-2 py-1.5 rounded border border-[#E4DDD2] text-xs focus:outline-none focus:border-[#1B3664]"
                            onChange={e => patch(dow, { amEnd: e.target.value })} />
                        </div>
                      )}
                    </div>
                    {/* 午後 */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer w-16">
                        <input
                          type="checkbox"
                          className="accent-[#1B3664]"
                          checked={bh.pmOpen ?? false}
                          onChange={e => patch(dow, { pmOpen: e.target.checked })}
                        />
                        <span className="text-xs text-[#4E6073]">午後</span>
                      </label>
                      {bh.pmOpen && (
                        <div className="flex items-center gap-2">
                          <input type="time" value={bh.pmStart ?? '14:00'}
                            className="px-2 py-1.5 rounded border border-[#E4DDD2] text-xs focus:outline-none focus:border-[#1B3664]"
                            onChange={e => patch(dow, { pmStart: e.target.value })} />
                          <span className="text-xs text-[#8A9BAC]">〜</span>
                          <input type="time" value={bh.pmEnd ?? '18:00'}
                            className="px-2 py-1.5 rounded border border-[#E4DDD2] text-xs focus:outline-none focus:border-[#1B3664]"
                            onChange={e => patch(dow, { pmEnd: e.target.value })} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <Button onClick={handleSave} className="self-start">
          設定を保存（デモ）
        </Button>
      </div>
    </AdminLayout>
  )
}
