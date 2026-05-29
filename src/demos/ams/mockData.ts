// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
import type {
  Employee, AttendanceRecord, ShiftRecord, LeaveRequest,
  LeaveBalance, CorrectionRequest, AuditLogEntry,
} from './types'

export const EMPLOYEES: Employee[] = [
  { id: 'EMP001', userId: 'U001', displayName: '橋本 晃治', role: 'admin',   dept: 'システム開発部', employmentType: '正社員', email: 'hashimoto@example.com', isActive: true },
  { id: 'EMP002', userId: 'U002', displayName: '田中 太郎', role: 'staff',   dept: 'システム開発部', employmentType: '正社員', email: 'tanaka@example.com',    isActive: true },
  { id: 'EMP003', userId: 'U003', displayName: '山田 花子', role: 'manager', dept: '総務部',         employmentType: '正社員', email: 'yamada@example.com',    isActive: true },
  { id: 'EMP004', userId: 'U004', displayName: '鈴木 一朗', role: 'staff',   dept: '総務部',         employmentType: 'パート', email: 'suzuki@example.com',    isActive: true },
  { id: 'EMP005', userId: 'U005', displayName: '佐藤 美咲', role: 'staff',   dept: 'デザイン部',     employmentType: '正社員', email: 'sato@example.com',      isActive: false },
]

export const SELF = EMPLOYEES[0]

// 4月の稼働日(平日)の勤怠レコード for SELF
const raw: [string, string, string, string, number, number][] = [
  ['2026-04-01', '09:00', '18:05', '通常',   60, 481],
  ['2026-04-02', '09:02', '17:58', '通常',   60, 476],
  ['2026-04-03', '09:00', '18:30', '通常',   60, 510],
  ['2026-04-06', '09:05', '18:00', '通常',   60, 475],
  ['2026-04-07', '08:58', '18:10', '通常',   60, 492],
  ['2026-04-08', '09:00', '18:00', '通常',   60, 480],
  ['2026-04-09', '09:00', '19:30', '通常',   60, 570],
  ['2026-04-10', '08:55', '17:55', '通常',   60, 480],
  ['2026-04-13', '09:00', '18:00', '通常',   60, 480],
  ['2026-04-14', '10:30', '18:00', '遅刻',   60, 390],
  ['2026-04-15', '09:00', '18:00', '通常',   60, 480],
  ['2026-04-16', '09:00', '18:00', '通常',   60, 480],
  ['2026-04-17', '--:--', '--:--', '有休',    0,   0],
  ['2026-04-20', '09:00', '18:05', '通常',   60, 485],
  ['2026-04-21', '09:00', '18:00', '通常',   60, 480],
  // 今日 04-22 は出勤中（退勤前）
  ['2026-04-22', '09:03', '--:--', '通常',   60,   0],
]

export const SELF_ATTENDANCE: AttendanceRecord[] = raw.map(([date, startTime, endTime, attendanceType, breakMinutes, workMinutes], i) => ({
  id: `ATT-SELF-${i + 1}`,
  uid: SELF.id,
  userId: SELF.userId,
  displayName: SELF.displayName,
  date, startTime, endTime, attendanceType, breakMinutes, workMinutes, remarks: '',
}))

// 全社員分（管理者向け）— 簡略版
function makeRecords(emp: Employee, dates: [string, string, string, string, number, number][]): AttendanceRecord[] {
  return dates.map(([date, startTime, endTime, attendanceType, breakMinutes, workMinutes], i) => ({
    id: `ATT-${emp.id}-${i + 1}`,
    uid: emp.id, userId: emp.userId, displayName: emp.displayName,
    date, startTime, endTime, attendanceType, breakMinutes, workMinutes, remarks: '',
  }))
}

