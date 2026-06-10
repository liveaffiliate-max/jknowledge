"use server"

import { auth } from "@clerk/nextjs/server"
import {
  getLatestMBTIResultForClerkUser,
  getMBTIMatchScore,
} from "@/server/mbti-queries"

export interface AnalyzeMBTIMatchInfo {
  /** The user's MBTI type from their latest quiz */
  type: string
  /** Match score 0-1 for THIS faculty under that type — null if not in top recommendations */
  match: { score: number; reason: string; rank: number } | null
}

/**
 * Server Action — returns the signed-in user's MBTI type + how well it matches
 * the given faculty. Used to render the "เหมาะกับบุคลิก INTJ ของคุณ" badge
 * inside /analyze ResultCard.
 *
 * Returns null when:
 *  - user is anonymous
 *  - user has never taken the MBTI quiz
 */
export async function getAnalyzeMBTIMatchAction(
  facultyId: string
): Promise<AnalyzeMBTIMatchInfo | null> {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const mbti = await getLatestMBTIResultForClerkUser(clerkId)
  if (!mbti) return null

  const match = await getMBTIMatchScore(mbti.mbtiType, facultyId)
  return { type: mbti.mbtiType, match }
}
