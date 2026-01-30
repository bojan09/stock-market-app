import Link from "next/link";
import { getStockQuote } from "@/lib/actions/finnhub.actions";
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Building2,
  Clock,
} from "lucide-react";
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

  if (!quote || quote.current === 0) return null;

  const isPositive = (quote.percentChange ?? 0) >= 0;

  // Step 2 & 3 Logic: Range Progress
  const dayRange = quote.high - quote.low;
  const rangeProgress =
    dayRange > 0 ? ((quote.current - quote.low) / dayRange) * 100 : 0;

  // Step 4 Logic: Generate a simple Sparkline Path based on daily points
  // We map [Open, Low, High, Current] to coordinates
  const points = [quote.open, quote.low, quote.high, quote.current];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const normalize = (val: number) => 40 - ((val - min) / (max - min)) * 30; // Scale to SVG height

  const sparklinePath = `M 0 ${normalize(points[0])} L 20 ${normalize(points[1])} L 40 ${normalize(points[2])} L 60 ${normalize(points[3])}`;

  const lastUpdated = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="group flex items-center gap-3 w-full">
      <Link href={`/stocks/${symbol.toLowerCase()}`} className="flex-1">
        <div className="flex items-center justify-between p-5 bg-[#1A1D23] hover:bg-[#23272F] rounded-2xl border border-gray-800 transition-all duration-200 relative overflow-hidden">
          {/* BACKGROUND SPARKLINE (Step 4) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 60 40"
              preserveAspectRatio="none"
            >
              <path
                d={sparklinePath}
                fill="none"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Left: Symbol & Status */}
          <div className="flex items-center gap-4 min-w-[160px] z-10">
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
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white uppercase tracking-tight">
                  {symbol}
                </h3>
                <div
                  className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"
                  title="Live"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                <Clock size={10} />
                Updated {lastUpdated}
              </p>
            </div>
          </div>

          {/* Middle: Day Range Visualizer (Step 2/3) */}
          <div className="flex-1 max-w-[180px] px-6 hidden xl:block z-10">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1.5 font-mono uppercase">
              <span>L: ${quote.low?.toFixed(2)}</span>
              <span>H: ${quote.high?.toFixed(2)}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-900/50 rounded-full overflow-hidden relative border border-gray-800">
              <div
                className={cn(
                  "absolute h-full rounded-full transition-all duration-700 ease-in-out",
                  isPositive
                    ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                    : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
                )}
                style={{
                  width: `${Math.min(Math.max(rangeProgress, 2), 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Right: Pricing */}
          <div className="flex items-center gap-6 md:gap-10 z-10">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">
                High/Low
              </p>
              <p className="font-medium text-xs text-gray-300">
                ${quote.high?.toFixed(2)} / ${quote.low?.toFixed(2)}
              </p>
            </div>

            <div className="text-right min-w-[90px]">
              <p className="font-bold text-xl text-white tracking-tight">
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

      <div className="flex items-center justify-center">
        <RemoveFromWatchlistButton symbol={symbol} userEmail={userEmail} />
      </div>
    </div>
  );
}
