"use client"

import Link from "next/link"
import { AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Field ─────────────────────────────────────────────────────────────────────

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id:    string
  label: string
  error?: string
  /** Right-aligned link next to the label, e.g. "ลืมรหัสผ่าน?" */
  trailingLink?: { href: string; text: string }
}

export function AuthField({ id, label, error, trailingLink, ...inputProps }: AuthFieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {inputProps.required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        </label>
        {trailingLink && (
          <Link
            href={trailingLink.href}
            className="text-xs text-gray-500 hover:text-green-700"
          >
            {trailingLink.text}
          </Link>
        )}
      </div>
      <input
        id={id}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 outline-none transition-colors",
          "placeholder:text-gray-400",
          "focus:border-green-400 focus:ring-2 focus:ring-green-100",
          error ? "border-red-300" : "border-gray-200"
        )}
        {...inputProps}
      />
      {error && <p className="mt-1 animate-error-reveal text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ── Submit button ─────────────────────────────────────────────────────────────

interface AuthSubmitButtonProps {
  children: React.ReactNode
  loading?: boolean
  /** Label shown next to the spinner when loading, e.g. "กำลังเข้าสู่ระบบ…" */
  label?:   string
}

export function AuthSubmitButton({ children, loading, label }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl",
        "bg-green-600 text-sm font-semibold text-white",
        "transition-all duration-150 active:scale-[0.97]",
        "hover:bg-green-700",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      )}
    >
      {loading ? (
        <><Loader2 className="h-4 w-4 animate-spin" />{label ?? "กำลังดำเนินการ…"}</>
      ) : children}
    </button>
  )
}

// ── Error banner ──────────────────────────────────────────────────────────────

export function AuthErrorBanner({ error }: { error?: string }) {
  if (!error) return null
  return (
    <div className="animate-error-reveal mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  )
}
