// 2026-04-22 claude-sonnet-4-6 セッションターン数：-
import type { ReservationRecord, BusinessHours } from './types'
import { today } from './utils'

const T = today()
const [ty, tm] = T.split('-').map(Number)

function d(offset: number): string {
  const dt = new Date(ty, tm - 1, Number(T.split('-')[2]) + offset)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}

export const MOCK_RESERVATIONS: ReservationRecord[] = [
  { id: 'RES-20260422-001', date: T, time: '09:00', name: '佐藤 健太', furigana: 'さとう けんた', birthdate: '1985-06-15', zip: '150-0001', addressMain: '東京都渋谷区神宮前1-1-1', addressSub: 'プレミアムマンション201', address: '東京都渋谷区神宮前1-1-1 プレミアムマンション201', phone: '090-1234-5678', email: 'kenta@example.com', gender: '男性', visitType: '初診', insurance: '保険あり', symptoms: '右肩の痛みが続いており、腕を上げると激しく痛む。2週間前から悪化している。', notes: '', contactMethod: '電話', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'pending', createdAt: `${d(-3)}T10:23:00` },
  { id: 'RES-20260422-002', date: T, time: '10:00', name: '田中 美咲', furigana: 'たなか みさき', birthdate: '1992-03-28', zip: '160-0022', addressMain: '東京都新宿区新宿3-14-5', addressSub: '', address: '東京都新宿区新宿3-14-5', phone: '080-9876-5432', email: 'misaki@example.com', gender: '女性', visitType: '再診', insurance: '保険あり', symptoms: '腰痛の継続フォローアップ。先週の施術後に少し楽になったが、まだ痛みがある。', notes: '前回の施術後の経過確認', contactMethod: 'メール', hasSensitiveDataConsent: true, reminderEmailConsent: true, status: 'confirmed', createdAt: `${d(-5)}T14:15:00` },
  { id: 'RES-20260422-003', date: T, time: '11:00', name: '鈴木 大輔', furigana: 'すずき だいすけ', birthdate: '1978-11-03', zip: '102-0083', addressMain: '東京都千代田区麹町3-2-1', addressSub: 'オフィスビル8F', address: '東京都千代田区麹町3-2-1 オフィスビル8F', phone: '070-5555-3333', email: '', gender: '男性', visitType: '初診', insurance: '保険なし', symptoms: '首こりと頭痛。デスクワークが多く、慢性的な肩こりも気になる。', notes: '', contactMethod: '電話', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'pending', createdAt: `${d(-1)}T09:45:00` },
  { id: 'RES-20260422-004', date: T, time: '14:00', name: '伊藤 彩香', furigana: 'いとう あやか', birthdate: '1995-07-21', zip: '141-0031', addressMain: '東京都品川区西五反田7-22-3', addressSub: 'グリーンハイツ305', address: '東京都品川区西五反田7-22-3 グリーンハイツ305', phone: '090-3333-7777', email: 'ayaka@example.com', gender: '女性', visitType: '初診', insurance: '保険あり', symptoms: '膝の痛みで歩行が困難。スポーツ中に捻挫した可能性がある。', notes: '', contactMethod: 'メール', hasSensitiveDataConsent: true, reminderEmailConsent: true, status: 'pending', createdAt: `${d(-2)}T16:30:00` },
  { id: 'RES-20260422-005', date: T, time: '15:30', name: '山本 哲也', furigana: 'やまもと てつや', birthdate: '1968-02-14', zip: '231-0005', addressMain: '神奈川県横浜市中区本町6-50-10', addressSub: '', address: '神奈川県横浜市中区本町6-50-10', phone: '045-678-9012', email: 'tetsuya@example.com', gender: '男性', visitType: '再診', insurance: '保険あり', symptoms: '腰椎ヘルニアの定期通院。最近しびれが悪化。', notes: '特になし', contactMethod: '電話', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'confirmed', createdAt: `${d(-7)}T11:00:00` },
  { id: 'RES-20260423-001', date: d(1), time: '09:30', name: '中村 愛', furigana: 'なかむら あい', birthdate: '2001-09-05', zip: '165-0024', addressMain: '東京都中野区松が丘1-3-5', addressSub: 'コーポ松が丘102', address: '東京都中野区松が丘1-3-5 コーポ松が丘102', phone: '080-1111-2222', email: 'ai.nakamura@example.com', gender: '女性', visitType: '初診', insurance: '保険あり', symptoms: '足首の捻挫。昨日サッカー中に負傷した。', notes: '', contactMethod: 'メール', hasSensitiveDataConsent: true, reminderEmailConsent: true, status: 'pending', createdAt: `${d(-1)}T20:10:00` },
  { id: 'RES-20260423-002', date: d(1), time: '11:00', name: '小林 浩二', furigana: 'こばやし こうじ', birthdate: '1960-05-30', zip: '330-0854', addressMain: '埼玉県さいたま市大宮区桜木町2-7-1', addressSub: '', address: '埼玉県さいたま市大宮区桜木町2-7-1', phone: '048-555-7890', email: '', gender: '男性', visitType: '再診', insurance: '保険あり', symptoms: '五十肩の継続治療。可動域が少し改善してきた。', notes: '', contactMethod: '電話', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'pending', createdAt: `${d(-4)}T13:20:00` },
  { id: 'RES-20260424-001', date: d(2), time: '10:30', name: '加藤 由美', furigana: 'かとう ゆみ', birthdate: '1988-12-01', zip: '231-0013', addressMain: '神奈川県横浜市中区住吉町6-77', addressSub: 'サンライズビル3F', address: '神奈川県横浜市中区住吉町6-77 サンライズビル3F', phone: '090-6666-8888', email: 'yumi.kato@example.com', gender: '女性', visitType: '初診', insurance: '保険なし', symptoms: '産後の骨盤矯正希望。育児疲れによる腰の痛みも気になる。', notes: '子連れで来院予定', contactMethod: 'メール', hasSensitiveDataConsent: true, reminderEmailConsent: true, status: 'pending', createdAt: `${d(-3)}T08:55:00` },
  { id: 'RES-20260418-001', date: d(-4), time: '09:00', name: '渡辺 修', furigana: 'わたなべ おさむ', birthdate: '1975-08-22', zip: '113-0033', addressMain: '東京都文京区本郷3-38-1', addressSub: '', address: '東京都文京区本郷3-38-1', phone: '03-1234-5678', email: 'osamu@example.com', gender: '男性', visitType: '再診', insurance: '保険あり', symptoms: '腰痛。', notes: '', contactMethod: '電話', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'completed', createdAt: `${d(-10)}T09:30:00` },
  { id: 'RES-20260418-002', date: d(-4), time: '14:00', name: '松本 花', furigana: 'まつもと はな', birthdate: '1998-04-10', zip: '150-0042', addressMain: '東京都渋谷区宇田川町15-1', addressSub: '', address: '東京都渋谷区宇田川町15-1', phone: '090-2222-4444', email: 'hana.matsumoto@example.com', gender: '女性', visitType: '初診', insurance: '保険あり', symptoms: '肩こり・目の疲れ。長時間のPC作業が続いている。', notes: '', contactMethod: 'メール', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'completed', createdAt: `${d(-8)}T15:00:00` },
  { id: 'RES-20260417-001', date: d(-5), time: '10:00', name: '井上 康太', furigana: 'いのうえ こうた', birthdate: '1982-01-17', zip: '160-0023', addressMain: '東京都新宿区西新宿2-8-1', addressSub: '東京都庁前マンション707', address: '東京都新宿区西新宿2-8-1 東京都庁前マンション707', phone: '080-7777-9999', email: 'kota.inoue@example.com', gender: '男性', visitType: '初診', insurance: '保険あり', symptoms: '両手のしびれ。仕事中にキーボードを打つと痛む。', notes: '', contactMethod: '電話', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'completed', createdAt: `${d(-9)}T10:15:00` },
  { id: 'RES-20260417-002', date: d(-5), time: '15:00', name: '木村 沙織', furigana: 'きむら さおり', birthdate: '2003-06-25', zip: '177-0042', addressMain: '東京都練馬区飛び地町1-2-3', addressSub: '', address: '東京都練馬区飛び地町1-2-3', phone: '090-8888-6666', email: 'saori@example.com', gender: '女性', visitType: '初診', insurance: '保険あり', symptoms: '姿勢矯正とO脚改善。', notes: '', contactMethod: 'メール', hasSensitiveDataConsent: true, reminderEmailConsent: true, status: 'completed', createdAt: `${d(-6)}T14:45:00` },
  { id: 'RES-20260415-001', date: d(-7), time: '09:30', name: '林 正人', furigana: 'はやし まさと', birthdate: '1970-10-08', zip: '221-0835', addressMain: '神奈川県横浜市神奈川区鶴屋町2-21-1', addressSub: '', address: '神奈川県横浜市神奈川区鶴屋町2-21-1', phone: '045-333-2222', email: '', gender: '男性', visitType: '再診', insurance: '保険あり', symptoms: '坐骨神経痛の継続治療。', notes: '', contactMethod: '電話', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'completed', createdAt: `${d(-12)}T09:00:00` },
  { id: 'RES-20260415-002', date: d(-7), time: '11:00', name: '清水 るな', furigana: 'しみず るな', birthdate: '2000-03-15', zip: '272-0021', addressMain: '千葉県市川市八幡3-6-1', addressSub: '', address: '千葉県市川市八幡3-6-1', phone: '047-222-3333', email: 'runa@example.com', gender: '女性', visitType: '初診', insurance: '保険あり', symptoms: '足裏の痛み（足底筋膜炎の疑い）。', notes: '', contactMethod: 'メール', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'completed', createdAt: `${d(-9)}T16:30:00` },
  { id: 'RES-20260413-001', date: d(-9), time: '10:00', name: '山田 誠一', furigana: 'やまだ せいいち', birthdate: '1955-12-20', zip: '330-0803', addressMain: '埼玉県さいたま市大宮区高鼻町1-1-1', addressSub: '', address: '埼玉県さいたま市大宮区高鼻町1-1-1', phone: '048-111-2222', email: '', gender: '男性', visitType: '再診', insurance: '保険あり', symptoms: '変形性膝関節症の定期通院。', notes: '', contactMethod: '電話', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'completed', createdAt: `${d(-14)}T11:30:00` },
  { id: 'RES-20260420-CANCEL1', date: d(-2), time: '14:30', name: '橋本 京子', furigana: 'はしもと きょうこ', birthdate: '1967-07-04', zip: '110-0005', addressMain: '東京都台東区上野7-3-1', addressSub: '', address: '東京都台東区上野7-3-1', phone: '03-9876-5432', email: 'kyoko@example.com', gender: '女性', visitType: '初診', insurance: '保険あり', symptoms: '頸椎症の疑い。', notes: '', contactMethod: '電話', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'cancelled', cancelledBy: 'patient', cancelReason: '体調不良のため', cancelledAt: `${d(-3)}T18:20:00`, createdAt: `${d(-6)}T10:00:00` },
  { id: 'RES-20260419-CANCEL2', date: d(-3), time: '10:30', name: '西村 隼人', furigana: 'にしむら はやと', birthdate: '1991-11-11', zip: '532-0011', addressMain: '大阪府大阪市淀川区西中島5-14-5', addressSub: 'ユニバービル10F', address: '大阪府大阪市淀川区西中島5-14-5 ユニバービル10F', phone: '06-3333-4444', email: 'hayato@example.com', gender: '男性', visitType: '初診', insurance: '保険なし', symptoms: '腱鞘炎。', notes: '', contactMethod: 'メール', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'cancelled', cancelledBy: 'admin', cancelReason: '医師都合による休診', cancelledAt: `${d(-4)}T09:00:00`, createdAt: `${d(-7)}T14:00:00` },
  { id: 'RES-20260416-CANCEL3', date: d(-6), time: '16:00', name: '前田 千尋', furigana: 'まえだ ちひろ', birthdate: '2005-02-28', zip: '112-0006', addressMain: '東京都文京区小日向4-5-3', addressSub: '', address: '東京都文京区小日向4-5-3', phone: '090-4444-5555', email: 'chihiro@example.com', gender: '女性', visitType: '初診', insurance: '保険あり', symptoms: '部活での怪我（右足首）。', notes: '', contactMethod: 'メール', hasSensitiveDataConsent: true, reminderEmailConsent: false, status: 'cancelled', cancelledBy: 'patient', cancelReason: '日程変更のため', cancelledAt: `${d(-7)}T20:00:00`, createdAt: `${d(-10)}T09:30:00` },
]

