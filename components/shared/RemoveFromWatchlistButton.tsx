"use client";

import { useState, useEffect } from "react";
import { Trash2, Loader2, X, Check } from "lucide-react";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";

interface RemoveButtonProps {
  symbol: string;
  userId: string;
}

export default function RemoveFromWatchlistButton({
  symbol,
  userId,
}: RemoveButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Auto-reset confirmation state if user doesn't click within 3 seconds
  useEffect(() => {
    if (showConfirm) {
      const timer = setTimeout(() => setShowConfirm(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfirm]);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    if (!userId) {
      toast.error("User session not found");
      return;
    }

    setIsPending(true);
    try {
      const result = await toggleWatchlist(userId, symbol, "");
      if (result.success) {
        toast.success(`Removed ${symbol} from watchlist`);
      } else {
        toast.error("Failed to remove item");
        setShowConfirm(false);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
      setShowConfirm(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative flex items-center justify-end">
      <button
        onClick={handleRemove}
        disabled={isPending}
        aria-label={showConfirm ? `Confirm remove ${symbol}` : `Remove ${symbol} from watchlist`}
        className={`flex items-center gap-2 px-3 h-8 rounded-lg transition-all duration-200 overflow-hidden ${
          showConfirm
            ? "bg-rose-500 text-white w-auto shadow-lg shadow-rose-500/20"
            : "bg-white/5 text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 w-10"
        } disabled:opacity-50`}
      >
        <div className="flex items-center justify-center shrink-0">
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : showConfirm ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </div>

        {showConfirm && !isPending && (
          <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap animate-in fade-in slide-in-from-right-1">
            Confirm?
          </span>
        )}
      </button>

      {showConfirm && !isPending && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowConfirm(false);
          }}
          aria-label="Cancel remove"
          className="ml-1 p-1 text-gray-500 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
