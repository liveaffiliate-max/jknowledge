import { Skeleton } from "@/components/ui/skeleton"

export default function MajorLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b border-border/50 bg-white/90" />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-5xl space-y-5 px-4 py-8">
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-7 w-80" />
            <Skeleton className="h-4 w-96" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-6 w-40 rounded-full" />
            </div>
          </div>

          <Skeleton className="h-[320px] w-full rounded-2xl" />
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </main>
    </div>
  )
}