export const MOCK_BOOKED_SLOTS: Record<string, string[]> = {
  [T]:      ['09:00', '10:00', '11:00', '14:00', '15:30'],
  [d(1)]:   ['09:30', '11:00', '14:30', '15:00'],
  [d(2)]:   ['09:00', '10:30', '14:00'],
  [d(3)]:   ['10:00', '11:00'],
  [d(5)]:   ['09:30', '14:00', '15:30', '16:00'],
  [d(7)]:   ['09:00', '09:30', '10:00'],
}

export const MOCK_BUSINESS_HOURS: BusinessHours = {
  '0': { open: false },
  '1': { open: true, amOpen: true, amStart: '09:00', amEnd: '12:00', pmOpen: true, pmStart: '14:00', pmEnd: '18:00' },
  '2': { open: true, amOpen: true, amStart: '09:00', amEnd: '12:00', pmOpen: true, pmStart: '14:00', pmEnd: '18:00' },
  '3': { open: true, amOpen: true, amStart: '09:00', amEnd: '12:00', pmOpen: true, pmStart: '14:00', pmEnd: '18:00' },
  '4': { open: true, amOpen: true, amStart: '09:00', amEnd: '12:00', pmOpen: true, pmStart: '14:00', pmEnd: '18:00' },
  '5': { open: true, amOpen: true, amStart: '09:00', amEnd: '12:00', pmOpen: true, pmStart: '14:00', pmEnd: '18:00' },
  '6': { open: true, amOpen: true, amStart: '09:00', amEnd: '12:30', pmOpen: false },
}

export const MOCK_CLINIC = {
  clinicName: 'ひまわり整骨院',
  phone: '03-1234-5678',
}
