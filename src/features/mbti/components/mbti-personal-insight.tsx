"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Check, AlertTriangle, ArrowRight, Sparkles, Crosshair, TrendingUp } from "lucide-react"
import { UniversityLogo } from "@/components/university-logo"
import { getMBTIInsightsAction } from "../actions/get-insights"
import type { MBTIMatchWithUserPrediction } from "@/server/mbti-queries"

interface Props {
  type: string
}

/**
 * Personal insight panel — shown after quiz reveal for signed-in users only.
 *
 * Cross-references MBTI recommendations with the user's /analyze history:
 *  - "เหมาะ + คะแนนถึง"   → green check  → faculty matches AND user has high chance
 *  - "เหมาะ + ต้องเพิ่ม"   → amber warn   → faculty matches but user fell short
 *  - "เหมาะ + ยังไม่วิเคราะห์" → CTA      → faculty matches but never analyzed
 *
 * For anonymous users this component returns null (no cross-reference possible).
 */
export function MBTIPersonalInsight({ type }: Props) {
  const [data, setData]     = useState<MBTIMatchWithUserPrediction[] | null | "loading">("loading")

  useEffect(() => {
    let cancelled = false
    getMBTIInsightsAction(type, 6)
      .then((rows) => !cancelled && setData(rows))
      .catch(() => !cancelled && setData(null))
    return () => { cancelled = true }
  }, [type])

  // Anonymous user → hide entirely
  if (data === null) return null

  if (data === "loading") {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="h-4 w-32 rounded bg-gray-100 motion-safe:animate-pulse" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-50 motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0) return null

  const analyzed   = data.filter((m) => m.userPrediction !== null)
  const reached    = analyzed.filter((m) => m.userPrediction!.chance === "high")
  const competitive = analyzed.filter((m) => m.userPrediction!.chance === "competitive")
  const fellShort  = analyzed.filter((m) => m.userPrediction!.chance === "low")
  const unanalyzed = data.filter((m) => m.userPrediction === null)

  const totalAnalyzed = analyzed.length

  return (
    <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50/60 to-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-green-800">
        <Crosshair className="h-4 w-4" />
        บุคลิก × คะแนนของคุณ
      </div>
      <p className="mb-4 text-xs text-green-700/80">
        {totalAnalyzed > 0
          ? `จาก ${totalAnalyzed} คณะที่คุณเคยวิเคราะห์ — เทียบกับคำแนะนำสำหรับ ${type}`
          : `คุณยังไม่ได้วิเคราะห์คะแนนสำหรับคณะที่เหมาะกับ ${type} เลย`}
      </p>

      {/* Summary stats — only show when user has analyzed something */}
      {totalAnalyzed > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <StatPill
            value={reached.length}
            label="คะแนนถึง"
            color="text-green-700 bg-green-100"
          />
          <StatPill
            value={competitive.length}
            label="ใกล้เคียง"
            color="text-amber-700 bg-amber-100"
          />
          <StatPill
            value={fellShort.length}
            label="ขาดอีกหน่อย"
            color="text-gray-600 bg-gray-100"
          />
        </div>
      )}

      {/* Reached faculties — strongest positive signal first */}
      {reached.length > 0 && (
        <Section title="🎯 คณะที่ทั้งเหมาะและคะแนนถึง" tone="success">
          {reached.map((m, i) => <InsightRow key={m.matchId} match={m} index={i} tone="success" />)}
        </Section>
      )}

      {/* Competitive — close call */}
      {competitive.length > 0 && (
        <Section title="⚡ ใกล้เคียง — มีลุ้น" tone="warning">
          {competitive.map((m, i) => <InsightRow key={m.matchId} match={m} index={i} tone="warning" />)}
        </Section>
      )}

      {/* Unanalyzed — CTA to analyze */}
      {unanalyzed.length > 0 && (
        <Section title="ยังไม่ได้วิเคราะห์" tone="neutral">
          {unanalyzed.slice(0, 3).map((m, i) => (
            <InsightRow key={m.matchId} match={m} index={i} tone="neutral" />
          ))}
          {unanalyzed.length > 3 && (
            <p className="mt-2 px-1 text-[11px] text-gray-400">
              + อีก {unanalyzed.length - 3} คณะ
            </p>
          )}
        </Section>
      )}
    </div>
  )
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function StatPill({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className={cn("rounded-xl px-3 py-2.5 text-center", color)}>
      <div className="text-xl font-black tabular-nums">{value}</div>
      <div className="mt-0.5 text-[10px] font-medium opacity-80">{label}</div>
    </div>
  )
}

function Section({
  title,
  tone,
  children,
}: {
  title:    string
  tone:     "success" | "warning" | "neutral"
  children: React.ReactNode
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className={cn(
        "mb-2 text-[11px] font-semibold",
        tone === "success" ? "text-green-700" :
        tone === "warning" ? "text-amber-700" :
        "text-gray-500"
      )}>
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function InsightRow({
  match,
  index,
  tone,
}: {
  match: MBTIMatchWithUserPrediction
  index: number
  tone:  "success" | "warning" | "neutral"
}) {
  const f = match.faculty
  const p = match.userPrediction
  // Route resolves by Faculty.id (cuid), not slug. See /scores/[..]/[facultySlug]/page.tsx
  const href = p
    ? `/scores/${f.university.slug}/${f.id}`
    : `/analyze?facultyId=${f.id}`

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-start gap-2.5 rounded-xl border bg-white px-3 py-2.5",
        "motion-safe:transition-colors hover:bg-gray-50",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1",
        tone === "success" ? "border-green-200" :
        tone === "warning" ? "border-amber-200" :
        "border-gray-200"
      )}
      style={{
        animationDelay: `${index * 60}ms`,
        animationDuration: "280ms",
        animationFillMode: "both",
      }}
    >
      <UniversityLogo
        slug={f.university.slug}
        shortName={f.university.shortName}
        color={f.university.color}
        className="h-7 w-7 shrink-0"
        rounded="rounded-md"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-gray-900">{f.name}</p>
        <p className="truncate text-[11px] text-gray-500">{f.university.shortName}</p>

        {p ? (
          <div className="mt-1 flex items-center gap-2 text-[11px]">
            <span className={cn(
              "inline-flex items-center gap-0.5 font-semibold",
              p.chance === "high"        ? "text-green-700" :
              p.chance === "competitive" ? "text-amber-700" : "text-gray-500"
            )}>
              {p.chance === "high" && <Check className="h-3 w-3" />}
              {p.chance === "competitive" && <TrendingUp className="h-3 w-3" />}
              คะแนนคุณ {p.userScore.toFixed(1)}
            </span>
            <span className={cn(
              "tabular-nums",
              p.gap >= 0 ? "text-green-600" : "text-gray-400"
            )}>
              {p.gap >= 0 ? `+${p.gap.toFixed(1)}` : p.gap.toFixed(1)}
            </span>
          </div>
        ) : (
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-green-700">
            <Sparkles className="h-3 w-3" /> วิเคราะห์เลย
          </span>
        )}
      </div>
      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
    </Link>
  )
}
