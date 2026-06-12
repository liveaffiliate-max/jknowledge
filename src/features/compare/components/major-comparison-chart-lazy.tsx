"use client"

/** Lazy wrapper — defers Recharts bundle until the comparison page is rendered. */
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

export const MajorComparisonChartLazy = dynamic(
  () => import("./major-comparison-chart").then((m) => ({ default: m.MajorComparisonChart })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[320px] w-full rounded-2xl" />,
  }
)
