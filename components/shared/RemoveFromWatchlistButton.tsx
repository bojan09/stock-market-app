"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";

interface RemoveButtonProps {
  symbol: string;
  userId: string; // Corrected prop to match Screenshot 9
}

export default function RemoveFromWatchlistButton({
  symbol,
  userId,
}: RemoveButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      toast.error("User session not found");
      return;
    }

    setIsPending(true);
    try {
      // Toggle using userId
      const result = await toggleWatchlist(userId, symbol, "");
      if (result.success) {
        toast.success(`Removed ${symbol} from watchlist`);
      } else {
        toast.error("Failed to remove item");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
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
