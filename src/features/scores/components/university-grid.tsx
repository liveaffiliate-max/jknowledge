"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { UniversityLogo } from "@/components/university-logo"
import type { UniversityWithStats } from "@/types/tcas"
import { Search, School, MapPin } from "lucide-react"

interface UniversityGridProps {
  universities: UniversityWithStats[]
}

export function UniversityGrid({ universities }: UniversityGridProps) {
  const [query, setQuery] = useState("")

  const filtered = query.trim()
    ? universities.filter(
        (u) =>
          u.name.includes(query) ||
          u.shortName.includes(query) ||
          u.location.includes(query)
      )
    : universities

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหามหาวิทยาลัย เช่น จุฬา, มหิดล, เชียงใหม่..."
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4",
            "text-sm text-gray-900 outline-none transition-all",
            "focus:border-green-400 focus:ring-2 focus:ring-green-100"
          )}
        />
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400">
        {query.trim()
          ? `พบ ${filtered.length} มหาวิทยาลัย`
          : `ทั้งหมด ${universities.length} มหาวิทยาลัย`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400 space-y-3">
          <School className="mx-auto h-10 w-10 text-gray-200" />
          <p className="text-sm font-medium text-gray-500">ไม่พบ &ldquo;{query}&rdquo;</p>
          <button
            onClick={() => setQuery("")}
            className="text-xs text-green-600 hover:underline"
          >
            ล้างการค้นหา
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <UniversityCard key={u.id} university={u} />
          ))}
        </div>
      )}
    </div>
  )
}

function UniversityCard({ university: u }: { university: UniversityWithStats }) {
  return (
    <Link
      href={`/scores/${u.slug}`}
      className="group block rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200"
    >
      {/* Color band */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: u.color }}
      />

      <div className="p-5">
        {/* Logo + name */}
        <div className="flex items-start gap-3">
          <UniversityLogo
            slug={u.slug}
            shortName={u.shortName}
            color={u.color}
            className="h-10 w-10"
            rounded="rounded-xl"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-green-700 transition-colors line-clamp-2">
              {u.name}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{u.shortName}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{u.location}</span>
          </div>
          <div className="flex items-center gap-2">
            {u.latestYear && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
                TCAS{u.latestYear - 2500}
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              {u.facultyCount} สาขา
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
