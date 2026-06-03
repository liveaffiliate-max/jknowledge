"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, Landmark, Brain, LayoutDashboard } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { cn } from "@/lib/utils"

const BASE_ITEMS = [
  { href: "/",        label: "หน้าหลัก",  icon: Home           },
  { href: "/analyze", label: "วิเคราะห์คะแนน", icon: BarChart2       },
  { href: "/scores",  label: "คะแนนย้อนหลัง",     icon: Landmark        },
  { href: "/mbti",    label: "MBTI",       icon: Brain           },
]

const DASHBOARD_ITEM = { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }

export function BottomNav() {
  const pathname  = usePathname()
  const { isSignedIn } = useAuth()
  const NAV_ITEMS = isSignedIn
    ? [...BASE_ITEMS.slice(0, 3), DASHBOARD_ITEM, BASE_ITEMS[3]]
    : BASE_ITEMS

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/50 bg-white/95 backdrop-blur-sm">
      <div className={`grid grid-cols-${NAV_ITEMS.length}`}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active
                  ? "text-green-600"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform duration-150",
                  active && "scale-110"
                )}
              />
              <span>{label}</span>
              {active && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-green-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
