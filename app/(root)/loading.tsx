"use client";

import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Loading() {
  const pathname = usePathname();

  const getLoadingMessage = () => {
    if (pathname.includes("/profile")) return "Securing your profile...";
    if (pathname.includes("/stocks/")) return "Analyzing stock performance...";
    if (pathname.includes("/watchlist")) return "Updating your favorites...";
    if (pathname.includes("/dashboard"))
      return "Aggregating market insights...";
    return "Fetching latest data...";
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full border-2 border-indigo-500/20" />
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
      <p className="mt-4 text-sm font-medium tracking-widest text-gray-400 uppercase animate-pulse">
        {getLoadingMessage()}
      </p>
    </div>
  );
}
