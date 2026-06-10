"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import type { MBTIResult, MBTIProfile } from "@/types/mbti"
import { MBTI_ROLE_META } from "@/types/mbti"
import type { MBTIFacultyMatch } from "@/server/mbti-queries"

interface Props {
  result:    MBTIResult
  profile:   MBTIProfile
  faculties: Pick<MBTIFacultyMatch, "rank" | "score" | "faculty">[]
  /** "story" = 9:16 portrait (1080×1920), "square" = 1:1 (1080×1080) */
  variant:   "story" | "square"
}

/**
 * Branded, screenshot-friendly result card. Renders at fixed canvas dimensions
 * so html-to-image captures it at the right pixel ratio for IG/TikTok.
 *
 * Exposed as forwardRef so the parent can hand the DOM node to html-to-image.
 */
export const MBTIShareableCard = forwardRef<HTMLDivElement, Props>(
  function MBTIShareableCard({ result, profile, faculties, variant }, ref) {
    const { scores } = result
    const roleMeta = MBTI_ROLE_META[profile.role]

    const dims = variant === "story"
      ? { width: 1080, height: 1920 }
      : { width: 1080, height: 1080 }

    return (
      <div
        ref={ref}
        style={{ width: dims.width, height: dims.height }}
        className={cn(
          "relative flex flex-col overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50",
          variant === "story" ? "p-20" : "p-16"
        )}
      >
        {/* Decorative blob top-right */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full bg-green-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full bg-emerald-100/60 blur-3xl" />

        {/* Brand header */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white text-2xl font-black">
              J
            </div>
            <span className="text-3xl font-black tracking-tight text-gray-900">Jknowledge</span>
          </div>
          <span className="text-xl font-medium text-gray-400">/mbti</span>
        </div>

        {/* Type hero — center column */}
        <div className={cn(
          "relative mt-12 flex flex-col items-center text-center",
          variant === "story" ? "gap-2" : "gap-1"
        )}>
          <span className="text-2xl font-medium text-gray-500">บุคลิกของฉัน</span>
          <div className={cn(
            "font-black tracking-tight",
            profile.color,
            variant === "story" ? "text-[200px] leading-none" : "text-[160px] leading-none"
          )}>
            {profile.type}
          </div>
          <p className={cn(
            "font-bold text-gray-900",
            variant === "story" ? "text-5xl mt-2" : "text-4xl"
          )}>
            &ldquo;{profile.nickname}&rdquo;
          </p>
          <span className={cn(
            "mt-3 inline-block rounded-full border-2 px-5 py-2 text-xl font-semibold",
            roleMeta.bg, roleMeta.color
          )}>
            {roleMeta.label}
          </span>
          <p className={cn(
            "mt-3 text-2xl text-gray-500",
            variant === "story" ? "max-w-[800px]" : "max-w-[700px]"
          )}>
            {profile.tagline}
          </p>
        </div>

        {/* Dimension bars — visual proof */}
        <div className={cn(
          "relative grid gap-4",
          variant === "story" ? "mt-14" : "mt-10",
          "grid-cols-2"
        )}>
          <DimBar leftLabel="E" rightLabel="I" leftScore={scores.E} rightScore={scores.I} />
          <DimBar leftLabel="S" rightLabel="N" leftScore={scores.S} rightScore={scores.N} />
          <DimBar leftLabel="T" rightLabel="F" leftScore={scores.T} rightScore={scores.F} />
          <DimBar leftLabel="J" rightLabel="P" leftScore={scores.J} rightScore={scores.P} />
        </div>

        {/* Top faculties — only on story variant (square is too tight) */}
        {variant === "story" && faculties.length > 0 && (
          <div className="relative mt-12">
            <p className="mb-4 text-2xl font-bold text-gray-800">คณะที่เหมาะกับฉัน</p>
            <div className="space-y-3">
              {faculties.slice(0, 3).map((m) => (
                <div
                  key={m.faculty.id}
                  className="flex items-center gap-4 rounded-2xl border border-green-200 bg-white/80 px-5 py-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl font-black text-green-700">
                    {m.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-2xl font-semibold text-gray-900">
                      {m.faculty.name}
                    </p>
                    <p className="truncate text-lg text-gray-500">
                      {m.faculty.university.shortName} · เข้ากันได้ {Math.round(m.score * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="relative mt-auto pt-12 text-center">
          <p className="text-xl font-medium text-gray-500">ลองทำดูที่</p>
          <p className="mt-1 text-3xl font-bold text-green-700">jknowledge.com/mbti</p>
        </div>
      </div>
    )
  }
)

// ── Subcomponent ────────────────────────────────────────────────────────────

function DimBar({
  leftLabel,
  rightLabel,
  leftScore,
  rightScore,
}: {
  leftLabel:  string
  rightLabel: string
  leftScore:  number
  rightScore: number
}) {
  const total = leftScore + rightScore
  const leftPct = total === 0 ? 50 : Math.round((leftScore / total) * 100)
  const dominantLeft = leftScore >= rightScore
  return (
    <div className="rounded-2xl border-2 border-gray-100 bg-white/70 p-4">
      <div className="flex items-center justify-between text-xl font-bold">
        <span className={cn(dominantLeft ? "text-gray-900" : "text-gray-300")}>{leftLabel}</span>
        <span className={cn(!dominantLeft ? "text-gray-900" : "text-gray-300")}>{rightLabel}</span>
      </div>
      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-green-500"
          style={{ width: `${leftPct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-base font-semibold text-gray-500">
        <span className={dominantLeft ? "text-green-700" : ""}>{leftPct}%</span>
        <span className={!dominantLeft ? "text-green-700" : ""}>{100 - leftPct}%</span>
      </div>
    </div>
  )
}
