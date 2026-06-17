import Link from "next/link"
import { cn } from "@/lib/utils"
import { UniversityLogo } from "@/components/university-logo"
import type { MajorComparisonEntry } from "@/server/queries"
import { ArrowRight, MapPin } from "lucide-react"

interface Props {
  entries:       MajorComparisonEntry[]
  currentMin:    number | null
  majorSlug:     string
}

export function SimilarFaculties({ entries, currentMin, majorSlug }: Props) {
  if (entries.length === 0) return null

  // Pick up to 5 closest by latest min score; if currentMin null, just take
  // first 5 (already sorted asc by latest min in the query).
  const ranked = currentMin !== null
    ? [...entries]
        .filter((e) => e.latestMinScore !== null)
        .sort(
          (a, b) =>
            Math.abs((a.latestMinScore ?? 0) - currentMin) -
            Math.abs((b.latestMinScore ?? 0) - currentMin),
        )
        .slice(0, 5)
    : entries.slice(0, 5)

  if (ranked.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">
        สาขาเดียวกันจากมหาวิทยาลัยอื่น เรียงตามคะแนนใกล้เคียงกับสาขานี้
      </p>
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
        {ranked.map((e) => {
          const diff =
            currentMin !== null && e.latestMinScore !== null
              ? e.latestMinScore - currentMin
              : null
          return (
            <Link
              key={e.facultyId}
              href={`/scores/${e.university.slug}/${e.facultyId}`}
              className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <UniversityLogo
                slug={e.university.slug}
                shortName={e.university.shortName}
                color={e.university.color}
                className="h-9 w-9 flex-shrink-0"
                rounded="rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
                  {e.university.shortName}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {e.university.location}
                </p>
              </div>
              {e.latestMinScore !== null && (
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-red-500 tabular-nums">
                    {e.latestMinScore.toFixed(2)}
                  </p>
                  {diff !== null && Math.abs(diff) >= 0.01 && (
                    <p className={cn(
                      "text-[10px] font-medium tabular-nums",
                      diff > 0 ? "text-amber-600" : "text-green-600",
                    )}>
                      {diff > 0 ? "+" : ""}{diff.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      <Link
        href={`/analyze/major/${majorSlug}`}
        className="flex items-center justify-center gap-1.5 mt-3 text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
      >
        ดูเปรียบเทียบทุกมหาวิทยาลัย <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
