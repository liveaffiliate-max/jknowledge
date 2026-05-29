"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Show, UserButton } from "@clerk/nextjs"

const NAV_LINKS = [
  { href: "/analyze", label: "วิเคราะห์คะแนน" },
  { href: "/scores",  label: "คะแนนย้อนหลัง" },
  { href: "/mbti",    label: "แนะนำคณะ (MBTI)" },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src="/jknowledge_logo.png"
            alt="Jknowledge"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span className="text-lg font-bold text-gray-900">Jknowledge</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-600">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "transition-colors hover:text-green-600",
                pathname.startsWith(href) && "text-green-600 font-semibold"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Auth — desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-gray-600 hover:text-green-600")}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "sm" }), "bg-green-600 hover:bg-green-700 text-white")}
              >
                สมัครสมาชิก
              </Link>
            </Show>
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-green-600 ring-offset-2 ring-offset-white",
                    userButtonPopoverCard: "shadow-xl border border-border rounded-xl overflow-hidden",
                    userButtonPopoverHeader: "border-b border-border pb-3",
                    userPreviewMainIdentifier: "font-semibold text-foreground text-sm",
                    userPreviewSecondaryIdentifier: "text-muted-foreground text-xs",
                    userButtonPopoverActionButton: "rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors",
                    userButtonPopoverActionButtonIcon: "text-muted-foreground",
                    userButtonPopoverActionButtonText: "text-sm font-medium",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
              />
            </Show>
          </div>

          {/* UserButton visible on mobile too (when signed in) */}
          <div className="sm:hidden">
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 ring-2 ring-green-600 ring-offset-1 ring-offset-white",
                    userButtonPopoverCard: "shadow-xl border border-border rounded-xl overflow-hidden",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
              />
            </Show>
          </div>

          {/* Hamburger button — mobile only */}
          <button
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="sm:hidden border-t border-border/50 bg-white px-4 pb-5 pt-3 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-green-50 text-green-700"
                  : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
              )}
            >
              {label}
            </Link>
          ))}

          {/* Auth — mobile */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <Show when="signed-out">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full justify-center text-gray-700")}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ size: "sm" }), "w-full justify-center bg-green-600 hover:bg-green-700 text-white")}
              >
                สมัครสมาชิก
              </Link>
            </Show>
          </div>
        </div>
      )}
    </header>
  )
}
