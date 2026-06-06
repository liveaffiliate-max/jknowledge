"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { GoogleIcon, LineIcon, AppleIcon, FacebookIcon, XIcon } from "../icons"

type Strategy =
  | "oauth_google"
  | "oauth_line"
  | "oauth_apple"
  | "oauth_facebook"
  | "oauth_x"

interface OAuthButtonsProps {
  /**
   * Triggered when the user picks a provider. The caller wires this to
   * signIn.authenticateWithRedirect / signUp.authenticateWithRedirect so the
   * exact flow (sign-in vs sign-up) is decided by the page, not this
   * component.
   */
  onSelect: (strategy: Strategy) => Promise<void> | void
  disabled?: boolean
}

export function OAuthButtons({ onSelect, disabled }: OAuthButtonsProps) {
  const [pending, setPending] = useState<Strategy | null>(null)

  async function handle(strategy: Strategy) {
    if (disabled || pending) return
    setPending(strategy)
    try {
      await onSelect(strategy)
    } finally {
      // If the redirect fires the page unmounts, this is unreachable.
      // If it fails (e.g. popup blocked), restore the button.
      setPending(null)
    }
  }

  const isDisabled = !!disabled || !!pending

  return (
    <div className="space-y-3">
      {/* ── Primary row: Google (universal) ── */}
      <button
        type="button"
        onClick={() => handle("oauth_google")}
        disabled={isDisabled}
        className={cn(
          "flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-700 transition-all",
          "hover:border-gray-400 hover:bg-gray-50",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        <GoogleIcon className="h-5 w-5" />
        <span>{pending === "oauth_google" ? "กำลังเปิด Google..." : "เข้าด้วย Google"}</span>
      </button>

      {/* ── Secondary row: LINE (Thai context, brand green) ── */}
      <button
        type="button"
        onClick={() => handle("oauth_line")}
        disabled={isDisabled}
        className={cn(
          "flex h-11 w-full items-center justify-center gap-2.5 rounded-xl px-4 text-sm font-semibold text-white transition-all",
          "bg-[#06C755] hover:bg-[#05a647]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#06C755]/40 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        <LineIcon className="h-5 w-5" />
        <span>{pending === "oauth_line" ? "กำลังเปิด LINE..." : "เข้าด้วย LINE"}</span>
      </button>

      {/* ── Tertiary row: icon-only Apple / Facebook / X ── */}
      <div className="grid grid-cols-3 gap-3">
        <IconOnlyButton
          label="Apple"
          onClick={() => handle("oauth_apple")}
          disabled={isDisabled}
          pending={pending === "oauth_apple"}
          className="bg-black text-white hover:bg-neutral-800 focus-visible:ring-black/30"
        >
          <AppleIcon className="h-5 w-5" />
        </IconOnlyButton>
        <IconOnlyButton
          label="Facebook"
          onClick={() => handle("oauth_facebook")}
          disabled={isDisabled}
          pending={pending === "oauth_facebook"}
          className="bg-[#1877F2] text-white hover:bg-[#0c63d4] focus-visible:ring-[#1877F2]/40"
        >
          <FacebookIcon className="h-5 w-5" />
        </IconOnlyButton>
        <IconOnlyButton
          label="X"
          onClick={() => handle("oauth_x")}
          disabled={isDisabled}
          pending={pending === "oauth_x"}
          className="bg-black text-white hover:bg-neutral-800 focus-visible:ring-black/30"
        >
          <XIcon className="h-4 w-4" />
        </IconOnlyButton>
      </div>
    </div>
  )
}

function IconOnlyButton({
  children,
  label,
  onClick,
  disabled,
  pending,
  className,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled: boolean
  pending: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`เข้าด้วย ${label}`}
      className={cn(
        "flex h-11 items-center justify-center rounded-xl transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        pending && "scale-[0.97]",
        className
      )}
    >
      {children}
    </button>
  )
}
