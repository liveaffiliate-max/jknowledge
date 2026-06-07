"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import type { MinScoreEntry } from "@/server/queries"
import type { FacultyField } from "@/types/tcas"

interface Props {
  rows:        MinScoreEntry[]
  fieldLabels: Record<FacultyField, string>
  fieldColors: Record<FacultyField, string>
}

export function MinScoresFilter({ rows, fieldLabels, fieldColors }: Props) {
  const [field, setField] = useState<"all" | FacultyField>("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (field !== "all" && r.field !== field) return false
      if (!q) return true
      return (
        r.facultyName.toLowerCase().includes(q) ||
        r.universityName.toLowerCase().includes(q) ||
        r.universityShortName.toLowerCase().includes(q) ||
        (r.program?.toLowerCase().includes(q)) ||
        (r.majorName?.toLowerCase().includes(q))
      )
    })
  }, [rows, field, query])

  // Build field tabs with counts
  const fieldCounts = useMemo(() => {
    const counts: Partial<Record<string, number>> = {}
    for (const r of rows) counts[r.field] = (counts[r.field] ?? 0) + 1
    return counts
  }, [rows])

  const availableFields = (Object.keys(fieldLabels) as FacultyField[])
    .filter((f) => fieldCounts[f])
    .sort((a, b) => (fieldCounts[b] ?? 0) - (fieldCounts[a] ?? 0))

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาคณะหรือมหาวิทยาลัย…"
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
        />
      </div>

      {/* Field chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setField("all")}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
            field === "all"
              ? "border-green-600 bg-green-600 text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-green-200"
          )}
        >
          ทั้งหมด ({rows.length})
        </button>
        {availableFields.map((f) => (
          <button
            key={f}
            onClick={() => setField(f)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
              field === f
                ? "border-green-600 bg-green-600 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-green-200"
            )}
          >
            {fieldLabels[f]} ({fieldCounts[f]})
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-500">
        แสดง {filtered.length.toLocaleString("th-TH")} จาก {rows.length.toLocaleString("th-TH")} รายการ
      </p>

      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium w-12">#</th>
                <th className="px-4 py-2.5 text-left font-medium">คณะ / หลักสูตร</th>
                <th className="px-4 py-2.5 text-left font-medium hidden sm:table-cell">สาขา</th>
                <th className="px-4 py-2.5 text-right font-medium">คะแนนต่ำสุด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.slice(0, 200).map((r, i) => {
                const fieldClass = fieldColors[r.field as FacultyField] ?? fieldColors.other
                return (
                  <tr key={r.facultyId} className="hover:bg-green-50/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400 tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/scores/${r.universitySlug}/${r.facultyId}`}
                        className="block group"
                      >
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-green-700">
                          {r.facultyName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {r.universityShortName} · <span className={cn("inline-block rounded-full border px-1.5 py-px text-[10px] font-medium align-middle", fieldClass)}>{fieldLabels[r.field as FacultyField] ?? "อื่นๆ"}</span>
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell truncate max-w-[200px]">
                      {r.majorName || r.program || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-green-700 tabular-nums">
                        {r.minScore.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 200 && (
          <p className="px-4 py-3 text-center text-xs text-gray-400 border-t border-gray-50">
            แสดง 200 รายการแรก — ใช้ฟิลเตอร์เพื่อค้นหาคณะที่สนใจ
          </p>
        )}
      </div>
    </div>
  )
}
