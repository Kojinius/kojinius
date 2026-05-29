import { useEffect, useState, useRef, useLayoutEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMockAuth } from './MockAuthContext'
import { ThemeToggle } from './ThemeToggle'
import { ROLE_LEVEL } from './types'
import type { MemberDoc } from './types'
import { MOCK_MEMBERS } from './mockData'

const BASE = '/demo/hirake'

interface SlotDef { c: number; r: number }

const LAYOUT_CONFIGS: SlotDef[][] = [
  [{ c: 7, r: 2 }, { c: 5, r: 2 }, { c: 4, r: 1 }, { c: 4, r: 1 }, { c: 4, r: 1 }, { c: 6, r: 1 }, { c: 6, r: 1 }],
  [{ c: 6, r: 2 }, { c: 3, r: 2 }, { c: 3, r: 2 }, { c: 3, r: 1 }, { c: 3, r: 1 }, { c: 3, r: 1 }, { c: 3, r: 1 }],
  [{ c: 4, r: 1 }, { c: 4, r: 1 }, { c: 4, r: 1 }, { c: 8, r: 2 }, { c: 4, r: 2 }, { c: 6, r: 1 }, { c: 6, r: 1 }],
  [{ c: 4, r: 3 }, { c: 8, r: 1 }, { c: 5, r: 2 }, { c: 3, r: 2 }, { c: 4, r: 1 }, { c: 4, r: 1 }, { c: 4, r: 1 }],
  [{ c: 5, r: 3 }, { c: 7, r: 1 }, { c: 4, r: 2 }, { c: 3, r: 2 }, { c: 5, r: 2 }, { c: 4, r: 2 }, { c: 3, r: 2 }],
  [{ c: 6, r: 1 }, { c: 6, r: 1 }, { c: 4, r: 2 }, { c: 4, r: 2 }, { c: 4, r: 2 }, { c: 5, r: 1 }, { c: 7, r: 1 }],
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="100" height="100" fill="var(--surface-2)" />
      <circle cx="50" cy="36" r="17" fill="var(--text-3)" opacity="0.28" />
      <ellipse cx="50" cy="82" rx="30" ry="22" fill="var(--text-3)" opacity="0.16" />
      <line x1="10" y1="95" x2="32" y2="95" stroke="var(--amber)" strokeWidth="1" opacity="0.3" />
      <line x1="68" y1="95" x2="90" y2="95" stroke="var(--amber)" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

function useFLIP(trigger: unknown) {
  const elemsRef   = useRef<Map<string, HTMLElement>>(new Map())
  const prevRects  = useRef<Map<string, DOMRect>>(new Map())
  const animsRef   = useRef<Animation[]>([])
  const isFirst    = useRef(true)

  const snapshot = useCallback(() => {
    prevRects.current.clear()
    elemsRef.current.forEach((el, id) => { prevRects.current.set(id, el.getBoundingClientRect()) })
  }, [])

  const setCardRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) elemsRef.current.set(id, el)
    else    elemsRef.current.delete(id)
  }, [])

  useLayoutEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    if (prevRects.current.size === 0) return
    animsRef.current.forEach(a => a.cancel())
    animsRef.current = []
    elemsRef.current.forEach((el, id) => {
      const prev = prevRects.current.get(id)
      if (!prev) return
      const curr = el.getBoundingClientRect()
      const dx = prev.left - curr.left
      const dy = prev.top  - curr.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
      const anim = el.animate(
        [{ transform: `translate(${dx}px,${dy}px)`, opacity: '0.35' }, { transform: 'translate(0,0)', opacity: '1' }],
        { duration: 750, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)', fill: 'none' },
      )
      animsRef.current.push(anim)
      anim.finished.then(() => anim.cancel()).catch(() => {})
    })
    prevRects.current.clear()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return { snapshot, setCardRef }
}

interface MemberEntry { id: string; data: MemberDoc; slot: SlotDef }

function MemberCard({ id, member, slot, setRef }: { id: string; member: MemberDoc; slot: SlotDef; setRef: (el: HTMLElement | null) => void }) {
  const navigate = useNavigate()
  return (
    <div
      ref={setRef}
      style={{ gridColumn: `span ${slot.c}`, gridRow: `span ${slot.r}` }}
      className="relative overflow-hidden cursor-pointer group bg-[var(--surface)] will-change-transform"
      onClick={() => navigate(`${BASE}/member/${id}`)}
      role="button" tabIndex={0} aria-label={`${member.name} の作品を見る`}
      onKeyDown={e => e.key === 'Enter' && navigate(`${BASE}/member/${id}`)}
    >
      <div className="absolute inset-0">
        {member.avatar
          ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" draggable={false} />
          : <AvatarPlaceholder />
        }
      </div>
      <div className="absolute top-0 left-0 h-[2px] w-full z-20 bg-[var(--amber)] hover-line" />
      <div className="absolute inset-0 flex flex-col justify-end px-5 py-5 bg-gradient-to-t from-black/80 via-black/20 to-transparent hover-overlay">
        <p className="font-display text-white leading-tight text-xl font-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          {member.name}
        </p>
        {member.role && (
          <p className="text-[9px] text-[var(--amber)] tracking-[0.2em] uppercase mt-1.5 font-mono">{member.role}</p>
        )}
      </div>
    </div>
  )
}

