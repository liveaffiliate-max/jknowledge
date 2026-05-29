import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Header from "@/components/layout/header"
import { FacultyList } from "@/features/scores/components/faculty-list"
import { UniversityLogo } from "@/components/university-logo"
import {
  getUniversityBySlug,
  getFacultiesByUniSlug,
  getLatestTcasYear,
} from "@/server/queries"
import { MapPin } from "lucide-react"

interface Props {
  params: Promise<{ universitySlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { universitySlug } = await params
  const uni = await getUniversityBySlug(universitySlug)
  if (!uni) return {}
  return {
    title: `คะแนน TCAS ${uni.shortName} — Jknowledge`,
    description: `ข้อมูลคะแนนตัดสิทธิ์ TCAS ย้อนหลัง ${uni.name} ทุกคณะและสาขา`,
  }
}

export const dynamic = "force-dynamic"

export default async function UniversityScoresPage({ params }: Props) {
  const { universitySlug } = await params

  const [uni, faculties, latestYear] = await Promise.all([
    getUniversityBySlug(universitySlug),
    getFacultiesByUniSlug(universitySlug),
    getLatestTcasYear(),
  ])

  if (!uni) notFound()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* University banner */}
        <div
          className="text-white"
          style={{ backgroundColor: uni.color }}
        >
          <div className="mx-auto max-w-5xl px-4 py-8">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-white/70">
              <Link href="/scores" className="hover:text-white transition-colors">
                คะแนนย้อนหลัง
              </Link>
              <span>/</span>
              <span className="text-white font-medium">{uni.shortName}</span>
            </nav>

            <div className="flex items-center gap-4">
              {/* University logo */}
              <UniversityLogo
                slug={uni.slug}
                shortName={uni.shortName}
                color={uni.color}
                className="h-14 w-14"
                rounded="rounded-2xl"
              />

              <div>
                <h1 className="text-xl font-bold leading-snug">{uni.name}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {uni.location}
                  </span>
                  <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                    {faculties.length} คณะ/สาขา
                  </span>
                  {latestYear && (
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium">
                      ข้อมูลถึง TCAS{latestYear - 2500}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Faculty list */}
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">คณะและสาขา</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              คลิกที่คณะเพื่อดูคะแนนย้อนหลังและกราฟแนวโน้ม
            </p>
          </div>
          <FacultyList faculties={faculties} universitySlug={uni.slug} />
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-400">
        © 2026 Jknowledge · ข้อมูลจาก mytcas · เป็นการประมาณการ ไม่รับประกันความถูกต้อง
      </footer>
    </div>
  )
}
