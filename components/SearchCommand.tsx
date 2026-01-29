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
import { toast } from "sonner"; // Ensure 'sonner' is installed in your project

// Define the types
type Stock = {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
};

type StockWithWatchlistStatus = Stock & {
  isInWatchlist: boolean;
};

interface SearchCommandProps {
  renderAs?: "button" | "text";
  label?: string;
  initialStocks: StockWithWatchlistStatus[];
  userEmail: string;
}

export default function SearchCommand({
  renderAs = "button",
  label = "Add stock",
  initialStocks,
  userEmail,
}: SearchCommandProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] =
    useState<StockWithWatchlistStatus[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Main search logic with database cross-referencing (hydration)
  const handleSearch = useCallback(async () => {
    if (!isSearchMode) {
      setStocks(initialStocks);
      return;
    }

    setLoading(true);
    try {
      // 1. Get raw search results from Finnhub
      const results = await searchStocks(searchTerm.trim());

      // 2. Fetch the user's latest watchlist from your DB
      const watchedSymbols = await getWatchlistSymbolsByEmail(userEmail);

      // 3. Map results to include current watchlist status so stars stay filled
      const hydratedResults = results.map((s: Stock) => ({
        ...s,
        isInWatchlist: watchedSymbols.includes(s.symbol.toUpperCase()),
      }));

      setStocks(hydratedResults);
    } catch (error) {
      console.error("Search error:", error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [isSearchMode, searchTerm, initialStocks, userEmail]);

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, debouncedSearch]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

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

    const targetSymbol = stock.symbol.toUpperCase();
    const isAdding = !stock.isInWatchlist;

    // Optimistic UI Update
    setStocks((prev) =>
      prev.map((s) =>
        s.symbol === stock.symbol ? { ...s, isInWatchlist: isAdding } : s,
      ),
    );

    try {
      // Pass email, symbol, and stock name (required by your Mongoose schema)
      const result = await toggleWatchlist(userEmail, targetSymbol, stock.name);

      if (result.success) {
        // Toast notification for both adding and removing
        toast.success(
          isAdding
            ? `${targetSymbol} added to watchlist`
            : `${targetSymbol} removed from watchlist`,
        );
      } else {
        // Revert UI on server failure
        throw new Error("Server failed");
      }
    } catch (error) {
      setStocks((prev) =>
        prev.map((s) =>
          s.symbol === stock.symbol ? { ...s, isInWatchlist: !isAdding } : s,
        ),
      );
      toast.error("Failed to update watchlist");
      console.error("Watchlist error:", error);
    }
  };

  return (
    <>
      {renderAs === "text" ? (
        <span
          onClick={() => setOpen(true)}
          className="search-text cursor-pointer"
        >
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="search-btn">
          {label}
        </Button>
      )}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="search-dialog"
      >
        <div className="search-field flex items-center border-b px-3">
          <CommandInput
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search stocks..."
            className="search-input flex-1"
          />
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
        <CommandList className="search-list">
          {loading && !displayStocks.length ? (
            <CommandEmpty className="search-list-empty py-6 text-center text-sm">
              Searching...
            </CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="search-list-indicator py-6 text-center text-sm text-muted-foreground">
              {isSearchMode ? "No results found" : "No stocks available"}
            </div>
          ) : (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isSearchMode ? "Search results" : "Popular stocks"}
                {` `}({displayStocks?.length || 0})
              </div>
              <ul>
                {displayStocks?.map((stock) => (
                  <li key={stock.symbol} className="relative group">
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      onClick={handleSelectStock}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{stock.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {stock.symbol} | {stock.exchange} | {stock.type}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleWatchlistToggle(e, stock)}
                        className="p-2 hover:bg-background rounded-full transition-all z-10"
                      >
                        <Star
                          className={cn(
                            "h-5 w-5 transition-colors",
                            stock.isInWatchlist
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground hover:text-yellow-400",
                          )}
                        />
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