export const ALL_ATTENDANCE: AttendanceRecord[] = [
  ...SELF_ATTENDANCE,
  ...makeRecords(EMPLOYEES[1], [
    ['2026-04-01','09:00','18:00','通常',60,480],['2026-04-02','09:00','18:00','通常',60,480],
    ['2026-04-03','09:00','17:30','通常',60,450],['2026-04-06','09:10','18:00','通常',60,470],
    ['2026-04-07','09:00','18:00','通常',60,480],['2026-04-08','09:00','18:00','通常',60,480],
    ['2026-04-09','09:00','18:00','通常',60,480],['2026-04-10','09:00','18:00','通常',60,480],
    ['2026-04-13','09:00','18:00','通常',60,480],['2026-04-14','09:00','18:00','通常',60,480],
    ['2026-04-15','09:00','18:00','通常',60,480],['2026-04-16','09:00','17:00','早退',60,420],
    ['2026-04-17','09:00','18:00','通常',60,480],['2026-04-20','09:00','18:00','通常',60,480],
    ['2026-04-21','09:00','18:00','通常',60,480],['2026-04-22','09:05','--:--','通常',60,0],
  ]),
  ...makeRecords(EMPLOYEES[2], [
    ['2026-04-01','09:00','18:00','通常',60,480],['2026-04-02','09:00','18:00','通常',60,480],
    ['2026-04-03','09:00','18:00','通常',60,480],['2026-04-06','09:00','18:00','通常',60,480],
    ['2026-04-07','09:00','18:00','通常',60,480],['2026-04-08','--:--','--:--','有休',0,0],
    ['2026-04-09','09:00','18:00','通常',60,480],['2026-04-10','09:00','18:00','通常',60,480],
    ['2026-04-13','09:00','18:00','通常',60,480],['2026-04-14','09:00','18:00','通常',60,480],
    ['2026-04-15','09:00','18:00','通常',60,480],['2026-04-16','09:00','18:00','通常',60,480],
    ['2026-04-17','09:00','18:00','通常',60,480],['2026-04-20','09:00','18:00','通常',60,480],
    ['2026-04-21','09:00','18:00','通常',60,480],['2026-04-22','09:00','--:--','通常',60,0],
  ]),
  ...makeRecords(EMPLOYEES[3], [
    ['2026-04-01','10:00','17:00','通常',45,345],['2026-04-03','10:00','17:00','通常',45,345],
    ['2026-04-07','10:00','17:00','通常',45,345],['2026-04-09','10:00','17:00','通常',45,345],
    ['2026-04-10','10:00','17:00','通常',45,345],['2026-04-14','10:00','17:00','通常',45,345],
    ['2026-04-16','10:00','17:00','通常',45,345],['2026-04-21','10:00','17:00','通常',45,345],
    ['2026-04-22','10:00','--:--','通常',45,0],
  ]),
]

export const SHIFT_RECORDS: ShiftRecord[] = [
  { id: 'SHF001', uid: SELF.id, displayName: SELF.displayName, dates: ['2026-04-14'], shiftType: '遅刻', reason: '通院のため', status: 'approved', approverName: '山田 花子', createdAt: '2026-04-13T18:00:00' },
  { id: 'SHF002', uid: SELF.id, displayName: SELF.displayName, dates: ['2026-04-25'], shiftType: '早退', reason: '子供の迎えのため', status: 'pending', createdAt: '2026-04-21T09:00:00' },
  { id: 'SHF003', uid: SELF.id, displayName: SELF.displayName, dates: ['2026-04-16'], shiftType: '早退', reason: '体調不良', status: 'rejected', adminComment: '当日の対応が困難なため却下', approverName: '山田 花子', createdAt: '2026-04-15T12:00:00' },
  { id: 'SHF004', uid: EMPLOYEES[1].id, displayName: EMPLOYEES[1].displayName, dates: ['2026-04-28'], shiftType: '欠勤', reason: '忌引のため', status: 'pending', createdAt: '2026-04-22T08:00:00' },
  { id: 'SHF005', uid: EMPLOYEES[3].id, displayName: EMPLOYEES[3].displayName, dates: ['2026-04-24', '2026-04-25'], shiftType: '早退', reason: '体調不良', status: 'pending', createdAt: '2026-04-22T07:30:00' },
]

