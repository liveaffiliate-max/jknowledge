import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/layout/header"
import { getMBTIProfileByType } from "@/server/mbti-queries"
import { cn } from "@/lib/utils"
import { Check, Brain, BarChart2, GraduationCap, Briefcase, AlertTriangle } from "lucide-react"

interface Props {
  params: Promise<{ type: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params
  const profile = await getMBTIProfileByType(type)
  if (!profile) return {}
  return {
    title: `${profile.type} ${profile.nickname} — บุคลิกภาพ MBTI | Jknowledge`,
    description: profile.tagline + " · " + profile.description.slice(0, 120),
    openGraph: {
      title: `ฉันเป็น ${profile.type} — ${profile.nickname}`,
      description: profile.tagline,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `ฉันเป็น ${profile.type} — ${profile.nickname}`,
      description: profile.tagline,
    },
  }
}

export const dynamic = "force-dynamic"

export default async function MBTITypePage({ params }: Props) {
  const { type } = await params
  const profile = await getMBTIProfileByType(type)
  if (!profile) notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Hero banner */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-2xl px-4 py-8">
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
              <Link href="/mbti" className="hover:text-green-600 transition-colors">
                แนะนำคณะ (MBTI)
              </Link>
              <span>/</span>
              <span className="text-gray-600 font-medium">{profile.type}</span>
            </nav>

            <div className="text-center">
              <profile.icon className={cn("mx-auto h-16 w-16", profile.color)} />
              <div className="mt-4">
                <h1 className={cn("text-5xl font-black tracking-wide", profile.color)}>
                  {profile.type}
                </h1>
                <p className="mt-2 text-xl font-semibold text-gray-800">
                  "{profile.nickname}"
                </p>
                <p className="mt-2 text-sm text-gray-500">{profile.tagline}</p>
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {profile.strengths.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                  >
                    <Check className="h-3 w-3" /> {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-2xl px-4 py-8 space-y-5">
          {/* Description */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
              <Brain className="h-4 w-4" />
              บุคลิกภาพ
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{profile.description}</p>
          </div>

          {/* Dimension breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-4">
              <BarChart2 className="h-4 w-4" />
              มิติบุคลิกภาพ
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(["EI", "SN", "TF", "JP"] as const).map((dim) => {
                const dominant = profile.type[["EI", "SN", "TF", "JP"].indexOf(dim)]
                const colors: Record<string, string> = {
                  E: "bg-blue-100 text-blue-800", I: "bg-indigo-100 text-indigo-800",
                  S: "bg-yellow-100 text-yellow-800", N: "bg-orange-100 text-orange-800",
                  T: "bg-purple-100 text-purple-800", F: "bg-pink-100 text-pink-800",
                  J: "bg-green-100 text-green-800", P: "bg-teal-100 text-teal-800",
                }
                const labels: Record<string, string> = {
                  E: "Extraversion", I: "Introversion",
                  S: "Sensing", N: "iNtuition",
                  T: "Thinking", F: "Feeling",
                  J: "Judging", P: "Perceiving",
                }
                return (
                  <div
                    key={dim}
                    className={cn(
                      "flex flex-col items-center rounded-xl py-3 px-2",
                      colors[dominant]
                    )}
                  >
                    <span className="text-2xl font-black">{dominant}</span>
                    <span className="text-[10px] font-medium mt-1 text-center leading-tight">
                      {labels[dominant]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Faculty recommendations */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-4">
              <GraduationCap className="h-4 w-4" />
              คณะที่เหมาะกับ {profile.type}
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
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-3">
              <Briefcase className="h-4 w-4" />
              อาชีพที่เหมาะกับ {profile.type}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.careers.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 text-center px-4">
            <AlertTriangle className="h-3 w-3 flex-shrink-0" />
            ผลลัพธ์นี้เป็นเพียงการประมาณการ ไม่ใช่การวินิจฉัยทางจิตวิทยา
          </p>

          {/* CTA */}
          <div className="rounded-2xl border border-green-100 bg-green-50 p-5 text-center">
            <p className="text-sm font-semibold text-green-900 mb-1">
              ยังไม่รู้บุคลิกภาพของตัวเอง?
            </p>
            <p className="text-xs text-green-700 mb-3">
              ทำแบบทดสอบ 20 ข้อ ใช้เวลาเพียง ~3 นาที
            </p>
            <Link
              href="/mbti"
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              <Brain className="h-4 w-4" /> ทำแบบทดสอบ MBTI →
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-400">
        © 2026 Jknowledge · แบบทดสอบ MBTI อ้างอิงจากทฤษฎีของ Myers-Briggs Type Indicator
      </footer>
    </div>
  )
}
