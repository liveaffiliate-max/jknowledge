"use server"

import { saveMBTIResult } from "@/server/mbti-queries"
import type { MBTIAnswer, MBTIResult } from "@/types/mbti"

export interface SaveResultPayload {
  result:      MBTIResult
  answers:     MBTIAnswer[]
  durationMs:  number
}

/**
 * Server Action — persists a completed MBTI quiz result.
 * Always saves with userId=null (anonymous). When auth is added,
 * pass userId here so the result is linked to the account.
 *
 * Returns the saved record's id so the client can store it in localStorage
 * for future claim-after-sign-in.
 */
export async function saveQuizResult(payload: SaveResultPayload): Promise<string> {
  return saveMBTIResult({
    mbtiType:      payload.result.type,
    scores:        payload.result.scores,
    answers:       payload.answers as unknown[],
    answeredCount: payload.answers.length,
    durationMs:    payload.durationMs,
    userId:        undefined,   // TODO: pass auth userId once Clerk is wired
  })
}
