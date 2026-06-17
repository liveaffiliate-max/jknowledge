"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { FIELD_COLORS, FIELD_LABELS } from "../lib/field-labels"
import { trackFacultyClick } from "@/lib/analytics"
import type { FacultyPreview, FacultyField } from "@/types/tcas"
import { Search, ChevronRight, ArrowUpDown } from "lucide-react"

type SortKey = "min-asc" | "min-desc" | "seats-desc" | "name"

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "min-asc",    label: "คะแนนต่ำสุด: น้อย → มาก" },
  { key: "min-desc",   label: "คะแนนต่ำสุด: มาก → น้อย" },
  { key: "seats-desc", label: "ที่นั่งเยอะที่สุด" },
  { key: "name",       label: "ชื่อ ก–ฮ" },
]

interface FacultyListProps {
  faculties: FacultyPreview[]
  universitySlug: string
}

export function FacultyList({ faculties, universitySlug }: FacultyListProps) {
  const [query, setQuery]   = useState("")
  const [field, setField]   = useState<FacultyField | "all">("all")
  const [sort, setSort]     = useState<SortKey>("min-asc")

  // Compute available fields once from the source list — chips only show what
  // this university actually offers, sorted by count desc.
  const availableFields = useMemo(() => {
    const counts = new Map<FacultyField, number>()
    for (const f of faculties) counts.set(f.field, (counts.get(f.field) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [faculties])

  const filtered = useMemo(() => {
    const q = query.trim()
    let list = faculties
    if (field !== "all") list = list.filter((f) => f.field === field)
    if (q) {
      list = list.filter(
        (f) =>
          f.name.includes(q) ||
          f.program.includes(q) ||
          (f.majorName ?? "").includes(q) ||
          (f.detail ?? "").includes(q),
      )
    }
    const sorted = [...list]
    switch (sort) {
      case "min-asc":
        sorted.sort((a, b) => (a.latestMinScore ?? Infinity) - (b.latestMinScore ?? Infinity))
        break
      case "min-desc":
        sorted.sort((a, b) => (b.latestMinScore ?? -Infinity) - (a.latestMinScore ?? -Infinity))
        break
      case "seats-desc":
        sorted.sort((a, b) => (b.latestSeats ?? -1) - (a.latestSeats ?? -1))
        break
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "th"))
        break
    }
    return sorted
  }, [faculties, query, field, sort])

  const resetAll = () => {
    setQuery("")
    setField("all")
  }

  return (
    <div className="space-y-4">
      {/* Search + sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาคณะ / สาขา / โครงการ..."
            className={cn(
              "w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4",
              "text-sm text-gray-900 outline-none transition-all",
              "focus:border-green-400 focus:ring-2 focus:ring-green-100",
            )}
          />
        </div>
        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="เรียงลำดับ"
            className={cn(
              "appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8",
              "text-sm text-gray-700 outline-none transition-all cursor-pointer",
              "focus:border-green-400 focus:ring-2 focus:ring-green-100",
            )}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Field chips */}
      {availableFields.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <FieldChip
            label={`ทั้งหมด · ${faculties.length}`}
            active={field === "all"}
            onClick={() => setField("all")}
          />
          {availableFields.map(([f, count]) => (
            <FieldChip
              key={f}
              label={`${FIELD_LABELS[f] ?? "อื่นๆ"} · ${count}`}
              active={field === f}
              colorClass={field === f ? FIELD_COLORS[f] : undefined}
              onClick={() => setField(f)}
            />
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-gray-400">
        {query.trim() || field !== "all"
          ? `พบ ${filtered.length} รายการ`
          : `ทั้งหมด ${faculties.length} คณะ/สาขา`}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400 space-y-3">
          <Search className="mx-auto h-10 w-10 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">
            ไม่พบผลลัพธ์ที่ตรงกับเงื่อนไข
          </p>
          <button
            onClick={resetAll}
            className="text-xs text-green-600 hover:underline"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          {filtered.map((f) => (
            <FacultyRow
              key={f.id}
              faculty={f}
              universitySlug={universitySlug}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FieldChip({
  label,
  active,
  colorClass,
  onClick,
}: {
  label: string
  active: boolean
  colorClass?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? colorClass ?? "bg-green-600 text-white border-green-600"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50",
      )}
    >
      {label}
    </button>
  )
}

function FacultyRow({
  faculty: f,
  universitySlug,
}: {
  faculty: FacultyPreview
  universitySlug: string
}) {
  const displayName = [f.name, f.program, f.majorName, f.detail]
    .filter(Boolean)
    .join(" · ")

  const fieldColor = FIELD_COLORS[f.field] ?? FIELD_COLORS.other
  const fieldLabel = FIELD_LABELS[f.field] ?? "อื่นๆ"

  return (
    <Link
      href={`/scores/${universitySlug}/${f.id}`}
      onClick={() => trackFacultyClick({ universitySlug, facultyName: f.name, facultyId: f.id })}
      className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
    >
      {/* Left: name + field badge */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug">
          {displayName}
        </p>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
              fieldColor,
            )}
          >
            {fieldLabel}
          </span>
          {f.scoreCount > 0 && (
            <span className="text-xs text-gray-400">
              ข้อมูล {f.scoreCount} ปี
            </span>
          )}
        </div>
      </div>

      {/* Right: latest scores */}
      <div className="flex flex-shrink-0 items-center gap-4 text-right">
        {f.latestYear && f.latestMinScore !== null ? (
          <>
            <div className="hidden sm:block">
              <p className="text-xs text-gray-400 mb-0.5">
                TCAS{f.latestYear - 2500}
              </p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-gray-400">ต่ำสุด</p>
                  <p className="text-sm font-bold text-red-500">
                    {f.latestMinScore.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">เฉลี่ย</p>
                  <p className="text-sm font-semibold text-amber-500">
                    {f.latestAvgScore?.toFixed(2) ?? "—"}
                  </p>
                </div>
                {f.latestSeats !== null && (
                  <div>
                    <p className="text-xs text-gray-400">ที่นั่ง</p>
                    <p className="text-sm font-medium text-gray-600">
                      {f.latestSeats}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Mobile: only min score */}
            <div className="sm:hidden text-right">
              <p className="text-xs text-gray-400">ต่ำสุด</p>
              <p className="text-sm font-bold text-red-500">
                {f.latestMinScore.toFixed(2)}
              </p>
            </div>
          </>
        ) : (
          <span className="text-xs text-gray-300">ยังไม่มีข้อมูล</span>
        )}
        <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
      </div>
    </Link>
  )
}
