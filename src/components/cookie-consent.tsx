"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Cookie, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  readConsent,
  writeConsent,
  acceptAll,
  acceptEssentialOnly,
  type ConsentState,
} from "@/lib/consent"

type View = "banner" | "settings"

export function CookieConsent() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>("banner")
  const [draft, setDraft] = useState({ analytics: true, marketing: false })

  // Show banner only when user hasn't responded yet (or after policy bump)
  useEffect(() => {
    const existing = readConsent()
    if (!existing || !existing.consentedAt) setOpen(true)
  }, [])

  function dismiss() { setOpen(false) }

  function handleAcceptAll() {
    acceptAll()
    dismiss()
  }

  function handleEssentialOnly() {
    acceptEssentialOnly()
    dismiss()
  }

  function handleSaveSettings() {
    writeConsent(draft)
    dismiss()
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop only when settings view is open */}
      {view === "settings" && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm sm:bg-black/40"
          onClick={() => setView("banner")}
          aria-hidden="true"
        />
      )}

      <div
        role="dialog"
        aria-modal={view === "settings"}
        aria-labelledby="consent-title"
        className={cn(
          "fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl",
          "sm:inset-x-4 sm:bottom-4"
        )}
      >
        {view === "banner" ? (
          <BannerView
            onAcceptAll={handleAcceptAll}
            onEssentialOnly={handleEssentialOnly}
            onOpenSettings={() => setView("settings")}
            onDismiss={dismiss}
          />
        ) : (
          <SettingsView
            draft={draft}
            setDraft={setDraft}
            onSave={handleSaveSettings}
            onBack={() => setView("banner")}
          />
        )}
      </div>
    </>
  )
}

// ── Banner view ──────────────────────────────────────────────────────────────

function BannerView({
  onAcceptAll,
  onEssentialOnly,
  onOpenSettings,
  onDismiss,
}: {
  onAcceptAll:     () => void
  onEssentialOnly: () => void
  onOpenSettings:  () => void
  onDismiss:       () => void
}) {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-100">
          <Cookie className="h-5 w-5 text-green-700" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 id="consent-title" className="text-sm font-bold text-gray-900">
            เราใช้ cookies
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-gray-600 sm:text-sm">
            Jknowledge ใช้ cookies เพื่อให้บริการพื้นฐาน (เข้าสู่ระบบ) และเพื่อวัดการใช้งานเพื่อปรับปรุงประสบการณ์ของคุณ{" "}
            <Link
              href="/privacy"
              className="font-medium text-green-700 underline-offset-4 hover:underline"
            >
              อ่านนโยบาย
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="ปิด"
          className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={onOpenSettings}
          className="order-3 text-xs font-medium text-gray-500 underline-offset-4 hover:text-gray-700 hover:underline sm:order-1 sm:mr-auto"
        >
          ตั้งค่า
        </button>
        <button
          type="button"
          onClick={onEssentialOnly}
          className="order-2 h-10 rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
        >
          เฉพาะที่จำเป็น
        </button>
        <button
          type="button"
          onClick={onAcceptAll}
          className="order-1 h-10 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 sm:order-3"
        >
          ยอมรับทั้งหมด
        </button>
      </div>
    </div>
  )
}

// ── Settings view ────────────────────────────────────────────────────────────

function SettingsView({
  draft,
  setDraft,
  onSave,
  onBack,
}: {
  draft: { analytics: boolean; marketing: boolean }
  setDraft: (next: { analytics: boolean; marketing: boolean }) => void
  onSave: () => void
  onBack: () => void
}) {
  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">ตั้งค่า cookies</h2>
        <button
          type="button"
          onClick={onBack}
          aria-label="ปิด"
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <CategoryToggle
          label="จำเป็นต่อระบบ"
          description="เข้าสู่ระบบ ป้องกัน CSRF จำเป็นสำหรับการใช้งาน ไม่สามารถปิดได้"
          checked={true}
          locked
        />
        <CategoryToggle
          label="การวัดผลการใช้งาน"
          description="ช่วยให้เราเข้าใจว่าผู้ใช้ใช้งานส่วนไหนของเว็บไซต์ เพื่อปรับปรุงให้ดีขึ้น (Google Analytics, Vercel)"
          checked={draft.analytics}
          onChange={(v) => setDraft({ ...draft, analytics: v })}
        />
        <CategoryToggle
          label="การตลาด"
          description="ใช้สำหรับวัดผลแคมเปญโฆษณาและทำความเข้าใจพฤติกรรมผู้ใช้ (Meta Pixel)"
          checked={draft.marketing}
          onChange={(v) => setDraft({ ...draft, marketing: v })}
        />
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onBack}
          className="h-10 rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50"
        >
          ยกเลิก
        </button>
        <button
          type="button"
          onClick={onSave}
          className="h-10 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          บันทึก
        </button>
      </div>
    </div>
  )
}

function CategoryToggle({
  label,
  description,
  checked,
  onChange,
  locked,
}: {
  label:       string
  description: string
  checked:     boolean
  onChange?:   (v: boolean) => void
  locked?:     boolean
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-600">{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={locked}
          onClick={() => onChange?.(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors",
            checked ? "bg-green-600" : "bg-gray-300",
            locked && "cursor-not-allowed opacity-60",
            !locked && "cursor-pointer"
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
              checked ? "translate-x-5" : "translate-x-0.5"
            )}
          />
        </button>
      </div>
    </div>
  )
}
