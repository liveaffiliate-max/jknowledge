"use client"

import { useEffect, useRef } from "react"

interface CountUpProps {
  to: number
  duration?: number
  suffix?: string
  className?: string
}

export function CountUp({ to, duration = 1400, suffix = "", className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const hasStarted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let firstEntry = true

    const animate = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        // ease-out-quart
        const eased = 1 - Math.pow(1 - progress, 4)
        el.textContent = `${Math.round(eased * to)}${suffix}`
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    // Use first observer callback to check initial visibility.
    // Above-fold: keep SSR final value, skip animation (no flash to 0).
    // Below-fold: reset to 0 and animate when scrolled into view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (firstEntry) {
          firstEntry = false
          if (!entry.isIntersecting) {
            el.textContent = `0${suffix}`
            return
          }
          // already visible — keep SSR value, no animation needed
          observer.disconnect()
          return
        }
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true
          observer.disconnect()
          animate()
        }
      },
      { threshold: 0.6 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [to, duration, suffix])

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {to}{suffix}
    </span>
  )
}
