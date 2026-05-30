import { Skeleton } from "@/components/ui/skeleton"

export default function FacultyScoreLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-border/50 bg-white/90" />

      <main className="flex-1 bg-gray-50">
        {/* Faculty header */}
        <div className="bg-white border-b border-gray-100 px-4 py-6">
          <div className="mx-auto max-w-4xl space-y-3">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-7 w-72" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-6 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-52 w-full rounded-xl" />
          </div>

          {/* Table placeholder */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
