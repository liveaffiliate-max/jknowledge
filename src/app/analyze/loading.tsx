import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyzeLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-border/50 bg-white/90" />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-8 space-y-5">
          {/* Page title */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
            <Skeleton className="h-5 w-36" />
            {/* Score inputs */}
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>

            {/* University / faculty selectors */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  )
}
