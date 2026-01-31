import { Newspaper } from "lucide-react";
import NewsSkeleton from "@/components/shared/NewsSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-10 space-y-8 opacity-50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-6">
              <div className="h-10 w-64 bg-gray-800/50 rounded-lg animate-pulse" />
              <div className="flex gap-4">
                <div className="h-10 w-32 bg-gray-800/50 rounded-xl" />
                <div className="h-10 w-64 bg-gray-800/50 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="h-6 w-full max-w-md bg-gray-800/30 rounded-full" />
        </header>

        <NewsSkeleton />
      </div>
    </div>
  );
}