export const LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'LVR001', uid: SELF.id, displayName: SELF.displayName, targetDate: '2026-04-17', leaveType: 'full', reason: '私用のため', status: 'approved', approverName: '山田 花子', createdAt: '2026-04-10T10:00:00' },
  { id: 'LVR002', uid: SELF.id, displayName: SELF.displayName, targetDate: '2026-03-14', leaveType: 'full', reason: '通院のため', status: 'approved', approverName: '山田 花子', createdAt: '2026-03-10T09:00:00' },
  { id: 'LVR003', uid: SELF.id, displayName: SELF.displayName, targetDate: '2026-03-03', leaveType: 'half_am', reason: '歯科受診', status: 'approved', approverName: '山田 花子', createdAt: '2026-03-01T08:00:00' },
  { id: 'LVR004', uid: EMPLOYEES[1].id, displayName: EMPLOYEES[1].displayName, targetDate: '2026-04-28', leaveType: 'full', reason: '旅行のため', status: 'pending', createdAt: '2026-04-20T15:00:00' },
  { id: 'LVR005', uid: EMPLOYEES[2].id, displayName: EMPLOYEES[2].displayName, targetDate: '2026-04-08', leaveType: 'full', reason: '結婚記念日', status: 'approved', approverName: '橋本 晃治', createdAt: '2026-04-01T09:00:00' },
]

export const SELF_LEAVE_BALANCE: LeaveBalance = {
  grantedDays: 15,
  usedDays: 2.5,
  remainingDays: 12.5,
  grantedAt: '2026-04-01',
  expiresAt: '2027-03-31',
}

export const CORRECTION_REQUESTS: CorrectionRequest[] = [
  {
    id: 'COR001', uid: SELF.id, displayName: SELF.displayName,
    attendanceId: 'ATT-SELF-2', targetDate: '2026-04-02', deptId: 'D001',
    originalData:  { startTime: '09:02', endTime: '17:58', breakMinutes: 60, attendanceType: '通常' },
    correctedData: { endTime: '18:30' },
    reason: '残業があったため退勤時刻の修正を依頼します', status: 'pending', createdAt: '2026-04-05T10:00:00',
  },
  {
    id: 'COR002', uid: EMPLOYEES[1].id, displayName: EMPLOYEES[1].displayName,
    attendanceId: 'ATT-EMP002-13', targetDate: '2026-04-16', deptId: 'D001',
    originalData:  { startTime: '09:00', endTime: '17:00', breakMinutes: 60, attendanceType: '通常' },
    correctedData: { attendanceType: '早退' },
    reason: '体調不良で早退したため勤務種別を修正お願いします', status: 'pending', createdAt: '2026-04-17T09:00:00',
  },
  {
    id: 'COR003', uid: EMPLOYEES[2].id, displayName: EMPLOYEES[2].displayName,
    attendanceId: 'ATT-EMP003-3', targetDate: '2026-04-03', deptId: 'D002',
    originalData:  { startTime: '09:00', endTime: '18:00', breakMinutes: 60, attendanceType: '通常' },
    correctedData: { endTime: '19:00' },
    reason: '月次資料の作成で残業', status: 'approved', approverName: '橋本 晃治', createdAt: '2026-04-04T08:00:00',
  },
]

