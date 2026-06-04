"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

/**
 * Fade-in transition on route change — re-triggers CSS animation WITHOUT
 * unmounting/remounting the React tree (unlike key={pathname} which destroys
 * the entire subtree and forces a full re-render on every navigation).
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Reset animation by clearing animationName, forcing a reflow, then restoring —
    // the browser re-triggers the @keyframes without unmounting the tree.
    el.style.animationName = "none"
    void el.offsetHeight           // sync reflow — forces layout before next paint
    el.style.animationName = ""
  }, [pathname])

  return (
    <div ref={ref} className="animate-in fade-in duration-200">
      {children}
    </div>
  )
}
