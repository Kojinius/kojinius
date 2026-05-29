// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { Link } from 'react-router-dom'
import { PatientLayout } from '../layout/PatientLayout'
import { Button } from '../ui/Button'
import { formatDateShort } from '../utils'
import { MOCK_CLINIC } from '../mockData'
import type { ReservationFormData } from '../types'

interface Props {
  bookingId: string
  form: ReservationFormData
}

export function Complete({ bookingId, form }: Props) {
  return (
    <PatientLayout step={3}>
      <div className="flex flex-col items-center gap-8 py-8 oas-fade-in">
        <div className="w-20 h-20 rounded-full bg-[#1B3664] flex items-center justify-center shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#1C2E45] mb-2 oas-heading">ご予約が完了しました</h2>
          <p className="text-sm text-[#8A9BAC]">ご来院をお待ちしております。</p>
        </div>

        <div className="oas-card w-full p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8A9BAC]">予約番号</span>
            <span className="text-sm font-mono font-bold text-[#1B3664] bg-[#EEF3FA] px-3 py-1.5 rounded-lg">
              {bookingId}
            </span>
          </div>
          <div className="border-t border-[#E4DDD2] pt-3 flex items-center justify-between">
            <span className="text-sm text-[#8A9BAC]">予約日時</span>
            <span className="text-sm font-medium text-[#1C2E45]">
              {formatDateShort(form.date)}　{form.time}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8A9BAC]">お名前</span>
            <span className="text-sm text-[#1C2E45]">{form.name} 様</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8A9BAC]">区分</span>
            <span className="text-sm text-[#1C2E45]">{form.visitType}・{form.insurance}</span>
          </div>
        </div>

        <div className="oas-card w-full p-5 bg-[#F0F5FF] border-[#B8CCE8]">
          <h3 className="text-sm font-semibold text-[#1B3664] mb-2">来院時のご注意</h3>
          <ul className="text-xs text-[#4E6073] space-y-1.5 list-disc list-inside">
            <li>ご予約時間の5分前にお越しください。</li>
            <li>保険証・診察券（お持ちの方）をご持参ください。</li>
            <li>当日のキャンセルは {MOCK_CLINIC.phone} までご連絡ください。</li>
            {form.reminderEmailConsent && <li>前日にリマインダーメールをお送りします。</li>}
          </ul>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <Link to="/demo/oas" className="w-full">
            <Button variant="secondary" className="w-full">別の日時を予約する</Button>
          </Link>
          <Link to="/" className="w-full">
            <Button variant="ghost" className="w-full">ポートフォリオに戻る</Button>
          </Link>
        </div>
      </div>
    </PatientLayout>
  )
}
