"use client"

// ── Shared Combobox ──────────────────────────────────────────────────────────
// Generic searchable picker used by /analyze (university + faculty pickers)
// and /analyze/compare (per-slot pickers). Unifies mobile + desktop into one
// searchable interface — no native <select>, no iOS wheel picker.
//
// Owns its own input value and filtering. Pass `buildSearchString` for a wider
// query (e.g. Thai synonyms) and `buildDisplayString` for the text shown after
// selection. Optional `groupBy` buckets items under sticky GroupLabel headers.

import { useState, useMemo, useEffect } from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const selectClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 " +
  "outline-none transition-all duration-150 focus:border-green-400 focus:ring-2 focus:ring-green-100 " +
  "disabled:cursor-not-allowed disabled:opacity-50"

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

export interface ComboboxItem { id: string }

export interface ComboboxProps<T extends ComboboxItem> {
  items:             T[]
  value:             string
  onChange:          (id: string) => void
  disabled?:         boolean
  loading?:          boolean
  placeholder:       string
  ariaLabel:         string
  emptyText:         string
  /** Clean text shown in the input after selection (no synonyms, no separators). */
  buildDisplayString: (item: T) => string
  /** Wider text used only for the filter — may include synonyms / abbreviations. */
  buildSearchString:  (item: T) => string
  renderItem:         (item: T) => React.ReactNode
  /**
   * Optional grouping. If provided, items are bucketed by the returned key
   * and rendered under a sticky GroupLabel header. Pass `groupOrder` to
   * control section sequence (otherwise insertion order is used).
   */
  groupBy?:    (item: T) => string
  groupOrder?: readonly string[]
}

export function Combobox<T extends ComboboxItem>({
  items, value, onChange, disabled, loading, placeholder, ariaLabel,
  emptyText, buildDisplayString, buildSearchString, renderItem, groupBy, groupOrder,
}: ComboboxProps<T>) {
  const selectedItem = useMemo(
    () => items.find((i) => i.id === value) ?? null,
    [items, value]
  )

  const [inputValue, setInputValue] = useState(() =>
    selectedItem ? buildDisplayString(selectedItem) : ""
  )

  // Sync input when external value changes (e.g. parent restored from storage).
  useEffect(() => {
    setInputValue(selectedItem ? buildDisplayString(selectedItem) : "")
  }, [selectedItem, buildDisplayString])

  // When input still equals the selected display string, treat query as empty
  // so the full list is browsable instead of filtered to one match.
  const query =
    selectedItem && inputValue === buildDisplayString(selectedItem)
      ? ""
      : inputValue

  // Pre-compute search strings once — avoids running synonym regex per keystroke.
  const searchIndex = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of items) {
      map.set(item.id, buildSearchString(item).toLowerCase())
    }
    return map
  }, [items, buildSearchString])

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase().trim()
    return items.filter((item) => searchIndex.get(item.id)?.includes(q))
  }, [items, query, searchIndex])

  // Bucket the filtered subset (not raw items) so empty groups disappear.
  const grouped = useMemo(() => {
    if (!groupBy) return null
    const buckets = new Map<string, T[]>()
    for (const item of filteredItems) {
      const key = groupBy(item)
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key)!.push(item)
    }
    const ordered: { key: string; items: T[] }[] = []
    if (groupOrder) {
      for (const key of groupOrder) {
        const bucket = buckets.get(key)
        if (bucket && bucket.length > 0) ordered.push({ key, items: bucket })
      }
      for (const [key, bucket] of buckets) {
        if (!groupOrder.includes(key)) ordered.push({ key, items: bucket })
      }
    } else {
      for (const [key, bucket] of buckets) ordered.push({ key, items: bucket })
    }
    return ordered
  }, [filteredItems, groupBy, groupOrder])

  const isUnavailable = !!(disabled || loading)
  const hasResults = filteredItems.length > 0

  return (
    <ComboboxPrimitive.Root<T>
      items={items}
      value={selectedItem}
      onValueChange={(item) => onChange(item?.id ?? "")}
      inputValue={inputValue}
      onInputValueChange={(v) => setInputValue(v)}
      itemToStringLabel={(item) => (item ? buildDisplayString(item) : "")}
      filter={() => true}
      disabled={isUnavailable}
    >
      <div className="relative w-full min-w-0">
        <ComboboxPrimitive.Input
          aria-label={ariaLabel}
          placeholder={placeholder}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            selectClass,
            isUnavailable && "opacity-50 cursor-not-allowed",
            (loading || selectedItem) && "pr-9"
          )}
        />
        {loading ? (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner />
          </div>
        ) : selectedItem ? (
          <ComboboxPrimitive.Clear
            aria-label="ล้างค่า"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-100"
          >
            <X className="h-4 w-4" />
          </ComboboxPrimitive.Clear>
        ) : null}
      </div>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={4} className="z-50 w-(--anchor-width)">
          <ComboboxPrimitive.Popup className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
            <ComboboxPrimitive.List>
              {grouped
                ? grouped.map(({ key, items: groupItems }) => (
                    <ComboboxPrimitive.Group key={key}>
                      <ComboboxPrimitive.GroupLabel className="sticky top-0 flex items-center justify-between bg-gray-50/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500 backdrop-blur-sm">
                        <span>{key}</span>
                        <span className="tabular-nums text-gray-400 normal-case tracking-normal">
                          {groupItems.length}
                        </span>
                      </ComboboxPrimitive.GroupLabel>
                      {groupItems.map((item) => (
                        <ComboboxPrimitive.Item
                          key={item.id}
                          value={item}
                          className="group cursor-pointer px-3 py-2.5 outline-none data-[highlighted]:bg-green-50"
                        >
                          {renderItem(item)}
                        </ComboboxPrimitive.Item>
                      ))}
                    </ComboboxPrimitive.Group>
                  ))
                : filteredItems.map((item) => (
                    <ComboboxPrimitive.Item
                      key={item.id}
                      value={item}
                      className="group cursor-pointer px-3 py-2.5 outline-none data-[highlighted]:bg-green-50"
                    >
                      {renderItem(item)}
                    </ComboboxPrimitive.Item>
                  ))}
            </ComboboxPrimitive.List>
            {!hasResults && (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                {emptyText}
              </div>
            )}
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}
