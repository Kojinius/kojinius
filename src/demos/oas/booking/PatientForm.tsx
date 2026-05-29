// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import { useState } from 'react'
import { PatientLayout } from '../layout/PatientLayout'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Textarea } from '../ui/Textarea'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { isValidFurigana, isValidZip, isValidPhone, isValidEmail, toHankaku, calcAge } from '../utils'
import type { ReservationFormData, Gender, VisitType, InsuranceType, ContactMethod } from '../types'

interface Props {
  form: ReservationFormData
  onChange: (updates: Partial<ReservationFormData>) => void
  onBack: () => void
  onNext: () => void
}

type Errors = Partial<Record<keyof ReservationFormData, string>>

export function PatientForm({ form, onChange, onBack, onNext }: Props) {
  const [errors, setErrors] = useState<Errors>({})

  const validate = (): boolean => {
    const e: Errors = {}
    if (!form.name.trim())     e.name     = '氏名を入力してください。'
    if (!form.furigana.trim()) e.furigana = 'フリガナを入力してください。'
    else if (!isValidFurigana(form.furigana)) e.furigana = '全角ひらがな・カタカナで入力してください。'
    if (!form.birthdate)       e.birthdate = '生年月日を入力してください。'
    if (!form.zip.trim())      e.zip = '郵便番号を入力してください。'
    else if (!isValidZip(form.zip)) e.zip = '正しい郵便番号を入力してください（例：123-4567）。'
    if (!form.addressMain.trim()) e.addressMain = '住所を入力してください。'
    if (!form.phone.trim())    e.phone = '電話番号を入力してください。'
    else if (!isValidPhone(form.phone)) e.phone = '正しい電話番号を入力してください。'
    if (form.email && !isValidEmail(form.email)) e.email = '正しいメールアドレスを入力してください。'
    if (!form.symptoms.trim()) e.symptoms = '症状・お悩みを入力してください。'
    if (!form.hasSensitiveDataConsent) e.hasSensitiveDataConsent = '同意が必要です。'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleZipBlur = () => {
    const zip = toHankaku(form.zip).replace(/-/g, '')
    if (zip.length === 7) {
      onChange({ addressMain: `東京都新宿区新宿（〒${form.zip} 住所自動入力デモ）` })
    }
  }

  const age = calcAge(form.birthdate)

  return (
    <PatientLayout step={1}>
      <div className="flex flex-col gap-6 oas-fade-in">
        <div>
          <h2 className="text-xl font-semibold text-[#1C2E45] mb-1">患者情報の入力</h2>
          <p className="text-sm text-[#8A9BAC]">ご予約に必要な情報をご入力ください。</p>
        </div>

        <Alert type="info">
          ご入力いただいた個人情報は予約管理目的のみに使用し、第三者に提供しません。
        </Alert>

        {/* 基本情報 */}
        <div className="oas-card p-6 flex flex-col gap-4 oas-fade-in-1">
          <h3 className="text-sm font-semibold text-[#1C2E45] border-b border-[#E4DDD2] pb-2">基本情報</h3>
          <Input label="お名前（漢字）" required placeholder="山田 太郎"
            value={form.name} error={errors.name}
            onChange={e => onChange({ name: e.target.value })} />
          <Input label="フリガナ" required placeholder="ヤマダ タロウ"
            value={form.furigana} error={errors.furigana}
            onChange={e => onChange({ furigana: e.target.value })} />
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input label="生年月日" required type="date"
                value={form.birthdate} error={errors.birthdate}
                onChange={e => onChange({ birthdate: e.target.value })} />
            </div>
            {age !== null && (
              <span className="text-sm text-[#8A9BAC] pb-2.5 whitespace-nowrap">（{age}歳）</span>
            )}
          </div>
          <Select label="性別"
            value={form.gender}
            onChange={e => onChange({ gender: e.target.value as Gender })}
            options={[
              { value: '',   label: '回答しない' },
              { value: '男性', label: '男性' },
              { value: '女性', label: '女性' },
            ]} />
        </div>

        {/* 住所 */}
        <div className="oas-card p-6 flex flex-col gap-4 oas-fade-in-2">
          <h3 className="text-sm font-semibold text-[#1C2E45] border-b border-[#E4DDD2] pb-2">住所</h3>
          <Input label="郵便番号" required placeholder="123-4567"
            value={form.zip} error={errors.zip}
            hint="7桁入力で住所を自動入力します（デモ）"
            onChange={e => onChange({ zip: toHankaku(e.target.value) })}
            onBlur={handleZipBlur} />
          <Input label="住所（都道府県・市区町村・番地）" required placeholder="東京都新宿区新宿1-2-3"
            value={form.addressMain} error={errors.addressMain}
            onChange={e => onChange({ addressMain: e.target.value })} />
          <Input label="建物名・部屋番号（任意）" placeholder="○○マンション101号室"
            value={form.addressSub}
            onChange={e => onChange({ addressSub: e.target.value })} />
        </div>

        {/* 連絡先 */}
        <div className="oas-card p-6 flex flex-col gap-4 oas-fade-in-3">
          <h3 className="text-sm font-semibold text-[#1C2E45] border-b border-[#E4DDD2] pb-2">連絡先</h3>
          <Input label="電話番号" required placeholder="090-1234-5678"
            value={form.phone} error={errors.phone}
            onChange={e => onChange({ phone: toHankaku(e.target.value) })} />
          <Input label="メールアドレス（任意）" type="email" placeholder="example@email.com"
            value={form.email} error={errors.email}
            onChange={e => onChange({ email: e.target.value })} />
          <Select label="ご連絡の希望方法"
            value={form.contactMethod}
            onChange={e => onChange({ contactMethod: e.target.value as ContactMethod })}
            options={[
              { value: '電話',   label: '電話' },
              { value: 'メール', label: 'メール' },
              { value: 'その他', label: 'その他' },
            ]} />
        </div>

        {/* 診療情報 */}
        <div className="oas-card p-6 flex flex-col gap-4 oas-fade-in-4">
          <h3 className="text-sm font-semibold text-[#1C2E45] border-b border-[#E4DDD2] pb-2">診療情報</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <Select label="初診・再診"
                value={form.visitType}
                onChange={e => onChange({ visitType: e.target.value as VisitType })}
                options={[
                  { value: '初診', label: '初診' },
                  { value: '再診', label: '再診' },
                ]} />
            </div>
            <div className="flex-1">
              <Select label="健康保険"
                value={form.insurance}
                onChange={e => onChange({ insurance: e.target.value as InsuranceType })}
                options={[
                  { value: '保険あり', label: '保険あり' },
                  { value: '保険なし', label: '保険なし（自費）' },
                ]} />
            </div>
          </div>
          <Textarea label="症状・お悩み" required
            placeholder="いつ頃から、どのような症状があるかを詳しくご記入ください。"
            value={form.symptoms} error={errors.symptoms}
            onChange={e => onChange({ symptoms: e.target.value })} />
          <Textarea label="その他・備考（任意）" rows={2}
            placeholder="アレルギー・持病・ご要望などがあればご記入ください。"
            value={form.notes}
            onChange={e => onChange({ notes: e.target.value })} />
        </div>

        {/* 同意 */}
        <div className="oas-card p-6 flex flex-col gap-3 oas-fade-in-4">
          <h3 className="text-sm font-semibold text-[#1C2E45] border-b border-[#E4DDD2] pb-2">同意事項</h3>
          <label className="flex gap-3 cursor-pointer">
            <input type="checkbox" className="mt-0.5 accent-[#1B3664]"
              checked={form.hasSensitiveDataConsent}
              onChange={e => onChange({ hasSensitiveDataConsent: e.target.checked })} />
            <span className="text-sm text-[#4E6073]">
              <span className="text-red-500 font-medium">【必須】</span>
              健康情報等の要配慮個人情報の取り扱いに同意します。診療目的以外には使用しません。
            </span>
          </label>
          {errors.hasSensitiveDataConsent && (
            <p className="text-xs text-red-500 ml-7">{errors.hasSensitiveDataConsent}</p>
          )}
          <label className="flex gap-3 cursor-pointer">
            <input type="checkbox" className="mt-0.5 accent-[#1B3664]"
              checked={form.reminderEmailConsent}
              onChange={e => onChange({ reminderEmailConsent: e.target.checked })} />
            <span className="text-sm text-[#4E6073]">
              予約前日のリマインダーメール受信を希望する（任意）
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>← 戻る</Button>
          <Button className="flex-1" onClick={() => validate() && onNext()}>
            確認画面へ →
          </Button>
        </div>
      </div>
    </PatientLayout>
  )
}
