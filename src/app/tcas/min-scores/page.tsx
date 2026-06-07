import Link from "next/link"
import type { Metadata } from "next"
import Header from "@/components/layout/header"
import { getMinScoresLatest } from "@/server/queries"
import { FIELD_LABELS, FIELD_COLORS } from "@/features/scores/lib/field-labels"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { SITE_URL, SITE_NAME } from "@/lib/site"
import { ChevronRight, TrendingDown } from "lucide-react"
import { MinScoresFilter } from "./_components/filter"
import type { FacultyField } from "@/types/tcas"

export const revalidate = 3600

export const metadata: Metadata = {
  title:       "คะแนนต่ำสุด TCAS ปีล่าสุด — รวมทุกคณะทุกมหาวิทยาลัย | Jknowledge",
  description: "ดูคะแนนตัดสิทธิ์ TCAS ต่ำสุดของทุกคณะ ทุกมหาวิทยาลัย ในปีล่าสุด เรียงจากต่ำที่สุด พร้อมเปรียบเทียบรายคณะและประเมินโอกาสรับ",
  keywords:    ["คะแนนต่ำสุด TCAS", "คะแนนตัดสิทธิ์", "TCAS ปีล่าสุด", "คะแนนคณะ", "คะแนนต่ำสุดรอบ 3"],
  alternates:  { canonical: `${SITE_URL}/tcas/min-scores` },
  openGraph: {
    title:       "คะแนนต่ำสุด TCAS ปีล่าสุด",
    description: "รวมคะแนนตัดสิทธิ์ของทุกคณะ เรียงจากต่ำสุด",
    url:         `${SITE_URL}/tcas/min-scores`,
    siteName:    SITE_NAME,
    type:        "website",
  },
}

export default async function MinScoresPage() {
  const rows = await getMinScoresLatest(500)
  const year = rows[0]?.year

  const jsonLd = {
    "@context":      "https://schema.org",
    "@type":         "ItemList",
    name:            `คะแนนต่ำสุด TCAS ${year ? `ปี ${year}` : ""}`,
    numberOfItems:   rows.length,
    itemListElement: rows.slice(0, 50).map((r, i) => ({
      "@type":  "ListItem",
      position: i + 1,
      name:     `${r.facultyName} — ${r.universityShortName}`,
      url:      `${SITE_URL}/scores/${r.universitySlug}/${r.facultyId}`,
    })),
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <Breadcrumb
          items={[
            { label: "หน้าแรก", href: "/" },
            { label: "TCAS",   href: "/scores" },
            { label: "คะแนนต่ำสุด" },
          ]}
        />

        {/* ── Hero ── */}
        <header className="rounded-2xl bg-white border border-gray-100 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                คะแนนต่ำสุด TCAS{year ? ` ปี ${year}` : ""}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                รวมคะแนนตัดสิทธิ์ของทุกคณะ ทุกมหาวิทยาลัย เรียงจากต่ำสุด
                — ใช้เป็นข้อมูลอ้างอิงประเมินโอกาสรับเข้าศึกษา
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-1 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              วิเคราะห์คะแนนของฉัน
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/scores"
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-green-200"
            >
              ดูตามมหาวิทยาลัย
            </Link>
          </div>
        </header>

        {/* ── Filterable list (client) ── */}
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-500">
            ยังไม่มีข้อมูลคะแนนสำหรับปีนี้
          </div>
        ) : (
          <MinScoresFilter
            rows={rows}
            fieldLabels={FIELD_LABELS as Record<FacultyField, string>}
            fieldColors={FIELD_COLORS as Record<FacultyField, string>}
          />
        )}

        {/* ── SEO copy ── */}
        <section className="rounded-2xl bg-white border border-gray-100 p-6 text-sm text-gray-600">
          <h2 className="text-base font-semibold text-gray-900 mb-2">เกี่ยวกับคะแนนต่ำสุด TCAS</h2>
          <p className="leading-relaxed">
            <strong>คะแนนต่ำสุด TCAS</strong> คือคะแนนของผู้ที่ติดอันดับสุดท้ายในรอบที่ผ่านมา
            ใช้เป็นแนวทางว่าหากจะสมัครคณะนี้ในปีถัดไป ควรจะมีคะแนนประมาณเท่าใดเพื่อให้มีโอกาสติด
            อย่างไรก็ตามคะแนนตัดสิทธิ์ในแต่ละปีจะเปลี่ยนแปลงตามจำนวนผู้สมัครและความยากของข้อสอบ
            จึงควรใช้ข้อมูลนี้ประกอบกับการ <Link href="/analyze" className="text-green-700 underline">วิเคราะห์โอกาส</Link> รับเข้าด้วย
          </p>
        </section>
      </div>
    </main>
  )
}
