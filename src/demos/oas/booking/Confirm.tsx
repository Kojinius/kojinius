// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useState } from 'react'
import { PatientLayout } from '../layout/PatientLayout'
import { Button } from '../ui/Button'
import { formatDateShort } from '../utils'
import type { ReservationFormData } from '../types'

interface Props {
  form: ReservationFormData
  onBack: () => void
  onSubmit: () => void
}

export function Confirm({ form, onBack, onSubmit }: Props) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); onSubmit() }, 1200)
  }

  const rows: { label: string; value: string }[] = [
    { label: '氏名',     value: `${form.name}（${form.furigana}）` },
    { label: '生年月日', value: form.birthdate },
    { label: '性別',     value: form.gender || '回答なし' },
    { label: '電話番号', value: form.phone },
    { label: 'メール',   value: form.email || '（未入力）' },
    { label: '住所',     value: [form.addressMain, form.addressSub].filter(Boolean).join(' ') },
    { label: '初診・再診', value: form.visitType },
    { label: '健康保険', value: form.insurance },
    { label: 'ご連絡方法', value: form.contactMethod },
    { label: '症状・お悩み', value: form.symptoms },
    ...(form.notes ? [{ label: '備考', value: form.notes }] : []),
  ]

  return (
    <PatientLayout step={2}>
      <div className="flex flex-col gap-6 oas-fade-in">
        <div>
          <h2 className="text-xl font-semibold text-[#1C2E45] mb-1">予約内容の確認</h2>
          <p className="text-sm text-[#8A9BAC]">以下の内容でご予約します。ご確認ください。</p>
        </div>

        <div className="oas-card overflow-hidden">
          {/* 予約日時ヘッダー */}
          <div className="px-6 py-5 bg-[#1B3664] text-white">
            <p className="text-xs text-white/60 mb-1">予約日時</p>
            <p className="text-lg font-semibold">
              {formatDateShort(form.date)}　{form.time}
            </p>
          </div>
          {/* 詳細 */}
          <dl className="divide-y divide-[#E4DDD2]">
            {rows.map(row => (
              <div key={row.label} className="flex px-6 py-3 gap-4">
                <dt className="w-28 text-sm text-[#8A9BAC] shrink-0">{row.label}</dt>
                <dd className="text-sm text-[#1C2E45] flex-1 whitespace-pre-wrap break-all">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="oas-card p-4 bg-[#FEFBF0] border-[#C9A84C]">
          <p className="text-xs text-[#4E6073]">
            ※ キャンセル・変更は当日8:00までにお電話にてご連絡ください。
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack} disabled={loading}>
            ← 修正する
          </Button>
          <Button className="flex-1" onClick={handleSubmit} loading={loading}>
            {loading ? '送信中...' : '予約を確定する'}
          </Button>
        </div>
      </div>
    </PatientLayout>
  )
}
