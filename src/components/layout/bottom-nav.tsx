"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart2, Landmark, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/",        label: "หน้าหลัก",  icon: Home      },
  { href: "/analyze", label: "วิเคราะห์", icon: BarChart2  },
  { href: "/scores",  label: "คะแนน",     icon: Landmark   },
  { href: "/mbti",    label: "MBTI",       icon: Brain      },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border/50 bg-white/95 backdrop-blur-sm">
      <div className="grid grid-cols-4">
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
