import { useEffect, useRef } from 'react'

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
  ready = true,
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ready) return
    const container = ref.current
    if (!container) return
    const targets = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (targets.length === 0) return

    let observer: IntersectionObserver | null = null
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const el  = entry.target as HTMLElement
                const idx = el.dataset.revealIndex ? Number(el.dataset.revealIndex) : 0
                el.style.transitionDelay = `${idx * 60}ms`
                el.classList.add('is-visible')
                observer?.unobserve(el)
              }
            })
          },
          { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options },
        )
        targets.forEach(el => observer!.observe(el))
      })
    })

    return () => {
      cancelAnimationFrame(raf)
      observer?.disconnect()
    }
  }, [ready])

  return ref
}
