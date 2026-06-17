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
  getUniversitiesWithStats,
} from "@/server/queries"
import { MapPin } from "lucide-react"

export async function generateStaticParams() {
  const unis = await getUniversitiesWithStats()
  return unis.map((u) => ({ universitySlug: u.slug }))
}

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

export const revalidate = 1800

export default async function UniversityScoresPage({ params }: Props) {
  const { universitySlug } = await params

  const [uni, faculties, latestYear] = await Promise.all([
    getUniversityBySlug(universitySlug),
    getFacultiesByUniSlug(universitySlug),
    getLatestTcasYear(),
  ])

  if (!uni) notFound()

  const jsonLd = {
    "@context":  "https://schema.org",
    "@type":     "CollegeOrUniversity",
    name:        uni.name,
    alternateName: uni.shortName,
    address: {
      "@type":          "PostalAddress",
      addressLocality:  uni.location,
      addressCountry:   "TH",
    },
    url: `https://jknowledge-th.com/scores/${uni.slug}`,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
        <p>© 2026 Jknowledge · ข้อมูลทั้งหมดเป็นอ้างอิงจากเว็บไซต์ mytcas · เป็นเพียงการประมาณการ ไม่ใช่ผลลัพธ์ที่รับประกันการสอบติด</p>
      </footer>
    </div>
  )
}
