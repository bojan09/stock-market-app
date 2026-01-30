"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";

interface RemoveButtonProps {
  symbol: string;
  userId: string; // Updated from userEmail
}

export default function RemoveFromWatchlistButton({
  symbol,
  userId,
}: RemoveButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    setIsPending(true);
    try {
      const result = await toggleWatchlist(userId, symbol, "");
      if (result.success) {
        toast.success(`Removed ${symbol} from watchlist`);
      }
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:opacity-50 shadow-lg border border-red-500/20"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
