import { useLayoutEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'
import { useScrollReveal } from './useScrollReveal'
import type { WorkDoc } from './types'
import { MOCK_MEMBERS, MOCK_WORKS } from './mockData'

const BASE = '/demo/hirake'

function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="100" height="100" fill="var(--surface-2)" />
      <circle cx="50" cy="36" r="17" fill="var(--text-3)" opacity="0.28" />
      <ellipse cx="50" cy="82" rx="30" ry="22" fill="var(--text-3)" opacity="0.16" />
    </svg>
  )
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] ?? null
}

interface LightboxProps { src: string; type: 'image' | 'video'; onClose: () => void; originRect: DOMRect }

function Lightbox({ src, type, onClose, originRect }: LightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    overlayRef.current?.animate([{ opacity: '0' }, { opacity: '1' }], { duration: 220, easing: 'ease-out', fill: 'backwards' })
    const content = contentRef.current
    if (!content) return
    const cr    = content.getBoundingClientRect()
    const dx    = (originRect.left + originRect.width  / 2) - (cr.left + cr.width  / 2)
    const dy    = (originRect.top  + originRect.height / 2) - (cr.top  + cr.height / 2)
    const scale = Math.min(originRect.width / cr.width, originRect.height / cr.height)
    content.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: '0.4' }, { transform: 'none', opacity: '1' }],
      { duration: 420, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'backwards' },
    )
  }, [originRect])

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] bg-black/92 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center text-white text-xl leading-none transition-colors duration-200" onClick={onClose} aria-label="閉じる">×</button>
      <div ref={contentRef} onClick={e => e.stopPropagation()} className="max-w-5xl w-full">
        {type === 'image'
          ? <img src={src} alt="" className="w-full h-auto max-h-[85vh] object-contain" />
          : <div className="aspect-video w-full"><iframe src={`https://www.youtube.com/embed/${src}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen /></div>
        }
      </div>
    </div>
  )
}

interface WorkEntry extends WorkDoc { id: string }

function WorkCard({ work, onOpenLightbox }: { work: WorkEntry; onOpenLightbox: (src: string, type: 'image' | 'video', originRect: DOMRect) => void }) {
  const [audioPlaying, setAudioPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const descRef  = useRef<HTMLParagraphElement>(null)
  const [descTruncated, setDescTruncated] = useState(false)
  const [descOpen, setDescOpen]           = useState(false)

  useLayoutEffect(() => {
    const el = descRef.current
    if (!el) return
    setDescTruncated(el.scrollHeight > el.clientHeight + 1)
  }, [work.description])

  const renderThumb = () => {
    if (work.type === 'image') return (
      <div className="aspect-[4/3] overflow-hidden cursor-pointer bg-[var(--surface-2)] relative group"
        onClick={e => onOpenLightbox(work.url, 'image', (e.currentTarget as HTMLElement).getBoundingClientRect())}>
        {work.thumbnail
          ? <img src={work.thumbnail} alt={work.title} className="w-full h-full object-cover hover-zoom" />
          : <div className="w-full h-full flex items-center justify-center"><svg viewBox="0 0 24 24" className="w-10 h-10 fill-[var(--text-3)] opacity-40"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>
        }
        <div className="absolute top-0 left-0 h-[2px] w-full bg-[var(--amber)] hover-line" />
      </div>
    )
    if (work.type === 'video') {
      const ytId = getYouTubeId(work.url)
      return (
        <div className="aspect-[4/3] overflow-hidden cursor-pointer bg-black relative group"
          onClick={e => ytId && onOpenLightbox(ytId, 'video', (e.currentTarget as HTMLElement).getBoundingClientRect())}>
          {ytId ? (
            <>
              <img src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} alt={work.title} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center group-hover:bg-[var(--amber)] transition-colors duration-300">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white ml-1"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </>
          ) : <div className="w-full h-full flex items-center justify-center bg-[var(--surface-2)]"><span className="text-[var(--text-3)] text-xs">無効なURL</span></div>
          }
          <div className="absolute top-0 left-0 h-[2px] w-full bg-[var(--amber)] hover-line" />
        </div>
      )
    }
    if (work.type === 'audio') return (
      <div className="aspect-[4/3] bg-[var(--surface-2)] flex flex-col items-center justify-center gap-5 px-6">
        <div className="flex gap-[3px] items-end h-10">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-[3px] rounded-full"
              style={{ height: `${16 + Math.sin(i * 0.75) * 13}px`, background: audioPlaying ? 'var(--amber)' : 'var(--text-3)', opacity: audioPlaying ? 0.9 : 0.35, animation: audioPlaying ? `bar 1.2s ease-in-out ${i * 0.08}s infinite` : 'none' }} />
          ))}
        </div>
        <button onClick={() => { if (!audioRef.current) return; if (audioPlaying) { audioRef.current.pause(); setAudioPlaying(false) } else { audioRef.current.play(); setAudioPlaying(true) } }}
          className="w-10 h-10 rounded-full border border-[var(--amber)] flex items-center justify-center hover:bg-[var(--amber)] transition-colors duration-200 group/btn" aria-label={audioPlaying ? '一時停止' : '再生'}>
          {audioPlaying
            ? <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[var(--amber)] group-hover/btn:fill-black"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[var(--amber)] ml-0.5 group-hover/btn:fill-black"><path d="M8 5v14l11-7z"/></svg>
          }
        </button>
        <audio ref={audioRef} src={work.url} onEnded={() => setAudioPlaying(false)} />
      </div>
    )
    if (work.type === 'pdf') return (
      <div className="aspect-[4/3] bg-[var(--surface-2)] flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
        {work.thumbnail && <img src={work.thumbnail} alt={work.title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="relative z-10 flex flex-col items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white/80 group-hover:fill-[var(--amber)] transition-colors duration-300"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
          <span className="text-[9px] text-[var(--amber)] tracking-[0.25em] uppercase font-mono">PDF — 開く ↗</span>
        </div>
        <div className="absolute top-0 left-0 h-[2px] w-full bg-[var(--amber)] hover-line" />
      </div>
    )
    return (
      <div className="aspect-[4/3] bg-[var(--surface-2)] flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
        {work.thumbnail && <img src={work.thumbnail} alt={work.title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="relative z-10 flex flex-col items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white/80 group-hover:fill-[var(--amber)] transition-colors duration-300"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          <span className="text-[9px] text-[var(--amber)] tracking-[0.25em] uppercase font-mono">Web — 開く ↗</span>
        </div>
        <div className="absolute top-0 left-0 h-[2px] w-full bg-[var(--amber)] hover-line" />
      </div>
    )
  }

  return (
    <article className="bg-[var(--surface)] flex flex-col flex-1">
      {renderThumb()}
      <div className="px-4 py-3 border-t border-[var(--border)] flex-1 flex flex-col">
        <div className="h-10 flex-none overflow-hidden mb-1.5">
          <p className="font-display font-bold text-[var(--text-1)] text-sm leading-snug line-clamp-2">{work.title}</p>
        </div>
        <div className="flex-none">
          {work.description && (
            <div>
              <p ref={descRef} className={`text-[var(--text-3)] text-xs leading-relaxed line-clamp-1 select-none ${descTruncated ? 'cursor-pointer hover:text-[var(--text-2)] transition-colors duration-150' : ''}`}
                onMouseEnter={() => descTruncated && setDescOpen(true)} onMouseLeave={() => setDescOpen(false)}>
                {work.description}
              </p>
              <div className="grid transition-all duration-[320ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ gridTemplateRows: descOpen ? '1fr' : '0fr', opacity: descOpen ? 1 : 0 }}
                onMouseEnter={() => setDescOpen(true)} onMouseLeave={() => setDescOpen(false)}>
                <div className="overflow-hidden">
                  <div className="mt-2 px-3 py-2.5 border-l-2 border-[var(--amber)] bg-gradient-to-br from-[var(--amber)]/8 via-[var(--surface-2)] to-[var(--surface-2)] text-[var(--text-2)] text-xs leading-relaxed tracking-wide">
                    {work.description}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1" />
        <p className="text-[8px] text-[var(--text-3)] tracking-[0.2em] uppercase font-mono mt-2 flex-none opacity-50">{work.type}</p>
      </div>
    </article>
  )
}

export function MemberPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const memberEntry = MOCK_MEMBERS.find(m => m.id === id)
  const member      = memberEntry?.data ?? null
  const works       = id ? (MOCK_WORKS[id] ?? []) : []
  const [workList, setWorkList] = useState(works)
  const [lightbox, setLightbox] = useState<{ src: string; type: 'image' | 'video'; originRect: DOMRect } | null>(null)
  const [dragSrc,  setDragSrc]  = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  const revealRef = useScrollReveal(undefined, !!member)

  const cardRefs      = useRef<Map<string, HTMLElement>>(new Map())
  const prevCardRects = useRef<Map<string, DOMRect>>(new Map())
  const setWorkCardRef = useCallback((wid: string) => (el: HTMLElement | null) => {
    if (el) cardRefs.current.set(wid, el)
    else    cardRefs.current.delete(wid)
  }, [])
  const snapshotCards = useCallback(() => {
    prevCardRects.current.clear()
    cardRefs.current.forEach((el, wid) => { prevCardRects.current.set(wid, el.getBoundingClientRect()) })
  }, [])

  const handleDrop = (targetIdx: number) => {
    if (dragSrc === null || dragSrc === targetIdx) { setDragSrc(null); setDragOver(null); return }
    snapshotCards()
    const next = [...workList]
    const [moved] = next.splice(dragSrc, 1)
    next.splice(targetIdx, 0, moved)
    setWorkList(next)
    setDragSrc(null); setDragOver(null)
  }

  useLayoutEffect(() => {
    if (prevCardRects.current.size === 0) return
    const moving: HTMLElement[] = []
    cardRefs.current.forEach((el, wid) => {
      const prev = prevCardRects.current.get(wid)
      if (!prev) return
      const curr = el.getBoundingClientRect()
      const dx = prev.left - curr.left
      const dy = prev.top  - curr.top
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
      el.style.setProperty('transition', 'none', 'important')
      el.style.setProperty('transform', `translate(${dx}px, ${dy}px)`, 'important')
      moving.push(el)
    })
    if (moving.length > 0) {
      void moving[0].offsetHeight
      moving.forEach(el => {
        el.style.setProperty('transition', 'transform 350ms cubic-bezier(0.25,0.46,0.45,0.94)', 'important')
        el.style.setProperty('transform', 'translate(0,0)', 'important')
      })
      moving.forEach(el => {
        el.addEventListener('transitionend', function cleanup() { el.style.removeProperty('transition'); el.style.removeProperty('transform') }, { once: true })
        setTimeout(() => { el.style.removeProperty('transition'); el.style.removeProperty('transform') }, 400)
      })
    }
    prevCardRects.current.clear()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workList])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-1)] flex flex-col pb-[120px]">
      <header className="flex-none border-b border-[var(--border)] px-4 md:px-8 py-4 md:py-5 flex items-center justify-between">
        <button onClick={() => navigate(BASE)} className="flex items-center gap-3 group">
          <span className="text-[var(--amber)] transition-transform duration-200 group-hover:-translate-x-1">←</span>
          <h1 className="font-display text-2xl font-black tracking-tight leading-none">Hirak<span className="text-[var(--amber)]">é</span></h1>
        </button>
        <ThemeToggle />
      </header>

      {!member ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="h-px w-12 bg-[var(--amber)]" />
          <p className="text-[var(--text-3)] text-sm tracking-wider">メンバーが見つかりません</p>
        </div>
      ) : (
        <main className="flex-1" ref={revealRef}>
          <section className="px-4 md:px-8 py-8 md:py-12 border-b border-[var(--border)]">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-6 md:gap-10 items-start">
              <div className="w-24 h-24 md:w-36 md:h-36 flex-none overflow-hidden bg-[var(--surface-2)]">
                {member.avatar ? <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" /> : <AvatarPlaceholder />}
              </div>
              <div className="flex-1 pt-1">
                <div className="h-px w-8 bg-[var(--amber)] mb-4" data-reveal="line" />
                <h2 className="font-display text-4xl font-black tracking-tight leading-none" data-reveal="text">
                  <span>{member.name}</span>
                </h2>
                {member.role && <p className="text-[10px] text-[var(--amber)] tracking-[0.28em] uppercase font-mono mt-3" data-reveal="fade" data-reveal-index="0">{member.role}</p>}
                {member.bio  && <p className="text-[var(--text-2)] text-sm leading-relaxed mt-4 max-w-lg whitespace-pre-wrap" data-reveal="fade" data-reveal-index="1">{member.bio}</p>}
              </div>
            </div>
          </section>

          <section className="px-4 md:px-8 py-8 md:py-10 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-[9px] text-[var(--text-3)] tracking-[0.35em] uppercase font-mono">Works</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
            {workList.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="h-px w-12 bg-[var(--amber)]" />
                <p className="text-[var(--text-3)] text-sm tracking-wider">作品がまだ登録されていません</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {workList.map((work, i) => (
                  <div key={work.id} ref={setWorkCardRef(work.id)} data-reveal="card" data-reveal-index={i}
                    className={`relative group/card flex flex-col cursor-grab active:cursor-grabbing`}
                    draggable onDragStart={() => setDragSrc(i)} onDragOver={e => { e.preventDefault(); if (dragOver !== i) setDragOver(i) }}
                    onDrop={() => handleDrop(i)} onDragEnd={() => { setDragSrc(null); setDragOver(null) }}
                    style={{ opacity: dragSrc === i ? 0.35 : 1 }}
                  >
                    <WorkCard work={work} onOpenLightbox={(src, type, originRect) => setLightbox({ src, type, originRect })} />
                    <div className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 rounded text-white/70 select-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-150 pointer-events-none">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                        <circle cx="2" cy="2" r="1.2"/><circle cx="8" cy="2" r="1.2"/>
                        <circle cx="2" cy="5" r="1.2"/><circle cx="8" cy="5" r="1.2"/>
                        <circle cx="2" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/>
                      </svg>
                    </div>
                    {dragOver === i && dragSrc !== i && <div className="absolute inset-0 border-2 border-[var(--amber)] pointer-events-none z-10" />}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {lightbox && <Lightbox src={lightbox.src} type={lightbox.type} originRect={lightbox.originRect} onClose={() => setLightbox(null)} />}
      <style>{`@keyframes bar { 0%,100% { transform: scaleY(0.3); opacity: 0.3; } 50% { transform: scaleY(1.0); opacity: 0.9; } }`}</style>
    </div>
  )
}
