"use client"

/**
 * Landing page after OAuth provider redirects back during sign-up.
 * Handles pending anonymous-analysis migration before finalizing the session.
 */

import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { readPendingHistory, clearPendingHistory } from "@/features/analyze/components/analyze-form"
import { savePendingHistoryAction } from "@/server/actions"
import { claimAnonymousMBTIResult } from "@/lib/mbti-claim"

export default function SignUpSSOCallback() {
  const { signUp, fetchStatus } = useSignUp()
  const router = useRouter()

  useEffect(() => {
    if (fetchStatus !== "idle") return
    if (!signUp) return

    if (signUp.status === "complete") {
      signUp.finalize({
        navigate: async ({ decorateUrl }) => {
          // Migrate any analysis done while anonymous
          const pending = readPendingHistory()
          if (pending) {
            await savePendingHistoryAction(pending.facultyId, pending.userScore)
            clearPendingHistory()
          }
          // Claim an anonymous MBTI result if the user took the quiz before signing up
          await claimAnonymousMBTIResult()

          const url = decorateUrl("/")
          if (url.startsWith("http")) window.location.href = url
          else router.push(url)
        },
      })
    } else {
      router.replace("/sign-up")
    }
  }, [signUp?.status, fetchStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      <p className="text-sm text-gray-500">กำลังสร้างบัญชี…</p>
    </div>
  )
}
