"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  distance?: number
}

export function FadeIn({ children, className, delay = 0, distance = 18 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    el.style.opacity = "0"
    el.style.transform = `translateY(${distance}px)`
    el.style.transition = `opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1"
          el.style.transform = "translateY(0)"
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, distance])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
