export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="h-7 w-40 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-gray-100 rounded-lg animate-pulse mt-2" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="h-5 w-5 bg-gray-100 rounded mx-auto animate-pulse" />
              <div className="h-8 w-10 bg-gray-100 rounded mx-auto mt-2 animate-pulse" />
              <div className="h-3 w-16 bg-gray-100 rounded mx-auto mt-2 animate-pulse" />
            </div>
          ))}
        </div>
        {/* List */}
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 p-4">
              <div className="h-10 w-1.5 bg-gray-100 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
