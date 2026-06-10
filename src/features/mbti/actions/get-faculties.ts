"use server"

import {
  getTopFacultiesForType,
  type MBTIFacultyMatch,
} from "@/server/mbti-queries"

/**
 * Server Action — fetch top faculty recommendations for a given MBTI type.
 * Called from the client-side result card after quiz completion.
 */
export async function getTopFacultiesAction(
  type:  string,
  limit: number = 8
): Promise<MBTIFacultyMatch[]> {
  return getTopFacultiesForType(type, limit)
}
