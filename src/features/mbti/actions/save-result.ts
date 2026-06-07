"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { saveMBTIResult } from "@/server/mbti-queries"
import type { MBTIAnswer, MBTIResult } from "@/types/mbti"

export interface SaveResultPayload {
  result:      MBTIResult
  answers:     MBTIAnswer[]
  durationMs:  number
}

/**
 * Server Action — persists a completed MBTI quiz result.
 * Links to the signed-in user when available; otherwise saves anonymously
 * and returns the row id so the client can claim it after signing in later.
 */
export async function saveQuizResult(payload: SaveResultPayload): Promise<string> {
  const { userId: clerkId } = await auth()

  let userId: string | undefined
  if (clerkId) {
    const user = await prisma.user.upsert({
      where:  { clerkId },
      update: {},
      create: { clerkId },
    })
    userId = user.id
  }

  return saveMBTIResult({
    mbtiType:      payload.result.type,
    scores:        payload.result.scores,
    answers:       payload.answers as unknown as Record<string, unknown>[],
    answeredCount: payload.answers.length,
    durationMs:    payload.durationMs,
    userId,
  })
}

/**
 * Server Action — claim a previously-anonymous MBTI result for the signed-in user.
 * Called from sign-in/sign-up callbacks with an id stored in localStorage by the quiz.
 */
export async function claimMBTIResultAction(resultId: string): Promise<{ ok: boolean }> {
  if (!resultId) return { ok: false }

  const { userId: clerkId } = await auth()
  if (!clerkId) return { ok: false }

  try {
    const user = await prisma.user.upsert({
      where:  { clerkId },
      update: {},
      create: { clerkId },
    })

    // Only update if it's still anonymous — never overwrite another user's claim
    const updated = await prisma.mBTIResult.updateMany({
      where: { id: resultId, userId: null },
      data:  { userId: user.id },
    })
    return { ok: updated.count > 0 }
  } catch {
    return { ok: false }
  }
}
