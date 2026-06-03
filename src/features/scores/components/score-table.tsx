import { cn } from "@/lib/utils"
import type { YearlyScore } from "@/types/tcas"

interface ScoreTableProps {
  scores: YearlyScore[]
}

export function ScoreTable({ scores }: ScoreTableProps) {
  const sorted = [...scores].sort((a, b) => b.year - a.year)

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="px-3 py-3 text-left font-semibold text-gray-600 text-xs">ปี</th>
            <th className="px-3 py-3 text-right font-semibold text-gray-600 text-xs">ต่ำสุด</th>
            <th className="px-3 py-3 text-right font-semibold text-gray-600 text-xs">เฉลี่ย</th>
            <th className="hidden sm:table-cell px-3 py-3 text-right font-semibold text-gray-600 text-xs">สูงสุด</th>
            <th className="hidden sm:table-cell px-3 py-3 text-right font-semibold text-gray-600 text-xs">ที่นั่ง</th>
            <th className="px-3 py-3 text-right font-semibold text-gray-600 text-xs">เทียบปีก่อน</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s, i) => {
            const prev = sorted[i + 1]
            const delta = prev ? s.minScore - prev.minScore : null
            const isLatest = i === 0
            return (
              <tr
                key={s.year}
                className={cn(
                  "border-b border-gray-50 last:border-0 transition-colors",
                  isLatest ? "bg-green-50/60" : "hover:bg-gray-50/80"
                )}
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 text-xs">
                      TCAS{s.year - 2500}
                    </span>
                    {isLatest && (
                      <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-semibold text-green-700">
                        ล่าสุด
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-bold text-red-600 text-sm">{s.minScore.toFixed(2)}</span>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-medium text-amber-600 text-sm">{s.avgScore.toFixed(2)}</span>
                </td>
                <td className="hidden sm:table-cell px-3 py-3 text-right">
                  <span className="font-medium text-blue-600 text-sm">
                    {s.maxScore !== undefined ? s.maxScore.toFixed(2) : "—"}
                  </span>
                </td>
                <td className="hidden sm:table-cell px-3 py-3 text-right">
                  <span className="text-gray-600 text-sm">{s.seats ?? "—"}</span>
                </td>
                <td className="px-3 py-3 text-right">
                  {delta === null ? (
                    <span className="text-gray-300">—</span>
                  ) : (
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        delta > 0
                          ? "text-red-500"
                          : delta < 0
                          ? "text-green-600"
                          : "text-gray-400"
                      )}
                    >
                      {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"}{" "}
                      {Math.abs(delta).toFixed(2)}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
