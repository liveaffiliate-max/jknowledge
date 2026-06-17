import { Skeleton } from "@/components/ui/skeleton"

export default function MajorIndexLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-border/50 bg-white/90" />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-5xl space-y-5 px-4 py-8">
          <div className="space-y-2">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <Skeleton className="h-5 w-48 mb-3" />
            <div className="grid gap-2 sm:grid-cols-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
