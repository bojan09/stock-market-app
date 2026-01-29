"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import {
  toggleWatchlist,
  getWatchlistSymbolsByEmail,
} from "@/lib/actions/watchlist.actions";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Stock = { symbol: string; name: string; exchange: string; type: string };
type StockWithWatchlistStatus = Stock & { isInWatchlist: boolean };

interface SearchCommandProps {
  renderAs?: "button" | "text";
  label?: string;
  initialStocks: Stock[];
  userEmail: string;
}

export default function SearchCommand({
  renderAs = "button",
  label,
  initialStocks,
  userEmail,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Initialize with the prop, but we will hydrate it immediately
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(
    initialStocks.map((s) => ({ ...s, isInWatchlist: false })),
  );

  /**
   * FIX: HYDRATION EFFECT
   * When the component loads or email changes, check the actual watchlist status
   * for the initial stocks.
   */
  useEffect(() => {
    const hydrateInitialStocks = async () => {
      if (!userEmail) return;
      const watchedSymbols = await getWatchlistSymbolsByEmail(userEmail);
      setStocks(
        initialStocks.map((s) => ({
          ...s,
          isInWatchlist: watchedSymbols.includes(s.symbol.toUpperCase()),
        })),
      );
    };

    if (!searchTerm) {
      hydrateInitialStocks();
    }
  }, [initialStocks, userEmail, searchTerm]);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const [results, watchedSymbols] = await Promise.all([
        searchStocks(searchTerm.trim()),
        getWatchlistSymbolsByEmail(userEmail),
      ]);

      const hydrated = results.map((s: Stock) => ({
        ...s,
        isInWatchlist: watchedSymbols.includes(s.symbol.toUpperCase()),
      }));

      setStocks(hydrated);
    } catch (error) {
      console.error("Search error");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, userEmail]);

  const debouncedSearch = useDebounce(handleSearch, 300);
  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, debouncedSearch]);

  const handleWatchlistToggle = async (
    e: React.MouseEvent,
    stock: StockWithWatchlistStatus,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userEmail) {
      toast.error("Please sign in to manage your watchlist");
      return;
    }

    if (isPending) return;

    const targetSymbol = stock.symbol.toUpperCase();
    const isAdding = !stock.isInWatchlist;

    // 1. Optimistic UI update
    setStocks((prev) =>
      prev.map((s) =>
        s.symbol === stock.symbol ? { ...s, isInWatchlist: isAdding } : s,
      ),
    );

    setIsPending(true);

    try {
      const result = await toggleWatchlist(userEmail, targetSymbol, stock.name);

      if (result.success) {
        toast.success(
          `${targetSymbol} ${isAdding ? "added to" : "removed from"} watchlist`,
          {
            style: {
              color: isAdding ? "#22c55e" : "#ef4444",
              fontWeight: "600",
            },
          },
        );
      } else {
        throw new Error();
      }
    } catch (error) {
      // 2. Rollback
      setStocks((prev) =>
        prev.map((s) =>
          s.symbol === stock.symbol ? { ...s, isInWatchlist: !isAdding } : s,
        ),
      );
      toast.error("Update failed.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {renderAs === "text" ? (
          <span className="hover:text-yellow-500 transition-colors">
            {label || "Search"}
          </span>
        ) : (
          <Button>{label || "Search Stocks"}</Button>
        )}
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b border-gray-800 px-3 bg-[#121212]">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search symbols..."
            className="flex-1 bg-transparent border-none focus:ring-0"
          />
          {(loading || isPending) && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        <CommandList className="bg-[#121212] overflow-y-auto max-h-[400px]">
          {searchTerm && stocks.length === 0 && !loading && (
            <CommandEmpty className="py-6 text-center text-sm text-gray-400">
              No results.
            </CommandEmpty>
          )}

          <div className="py-2">
            {stocks.map((stock) => (
              <div key={stock.symbol}>
                <Link
                  href={`/stocks/${stock.symbol}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800 transition-colors"
                >
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-100">
                      {stock.name}
                    </div>
                    <div className="text-xs text-gray-500">{stock.symbol}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleWatchlistToggle(e, stock)}
                    disabled={isPending}
                    className="p-2 z-20 group relative"
                  >
                    <Star
                      className={cn(
                        "h-5 w-5 transition-all duration-300 transform",
                        stock.isInWatchlist
                          ? "fill-yellow-400 text-yellow-400 scale-125 rotate-[72deg]"
                          : "text-gray-500 group-hover:text-yellow-400 hover:scale-110",
                      )}
                    />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </CommandList>
      </CommandDialog>
    </>
  );
}
