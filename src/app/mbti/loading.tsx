import { Skeleton } from "@/components/ui/skeleton"

export default function MBTILoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-border/50 bg-white/90" />

      <main className="flex-1 bg-gray-50">
        {/* Hero */}
        <div className="bg-white border-b border-gray-100 px-4 py-10 text-center">
          <div className="mx-auto max-w-xl space-y-3">
            <Skeleton className="mx-auto h-8 w-56" />
            <Skeleton className="mx-auto h-4 w-80" />
            <Skeleton className="mx-auto h-11 w-36 rounded-xl mt-4" />
          </div>
        </div>

        {/* MBTI type grid */}
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="h-5 w-32 mb-5" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
                <Skeleton className="mx-auto h-10 w-10 rounded-full" />
                <Skeleton className="mx-auto h-5 w-14" />
                <Skeleton className="mx-auto h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
