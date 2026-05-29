// 2026-04-22 claude-sonnet-4-6 セッションターン数：3
export type Role = 'admin' | 'manager' | 'staff' | 'user'

export interface Employee {
  id: string
  userId: string
  displayName: string
  role: Role
  dept: string
  employmentType: string
  email: string
  isActive: boolean
}

export interface AttendanceRecord {
  id: string
  uid: string
  userId: string
  displayName: string
  date: string
  startTime: string
  endTime: string
  breakMinutes: number
  workMinutes: number
  attendanceType: string
  remarks: string
  approverName?: string
}

export interface ShiftRecord {
  id: string
  uid: string
  displayName: string
  dates: string[]
  shiftType: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  adminComment?: string
  approverName?: string
  createdAt: string
}

export interface LeaveRequest {
  id: string
  uid: string
  displayName: string
  targetDate: string
  leaveType: 'full' | 'half_am' | 'half_pm' | 'hourly'
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approverName?: string
  createdAt: string
}

export interface LeaveBalance {
  grantedDays: number
  usedDays: number
  remainingDays: number
  grantedAt: string
  expiresAt: string
}

export interface CorrectionRequest {
  id: string
  uid: string
  displayName: string
  attendanceId: string
  targetDate: string
  deptId: string
  originalData: { startTime: string; endTime: string; breakMinutes: number; attendanceType: string }
  correctedData: Partial<{ startTime: string; endTime: string; breakMinutes: number; attendanceType: string }>
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approverName?: string
  createdAt: string
}

export interface AuditLogEntry {
  id: string
  uid: string
  displayName: string
  action: string
  target: string
  detail: string
  createdAt: string
}
