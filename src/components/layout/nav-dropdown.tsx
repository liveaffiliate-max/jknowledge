"use client"

// ── NavDropdown ──────────────────────────────────────────────────────────────
// Desktop top-nav dropdown for the "วิเคราะห์" family. Uses Base UI Menu so we
// get keyboard nav, ESC to close, focus management, and click-outside for free.
//
// Mobile rendering lives in mobile-menu.tsx (accordion) — this component is
// rendered only on sm+ in the header.

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "@base-ui/react/menu"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ANALYZE_NAV_ITEMS,
  isAnalyzeItemActive,
  isAnalyzeGroupActive,
} from "./analyze-nav-items"

interface NavDropdownProps {
  /** Trigger label, e.g. "วิเคราะห์" */
  label: string
}

export function NavDropdown({ label }: NavDropdownProps) {
  const pathname = usePathname()
  const groupActive = isAnalyzeGroupActive(pathname)

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 rounded",
          groupActive && "text-green-600 font-semibold"
        )}
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform data-[popup-open]:rotate-180" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={8} align="start" className="z-50">
          <Menu.Popup
            className={cn(
              "min-w-[280px] origin-top rounded-2xl border border-gray-200 bg-white p-1.5 shadow-lg",
              "focus:outline-none"
            )}
          >
            {ANALYZE_NAV_ITEMS.map((item) => {
              const active = isAnalyzeItemActive(pathname, item)
              const Icon = item.icon
              return (
                <Menu.Item
                  key={`${item.href}__${item.label}`}
                  render={
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors cursor-pointer outline-none",
                        "data-[highlighted]:bg-green-50",
                        active && "bg-green-50/60"
                      )}
                    />
                  }
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                      active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-bold tracking-tight",
                        active ? "text-green-800" : "text-gray-900"
                      )}
                    >
                      {item.label}
                    </p>
                    <p className="mt-1 text-[13px] leading-[1.5] text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </Menu.Item>
              )
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
