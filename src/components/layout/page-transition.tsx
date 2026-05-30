"use client"

import { usePathname } from "next/navigation"

/**
 * Wraps page content with a fade-in animation on every route change.
 * Uses pathname as key so React remounts the div on navigation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      className="animate-in fade-in duration-200"
    >
      {children}
    </div>
  )
}
