"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Star, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  searchStocks,
  getRandomMarketSuggestions,
} from "@/lib/actions/finnhub.actions";
import {
  toggleWatchlist,
  getWatchlistSymbolsByEmail,
} from "@/lib/actions/watchlist.actions";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type StockWithWatchlistStatus = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
  isInWatchlist: boolean;
};

interface SearchCommandProps {
  renderAs?: "button" | "text";
  label?: string;
  userEmail: string;
  className?: string;
}

export default function SearchCommand({
  renderAs = "button",
  label,
  userEmail,
  className,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>([]);

  /**
   * GET SUGGESTIONS (Server-side optimized)
   */
  const getSuggestions = useCallback(async () => {
    if (!userEmail) return;
    setLoading(true);
    try {
      const watchedSymbols = await getWatchlistSymbolsByEmail(userEmail);
      // Fetches only 10 items from the server
      const randomTen = await getRandomMarketSuggestions(watchedSymbols);
      setStocks(randomTen as StockWithWatchlistStatus[]);
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (open && !searchTerm) {
      getSuggestions();
    }
  }, [open, searchTerm, getSuggestions]);

  /**
   * SEARCH LOGIC
   */
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const [results, watchedSymbols] = await Promise.all([
        searchStocks(searchTerm.trim()),
        getWatchlistSymbolsByEmail(userEmail),
      ]);

      const uppercaseWatched = watchedSymbols.map((s: string) =>
        s.toUpperCase(),
      );

      const hydrated = results.map((s) => ({
        ...s,
        isInWatchlist: uppercaseWatched.includes(s.symbol.toUpperCase()),
      }));

      setStocks(hydrated);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, userEmail]);

  const debouncedSearch = useDebounce(handleSearch, 300);
  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, debouncedSearch]);

  /**
   * WATCHLIST TOGGLE
   */
  const handleWatchlistToggle = async (
    e: React.MouseEvent,
    stock: StockWithWatchlistStatus,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userEmail || isPending) return;

    const isAdding = !stock.isInWatchlist;
    setStocks((prev) =>
      prev.map((s) =>
        s.symbol === stock.symbol ? { ...s, isInWatchlist: isAdding } : s,
      ),
    );
    setIsPending(true);

    try {
      const result = await toggleWatchlist(userEmail, stock.symbol, stock.name);
      if (!result.success) throw new Error();

      toast.success(`${stock.symbol} ${isAdding ? "added" : "removed"}`);

      if (isAdding && !searchTerm) {
        setStocks((prev) => prev.filter((s) => s.symbol !== stock.symbol));
      }
    } catch (error) {
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
      <div
        onClick={() => setOpen(true)}
        className={cn("cursor-pointer", className)}
      >
        {renderAs === "text" ? (
          <span className="hover:text-white transition-colors">
            {label || "Search"}
          </span>
        ) : (
          <Button>{label || "Search Stocks"}</Button>
        )}
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b border-white/5 px-3 bg-[#121212]">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search live markets..."
            className="flex-1 bg-transparent border-none focus:ring-0"
          />
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          )}
        </div>

        <CommandList className="bg-[#121212] overflow-y-auto max-h-[400px]">
          {!searchTerm && (
            <div className="px-4 py-3 flex justify-between items-center border-b border-white/5 bg-white/5">
              <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400">
                Live Suggestions
              </p>
              <button
                onClick={getSuggestions}
                className="hover:rotate-180 transition-transform duration-500"
              >
                <RefreshCw className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          )}

          <div className="py-2">
            {stocks.map((stock, index) => (
              <Link
                key={`${stock.symbol}-${index}`}
                href={`/stocks/${stock.symbol}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-100 truncate">
                    {stock.name}
                  </div>
                  <div className="text-xs text-gray-500">{stock.symbol}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleWatchlistToggle(e, stock)}
                  className="p-2 z-30"
                >
                  <Star
                    className={cn(
                      "h-5 w-5 transition-all",
                      stock.isInWatchlist
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-500",
                    )}
                  />
                </button>
              </Link>
            ))}
          </div>
        </CommandList>
      </CommandDialog>
    </>
  );
}