export const AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'LOG001', uid: SELF.id, displayName: SELF.displayName, action: '出勤打刻',     target: '勤怠',   detail: '09:03 出勤登録',                      createdAt: '2026-04-22T09:03:05' },
  { id: 'LOG002', uid: EMPLOYEES[1].id, displayName: EMPLOYEES[1].displayName, action: '出勤打刻', target: '勤怠', detail: '09:05 出勤登録', createdAt: '2026-04-22T09:05:12' },
  { id: 'LOG003', uid: EMPLOYEES[2].id, displayName: EMPLOYEES[2].displayName, action: '出勤打刻', target: '勤怠', detail: '09:00 出勤登録', createdAt: '2026-04-22T09:00:55' },
  { id: 'LOG004', uid: EMPLOYEES[3].id, displayName: EMPLOYEES[3].displayName, action: '出勤打刻', target: '勤怠', detail: '10:00 出勤登録', createdAt: '2026-04-22T10:00:30' },
  { id: 'LOG005', uid: EMPLOYEES[1].id, displayName: EMPLOYEES[1].displayName, action: 'シフト申請', target: 'シフト', detail: '2026-04-28 欠勤申請', createdAt: '2026-04-22T08:00:21' },
  { id: 'LOG006', uid: EMPLOYEES[3].id, displayName: EMPLOYEES[3].displayName, action: 'シフト申請', target: 'シフト', detail: '2026-04-24,25 早退申請', createdAt: '2026-04-22T07:30:44' },
  { id: 'LOG007', uid: SELF.id, displayName: SELF.displayName, action: '有給承認',    target: '有給',   detail: 'LVR005 山田 花子 承認',                createdAt: '2026-04-21T15:22:00' },
  { id: 'LOG008', uid: SELF.id, displayName: SELF.displayName, action: '退勤打刻',    target: '勤怠',   detail: '18:00 退勤登録',                      createdAt: '2026-04-21T18:00:10' },
  { id: 'LOG009', uid: EMPLOYEES[1].id, displayName: EMPLOYEES[1].displayName, action: '退勤打刻', target: '勤怠', detail: '18:00 退勤登録', createdAt: '2026-04-21T18:00:44' },
  { id: 'LOG010', uid: EMPLOYEES[2].id, displayName: EMPLOYEES[2].displayName, action: '退勤打刻', target: '勤怠', detail: '18:00 退勤登録', createdAt: '2026-04-21T18:01:05' },
  { id: 'LOG011', uid: SELF.id, displayName: SELF.displayName, action: '修正申請',    target: '勤怠修正', detail: '2026-04-02 退勤時刻修正',             createdAt: '2026-04-20T18:10:00' },
  { id: 'LOG012', uid: EMPLOYEES[2].id, displayName: EMPLOYEES[2].displayName, action: '修正承認', target: '勤怠修正', detail: 'COR003 承認', createdAt: '2026-04-20T10:05:00' },
  { id: 'LOG013', uid: SELF.id, displayName: SELF.displayName, action: 'ユーザー更新', target: 'ユーザー', detail: 'EMP005 佐藤 美咲 ステータス変更', createdAt: '2026-04-19T14:00:00' },
  { id: 'LOG014', uid: SELF.id, displayName: SELF.displayName, action: 'シフト却下',  target: 'シフト',  detail: 'SHF003 橋本 晃治 却下',               createdAt: '2026-04-16T09:00:00' },
  { id: 'LOG015', uid: SELF.id, displayName: SELF.displayName, action: 'シフト承認',  target: 'シフト',  detail: 'SHF001 橋本 晃治 承認',               createdAt: '2026-04-13T19:00:00' },
]

export const DEPARTMENTS = ['システム開発部', '総務部', 'デザイン部']
export const EMPLOYMENT_TYPES = ['正社員', 'パート', '契約社員', 'アルバイト']
export const WORK_TYPES = ['通常', '遅刻', '早退', '欠勤', '休日出勤', '有休', '午前休', '午後休']
export const HOLIDAYS_APR_2026 = [
  { date: '2026-04-29', name: '昭和の日' },
]

export function minutesToHHMM(min: number): string {
  if (min <= 0) return '0:00'
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}:${String(m).padStart(2, '0')}`
}

export const ATTENDANCE_TYPE_COLORS: Record<string, string> = {
  '通常':     'bg-matsu/10 text-matsu',
  '遅刻':     'bg-amber-100 text-amber-700',
  '早退':     'bg-amber-100 text-amber-700',
  '欠勤':     'bg-shu/10 text-shu',
  '休日出勤': 'bg-bauhaus-yellow/20 text-yellow-700',
  '有休':     'bg-green-100 text-green-700',
  '午前休':   'bg-green-100 text-green-700',
  '午後休':   'bg-green-100 text-green-700',
}
