"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import AlertModal from "@/components/AlertModal";

interface WatchlistAlertButtonProps {
  symbol: string;
  company: string;
  userId: string;
  currentPrice?: number;
}

export default function WatchlistAlertButton({
  symbol,
  company,
  userId,
  currentPrice,
}: WatchlistAlertButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="flex items-center justify-center h-8 w-10 rounded-lg bg-white/5 text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all duration-200"
        aria-label={`Set price alert for ${symbol}`}
      >
        <Bell className="h-3.5 w-3.5" />
      </button>

      <AlertModal
        open={open}
        setOpen={setOpen}
        symbol={symbol}
        company={company}
        userId={userId}
        currentPrice={currentPrice}
      />
    </>
  );
}
