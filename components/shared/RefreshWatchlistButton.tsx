"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function RefreshWatchlistButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRotating, setIsRotating] = useState(false);

  const handleRefresh = () => {
    setIsRotating(true);

    startTransition(() => {
      // router.refresh() tells Next.js to fetch the data for the current route
      // from the server again without losing client-side state.
      router.refresh();

      // Delay stopping the animation slightly for better UX feel
      setTimeout(() => {
        setIsRotating(false);
        toast.info("Watchlist updated", {
          description: "Fetching latest market data...",
        });
      }, 500);
    });
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1D23] border border-gray-800 text-sm font-medium text-gray-300 hover:text-white hover:bg-[#23272F] transition-all disabled:opacity-50"
    >
      <RefreshCw
        size={16}
        className={cn(
          "transition-transform duration-700",
          isRotating && "animate-spin",
        )}
      />
      {isPending ? "Updating..." : "Refresh Prices"}
    </button>
  );
}
