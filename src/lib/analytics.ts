"use client"

import { sendGAEvent } from "@next/third-parties/google"

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
    university_name: params.universityName,
    faculty_name:    params.facultyName,
    has_weights:     params.hasWeights,
    user_score:      Math.round(params.userScore * 10) / 10,
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
    university_name: params.universityName,
    faculty_name:    params.facultyName,
    chance:          params.chance,
    gap:             Math.round(params.gap * 10) / 10,
    user_score:      Math.round(params.userScore * 10) / 10,
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
