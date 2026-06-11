"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Lock } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Show } from "@clerk/nextjs"
import { MobileMenu } from "./mobile-menu"
import { ProfileAvatarLink } from "./profile-avatar-link"

const NAV_LINKS = [
  { href: "/analyze",    label: "วิเคราะห์คะแนน" },
  { href: "/scores",     label: "คะแนนย้อนหลัง" },
  { href: "/mbti",       label: "ทดสอบ MBTI" },
  { href: "/tcas-folio", label: "TCAS Folio", gated: true },
]

export default function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
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
          {NAV_LINKS.map(({ href, label, gated }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1 transition-colors hover:text-green-600",
                pathname.startsWith(href) && "text-green-600 font-semibold"
              )}
            >
              {label}
              {gated && (
                <Show when="signed-out">
                  <Lock className="h-3 w-3 text-gray-400" />
                </Show>
              )}
            </Link>
          ))}
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors hover:text-green-600",
                pathname.startsWith("/dashboard") && "text-green-600 font-semibold"
              )}
            >
              บันทึกของฉัน
            </Link>
          </Show>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Desktop auth */}
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
              <ProfileAvatarLink size={36} />
            </Show>
          </div>

          {/* Mobile: hamburger + drawer — isolated in MobileMenu */}
          <MobileMenu links={NAV_LINKS} />
        </div>

      </div>
    </header>
  )
}
