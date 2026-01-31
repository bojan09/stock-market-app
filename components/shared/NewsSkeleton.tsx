export default function NewsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-[#16191F] border border-white/5 rounded-2xl overflow-hidden h-[400px]"
        >
          {/* Image Placeholder */}
          <div className="h-44 w-full bg-gray-800/50" />

          <div className="p-5 flex flex-col flex-1 space-y-4">
            {/* Source/Date Placeholder */}
            <div className="flex gap-2">
              <div className="h-3 w-12 bg-gray-800/50 rounded" />
              <div className="h-3 w-16 bg-gray-800/50 rounded" />
            </div>

            {/* Title Placeholder */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-800/50 rounded" />
              <div className="h-4 w-2/3 bg-gray-800/50 rounded" />
            </div>

            {/* Summary Placeholder */}
            <div className="space-y-2 flex-1">
              <div className="h-3 w-full bg-gray-800/30 rounded" />
              <div className="h-3 w-full bg-gray-800/30 rounded" />
              <div className="h-3 w-1/2 bg-gray-800/30 rounded" />
            </div>

            {/* Footer Placeholder */}
            <div className="pt-4 border-t border-white/5 flex justify-between">
              <div className="h-3 w-20 bg-gray-800/50 rounded" />
              <div className="h-3 w-3 bg-gray-800/50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
