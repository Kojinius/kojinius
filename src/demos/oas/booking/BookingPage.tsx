// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useState } from 'react'
import { PatientLayout } from '../layout/PatientLayout'
import { Calendar } from '../shared/Calendar'
import { TimeSlots } from '../shared/TimeSlots'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { PatientForm } from './PatientForm'
import { Confirm } from './Confirm'
import { Complete } from './Complete'
import { formatDateShort } from '../utils'
import type { ReservationFormData } from '../types'

const INITIAL: ReservationFormData = {
  date: '', time: '', name: '', furigana: '', birthdate: '',
  zip: '', addressMain: '', addressSub: '',
  phone: '', email: '',
  gender: '', visitType: '初診', insurance: '保険あり',
  symptoms: '', notes: '', contactMethod: '電話',
  hasSensitiveDataConsent: false, reminderEmailConsent: false,
}

export function BookingPage() {
  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState<ReservationFormData>(INITIAL)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [dateError, setDateError] = useState('')

  const patch = (updates: Partial<ReservationFormData>) =>
    setForm(f => ({ ...f, ...updates }))

  const handleNext0 = () => {
    if (!form.date || !form.time) { setDateError('日時を選択してください。'); return }
    setDateError('')
    setStep(1)
  }

  const handleSubmit = () => {
    const id = `RES-${Date.now().toString().slice(-8)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`
    setBookingId(id)
    setStep(3)
  }

  if (step === 1) return <PatientForm form={form} onChange={patch} onBack={() => setStep(0)} onNext={() => setStep(2)} />
  if (step === 2) return <Confirm form={form} onBack={() => setStep(1)} onSubmit={handleSubmit} />
  if (step === 3 && bookingId) return <Complete bookingId={bookingId} form={form} />

  return (
    <PatientLayout step={0}>
      <div className="flex flex-col gap-6 oas-fade-in">
        <div>
          <h2 className="text-xl font-semibold text-[#1C2E45] mb-1">日時を選択</h2>
          <p className="text-sm text-[#8A9BAC]">ご希望の予約日と時間帯をお選びください。</p>
        </div>

        <div className="oas-card p-6 oas-fade-in-1">
          <h3 className="text-sm font-medium text-[#1C2E45] mb-4">予約日</h3>
          <Calendar
            value={form.date}
            onChange={d => patch({ date: d, time: '' })}
          />
        </div>

        {form.date && (
          <div className="oas-card p-6 oas-fade-in-2">
            <h3 className="text-sm font-medium text-[#1C2E45] mb-0.5">時間帯</h3>
            <p className="text-xs text-[#8A9BAC] mb-4">{formatDateShort(form.date)}</p>
            <TimeSlots date={form.date} value={form.time} onChange={t => patch({ time: t })} />
          </div>
        )}

        {dateError && <Alert type="error">{dateError}</Alert>}

        {form.date && form.time && (
          <div className="oas-card p-4 border-l-4 border-[#C9A84C] oas-fade-in-3">
            <p className="text-sm text-[#4E6073]">
              選択中：<span className="font-semibold text-[#1C2E45]">{formatDateShort(form.date)}　{form.time}</span>
            </p>
          </div>
        )}

        <Button size="lg" className="w-full" onClick={handleNext0}>
          次へ：患者情報を入力 →
        </Button>
      </div>
    </PatientLayout>
  )
}
