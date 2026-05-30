"use client"

/**
 * Lazy-loaded wrapper for ScoreTrendChart.
 * Defers the Recharts bundle until the result card is visible.
 */
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

export const ScoreTrendChartLazy = dynamic(
  () => import("./score-trend-chart").then((m) => ({ default: m.ScoreTrendChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[220px] w-full rounded-xl" />,
  }
)
