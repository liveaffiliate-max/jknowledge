import { Skeleton } from "@/components/ui/skeleton"

export default function CompareLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-border/50 bg-white/90" />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>

          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  )
}
