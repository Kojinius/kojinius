// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type Gender = '' | '男性' | '女性'
export type VisitType = '初診' | '再診'
export type InsuranceType = '保険あり' | '保険なし'
export type ContactMethod = '電話' | 'メール' | 'その他'

export interface ReservationFormData {
  date: string
  time: string
  name: string
  furigana: string
  birthdate: string
  zip: string
  addressMain: string
  addressSub: string
  phone: string
  email: string
  gender: Gender
  visitType: VisitType
  insurance: InsuranceType
  symptoms: string
  notes: string
  contactMethod: ContactMethod
  hasSensitiveDataConsent: boolean
  reminderEmailConsent: boolean
}

export interface ReservationRecord extends ReservationFormData {
  id: string
  address: string
  status: ReservationStatus
  createdAt: string
  bookedBy?: 'admin'
  cancelReason?: string
  cancelledBy?: 'admin' | 'patient'
  cancelledAt?: string
}

export interface BusinessDaySchedule {
  open: boolean
  amOpen?: boolean
  amStart?: string
  amEnd?: string
  pmOpen?: boolean
  pmStart?: string
  pmEnd?: string
}

export type BusinessHours = Record<string, BusinessDaySchedule>
