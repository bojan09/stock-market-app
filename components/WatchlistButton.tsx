"use client";
import React, { useMemo, useState, useEffect } from "react";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";
import { Plus, Check, Trash2, Loader2, Star } from "lucide-react";

interface WatchlistButtonProps {
  symbol: string;
  company: string;
  isInWatchlist: boolean;
  userId: string;
  showTrashIcon?: boolean;
  type?: "button" | "icon";
  onWatchlistChange?: (symbol: string, isAdded: boolean) => void;
}

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon = true, // Default to true for better UX
  type = "button",
  onWatchlistChange,
  userId,
}: WatchlistButtonProps) => {
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setAdded(!!isInWatchlist);
  }, [isInWatchlist]);

  const handleClick = async () => {
    if (!userId) {
      toast.error("Please sign in to manage your watchlist");
      return;
    }
    if (isPending) return;

    const nextState = !added;
    setAdded(nextState);
    setIsPending(true);

    try {
      const result = await toggleWatchlist(userId, symbol, company);
      if (result.success) {
        toast.success(
          nextState
            ? `${symbol} added to watchlist`
            : `${symbol} removed from watchlist`,
        );
        onWatchlistChange?.(symbol, nextState);
      } else {
        setAdded(!nextState);
        toast.error("Failed to update watchlist");
      }
    } catch (error) {
      setAdded(!nextState);
      toast.error("Something went wrong");
    } finally {
      setIsPending(false);
    }
  };

  // ICON TYPE UI
  if (type === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className={`p-2 rounded-full transition-all active:scale-90 ${
          added
            ? "text-yellow-400 bg-yellow-400/10"
            : "text-gray-500 hover:text-white bg-white/5 hover:bg-white/10"
        }`}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Star className={`w-5 h-5 ${added ? "fill-yellow-400" : ""}`} />
        )}
      </button>
    );
  }

  // BUTTON TYPE UI (Standard Best Practice)
  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`group relative flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 min-w-[140px] ${
        added
          ? "bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500 hover:text-white hover:border-red-500"
          : "bg-blue-600 text-white border border-blue-500 hover:bg-blue-700 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
      } ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : added ? (
        <>
          {/* Default state when followed */}
          <Check className="w-3.5 h-3.5 group-hover:hidden" />
          <span className="group-hover:hidden">Following</span>

          {/* Hover state (Prompt to remove) */}
          <Trash2 className="w-3.5 h-3.5 hidden group-hover:block animate-in zoom-in-75" />
          <span className="hidden group-hover:block animate-in slide-in-from-right-2">
            Remove {symbol}
          </span>
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5" />
          <span>Add to Watchlist</span>
        </>
      )}
    </button>
  );
};

export default WatchlistButton;
