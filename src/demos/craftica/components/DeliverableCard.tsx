// 2026-05-20 claude-opus-4-7[1m] セッションターン数：1
// 成果物カード — CSS グラデのサムネ + メタ

import type { Deliverable, Course } from '../types'
import { colorOf, COURSE_TYPE_EMOJI, MEMBER_PALETTE } from '../types'

interface Props {
  deliverable: Deliverable
  course: Course
  memberKey: string
  memberName: string
}

export function DeliverableCard({ deliverable, course, memberKey, memberName }: Props) {
  const color = colorOf(memberKey)
  const palette = MEMBER_PALETTE[deliverable.thumbColorIdx]
  const seed = course.title.charCodeAt(0) ?? 0
  const deg = (seed * 7 + deliverable.thumbColorIdx * 31) % 180
  const bg = `linear-gradient(${deg}deg, ${palette.soft} 0%, ${palette.hex}55 60%, ${palette.soft} 100%)`

  return (
    <div className="ck-card" style={{ overflow: 'hidden', maxWidth: 220 }}>
      <div style={{
        aspectRatio: '4/5', background: bg, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56,
      }}>
        {COURSE_TYPE_EMOJI[course.type]}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
          background: 'rgba(255,255,255,0.95)', color: 'var(--ink-2)',
        }}>
          {COURSE_TYPE_EMOJI[course.type]} {course.type}
        </div>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, marginBottom: 4 }}>
          {deliverable.caption}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: color.hex, color: '#fff',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700,
            }}>{memberName.charAt(0)}</div>
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{memberName}</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{deliverable.completedAt}</span>
        </div>
      </div>
    </div>
  )
}
