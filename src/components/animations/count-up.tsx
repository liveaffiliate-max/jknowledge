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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = `${to}${suffix}`
      return
    }

    el.textContent = `0${suffix}`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true
          observer.disconnect()

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
