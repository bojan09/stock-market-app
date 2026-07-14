"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const MAX_COMPARE = 4;

export default function CompareSymbolPicker({
  availableSymbols,
  selected,
}: {
  availableSymbols: string[];
  selected: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggleSymbol = (symbol: string) => {
    let next: string[];
    if (selected.includes(symbol)) {
      next = selected.filter((s) => s !== symbol);
    } else {
      if (selected.length >= MAX_COMPARE) return;
      next = [...selected, symbol];
    }

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set("symbols", next.join(","));
    } else {
      params.delete("symbols");
    }
    router.replace(`/compare?${params.toString()}`, { scroll: false });
  };

  if (availableSymbols.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Add symbols to your watchlist to compare them here.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableSymbols.map((symbol) => {
        const isSelected = selected.includes(symbol);
        const isDisabled = !isSelected && selected.length >= MAX_COMPARE;

        return (
          <button
            key={symbol}
            type="button"
            disabled={isDisabled}
            onClick={() => toggleSymbol(symbol)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
              isSelected
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-gray-800 border-gray-600/50 text-gray-400 hover:border-indigo-500/40",
              isDisabled && "opacity-40 cursor-not-allowed",
            )}
          >
            ${symbol}
          </button>
        );
      })}
    </div>
  );
}
