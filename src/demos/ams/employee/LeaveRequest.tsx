// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LEAVE_TYPES = [
  { value: 'full',    label: '有休（全日）' },
  { value: 'half_am', label: '午前休' },
  { value: 'half_pm', label: '午後休' },
  { value: 'hourly',  label: '時間休' },
]

export default function LeaveRequest() {
  const navigate = useNavigate()
  const [leaveType, setLeaveType] = useState('full')
  const [date, setDate]           = useState('')
  const [reason, setReason]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!date)         { setError('日付を選択してください'); return }
    if (!reason.trim()){ setError('申請理由を入力してください'); return }
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-16 h-16 border-3 border-matsu rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-matsu" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="font-heading font-black text-lg uppercase text-bauhaus-black">
          申請完了<span className="text-bauhaus-red">.</span>
        </h2>
        <p className="text-sm text-sumi-500 mt-1">管理者の承認をお待ちください</p>
      </div>
      <button type="button" onClick={() => navigate('/demo/ams/leave')}
        className="px-6 py-2 bg-bauhaus-black text-white border-2 border-bauhaus-black font-heading font-black text-sm uppercase shadow-bauhaus-sm hover:shadow-bauhaus hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none transition-all">
        一覧に戻る
      </button>
    </div>
  )

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="p-1.5 hover:bg-sumi-100 border border-sumi-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-heading font-black uppercase text-bauhaus-black">
          有給申請<span className="text-bauhaus-red">.</span>
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-2 border-bauhaus-black shadow-bauhaus p-5 space-y-4">
        {error && (
          <div className="border-2 border-shu bg-shu/5 px-3 py-2 text-xs font-heading font-bold text-shu">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">種別</label>
          <div className="grid grid-cols-2 gap-2">
            {LEAVE_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setLeaveType(t.value)}
                className={`py-2 text-xs font-heading font-black uppercase border-2 transition-colors ${
                  leaveType === t.value
                    ? 'bg-bauhaus-black text-white border-bauhaus-black'
                    : 'bg-white text-sumi-500 border-sumi-200 hover:border-bauhaus-black'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">
            申請日 <span className="text-shu">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min="2026-04-23"
            className="w-full border-2 border-sumi-200 px-3 py-2 text-sm focus:border-bauhaus-black outline-none"
          />
        </div>

        {leaveType === 'hourly' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">開始時刻</label>
              <input type="time" className="w-full border-2 border-sumi-200 px-3 py-2 text-sm focus:border-bauhaus-black outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">終了時刻</label>
              <input type="time" className="w-full border-2 border-sumi-200 px-3 py-2 text-sm focus:border-bauhaus-black outline-none" />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-heading font-black uppercase text-sumi-500 mb-1">
            申請理由 <span className="text-shu">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={4}
            placeholder="申請理由を入力してください"
            className="w-full border-2 border-sumi-200 px-3 py-2 text-sm resize-none focus:border-bauhaus-black outline-none"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 py-3 border-2 border-bauhaus-black font-heading font-black text-sm uppercase hover:bg-sumi-50 transition-colors">
            キャンセル
          </button>
          <button type="submit"
            className="flex-1 py-3 bg-bauhaus-black text-white border-2 border-bauhaus-black font-heading font-black text-sm uppercase shadow-bauhaus-sm hover:shadow-bauhaus hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none transition-all">
            申請する
          </button>
        </div>
      </form>
    </div>
  )
}
