"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { UniversityLogo } from "@/components/university-logo"
import type { UniversityWithStats } from "@/types/tcas"
import { Search, School, MapPin, ArrowUpRight } from "lucide-react"

// Cap stagger so a long grid (88 unis) stays under ~400ms total.
// First 9 cards (≈ above the fold on desktop) get staggered entry; the rest
// fade in together once the visible group has finished.
const STAGGER_CAP = 9

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
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหา มหาวิทยาลัย เช่น จุฬา, มหิดล, เชียงใหม่..."
          className={cn(
            "w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4",
            "text-sm text-gray-900 placeholder:text-gray-500 outline-none",
            "transition-[border-color,box-shadow] duration-200 ease-out",
            "focus:border-green-400 focus:ring-2 focus:ring-green-100",
            "peer"
          )}
        />
      </div>

      {/* Count */}
      <p className="text-xs font-medium text-gray-500 tabular-nums">
        {query.trim()
          ? `พบ ${filtered.length} มหาวิทยาลัย`
          : `ทั้งหมด ${universities.length} มหาวิทยาลัย`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 motion-safe:animate-step-reveal">
          <School className="mx-auto h-10 w-10 text-gray-200 motion-safe:animate-idle-breathe" />
          <p className="text-base font-bold text-gray-700">ไม่พบ &ldquo;{query}&rdquo;</p>
          <button
            onClick={() => setQuery("")}
            className="text-xs font-bold text-green-700 hover:underline underline-offset-2"
          >
            ล้างการค้นหา
          </button>
        </div>
      ) : (
        <div
          // `key` resets the entrance animation when the filter result set
          // swaps — fresh stagger gives users a clear "the list just updated"
          // signal instead of a silent React reconciliation.
          key={query.trim() || "all"}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((u, i) => (
            <UniversityCard
              key={u.id}
              university={u}
              index={Math.min(i, STAGGER_CAP)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface UniversityCardProps {
  university: UniversityWithStats
  index:      number
}

function UniversityCard({ university: u, index }: UniversityCardProps) {
  return (
    <Link
      href={`/scores/${u.slug}`}
      style={{ "--i": index } as React.CSSProperties}
      className={cn(
        "group relative block rounded-2xl border border-gray-200 bg-white overflow-hidden",
        // Specific transitions instead of `transition-all` — keeps hover
        // crisp and avoids animating layout-driving properties.
        "transition-[transform,box-shadow,border-color] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300",
        "active:translate-y-0 active:duration-75",
        "motion-safe:animate-card-enter"
      )}
    >
      {/* Color band — grows wider on hover to read as "active" without changing layout */}
      <div className="relative h-2 w-full overflow-hidden">
        <div
          className="absolute inset-0 origin-left transition-transform duration-300 ease-out group-hover:scale-y-150"
          style={{ backgroundColor: u.color }}
        />
      </div>

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
          <div className="min-w-0 flex-1">
            <p
              className="font-bold text-gray-900 text-[15px] leading-[1.3] tracking-tight group-hover:text-green-700 transition-colors duration-200 line-clamp-2"
              style={{ letterSpacing: "-0.005em" } as React.CSSProperties}
            >
              {u.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">{u.shortName}</p>
          </div>

          {/* Hover-only "go" affordance — slides in from below the logo column. */}
          <ArrowUpRight
            className={cn(
              "h-4 w-4 flex-shrink-0 text-green-600",
              "opacity-0 -translate-x-1 transition-[opacity,transform] duration-200 ease-out",
              "group-hover:opacity-100 group-hover:translate-x-0"
            )}
            aria-hidden
          />
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{u.location}</span>
          </div>
          <div className="flex items-center gap-2">
            {u.latestYear && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold tabular-nums text-green-700">
                TCAS{u.latestYear - 2500}
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 tabular-nums">
              {u.facultyCount} สาขา
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
