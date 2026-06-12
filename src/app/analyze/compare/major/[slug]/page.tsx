import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import Header from "@/components/layout/header"
import { MajorComparisonTable } from "@/features/compare/components/major-comparison-table"
import { MajorComparisonChartLazy } from "@/features/compare/components/major-comparison-chart-lazy"
import { getMajorComparison } from "@/server/queries"
import { formatMajorLabel, parseMajorSlug } from "@/lib/major-canonical"
import { SITE_URL } from "@/lib/site"
import { ArrowLeft, GitCompareArrows, MapPin, Users, Building2 } from "lucide-react"

export const revalidate = 3600
export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

// ── Dynamic metadata ─────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const parts    = parseMajorSlug(slug)
  if (!parts) return { title: "ไม่พบคณะที่ระบุ — Jknowledge" }

  const data = await getMajorComparison(slug)
  if (!data || data.entries.length === 0) {
    return { title: "ไม่พบคณะที่ระบุ — Jknowledge" }
  }

  const label   = formatMajorLabel(parts)
  const count   = data.uniCount
  const easiest = data.entries[0]
  const minStr  = easiest?.latestMinScore != null ? easiest.latestMinScore.toFixed(1) : "–"

  return {
    title:       `เปรียบเทียบ ${label} ${count} มหาวิทยาลัย — Jknowledge`,
    description: `ดูคะแนนต่ำสุด เฉลี่ย จำนวนรับของ ${label} ทุกมหาวิทยาลัยที่เปิดสอน เรียงจากคะแนนต่ำสุด ${minStr} ของ ${easiest?.university.shortName ?? ""} ขึ้นไป — ข้อมูลย้อนหลัง 6 ปี อ้างอิงจาก mytcas`,
    alternates: {
      canonical: `${SITE_URL}/analyze/compare/major/${slug}`,
    },
    openGraph: {
      title:       `${label} — เทียบ ${count} มหาวิทยาลัย`,
      description: `คะแนนเข้าทุกมหาลัยที่เปิด ${label} เรียงจากเข้าง่ายสุด`,
      url:         `${SITE_URL}/analyze/compare/major/${slug}`,
      siteName:    "Jknowledge",
      type:        "website",
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function MajorComparisonPage({ params }: PageProps) {
  const { slug } = await params
  const data     = await getMajorComparison(slug)
  if (!data || data.entries.length === 0) notFound()

  const { parts, entries, uniCount, totalSeats } = data
  const label    = formatMajorLabel(parts)
  const easiest  = entries[0]
  const hardest  = entries[entries.length - 1]

  // JSON-LD ItemList — surfaces the ranking to Google's rich-result eligibility
  const jsonLd = {
    "@context":        "https://schema.org",
    "@type":           "ItemList",
    name:              `เปรียบเทียบ ${label} ${uniCount} มหาวิทยาลัย`,
    numberOfItems:     uniCount,
    itemListOrder:     "https://schema.org/ItemListOrderAscending",
    itemListElement:   entries.map((e, i) => ({
      "@type":   "ListItem",
      position:  i + 1,
      url:       `${SITE_URL}/scores/${e.university.slug}/${e.facultyId}`,
      name:      `${e.university.shortName} · ${e.facultyName}`,
    })),
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4 py-8">
            <Link
              href="/analyze/compare"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-2"
            >
              <ArrowLeft className="h-3 w-3" />
              กลับไปหน้าเปรียบเทียบ
            </Link>

            <div className="flex items-start gap-3">
              <GitCompareArrows className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight break-words">
                  {label}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  เปรียบเทียบคะแนนต่ำสุด · เฉลี่ย · จำนวนรับของทุกมหาวิทยาลัยที่เปิดสอน
                </p>
              </div>
            </div>

            {/* Summary chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                <Building2 className="h-3.5 w-3.5" />
                {uniCount} มหาวิทยาลัย
              </span>
              {totalSeats != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <Users className="h-3.5 w-3.5" />
                  รวม {totalSeats.toLocaleString()} ที่นั่ง
                </span>
              )}
              {easiest?.latestMinScore != null && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <MapPin className="h-3.5 w-3.5" />
                  ต่ำสุด {easiest.latestMinScore.toFixed(1)} ที่ {easiest.university.shortName}
                </span>
              )}
              {hardest?.latestMinScore != null && hardest.facultyId !== easiest?.facultyId && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                  สูงสุด {hardest.latestMinScore.toFixed(1)} ที่ {hardest.university.shortName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mx-auto max-w-5xl space-y-5 px-4 py-8">
          <MajorComparisonChartLazy entries={entries} />
          <MajorComparisonTable entries={entries} />

          {/* Subtle CTA back to multi-faculty compare */}
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-4 text-center">
            <p className="text-sm text-gray-600">
              อยากเทียบหลายคณะข้ามมหาลัยพร้อมกัน?
            </p>
            <Link
              href="/analyze/compare"
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100 transition-colors"
            >
              <GitCompareArrows className="h-4 w-4" />
              ไปหน้าเปรียบเทียบหลายคณะ
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-400">
        <p>© 2026 Jknowledge · ข้อมูลทั้งหมดเป็นอ้างอิงจากเว็บไซต์ mytcas · เป็นเพียงการประมาณการ ไม่ใช่ผลลัพธ์ที่รับประกันการสอบติด</p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
