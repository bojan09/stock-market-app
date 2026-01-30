"use client";

import { Trash2 } from "lucide-react";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { useState } from "react";
import { toast } from "sonner";

export default function RemoveFromWatchlistButton({
  symbol,
  userEmail,
}: {
  symbol: string;
  userEmail: string;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // Stop Link navigation
    e.stopPropagation(); // Stop event bubbling

    setIsPending(true);
    try {
      const res = await toggleWatchlist(userEmail, symbol, "");
      if (res.success) {
        toast.error(`${symbol} removed from watchlist`, {});
      }
    } catch (error) {
      toast.error("Failed to remove asset");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="group/btn p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/50 hover:bg-red-500 hover:text-white hover:border-red-500 hover:cursor-pointer transition-all duration-200 disabled:opacity-50 z-50"
      title="Remove from watchlist"
    >
      <Trash2
        size={18}
        className="transition-transform group-hover/btn:scale-110"
      />
    </button>
  );
}
