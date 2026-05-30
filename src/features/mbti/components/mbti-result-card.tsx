"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getMBTIProfile } from "@/data/mbti-types"
import { dimensionStrength } from "@/utils/mbti"
import type { MBTIResult } from "@/types/mbti"
import { MBTI_ROLE_META } from "@/types/mbti"
import { useToast } from "@/components/ui/toaster"
import { Check, X, BarChart2, GraduationCap, Briefcase, AlertTriangle, Link2, Share2, BookOpen } from "lucide-react"

interface MBTIResultCardProps {
  result: MBTIResult
  onRestart: () => void
}

interface DimBarProps {
  leftLabel: string
  rightLabel: string
  leftScore: number
  rightScore: number
  leftColor: string
}

function DimBar({ leftLabel, rightLabel, leftScore, rightScore, leftColor }: DimBarProps) {
  const total = leftScore + rightScore
  const leftPct = total === 0 ? 50 : Math.round((leftScore / total) * 100)
  const dominantLeft = leftScore >= rightScore
  const strength = dimensionStrength(leftScore, rightScore)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className={cn(dominantLeft ? "text-gray-900" : "text-gray-400")}>{leftLabel}</span>
        <span className={cn("text-[11px]", dominantLeft ? leftColor : "text-gray-400")}>
          {dominantLeft ? leftLabel : rightLabel} {strength}%
        </span>
        <span className={cn(!dominantLeft ? "text-gray-900" : "text-gray-400")}>{rightLabel}</span>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={cn("absolute top-0 left-0 h-full rounded-full", leftColor)}
          style={{ width: `${leftPct}%` }}
        />
      </div>
    </div>
  )
}

export function MBTIResultCard({ result, onRestart }: MBTIResultCardProps) {
  const profile = getMBTIProfile(result.type)
  const { scores } = result
  const { toast } = useToast()

  if (!profile) return null

  return (
    <div className="mx-auto max-w-xl space-y-5">
      {/* Type header */}
      <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-white p-6 text-center shadow-sm">
        <profile.icon className={cn("mx-auto h-12 w-12", profile.color)} />
        <div className="mt-3">
          <span className={cn("text-4xl font-black tracking-wide", profile.color)}>
            {profile.type}
          </span>
          <p className="mt-1 text-lg font-semibold text-gray-800">"{profile.nickname}"</p>
          <p className="mt-1 text-sm text-gray-500">{profile.tagline}</p>
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

      {/* Strengths & Weaknesses */}
      <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm space-y-4">
        {/* Strengths */}
        <div>
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-green-700">
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
          <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-orange-600">
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
        <DimBar
          leftLabel="E" rightLabel="I"
          leftScore={scores.E} rightScore={scores.I}
          leftColor="bg-blue-400"
        />
        <DimBar
          leftLabel="S" rightLabel="N"
          leftScore={scores.S} rightScore={scores.N}
          leftColor="bg-yellow-400"
        />
        <DimBar
          leftLabel="T" rightLabel="F"
          leftScore={scores.T} rightScore={scores.F}
          leftColor="bg-purple-400"
        />
        <DimBar
          leftLabel="J" rightLabel="P"
          leftScore={scores.J} rightScore={scores.P}
          leftColor="bg-green-400"
        />
      </div>

      {/* Faculty recommendations */}
      <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-4">
          <GraduationCap className="h-4 w-4" />
          คณะที่เหมาะกับคุณ
        </div>
        <div className="space-y-3">
          {profile.faculties.map((fac, i) => (
            <div
              key={fac.field}
              className="flex items-start gap-3 rounded-xl bg-gray-50 px-4 py-3"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[11px] font-bold text-green-700">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{fac.field}</p>
                <p className="text-xs text-gray-500 mt-0.5">{fac.reason}</p>
              </div>
            </div>
          ))}
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

      {/* Disclaimer */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 text-center px-4">
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
          onClick={() => {
            const shareUrl = `${window.location.origin}/mbti/${result.type}`
            if (typeof navigator !== "undefined" && navigator.share) {
              navigator.share({
                title: `ฉันเป็น ${result.type} — ${profile.nickname}`,
                text: `${profile.tagline}\nมาทำแบบทดสอบ MBTI กันที่ Jknowledge!`,
                url: shareUrl,
              }).catch(() => {
                navigator.clipboard?.writeText(shareUrl)
                toast("คัดลอกลิงก์แล้ว")
              })
            } else {
              navigator.clipboard?.writeText(shareUrl)
              toast("คัดลอกลิงก์แล้ว")
            }
          }}
          className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm"
        >
          <Share2 className="inline h-4 w-4 mr-1.5" />แชร์ผลลัพธ์
        </Button>
      </div>
    </div>
  )
}
