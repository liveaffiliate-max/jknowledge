import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import Header from "@/components/layout/header"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { prisma } from "@/lib/prisma"
import { getMBTIProfileByType } from "@/server/mbti-queries"
import { MBTI_ROLE_META } from "@/types/mbti"
import { MBTIFacultyList, MBTIFacultyListCTA } from "@/features/mbti/components/mbti-faculty-list"
import { cn } from "@/lib/utils"
import { getDimensionBreakdown } from "@/utils/mbti"
import { Brain, GraduationCap, BarChart2, ArrowRight, AlertTriangle } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const result = await prisma.mBTIResult.findUnique({
    where:  { id },
    select: { mbtiType: true, profile: { select: { nickname: true, tagline: true } } },
  })
  if (!result) return { title: "ผลลัพธ์ MBTI — Jknowledge" }

  const title = `ฉันเป็น ${result.mbtiType} — ${result.profile.nickname}`
  const desc  = `${result.profile.tagline} · ดูผลลัพธ์ MBTI ของฉันบน Jknowledge`
  return {
    title,
    description: desc,
    openGraph:   { title, description: desc, type: "website" },
    twitter:     { card: "summary_large_image", title, description: desc },
  }
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params

  const result = await prisma.mBTIResult.findUnique({
    where:  { id },
    select: { id: true, mbtiType: true, scores: true, createdAt: true },
  })
  if (!result) notFound()

  const profile = await getMBTIProfileByType(result.mbtiType)
  if (!profile) notFound()

  const roleMeta = MBTI_ROLE_META[profile.role]
  const rawScores = result.scores as Record<string, number>
  const scores = {
    E: rawScores.E ?? 0, I: rawScores.I ?? 0,
    S: rawScores.S ?? 0, N: rawScores.N ?? 0,
    T: rawScores.T ?? 0, F: rawScores.F ?? 0,
    J: rawScores.J ?? 0, P: rawScores.P ?? 0,
  }
  const breakdown = getDimensionBreakdown(scores)
  const hasEdge   = breakdown.some((b) => b.edge)

  // Per-dim left-pct for the bar visuals (canonical left = E/S/T/J)
  const pct = (a: number, b: number) => {
    const total = a + b
    return total === 0 ? 50 : Math.round((a / total) * 100)
  }
  const dims = [
    { left: "E", right: "I", leftPct: pct(scores.E, scores.I), edge: breakdown[0].edge },
    { left: "S", right: "N", leftPct: pct(scores.S, scores.N), edge: breakdown[1].edge },
    { left: "T", right: "F", leftPct: pct(scores.T, scores.F), edge: breakdown[2].edge },
    { left: "J", right: "P", leftPct: pct(scores.J, scores.P), edge: breakdown[3].edge },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Hero */}
        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-2xl px-4 py-6">
            <Breadcrumb items={[
              { label: "แนะนำคณะ (MBTI)", href: "/mbti" },
              { label: "ผลลัพธ์" },
            ]} />

            <div className="mt-5 text-center">
              <div className="text-xs font-medium text-gray-400">ผลลัพธ์ MBTI</div>
              <h1 className={cn("mt-1 text-6xl font-black tracking-wide", profile.color)}>
                {profile.type}
              </h1>
              <p className="mt-2 text-xl font-semibold text-gray-800">
                &ldquo;{profile.nickname}&rdquo;
              </p>
              <span className={cn(
                "mt-3 inline-block rounded-full border px-3 py-1 text-xs font-semibold",
                roleMeta.bg, roleMeta.color
              )}>
                {roleMeta.label}
              </span>

              {/* Inline % summary — Phase A.4 */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-gray-600">
                {breakdown.map((b, i) => (
                  <span key={b.letter} className="flex items-center gap-1">
                    {i > 0 && <span className="text-gray-300">·</span>}
                    <span className={cn("font-bold", profile.color)}>{b.letter}</span>
                    <span className="tabular-nums">{b.pct}%</span>
                    {b.edge && (
                      <span
                        className="ml-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
                      >
                        ก้ำกึ่ง
                      </span>
                    )}
                  </span>
                ))}
              </div>

              <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">{profile.tagline}</p>
              {hasEdge && (
                <p className="mx-auto mt-2 max-w-sm text-[11px] leading-snug text-amber-700/80">
                  บางมิติคะแนนใกล้ครึ่ง — แปลว่ามีลักษณะของทั้งสองด้านปะปนกัน ไม่ใช่ผลที่ผิด
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
          {/* Dimension bars — the differentiator */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <BarChart2 className="h-4 w-4" />
              สัดส่วนบุคลิกภาพของฉัน
            </div>
            <div className="space-y-3.5">
              {dims.map((d) => {
                const dominantLeft = d.leftPct >= 50
                return (
                  <div key={d.left}>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className={dominantLeft ? "text-gray-900" : "text-gray-300"}>{d.left}</span>
                        {d.edge && (
                          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            ก้ำกึ่ง
                          </span>
                        )}
                      </span>
                      <span className={!dominantLeft ? "text-gray-900" : "text-gray-300"}>{d.right}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn("h-full rounded-full", d.edge ? "bg-amber-400" : "bg-green-500")}
                        style={{ width: `${d.leftPct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[11px] font-medium">
                      <span className={dominantLeft ? "text-green-700" : "text-gray-400"}>{d.leftPct}%</span>
                      <span className={!dominantLeft ? "text-green-700" : "text-gray-400"}>{100 - d.leftPct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Brain className="h-4 w-4" />
              บุคลิกภาพ
            </div>
            <p className="text-sm leading-relaxed text-gray-700">{profile.description}</p>
          </div>

          {/* Faculty recommendations from real DB */}
          <div className="rounded-2xl border border-green-200 bg-green-50/60 p-5">
            <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-green-800">
              <GraduationCap className="h-4 w-4" />
              คณะที่เหมาะกับ {profile.type}
            </div>
            <p className="mb-4 text-xs text-green-700/80">
              เรียงตามความเข้ากันได้และคะแนนล่าสุด
            </p>
            <MBTIFacultyList type={profile.type} limit={8} variant="compact" source="share_page" />
            <MBTIFacultyListCTA type={profile.type} />
          </div>

          {/* Disclaimer */}
          <p className="flex items-center justify-center gap-1.5 px-4 text-center text-xs text-gray-400">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            ผลลัพธ์นี้เป็นเพียงการประมาณการ ไม่ใช่การวินิจฉัยทางจิตวิทยา
          </p>

          {/* CTA — encourage viewer to take their own quiz */}
          <Link
            href="/mbti"
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-green-600 px-5 py-3.5 text-sm font-semibold text-white motion-safe:transition-colors hover:bg-green-700"
          >
            <Brain className="h-4 w-4" />
            ทำแบบทดสอบเพื่อหาบุคลิกของคุณ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-xs text-gray-400">
        © 2026 Jknowledge · แบบทดสอบ MBTI อ้างอิงจากทฤษฎีของ Myers-Briggs
      </footer>
    </div>
  )
}
