"use client";
import React, { useMemo, useState, useEffect } from "react";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";

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
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
  userId, // Updated variable name
}: WatchlistButtonProps) => {
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setAdded(!!isInWatchlist);
  }, [isInWatchlist]);

  const label = useMemo(() => {
    if (type === "icon") return "";
    return added ? "Remove from Watchlist" : "Add to Watchlist";
  }, [added, type]);

  const handleClick = async () => {
    // Check for userId instead of email
    if (!userId) {
      toast.error("Please sign in to manage your watchlist");
      return;
    }

    if (isPending) return;

    const nextState = !added;
    setAdded(nextState);
    setIsPending(true);

    try {
      // Passing userId to the action
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
      toast.error("Something went wrong. Please try again.");
      console.error("Watchlist error:", error);
    } finally {
      setIsPending(false);
    }
  };

  if (type === "icon") {
    return (
      <button
        title={added ? `Remove ${symbol}` : `Add ${symbol}`}
        aria-label={added ? `Remove ${symbol}` : `Add ${symbol}`}
        className={`watchlist-icon-btn ${added ? "watchlist-icon-added" : ""} ${isPending ? "opacity-50" : ""}`}
        onClick={handleClick}
        disabled={isPending}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={added ? "#FACC15" : "none"}
          stroke="#FACC15"
          strokeWidth="1.5"
          className={`w-6 h-6 ${isPending ? "animate-pulse" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      className={`watchlist-btn flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all ${
        added
          ? "bg-red-500/10 text-red-500 border border-red-500/20"
          : "bg-blue-600 text-white"
      } ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
      onClick={handleClick}
      disabled={isPending}
    >
      {showTrashIcon && added && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      )}
      <span>{isPending ? "Updating..." : label}</span>
    </button>
  );
};

export default WatchlistButton;
