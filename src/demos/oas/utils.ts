// 2026-04-22 claude-sonnet-4-6 セッションターン数：-

export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const DOW = ['日', '月', '火', '水', '木', '金', '土']
  return `${y}年${m}月${d}日（${DOW[dt.getDay()]}）`
}

export function formatDateTimeJa(date: string, time: string): string {
  if (!date) return ''
  return `${date.replace(/-/g, '/')} ${time}`
}

export function calcAge(birthdate: string): number | null {
  if (!birthdate) return null
  const [by, bm, bd] = birthdate.split('-').map(Number)
  const today = new Date()
  let age = today.getFullYear() - by
  if (
    today.getMonth() + 1 < bm ||
    (today.getMonth() + 1 === bm && today.getDate() < bd)
  ) age--
  return age < 0 ? null : age
}

export function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let mins = sh * 60 + sm
  const endMins = eh * 60 + em
  while (mins < endMins) {
    slots.push(`${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`)
    mins += 30
  }
  return slots
}

export function isValidFurigana(v: string): boolean {
  return /^[぀-ゟ゠-ヿ\s　]+$/.test(v)
}

export function isValidZip(v: string): boolean {
  return /^\d{3}-?\d{4}$/.test(v)
}

export function isValidPhone(v: string): boolean {
  return /^[\d\-]{10,15}$/.test(v)
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function toHankaku(s: string): string {
  return s.replace(/[０-９ー]/g, c =>
    c === 'ー' ? '-' : String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
  )
}
