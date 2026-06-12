"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Lock } from "lucide-react"
import { Show } from "@clerk/nextjs"
import { ProfileAvatarLink } from "./profile-avatar-link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { withRedirect } from "@/features/auth/lib/validation"

interface NavLink {
  href:   string
  label:  string
  gated?: boolean
  exact?: boolean
}

interface MobileMenuProps {
  links: NavLink[]
}

function isLinkActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href
  return pathname.startsWith(href)
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="sm:hidden">
      {/* Trigger row: mobile UserButton + hamburger */}
      <div className="flex items-center gap-2">
        <Show when="signed-in">
          <ProfileAvatarLink size={32} />
        </Show>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Drawer — fixed below sticky header (h-16 = 64px) */}
      {open && (
        <div className="fixed inset-x-0 top-16 z-40 border-t border-border/50 bg-white px-4 pb-5 pt-3 space-y-1 shadow-sm">
          {links.map(({ href, label, gated, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isLinkActive(pathname, href, exact)
                  ? "bg-green-50 text-green-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
              )}
            >
              <span>{label}</span>
              {gated && (
                <Show when="signed-out">
                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                </Show>
              )}
            </Link>
          ))}

          {/* Auth section */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <Show when="signed-in">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname.startsWith("/dashboard")
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                )}
              >
                Dashboard
              </Link>
            </Show>
            <Show when="signed-out">
              <Link
                href={withRedirect("/sign-in", pathname)}
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "w-full justify-center text-gray-700"
                )}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href={withRedirect("/sign-up", pathname)}
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "w-full justify-center bg-green-600 hover:bg-green-700 text-white"
                )}
              >
                สมัครสมาชิก
              </Link>
            </Show>
          </div>
        </div>
      )}
    </div>
  )
}
