"use client"

import { useEffect, useState } from "react"
import { MBTIShareModal } from "./mbti-share-modal"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getMBTIProfile } from "@/data/mbti-types"
import { dimensionStrength, getDimensionBreakdown } from "@/utils/mbti"
import type { MBTIResult } from "@/types/mbti"
import { MBTI_ROLE_META } from "@/types/mbti"
import { useToast } from "@/components/ui/toaster"
import { Check, X, BarChart2, GraduationCap, Briefcase, AlertTriangle, Link2, Share2, BookOpen } from "lucide-react"
import { MBTIFacultyList, MBTIFacultyListCTA } from "./mbti-faculty-list"
import { MBTIPersonalInsight } from "./mbti-personal-insight"

interface MBTIResultCardProps {
  result:    MBTIResult
  onRestart: () => void
  /** Persisted MBTIResult.id, if available — enables /result/[id] shareable URL */
  resultId?: string
}

const DIM_FULL_LABELS: Record<string, string> = {
  E: "Extraversion", I: "Introversion",
  S: "Sensing",      N: "iNtuition",
  T: "Thinking",     F: "Feeling",
  J: "Judging",      P: "Perceiving",
}

interface DimBarProps {
  leftLabel: string
  rightLabel: string
  leftScore: number
  rightScore: number
  leftColor: string
  rightColor: string
}

function DimBar({ leftLabel, rightLabel, leftScore, rightScore, leftColor, rightColor, index = 0 }: DimBarProps & { index?: number }) {
  const total = leftScore + rightScore
  const leftPct = total === 0 ? 50 : Math.round((leftScore / total) * 100)
  const rightPct = 100 - leftPct
  const dominantLeft = leftScore >= rightScore
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120 + index * 140)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className={cn(dominantLeft ? "text-gray-900" : "text-gray-400")}>
          {DIM_FULL_LABELS[leftLabel] ?? leftLabel}
        </span>
        <span className={cn(!dominantLeft ? "text-gray-900" : "text-gray-400")}>
          {DIM_FULL_LABELS[rightLabel] ?? rightLabel}
        </span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out", leftColor)}
          style={{ width: mounted ? `${leftPct}%` : "0%" }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={cn("font-semibold", dominantLeft ? leftColor.replace("bg-", "text-") : "text-gray-300")}>
          {leftLabel} {leftPct}%
        </span>
        <span className={cn("font-semibold", !dominantLeft ? rightColor.replace("bg-", "text-") : "text-gray-300")}>
          {rightPct}% {rightLabel}
        </span>
      </div>
    </div>
  )
}

