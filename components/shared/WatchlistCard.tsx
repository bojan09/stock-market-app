import Link from "next/link";
import { getStockQuote } from "@/lib/actions/finnhub.actions";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import RemoveFromWatchlistButton from "./RemoveFromWatchlistButton";

interface WatchlistCardProps {
  symbol: string;
  userEmail: string;
}

export default async function WatchlistCard({
  symbol,
  userEmail,
}: WatchlistCardProps) {
  const quote = await getStockQuote(symbol);

  // Safety check for API limits or missing data
  if (!quote || quote.current === 0) return null;

  const isPositive = (quote.percentChange ?? 0) >= 0;

  // STEP 2 LOGIC: Calculate where the current price sits in the daily high/low range
  // Range = High - Low. Progress = (Current - Low) / Range
  const dayRange = quote.high - quote.low;
  const rangeProgress =
    dayRange > 0 ? ((quote.current - quote.low) / dayRange) * 100 : 0;

  return (
    <div className="group flex items-center gap-3 w-full">
      {/* Main Stock Link */}
      <Link href={`/stocks/${symbol.toLowerCase()}`} className="flex-1">
        <div className="flex items-center justify-between p-5 bg-[#1A1D23] hover:bg-[#23272F] rounded-2xl border border-gray-800 transition-all duration-200">
          {/* Left Section: Symbol & Opening Price */}
          <div className="flex items-center gap-4 min-w-[140px]">
            <div
              className={cn(
                "p-3 rounded-xl",
                isPositive
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500",
              )}
            >
              {isPositive ? (
                <TrendingUp size={22} />
              ) : (
                <TrendingDown size={22} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-white uppercase tracking-tight">
                {symbol}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Open:{" "}
                <span className="text-gray-300">${quote.open?.toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* STEP 2 UI: Day Range Visualizer (Hidden on small mobile) */}
          <div className="flex-1 max-w-[200px] px-6 hidden lg:block">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1.5 font-mono uppercase tracking-tighter">
              <span>L: ${quote.low?.toFixed(2)}</span>
              <span>H: ${quote.high?.toFixed(2)}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden relative">
              <div
                className={cn(
                  "absolute h-full rounded-full transition-all duration-700 ease-in-out",
                  isPositive ? "bg-green-500" : "bg-red-500",
                )}
                style={{
                  width: `${Math.min(Math.max(rangeProgress, 2), 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Right Section: Price & Performance */}
          <div className="flex items-center gap-6 md:gap-10">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">
                Prev. Close
              </p>
              <p className="font-medium text-gray-300">
                ${quote.previousClose?.toFixed(2)}
              </p>
            </div>

            <div className="text-right min-w-[90px]">
              <p className="font-bold text-xl text-white">
                ${quote.current?.toFixed(2)}
              </p>
              <p
                className={cn(
                  "text-sm font-bold mt-0.5",
                  isPositive ? "text-green-500" : "text-red-500",
                )}
              >
                {isPositive ? "+" : ""}
                {quote.percentChange?.toFixed(2)}%
              </p>
            </div>

            <ChevronRight
              className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all"
              size={20}
            />
          </div>
        </div>
      </Link>

      {/* Remove Button (From Step 1) */}
      <div className="flex items-center justify-center">
        <RemoveFromWatchlistButton symbol={symbol} userEmail={userEmail} />
      </div>
    </div>
  );
}
