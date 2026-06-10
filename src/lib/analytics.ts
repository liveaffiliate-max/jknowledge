"use client"

import { sendGAEvent } from "@next/third-parties/google"

// ── Privacy helpers ───────────────────────────────────────────────────────────
// Raw TCAS scores are personal educational data (PDPA-protected).
// We send bucketed/categorical versions to GA, never raw values.
// See context/features/privacy.md §3 for the rule of thumb.

function bucketScore(score: number): string {
  if (score >= 90) return "90+"
  if (score >= 80) return "80-89"
  if (score >= 70) return "70-79"
  if (score >= 60) return "60-69"
  if (score >= 50) return "50-59"
  if (score >= 40) return "40-49"
  return "<40"
}

function bucketGap(gap: number): "far_above" | "above" | "close" | "below" | "far_below" {
  if (gap >= 10) return "far_above"
  if (gap >= 3) return "above"
  if (gap >= -3) return "close"
  if (gap >= -10) return "below"
  return "far_below"
}

// ── Analyze events ────────────────────────────────────────────────────────────

export function trackUniversitySelect(universityName: string) {
  sendGAEvent("event", "analyze_university_select", {
    university_name: universityName,
  })
}

export function trackFacultySelect(universityName: string, facultyName: string) {
  sendGAEvent("event", "analyze_faculty_select", {
    university_name: universityName,
    faculty_name:    facultyName,
  })
}

export function trackAnalyzeSubmit(params: {
  universityName: string
  facultyName:    string
  hasWeights:     boolean
  userScore:      number
}) {
  sendGAEvent("event", "analyze_submit", {
    university_name:   params.universityName,
    faculty_name:      params.facultyName,
    has_weights:       params.hasWeights,
    user_score_bucket: bucketScore(params.userScore),  // bucketed, not raw
  })
}

export function trackAnalyzeResult(params: {
  universityName: string
  facultyName:    string
  chance:         string
  gap:            number
  userScore:      number
}) {
  sendGAEvent("event", "analyze_result", {
    university_name:   params.universityName,
    faculty_name:      params.facultyName,
    chance:            params.chance,
    gap_direction:     bucketGap(params.gap),         // categorical, not raw
    user_score_bucket: bucketScore(params.userScore), // bucketed, not raw
  })
}

// ── MBTI events ───────────────────────────────────────────────────────────────

export function trackMBTIStart() {
  sendGAEvent("event", "mbti_quiz_start", {})
}

export function trackMBTIComplete(params: {
  type:             string
  durationSec:      number
  questionsAnswered: number
}) {
  sendGAEvent("event", "mbti_quiz_complete", {
    mbti_type:         params.type,
    duration_sec:      params.durationSec,
    questions_answered: params.questionsAnswered,
  })
}

export function trackMBTIRestart() {
  sendGAEvent("event", "mbti_quiz_restart", {})
}

// Post-quiz funnel: tracks how users engage with their result
export function trackMBTIFacultyClick(params: {
  mbtiType:       string
  facultyId:      string
  rank:           number
  matchScore:     number
  source:         "result_card" | "type_page" | "share_page" | "dashboard"
}) {
  sendGAEvent("event", "mbti_faculty_click", {
    mbti_type:        params.mbtiType,
    faculty_id:       params.facultyId,
    rank:             params.rank,
    match_score_pct:  Math.round(params.matchScore * 100),
    source:           params.source,
  })
}

export function trackMBTIShareOpen(params: { mbtiType: string; variant: "story" | "square" | "link" }) {
  sendGAEvent("event", "mbti_share_open", {
    mbti_type: params.mbtiType,
    variant:   params.variant,
  })
}

export function trackMBTIImageDownload(params: { mbtiType: string; variant: "story" | "square" }) {
  sendGAEvent("event", "mbti_image_download", {
    mbti_type: params.mbtiType,
    variant:   params.variant,
  })
}

export function trackMBTIAnalyzeFromInsight(params: { mbtiType: string; facultyId: string }) {
  sendGAEvent("event", "mbti_analyze_from_insight", {
    mbti_type:  params.mbtiType,
    faculty_id: params.facultyId,
  })
}

// ── Score browsing events ─────────────────────────────────────────────────────

export function trackFacultyClick(params: {
  universitySlug: string
  facultyName:    string
  facultyId:      string
}) {
  sendGAEvent("event", "faculty_click", {
    university_slug: params.universitySlug,
    faculty_name:    params.facultyName,
    faculty_id:      params.facultyId,
  })
}
