"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { GraduationCap, ArrowRight, Sparkles, TrendingUp } from "lucide-react"
import { UniversityLogo } from "@/components/university-logo"
import { getTopFacultiesAction } from "../actions/get-faculties"
import { trackMBTIFacultyClick } from "@/lib/analytics"
import type { MBTIFacultyMatch } from "@/server/mbti-queries"

interface Props {
  type:           string
  limit?:         number
  /** Compact = used inside result card; full = used on /mbti/[type] page */
  variant?:       "compact" | "full"
  /** Optional className for outer container */
  className?:     string
  /** Analytics source — where this list is rendered */
  source?:        "result_card" | "type_page" | "share_page" | "dashboard"
}

export function MBTIFacultyList({
  type,
  limit = 8,
  variant = "compact",
  className,
  source = "result_card",
}: Props) {
  const [matches, setMatches] = useState<MBTIFacultyMatch[] | null>(null)
  const [error, setError]     = useState(false)

  useEffect(() => {
    let cancelled = false
    getTopFacultiesAction(type, limit)
      .then((rows) => {
        if (cancelled) return
        setMatches(rows)
      })
      .catch(() => !cancelled && setError(true))
    return () => { cancelled = true }
  }, [type, limit])

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (matches === null && !error) {
    return (
      <div className={cn("space-y-2.5", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-gray-100 motion-safe:animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error || !matches || matches.length === 0) {
    return (
      <p className={cn("text-xs text-gray-400 italic", className)}>
        ยังไม่มีข้อมูลคณะที่แนะนำสำหรับบุคลิกนี้
      </p>
    )
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      {matches.map((m, i) => (
        <FacultyMatchRow
          key={m.matchId}
          match={m}
          index={i}
          variant={variant}
          mbtiType={type}
          source={source}
        />
      ))}
    </div>
  )
}

// ── Row ──────────────────────────────────────────────────────────────────────

function FacultyMatchRow({
  match,
  index,
  variant,
  mbtiType,
  source,
}: {
  match:    MBTIFacultyMatch
  index:    number
  variant:  "compact" | "full"
  mbtiType: string
  source:   "result_card" | "type_page" | "share_page" | "dashboard"
}) {
  const { faculty, score, reason, rank } = match
  const uni = faculty.university
  const latest = faculty.latestScore

  // The /scores/[universitySlug]/[facultySlug] route resolves by Faculty.id (cuid),
  // not the human-readable slug. Using slug here would 404 — see route file comment.
  const href = `/scores/${uni.slug}/${faculty.id}`
  const matchPct = Math.round(score * 100)

  return (
    <Link
      href={href}
      onClick={() => trackMBTIFacultyClick({
        mbtiType,
        facultyId:  faculty.id,
        rank,
        matchScore: score,
        source,
      })}
      className={cn(
        "group block rounded-xl border border-gray-200 bg-white p-3.5",
        "motion-safe:transition-[border-color,box-shadow,transform] duration-150",
        "hover:border-green-300 hover:shadow-sm hover:-translate-y-px",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
      )}
      style={{
        animationDelay:  `${index * 70}ms`,
        animationDuration: "320ms",
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Rank pill */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700">
          {rank}
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <UniversityLogo
              slug={uni.slug}
              shortName={uni.shortName}
              color={uni.color}
              className="h-7 w-7 shrink-0"
              rounded="rounded-md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-green-700">
                {faculty.name}
              </p>
              <p className="truncate text-xs text-gray-500">
                {uni.shortName} · {faculty.program}
              </p>
            </div>
          </div>

          {variant === "full" && (
            <p className="mt-1.5 text-xs text-gray-500 leading-snug">
              {reason}
            </p>
          )}

          {/* Stats row */}
          <div className="mt-2 flex items-center gap-3 text-[11px]">
            {/* Match strength */}
            <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
              <Sparkles className="h-3 w-3" />
              เข้ากันได้ {matchPct}%
            </span>

            {/* Latest cutoff */}
            {latest ? (
              <span className="inline-flex items-center gap-1 text-gray-500">
                <TrendingUp className="h-3 w-3" />
                คะแนน {latest.minScore.toFixed(1)} <span className="text-gray-400">({latest.year})</span>
              </span>
            ) : (
              <span className="text-gray-400">ไม่มีข้อมูลคะแนน</span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-green-600" />
      </div>
    </Link>
  )
}

// ── Action CTA — show under list when user has many recommendations ──────────

export function MBTIFacultyListCTA({ type }: { type: string }) {
  return (
    <Link
      href={`/analyze?mbti=${type}`}
      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-xs font-semibold text-green-700 motion-safe:transition-colors hover:bg-green-50"
    >
      วิเคราะห์คะแนนของคุณสำหรับคณะเหล่านี้
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  )
}
