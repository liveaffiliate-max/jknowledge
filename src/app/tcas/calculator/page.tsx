import Link from "next/link"
import type { Metadata } from "next"
import Header from "@/components/layout/header"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { SITE_URL, SITE_NAME } from "@/lib/site"
import { Calculator, Check, ChevronRight, BarChart2, GraduationCap } from "lucide-react"

export const metadata: Metadata = {
  title:       "TCAS Calculator — คำนวณคะแนนและประเมินโอกาสรับ | Jknowledge",
  description: "เครื่องคำนวณคะแนน TCAS ฟรี กรอกคะแนนรายวิชา (TGAT TPAT A-Level) ดูคะแนนรวมตามน้ำหนักของคณะ และประเมินโอกาสรับเทียบกับคะแนนตัดสิทธิ์ย้อนหลัง",
  keywords:    ["TCAS calculator", "คำนวณคะแนน TCAS", "คะแนน TGAT", "คะแนน TPAT", "A-Level"],
  alternates:  { canonical: `${SITE_URL}/tcas/calculator` },
  openGraph: {
    title:       "TCAS Calculator — คำนวณคะแนนและประเมินโอกาสรับ",
    description: "เครื่องคำนวณคะแนน TCAS ฟรี พร้อมประเมินโอกาสรับเข้าศึกษา",
    url:         `${SITE_URL}/tcas/calculator`,
    siteName:    SITE_NAME,
    type:        "website",
  },
}

const FEATURES = [
  {
    icon:  Calculator,
    title: "คำนวณตามน้ำหนักจริง",
    body:  "ใช้น้ำหนักรายวิชา (weight) ของแต่ละคณะตรงจาก ทปอ. รอบ 3 ปี 2569",
  },
  {
    icon:  BarChart2,
    title: "เทียบคะแนนย้อนหลัง 5 ปี",
    body:  "ดูแนวโน้มคะแนนตัดสิทธิ์ปี 2564–2568 ของคณะที่สนใจ",
  },
  {
    icon:  GraduationCap,
    title: "ประเมินโอกาสรับ",
    body:  "ระบบจัดกลุ่มคะแนนเป็น โอกาสสูง / แข่งขันได้ / ยากขึ้น พร้อมเหตุผล",
  },
]

const HOW_IT_WORKS = [
  "เลือกมหาวิทยาลัยและคณะที่อยากเข้า",
  "กรอกคะแนนรายวิชาที่เกี่ยวข้อง (TGAT, TPAT, A-Level)",
  "ระบบคำนวณคะแนนรวมตามน้ำหนักจริง แล้วเทียบกับคะแนนตัดสิทธิ์ย้อนหลัง",
  "รับผลโอกาสรับและคำแนะนำคณะใกล้เคียง",
]

export default function CalculatorLandingPage() {
  const jsonLd = {
    "@context":   "https://schema.org",
    "@type":      "SoftwareApplication",
    name:         "Jknowledge TCAS Calculator",
    url:          `${SITE_URL}/analyze`,
    applicationCategory: "EducationalApplication",
    operatingSystem:     "Web",
    offers:       { "@type": "Offer", price: "0", priceCurrency: "THB" },
    description:  "เครื่องคำนวณคะแนน TCAS และประเมินโอกาสรับเข้าศึกษาในมหาวิทยาลัย",
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <Breadcrumb
          items={[
            { label: "หน้าแรก", href: "/" },
            { label: "TCAS",   href: "/scores" },
            { label: "Calculator" },
          ]}
        />

        {/* ── Hero ── */}
        <header className="rounded-2xl bg-white border border-gray-100 p-6 sm:p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 mb-4">
            <Calculator className="h-5 w-5 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            TCAS Calculator
          </h1>
          <p className="mt-1 text-base text-gray-500">
            คำนวณคะแนน TCAS ตามน้ำหนักจริงของแต่ละคณะ แล้วประเมินโอกาสรับ
          </p>

          <Link
            href="/analyze"
            className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
          >
            เริ่มคำนวณคะแนน
            <ChevronRight className="h-4 w-4" />
          </Link>
        </header>

        {/* ── Features ── */}
        <section className="grid gap-3 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl bg-white border border-gray-100 p-4">
              <Icon className="h-5 w-5 text-green-600 mb-2" />
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{body}</p>
            </div>
          ))}
        </section>

        {/* ── How it works ── */}
        <section className="rounded-2xl bg-white border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">วิธีใช้</h2>
          <ol className="space-y-3">
            {HOW_IT_WORKS.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Why ── */}
        <section className="rounded-2xl bg-white border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">ทำไมต้องใช้ Calculator?</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              "คะแนนรวมตามน้ำหนักจริงต่างจากการบวกคะแนนเฉลี่ย — Calculator คำนวณให้อัตโนมัติ",
              "เห็นแนวโน้มคะแนนตัดสิทธิ์ย้อนหลัง 5 ปี ประกอบการตัดสินใจ",
              "ไม่ต้องลงทะเบียน ไม่เก็บข้อมูลโดยไม่ได้ขออนุญาต (ตาม PDPA)",
              "ฟรี ใช้ได้ทุกอุปกรณ์",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/analyze"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ลองใช้ Calculator ฟรี
            <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </main>
  )
}