const SHUFFLE_MS = 8_000

export function TopPage() {
  const { userDoc, role } = useMockAuth()
  const [entries, setEntries] = useState<MemberEntry[]>([])
  const layoutIdxRef = useRef(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const { snapshot, setCardRef } = useFLIP(entries)
  const gridRef         = useRef<HTMLDivElement>(null)
  const initialAnimDone = useRef(false)

  const nextLayout = useCallback(() => {
    const next = (layoutIdxRef.current + 1 + Math.floor(Math.random() * (LAYOUT_CONFIGS.length - 1))) % LAYOUT_CONFIGS.length
    layoutIdxRef.current = next
    return LAYOUT_CONFIGS[next]
  }, [])

  useEffect(() => {
    const config = LAYOUT_CONFIGS[0]
    setEntries(MOCK_MEMBERS.map((m, i) => ({ id: m.id, data: m.data, slot: config[i % config.length] })))
  }, [])

  const doShuffle = useCallback(() => {
    snapshot()
    setEntries(prev => {
      const config   = nextLayout()
      const shuffled = shuffle(prev)
      return shuffled.map((e, i) => ({ ...e, slot: config[i % config.length] }))
    })
  }, [snapshot, nextLayout])

  useEffect(() => {
    if (entries.length === 0) return
    const t = setInterval(doShuffle, SHUFFLE_MS)
    return () => clearInterval(t)
  }, [entries.length, doShuffle])

  useEffect(() => {
    if (entries.length === 0 || initialAnimDone.current) return
    initialAnimDone.current = true
    const grid = gridRef.current
    if (!grid) return
    Array.from(grid.children as HTMLCollectionOf<HTMLElement>).forEach((card, i) => {
      const anim = card.animate(
        [{ opacity: '0', transform: 'scale(0.88) translateY(14px)' }, { opacity: '1', transform: 'none' }],
        { duration: 420, delay: i * 90, easing: 'cubic-bezier(0.25,0.46,0.45,0.94)', fill: 'backwards' },
      )
      anim.finished.then(() => anim.cancel()).catch(() => {})
    })
  }, [entries.length])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col pb-[120px]">
      <header className="flex-none border-b border-[var(--border)] px-4 md:px-8 py-4 md:py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl md:text-2xl font-black tracking-tight leading-none">
            Hirak<span className="text-[var(--amber)]">é</span>
          </h1>
          <span className="hidden sm:inline text-[var(--text-3)] text-[10px] tracking-wider">デザイン部　ポートフォリオ</span>
        </div>
        <div className="flex items-center gap-3 md:gap-6 text-sm">
          <span className="hidden md:block text-[var(--text-3)] text-xs">
            {userDoc.displayName}
            <span className="ml-2 text-[var(--amber)] text-[10px] tracking-widest uppercase">{role}</span>
          </span>
          {ROLE_LEVEL[role] >= ROLE_LEVEL['staff'] && (
            <Link to={`${BASE}/my/works`} className="hidden sm:inline text-[var(--text-3)] hover:text-[var(--amber)] text-xs font-mono tracking-widest transition-colors">
              マイページ
            </Link>
          )}
          {ROLE_LEVEL[role] >= ROLE_LEVEL['manager'] && (
            <Link to={`${BASE}/admin`} className="hidden sm:inline text-[var(--text-3)] hover:text-[var(--amber)] text-xs font-mono tracking-widest transition-colors">
              ADMIN
            </Link>
          )}
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="sm:hidden flex flex-col gap-1.5 p-1" aria-label="メニューを開く"
          >
            <span className={`block w-5 h-px bg-[var(--text-2)] transition-transform duration-200 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
            <span className={`block w-5 h-px bg-[var(--text-2)] transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-[var(--text-2)] transition-transform duration-200 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="sm:hidden border-b border-[var(--border)] bg-[var(--surface)] flex flex-col">
          {userDoc.displayName && (
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <p className="text-xs text-[var(--text-2)]">{userDoc.displayName}</p>
              <p className="text-[9px] text-[var(--amber)] tracking-[0.2em] uppercase font-mono mt-0.5">{role}</p>
            </div>
          )}
          {ROLE_LEVEL[role] >= ROLE_LEVEL['staff'] && (
            <Link to={`${BASE}/my/works`} onClick={() => setMenuOpen(false)} className="px-4 py-3 text-[10px] tracking-[0.22em] font-mono border-b border-[var(--border)] text-[var(--text-3)] hover:text-[var(--amber)] transition-colors">
              マイページ
            </Link>
          )}
          {ROLE_LEVEL[role] >= ROLE_LEVEL['manager'] && (
            <Link to={`${BASE}/admin`} onClick={() => setMenuOpen(false)} className="px-4 py-3 text-[10px] tracking-[0.22em] font-mono border-b border-[var(--border)] text-[var(--text-3)] hover:text-[var(--amber)] transition-colors">
              ADMIN
            </Link>
          )}
        </div>
      )}

      <main className="flex-1 p-6">
        <div ref={gridRef} className="grid grid-cols-12 gap-1.5 md:gap-2 member-grid">
          {entries.map(entry => (
            <MemberCard key={entry.id} id={entry.id} member={entry.data} slot={entry.slot} setRef={setCardRef(entry.id)} />
          ))}
        </div>
      </main>
    </div>
  )
}
