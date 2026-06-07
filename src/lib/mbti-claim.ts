"use client"

import { claimMBTIResultAction } from "@/features/mbti/actions/save-result"

const MBTI_RESULT_KEY = "mbti_result_id"

/**
 * Pulls the anonymous MBTI result id stored by the quiz (if any) and links it
 * to the now signed-in user. Best-effort — failures are swallowed so the auth
 * flow never blocks on this.
 */
export async function claimAnonymousMBTIResult(): Promise<void> {
  if (typeof window === "undefined") return
  let resultId: string | null = null
  try { resultId = window.localStorage.getItem(MBTI_RESULT_KEY) } catch { return }
  if (!resultId) return

  try {
    const res = await claimMBTIResultAction(resultId)
    if (res.ok) {
      try { window.localStorage.removeItem(MBTI_RESULT_KEY) } catch { /* noop */ }
    }
  } catch { /* best effort */ }
}
