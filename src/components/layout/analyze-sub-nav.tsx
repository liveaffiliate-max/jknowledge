"use client"

// ── AnalyzeSubNav ────────────────────────────────────────────────────────────
// Sticky tab bar rendered at the top of every /analyze* page. Lets users hop
// between วิเคราะห์เดี่ยว ↔ เปรียบเทียบหลายคณะ without going back to the dropdown.
//
// Renders below the sticky header (h-16) so it stays visible during scroll.

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ANALYZE_SUB_TABS, isAnalyzeItemActive } from "./analyze-nav-items"

export function AnalyzeSubNav() {
  const pathname = usePathname()

  return (
    <div className="sticky top-16 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-1 overflow-x-auto px-4 py-2 scrollbar-none">
        {ANALYZE_SUB_TABS.map((item) => {
          const active = isAnalyzeItemActive(pathname, item)
          const Icon   = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors",
                active
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
