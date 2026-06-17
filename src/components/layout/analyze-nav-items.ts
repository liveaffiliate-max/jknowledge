// ── Shared definition for the "วิเคราะห์" feature group ─────────────────────
// Three consumers reuse this list so they always show the same items in the
// same order:
//   1. Header desktop dropdown (NavDropdown)
//   2. MobileMenu drawer accordion
//   3. AnalyzeSubNav sticky tabs inside /analyze* pages
//
// Edit here and all three update at once.

import type { LucideIcon } from "lucide-react"
import { BarChart2, GitCompareArrows, Building2 } from "lucide-react"

export interface AnalyzeNavItem {
  href:        string
  label:       string
  description: string         // shown in dropdown rows for context
  icon:        LucideIcon
  /** Match only when pathname equals href exactly (used by "วิเคราะห์เดี่ยว" so it
   *  doesn't stay active when the user is on /analyze/compare). */
  exact?:      boolean
}

export const ANALYZE_NAV_ITEMS: AnalyzeNavItem[] = [
  {
    href:        "/analyze",
    label:       "วิเคราะห์คะแนน",
    description: "กรอกคะแนน + เลือกคณะ ดูโอกาสรับเทียบกับข้อมูลย้อนหลัง",
    icon:        BarChart2,
    exact:       true,
  },
  {
    href:        "/analyze/compare",
    label:       "เปรียบเทียบหลายคณะ",
    description: "เลือก 2-4 คณะ เห็นโอกาสรับเทียบกันในตารางเดียว",
    icon:        GitCompareArrows,
  },
  {
    href:        "/analyze/major",
    label:       "คณะเดียวกัน หลายมหาลัย",
    description: "ดูทุกมหาลัยที่เปิดสอนคณะที่สนใจ เรียงจากเข้าง่ายสุด",
    icon:        Building2,
  },
]

/** Sub-tabs — same as dropdown items now that all three have distinct URLs. */
export const ANALYZE_SUB_TABS: AnalyzeNavItem[] = ANALYZE_NAV_ITEMS

/** Active when href matches exactly (exact=true) or pathname is nested under href. */
export function isAnalyzeItemActive(pathname: string, item: AnalyzeNavItem): boolean {
  if (item.exact) return pathname === item.href
  return pathname.startsWith(item.href)
}

/** True when any sub-feature is active — drives the "วิเคราะห์ ▾" trigger highlight. */
export function isAnalyzeGroupActive(pathname: string): boolean {
  return pathname.startsWith("/analyze")
}
