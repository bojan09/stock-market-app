"use client";

import { useState, useEffect } from "react";
import { Trash2, Loader2, X, Check } from "lucide-react";
import { deletePosition } from "@/lib/actions/portfolio.actions";
import { toast } from "sonner";

export default function DeletePositionButton({
  userId,
  positionId,
  symbol,
}: {
  userId: string;
  positionId: string;
  symbol: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (showConfirm) {
      const timer = setTimeout(() => setShowConfirm(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfirm]);

  const handleRemove = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setIsPending(true);
    try {
      const result = await deletePosition(userId, positionId);
      if (result.success) {
        toast.success(`Removed ${symbol} position`);
      } else {
        toast.error("Failed to remove position");
        setShowConfirm(false);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="relative flex items-center justify-end">
      <button
        onClick={handleRemove}
        disabled={isPending}
        aria-label={
          showConfirm ? `Confirm remove ${symbol} position` : `Remove ${symbol} position`
        }
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
          <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">
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
