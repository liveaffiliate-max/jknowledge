"use client"

/**
 * Lazy-loaded wrapper for CompareTrendChart.
 * Defers the Recharts bundle until the results section is rendered.
 */
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

export const CompareTrendChartLazy = dynamic(
  () => import("./compare-trend-chart").then((m) => ({ default: m.CompareTrendChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[340px] w-full rounded-2xl" />,
  }
)
