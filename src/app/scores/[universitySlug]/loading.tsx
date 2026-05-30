import { Skeleton } from "@/components/ui/skeleton"

export default function UniversityLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-border/50 bg-white/90" />

      <main className="flex-1 bg-gray-50">
        {/* University header */}
        <div className="bg-white border-b border-gray-100 px-4 py-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl flex-shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        {/* Faculty list */}
        <div className="mx-auto max-w-5xl px-4 pb-10 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg ml-4" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
