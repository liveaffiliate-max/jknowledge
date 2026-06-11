import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BackButton } from "./back-button"

interface AuthShellProps {
  title:    string
  subtitle: string
  children: React.ReactNode
  /** Footer toggle: "ยังไม่มีบัญชี? สมัครสมาชิก" / "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ" */
  toggle: {
    question: string
    linkText: string
    href:     string
  }
}

export function AuthShell({ title, subtitle, children, toggle }: AuthShellProps) {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-start justify-center bg-gradient-to-b from-gray-50 to-white px-4 pt-8 pb-16 sm:items-center sm:pt-12">
      <div className="w-full max-w-sm">
        {/* Top bar: back button + brand mark */}
        <div className="mb-6 flex items-center">
          <BackButton />

          <div className="flex flex-1 items-center justify-center gap-2.5">
            <Image
              src="/jknowledge_logo.png"
              alt=""
              width={28}
              height={28}
              className="rounded-lg"
              priority
            />
            <span className="text-base font-bold text-gray-900">Jknowledge</span>
          </div>

          {/* Spacer เท่ากับ back button เพื่อให้ brand mark อยู่กึ่งกลาง */}
          <div className="w-[72px]" aria-hidden="true" />
        </div>

        {/* Card */}
        <div
          className={cn(
            "rounded-2xl border border-gray-200 bg-white p-6 sm:p-8",
            "shadow-[0_1px_2px_oklch(0_0_0/0.04)]"
          )}
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
            <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
          </div>

          {children}
        </div>

        {/* Footer toggle outside the card so it doesn't compete with primary action */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {toggle.question}{" "}
          <Link
            href={toggle.href}
            className="font-semibold text-green-700 underline-offset-4 hover:text-green-800 hover:underline"
          >
            {toggle.linkText}
          </Link>
        </p>
      </div>
    </main>
  )
}

/**
 * Divider used between OAuth buttons and the email form.
 * "หรือใช้อีเมล" with horizontal rules either side.
 */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  )
}
