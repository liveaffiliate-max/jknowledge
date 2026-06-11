"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

/**
 * Back button used in the auth shell header.
 *
 * Goes to the previous page when there is history (e.g. user clicked here from /analyze).
 * Falls back to "/" when there is no history (user opened /sign-in directly).
 */
export function BackButton() {
  const router = useRouter()

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-1 rounded-lg p-1 text-sm text-gray-400 transition-colors hover:text-gray-700"
      aria-label="กลับไปหน้าก่อนหน้า"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-xs">ย้อนกลับ</span>
    </button>
  )
}
