"use client"

// ── CompareSlotPicker ────────────────────────────────────────────────────────
// One compact card per slot: university combobox → faculty combobox → remove.
// Each slot owns its own faculty list (loaded when university is picked).

import { useState, useEffect } from "react"
import { Combobox } from "@/components/ui/combobox"
import { fetchFacultiesAction } from "@/server/actions"
import { getRegion, REGION_ORDER, type ThaiRegion } from "@/lib/thai-regions"
import { expandThaiSynonyms } from "@/lib/thai-synonyms"
import { cn } from "@/lib/utils"
import type { University } from "@/types/tcas"
import { X, Hash } from "lucide-react"

interface FacultyOption {
  id:        string
  name:      string
  program:   string
  majorName?: string
  detail?:   string
}

interface CompareSlotPickerProps {
  index:               number
  universities:        University[]
  filterYear?:         number
  facultyId:           string | null
  /** Set by parent during hydration so the university combobox shows the right pick. */
  initialUniversityId?: string | null
  onChange:            (next: {
    facultyId:      string | null
    facultyMeta:    FacultyOption | null
    universityId:   string | null
    universityName: string
  }) => void
  onRemove?:           () => void
}

// ── Helpers (mirror analyze-form's display + search strategy) ────────────────

const universityDisplay = (u: University) => u.name
const universitySearch  = (u: University) => expandThaiSynonyms(u.name)
const universityRegion  = (u: University): ThaiRegion => getRegion(u.location)

function facultySecondary(f: FacultyOption) {
  return [f.program, f.majorName, f.detail]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(" · ")
}
const facultyDisplay = (f: FacultyOption) => {
  const sec = facultySecondary(f)
  return sec ? `${f.name} · ${sec}` : f.name
}
const facultySearch = (f: FacultyOption) => expandThaiSynonyms(facultyDisplay(f))

// ── Component ────────────────────────────────────────────────────────────────

export function CompareSlotPicker({
  index,
  universities,
  filterYear,
  facultyId,
  initialUniversityId,
  onChange,
  onRemove,
}: CompareSlotPickerProps) {
  const [universityId, setUniversityId] = useState("")
  const [faculties,    setFaculties]    = useState<FacultyOption[]>([])
  const [loading,      setLoading]      = useState(false)
  const [hydratedFromProp, setHydratedFromProp] = useState(false)

  // Hydrate from a parent-seeded universityId (URL share / CTA from /analyze).
  // We load the faculty list for that uni so the faculty combobox can resolve
  // facultyId → label without the user re-picking.
  useEffect(() => {
    if (hydratedFromProp) return
    if (!initialUniversityId) return
    setUniversityId(initialUniversityId)
    setHydratedFromProp(true)
    setLoading(true)
    fetchFacultiesAction(initialUniversityId, filterYear)
      .then(setFaculties)
      .finally(() => setLoading(false))
  }, [initialUniversityId, filterYear, hydratedFromProp])

  const universityName = universities.find((u) => u.id === universityId)?.name ?? ""

  async function handleUniversity(id: string) {
    setUniversityId(id)
    setFaculties([])
    onChange({
      facultyId:      null,
      facultyMeta:    null,
      universityId:   id || null,
      universityName: "",
    })
    if (!id) return
    setLoading(true)
    try {
      const data = await fetchFacultiesAction(id, filterYear)
      setFaculties(data)
    } finally {
      setLoading(false)
    }
  }

  function handleFaculty(id: string) {
    const meta = faculties.find((f) => f.id === id) ?? null
    onChange({
      facultyId:      id || null,
      facultyMeta:    meta,
      universityId:   universityId || null,
      universityName,
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      {/* Slot header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
            facultyId ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          )}>
            <Hash className="h-3 w-3" />
          </span>
          <span className="text-xs font-semibold text-gray-600">
            ช่องที่ {index + 1}
          </span>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="ลบช่องเปรียบเทียบนี้"
            className="rounded-md p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* University */}
      <Combobox
        items={universities}
        value={universityId}
        onChange={handleUniversity}
        placeholder="ค้นหามหาวิทยาลัย..."
        ariaLabel={`เลือกมหาวิทยาลัย ช่องที่ ${index + 1}`}
        emptyText="ไม่พบมหาวิทยาลัย"
        buildDisplayString={universityDisplay}
        buildSearchString={universitySearch}
        groupBy={universityRegion}
        groupOrder={REGION_ORDER}
        renderItem={(u) => (
          <div className="text-sm font-medium text-gray-900 group-data-[highlighted]:text-green-800">
            {u.name}
          </div>
        )}
      />

      {/* Faculty */}
      <Combobox
        items={faculties}
        value={facultyId ?? ""}
        onChange={handleFaculty}
        disabled={!universityId}
        loading={loading}
        placeholder={
          !universityId ? "เลือกมหาวิทยาลัยก่อน"
          : loading      ? "กำลังโหลด..."
                         : "ค้นหาคณะ / สาขา..."
        }
        ariaLabel={`เลือกคณะ ช่องที่ ${index + 1}`}
        emptyText="ไม่พบคณะ"
        buildDisplayString={facultyDisplay}
        buildSearchString={facultySearch}
        renderItem={(f) => {
          const sec = facultySecondary(f)
          return (
            <>
              <div className="text-sm font-medium leading-tight text-gray-900 group-data-[highlighted]:text-green-800">
                {f.name}
              </div>
              {sec && (
                <div className="mt-0.5 truncate text-xs leading-tight text-gray-500 group-data-[highlighted]:text-green-600">
                  {sec}
                </div>
              )}
            </>
          )
        }}
      />
    </div>
  )
}
