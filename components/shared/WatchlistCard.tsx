import Link from "next/link";
import { getStockQuote } from "@/lib/actions/finnhub.actions";
import { TrendingUp, TrendingDown, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import RemoveFromWatchlistButton from "./RemoveFromWatchlistButton";

interface WatchlistCardProps {
  symbol: string;
  userId: string;
}

export default async function WatchlistCard({
  symbol,
  userId,
}: WatchlistCardProps) {
  const quote = await getStockQuote(symbol);

  // Fallback for missing data (e.g., ARCA:SPY error in Screenshot 4)
  if (!quote || quote.current === 0) return null;

  const isPositive = (quote.percentChange ?? 0) >= 0;

  // Range Progress Logic
  const dayRange = quote.high - quote.low;
  const rangeProgress =
    dayRange > 0 ? ((quote.current - quote.low) / dayRange) * 100 : 0;

  // Sparkline Path Generation
  const points = [quote.open, quote.low, quote.high, quote.current];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const normalize = (val: number) => 40 - ((val - min) / (max - min)) * 30;

  const sparklinePath = `M 0 ${normalize(points[0])} L 20 ${normalize(points[1])} L 40 ${normalize(points[2])} L 60 ${normalize(points[3])}`;

  const lastUpdated = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="group flex items-center gap-2 sm:gap-4 w-full">
      <Link href={`/stocks/${symbol.toLowerCase()}`} className="flex-1 min-w-0">
        <div className="flex items-center justify-between p-4 sm:p-5 bg-[#1A1D23] hover:bg-[#23272F] rounded-2xl border border-white/5 transition-all duration-200 relative overflow-hidden">
          {/* FIXED BACKGROUND TRENDLINE: Lowered opacity and ensured it stays behind content */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.07] pointer-events-none transition-opacity group-hover:opacity-[0.12]">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 60 40"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <path
                d={sparklinePath}
                fill="none"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Left Side: Symbol & Status (Elevated z-index) */}
          <div className="flex items-center gap-3 sm:gap-4 z-10 min-w-0">
            <div
              className={cn(
                "p-2.5 sm:p-3 rounded-xl shrink-0",
                isPositive
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500",
              )}
            >
              {isPositive ? (
                <TrendingUp size={20} />
              ) : (
                <TrendingDown size={20} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white uppercase truncate">
                  {symbol}
                </h3>
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
              </div>
              <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                <Clock size={10} />
                {lastUpdated}
              </p>
            </div>
          </div>

          {/* Middle: Day Range (Desktop Only) */}
          <div className="flex-1 max-w-[140px] px-4 hidden xl:block z-10">
            <div className="flex justify-between text-[9px] text-gray-500 mb-1.5 font-mono">
              <span>L: ${quote.low?.toFixed(2)}</span>
              <span>H: ${quote.high?.toFixed(2)}</span>
            </div>
            <div className="h-1 w-full bg-gray-900/50 rounded-full overflow-hidden relative border border-white/5">
              <div
                className={cn(
                  "absolute h-full rounded-full transition-all duration-700",
                  isPositive ? "bg-green-500" : "bg-red-500",
                )}
                style={{
                  width: `${Math.min(Math.max(rangeProgress, 5), 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Right Side: Pricing (Elevated z-index) */}
          <div className="flex items-center gap-3 sm:gap-6 z-10 ml-2 shrink-0">
            <div className="text-right">
              <p className="font-bold text-base sm:text-xl text-white tracking-tight">
                ${quote.current?.toFixed(2)}
              </p>
              <p
                className={cn(
                  "text-xs sm:text-sm font-bold mt-0.5",
                  isPositive ? "text-green-500" : "text-red-500",
                )}
              >
                {isPositive ? "+" : ""}
                {quote.percentChange?.toFixed(2)}%
              </p>
            </div>
            <ChevronRight
              className="text-gray-700 group-hover:text-white transition-all hidden sm:block"
              size={18}
            />
          </div>
        </div>
      </Link>

      {/* Action Area: Remove Button */}
      <div className="flex items-center justify-center shrink-0 z-20">
        <RemoveFromWatchlistButton symbol={symbol} userId={userId} />
      </div>
    </div>
  );
}
