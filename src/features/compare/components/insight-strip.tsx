// ── InsightStrip ─────────────────────────────────────────────────────────────
// Renders smart-insight cards in a horizontal strip on desktop, stacked on
// mobile. Server-component-safe — no client hooks here, the data comes from
// computeMajorInsights() at the page level.

import { cn } from "@/lib/utils"
import type { Insight, InsightTone } from "@/lib/insights"
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react"

interface Props {
  insights: Insight[]
}

const TONE_CONFIG: Record<InsightTone, {
  bg:     string
  border: string
  iconBg: string
  iconText: string
  titleText: string
  bodyText:  string
  icon:     LucideIcon
}> = {
  good: {
    bg:        "bg-green-50/60",
    border:    "border-green-100",
    iconBg:    "bg-green-100",
    iconText:  "text-green-700",
    titleText: "text-green-900",
    bodyText:  "text-green-700/80",
    icon:      TrendingDown,
  },
  celebrate: {
    bg:        "bg-green-50",
    border:    "border-green-200",
    iconBg:    "bg-green-600",
    iconText:  "text-white",
    titleText: "text-green-900",
    bodyText:  "text-green-700/80",
    icon:      Sparkles,
  },
  warn: {
    bg:        "bg-amber-50/70",
    border:    "border-amber-100",
    iconBg:    "bg-amber-100",
    iconText:  "text-amber-700",
    titleText: "text-amber-900",
    bodyText:  "text-amber-700/80",
    icon:      TrendingUp,
  },
  info: {
    bg:        "bg-blue-50/60",
    border:    "border-blue-100",
    iconBg:    "bg-blue-100",
    iconText:  "text-blue-700",
    titleText: "text-gray-900",
    bodyText:  "text-gray-600",
    icon:      Lightbulb,
  },
}

// Per-id icon overrides for insights where a more specific glyph reads better
const ICON_OVERRIDE: Record<string, LucideIcon> = {
  "trend-stable":     Lightbulb,
  "reach-low":        AlertTriangle,
}

export function InsightStrip({ insights }: Props) {
  if (insights.length === 0) return null

  return (
    <div className={cn(
      "grid gap-3",
      insights.length === 1 ? "sm:grid-cols-1" :
      insights.length === 2 ? "sm:grid-cols-2" :
                              "sm:grid-cols-3"
    )}>
      {insights.map((insight) => {
        const cfg  = TONE_CONFIG[insight.tone]
        const Icon = ICON_OVERRIDE[insight.id] ?? cfg.icon
        return (
          <div
            key={insight.id}
            className={cn(
              "flex items-start gap-3 rounded-2xl border px-4 py-3",
              cfg.bg, cfg.border,
            )}
          >
            <div className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl",
              cfg.iconBg, cfg.iconText,
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-semibold leading-snug", cfg.titleText)}>
                {insight.title}
              </p>
              {insight.body && (
                <p className={cn("mt-0.5 text-xs leading-snug", cfg.bodyText)}>
                  {insight.body}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
