// ── PopularMajorsSection ─────────────────────────────────────────────────────
// Discovery entry-point for the same-major-across-universities page family.
// Renders the top N majors (by uni participation) as chips that link straight
// to /analyze/compare/major/[slug]. Server component — no JS shipped.

import Link from "next/link"
import { Building2, ArrowRight } from "lucide-react"
import { parseMajorSlug, formatMajorLabel } from "@/lib/major-canonical"

interface Props {
  majors: Array<{ slug: string; uniCount: number }>
}

export function PopularMajorsSection({ majors }: Props) {
  if (majors.length === 0) return null

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900">
            คณะเดียวกัน หลายมหาวิทยาลัย
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            อยากเรียนแพทย์? วิศวะ? คลิกเพื่อดูทุกมหาลัยที่เปิดสอน เรียงจากคะแนนต่ำสุด
          </p>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {majors.map(({ slug, uniCount }) => {
          const parts = parseMajorSlug(slug)
          if (!parts) return null
          const label = formatMajorLabel(parts)
          return (
            <li key={slug}>
              <Link
                href={`/analyze/major/${slug}`}
                className="group flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-2.5 transition-colors hover:border-green-200 hover:bg-green-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate group-hover:text-green-700">
                    {label}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {uniCount} มหาวิทยาลัย
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-300 transition-colors group-hover:text-green-600" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
