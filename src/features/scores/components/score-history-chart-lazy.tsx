"use client"

/**
 * Lazy-loaded wrapper for ScoreHistoryChart.
 * Recharts ships ~100 kB JS — defer it until the component is needed
 * so it doesn't block the initial page render.
 */
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

export const ScoreHistoryChartLazy = dynamic(
  () => import("./score-history-chart").then((m) => ({ default: m.ScoreHistoryChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[240px] w-full rounded-xl" />,
  }
)
