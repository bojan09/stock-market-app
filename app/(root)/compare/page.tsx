export const dynamic = "force-dynamic";

import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlistSymbolsById } from "@/lib/actions/watchlist.actions";
import { getStockQuote } from "@/lib/actions/finnhub.actions";
import { getTradingViewSymbol, cn } from "@/lib/utils";
import { SYMBOL_COMPARISON_WIDGET_CONFIG } from "@/lib/constants";
import TradingViewWidget from "@/components/TradingViewWidget";
import CompareSymbolPicker from "@/components/shared/CompareSymbolPicker";
import Link from "next/link";
import { TrendingUp, TrendingDown, GitCompare } from "lucide-react";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ symbols?: string }>;
}) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const watchedSymbols = await getWatchlistSymbolsById(session.user.id);
  const { symbols: symbolsParam } = await searchParams;

  const requested = symbolsParam
    ? symbolsParam.split(",").filter(Boolean)
    : watchedSymbols.slice(0, 3);

  // Only compare symbols the user actually watches
  const selected = requested.filter((s) => watchedSymbols.includes(s)).slice(0, 4);

  const quotes = await Promise.all(
    selected.map(async (symbol) => ({
      symbol,
      quote: await getStockQuote(symbol),
    })),
  );

  const comparisonConfig = SYMBOL_COMPARISON_WIDGET_CONFIG(
    selected.map((s) => ({ s: getTradingViewSymbol(s), d: s })),
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 sm:px-6 pt-6 pb-32">
      <header className="mb-8 max-w-5xl mx-auto space-y-1">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Compare
        </h1>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
          Side-by-side, up to 4 watchlist symbols
        </p>
      </header>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-gray-800 border border-gray-600/50 rounded-2xl p-5">
          <CompareSymbolPicker
            availableSymbols={watchedSymbols}
            selected={selected}
          />
        </div>

        {selected.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-800 rounded-[2rem] border border-gray-600/50 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <GitCompare className="text-gray-600" size={28} />
            </div>
            <p className="text-gray-400 font-medium">
              Pick at least one symbol above to compare
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold px-1">
                Price Comparison
              </h2>
              <TradingViewWidget
                scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
                config={comparisonConfig}
                height={450}
                className="rounded-2xl border border-white/5 shadow-2xl overflow-hidden"
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold px-1">
                Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quotes.map(({ symbol, quote }) => {
                  if (!quote || !quote.current) {
                    return (
                      <div
                        key={symbol}
                        className="bg-gray-800 border border-gray-600/50 rounded-2xl p-5 text-center text-gray-500 text-sm"
                      >
                        No data for {symbol}
                      </div>
                    );
                  }

                  const isPositive = (quote.percentChange ?? 0) >= 0;

                  return (
                    <Link
                      key={symbol}
                      href={`/stocks/${symbol.toLowerCase()}`}
                      className="bg-gray-800 hover:bg-gray-700 border border-gray-600/50 rounded-2xl p-5 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg text-white uppercase">
                          {symbol}
                        </h3>
                        {isPositive ? (
                          <TrendingUp size={16} className="text-emerald-500" />
                        ) : (
                          <TrendingDown size={16} className="text-rose-500" />
                        )}
                      </div>
                      <p className="text-2xl font-black text-white mb-1">
                        ${quote.current.toFixed(2)}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-bold mb-4",
                          isPositive ? "text-emerald-500" : "text-rose-500",
                        )}
                      >
                        {isPositive ? "+" : ""}
                        {quote.percentChange?.toFixed(2)}%
                      </p>
                      <div className="space-y-1.5 text-[11px] text-gray-500 font-mono">
                        <div className="flex justify-between">
                          <span>Open</span>
                          <span className="text-gray-300">
                            ${quote.open?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>High</span>
                          <span className="text-gray-300">
                            ${quote.high?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Low</span>
                          <span className="text-gray-300">
                            ${quote.low?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prev Close</span>
                          <span className="text-gray-300">
                            ${quote.previousClose?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
