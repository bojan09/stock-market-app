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

  if (!quote || quote.current === 0) return null;

  const isPositive = (quote.percentChange ?? 0) >= 0;

  return (
    <div className="group flex items-center gap-3 w-full">
      {/* Main Stock Link */}
      <Link href={`/stocks/${symbol.toLowerCase()}`} className="flex-1">
        <div className="flex items-center justify-between p-5 bg-[#1A1D23] hover:bg-[#23272F] rounded-2xl border border-gray-800 transition-all duration-200">
          <div className="flex items-center gap-4">
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
                <span className="text-gray-300">
                  ${quote.open?.toFixed(2) ?? "0.00"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-10">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">
                Prev. Close
              </p>
              <p className="font-medium text-gray-300">
                ${quote.previousClose?.toFixed(2) ?? "0.00"}
              </p>
            </div>

            <div className="text-right min-w-[90px]">
              <p className="font-bold text-xl text-white">
                ${quote.current?.toFixed(2) ?? "0.00"}
              </p>
              <p
                className={cn(
                  "text-sm font-bold mt-0.5",
                  isPositive ? "text-green-500" : "text-red-500",
                )}
              >
                {isPositive ? "+" : ""}
                {quote.percentChange?.toFixed(2) ?? "0.00"}%
              </p>
            </div>

            <ChevronRight
              className="text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all"
              size={20}
            />
          </div>
        </div>
      </Link>

      {/* Remove Button - Now clearly separated with space */}
      <div className="flex items-center justify-center pr-2">
        <RemoveFromWatchlistButton symbol={symbol} userEmail={userEmail} />
      </div>
    </div>
  );
}
