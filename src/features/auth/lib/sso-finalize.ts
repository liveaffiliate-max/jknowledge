"use client"

import type { useRouter } from "next/navigation"
import { readPendingHistory, clearPendingHistory } from "@/features/analyze/components/analyze-form"
import { savePendingHistoryAction } from "@/server/actions"
import { claimAnonymousMBTIResult } from "@/lib/mbti-claim"

type Router     = ReturnType<typeof useRouter>
type TaskPrefix = "sign-in" | "sign-up"

interface NavigateArgs {
  session?: { currentTask?: { key: string } } | null
  decorateUrl: (url: string) => string
}

/** Migrate anonymous analyze history + claim MBTI result into the newly-signed-in user. */
export async function migrateAnonymousData() {
  try {
    const pending = readPendingHistory()
    if (pending) {
      await savePendingHistoryAction(pending.facultyId, pending.userScore)
      clearPendingHistory()
    }
    await claimAnonymousMBTIResult()
  } catch { /* best effort */ }
}

/**
 * Build the `navigate` callback shared by signIn.finalize / signUp.finalize / clerk.setActive.
 *
 * Responsibilities:
 *  1. Run anonymous-data migration before redirecting
 *  2. Respect Clerk's session.currentTask (e.g. force MFA setup) by routing to /{prefix}/tasks/{key}
 *  3. Use decorateUrl so Clerk can append handshake params if needed
 */
export function buildAuthNavigate(router: Router, taskPrefix: TaskPrefix) {
  return async ({ session, decorateUrl }: NavigateArgs) => {
    await migrateAnonymousData()

    if (session?.currentTask) {
      router.push(`/${taskPrefix}/tasks/${session.currentTask.key}`)
      return
    }

    const url = decorateUrl("/")
    if (url.startsWith("http")) window.location.href = url
    else router.push(url)
  }
}
