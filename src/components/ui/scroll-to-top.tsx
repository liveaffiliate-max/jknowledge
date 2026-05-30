"use client"

import { useEffect, useState } from "react"
import { ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="กลับขึ้นด้านบน"
      className={cn(
        "fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center",
        "rounded-full bg-white border border-gray-200 shadow-md",
        "text-gray-500 hover:text-green-600 hover:border-green-300 hover:shadow-lg",
        "transition-all duration-200"
      )}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  )
}