export function MBTIResultCard({ result, onRestart, resultId }: MBTIResultCardProps) {
  const profile = getMBTIProfile(result.type)
  const { scores } = result
  const { toast } = useToast()
  const [shareModalOpen, setShareModalOpen] = useState(false)

  if (!profile) return null
  const breakdown = getDimensionBreakdown(scores)
  const hasEdge   = breakdown.some((b) => b.edge)

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {/* Type header */}
      <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-6 text-center shadow-sm">
        <profile.icon className={cn("mx-auto h-12 w-12", profile.color)} />
        <div className="mt-3">
          <span className={cn("text-4xl font-black tracking-wide", profile.color)}>
            {profile.type}
          </span>
          <p className="mt-1 text-lg font-semibold text-gray-800">"{profile.nickname}"</p>
          <p className="mt-1 text-sm text-gray-500">{profile.tagline}</p>

          {/* Inline % summary — Phase A.4: surface continuous data alongside the type letter */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-medium text-gray-600">
            {breakdown.map((b, i) => (
              <span key={b.letter} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-300">·</span>}
                <span className={cn("font-bold", profile.color)}>{b.letter}</span>
                <span className="tabular-nums">{b.pct}%</span>
                {b.edge && (
                  <span
                    className="ml-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
                    title="ก้ำกึ่ง — คะแนนใกล้ครึ่ง อาจแปรปรวนระหว่างการทดสอบ"
                  >
                    ก้ำกึ่ง
                  </span>
                )}
              </span>
            ))}
          </div>
          {hasEdge && (
            <p className="mx-auto mt-2 max-w-xs text-[11px] leading-snug text-amber-700/80">
              บางมิติคะแนนใกล้ครึ่ง — แปลว่ามีลักษณะของทั้งสองด้านปะปนกัน ไม่ใช่ผลที่ผิด
            </p>
          )}

          {/* Role badge */}
          {(() => {
            const roleMeta = MBTI_ROLE_META[profile.role]
            return (
              <span className={cn(
                "mt-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold",
                roleMeta.bg, roleMeta.color
              )}>
                {roleMeta.label}
              </span>
            )
          })()}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-700 leading-relaxed">{profile.description}</p>
      </div>

      {/* Personal insight — only renders for signed-in users with prediction history */}
      <MBTIPersonalInsight type={result.type} />

      {/* Faculty recommendations — real DB-linked rows with cutoffs */}
      <div className="rounded-2xl border border-green-200 bg-green-50/60 p-5 shadow-sm">
        <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-green-800">
          <GraduationCap className="h-4 w-4" />
          คณะที่เหมาะกับคุณ
        </div>
        <p className="mb-4 text-xs text-green-700/80">
          จาก {profile.type} — เรียงตามความเข้ากันได้และคะแนนล่าสุด
        </p>
        <MBTIFacultyList type={result.type} limit={8} variant="compact" />
        <MBTIFacultyListCTA type={result.type} />
      </div>

      {/* Strengths & Weaknesses */}
      <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm space-y-4">
        {/* Strengths */}
        <div>
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-green-700">
            <Check className="h-3.5 w-3.5" /> จุดแข็ง
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.strengths.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Weaknesses */}
        <div>
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-orange-600">
            <X className="h-3.5 w-3.5" /> จุดที่ควรพัฒนา
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.weaknesses.map((w) => (
              <span
                key={w}
                className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Careers */}
      <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
          <Briefcase className="h-4 w-4" />
          อาชีพที่เหมาะกับ {profile.type}
        </div>
        <div className="flex flex-wrap gap-2">
          {profile.careers.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border/50 bg-gray-50 px-3 py-1 text-xs text-gray-600"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Study style */}
      <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
          <BookOpen className="h-4 w-4" />
          สไตล์การเรียนของคุณ
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{profile.studyStyle}</p>
      </div>

      {/* Dimension bars */}
      <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
          <BarChart2 className="h-4 w-4" />
          สัดส่วนบุคลิกภาพ
        </div>
        <DimBar index={0}
          leftLabel="E" rightLabel="I"
          leftScore={scores.E} rightScore={scores.I}
          leftColor="bg-blue-400" rightColor="bg-indigo-400"
        />
        <DimBar index={1}
          leftLabel="S" rightLabel="N"
          leftScore={scores.S} rightScore={scores.N}
          leftColor="bg-yellow-400" rightColor="bg-orange-400"
        />
        <DimBar index={2}
          leftLabel="T" rightLabel="F"
          leftScore={scores.T} rightScore={scores.F}
          leftColor="bg-purple-400" rightColor="bg-pink-400"
        />
        <DimBar index={3}
          leftLabel="J" rightLabel="P"
          leftScore={scores.J} rightScore={scores.P}
          leftColor="bg-green-400" rightColor="bg-teal-400"
        />
      </div>

      {/* Disclaimer */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 text-center px-4">
        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
        ผลลัพธ์นี้เป็นเพียงการประมาณการจากแบบทดสอบสั้น ไม่ใช่การวินิจฉัยทางจิตวิทยา
      </p>

      {/* CTA */}
      <Link
        href={`/mbti/${result.type}`}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
      >
        <Link2 className="h-4 w-4" /> ดูหน้าผลลัพธ์แบบเต็ม (แชร์ได้)
      </Link>

      <div className="flex gap-3">
        <Button
          onClick={onRestart}
          className="flex-1 h-11 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold text-sm"
        >
          ทำแบบทดสอบอีกครั้ง
        </Button>
        <Button
          onClick={() => setShareModalOpen(true)}
          className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
        >
          <Share2 className="inline h-4 w-4 mr-1.5" />แชร์ผลลัพธ์
        </Button>
      </div>

      {/* Quick copy-link fallback — for users who just want the URL */}
      <button
        type="button"
        onClick={() => {
          const shareUrl = resultId
            ? `${window.location.origin}/result/${resultId}`
            : `${window.location.origin}/mbti/${result.type}`
          if (typeof navigator !== "undefined" && navigator.share) {
            navigator.share({
              title: `ฉันเป็น ${result.type} — ${profile.nickname}`,
              text:  `${profile.tagline}\nมาทำแบบทดสอบ MBTI กันที่ Jknowledge!`,
              url:   shareUrl,
            }).catch(() => {
              navigator.clipboard?.writeText(shareUrl)
              toast("คัดลอกลิงก์แล้ว")
            })
          } else {
            navigator.clipboard?.writeText(shareUrl)
            toast("คัดลอกลิงก์แล้ว")
          }
        }}
        className="-mt-2 w-full text-center text-xs text-gray-500 hover:text-green-700 hover:underline"
      >
        หรือ คัดลอกลิงก์ผลลัพธ์
      </button>

      {/* Image export modal */}
      <MBTIShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        result={result}
        profile={profile}
      />
    </div>
  )
}
