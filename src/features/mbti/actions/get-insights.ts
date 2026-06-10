"use server"

import { auth } from "@clerk/nextjs/server"
import {
  getMBTIRecommendationsWithPredictions,
  type MBTIMatchWithUserPrediction,
} from "@/server/mbti-queries"

/**
 * Server Action — returns the user's MBTI recommendations cross-referenced
 * with their prior /analyze predictions. Returns null when user is anonymous
 * (UI then falls back to the standard recommendation list).
 */
export async function getMBTIInsightsAction(
  type:  string,
  limit: number = 6
): Promise<MBTIMatchWithUserPrediction[] | null> {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  return getMBTIRecommendationsWithPredictions(type, clerkId, limit)
}
