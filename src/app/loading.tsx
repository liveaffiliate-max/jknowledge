import { Skeleton } from "@/components/ui/skeleton"

export default function HomeLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header placeholder */}
      <div className="h-16 border-b border-border/50 bg-white/90" />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-green-50 to-white px-4 py-16 text-center">
          <Skeleton className="mx-auto h-10 w-64 mb-4" />
          <Skeleton className="mx-auto h-5 w-96 mb-2" />
          <Skeleton className="mx-auto h-5 w-80 mb-8" />
          <div className="flex justify-center gap-3">
            <Skeleton className="h-11 w-36 rounded-xl" />
            <Skeleton className="h-11 w-36 rounded-xl" />
          </div>
        </section>

        {/* Feature cards */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
