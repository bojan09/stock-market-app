import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getWatchlistSymbolsById } from "@/lib/actions/watchlist.actions";
import {
  getSingleStockNews,
  getAnalystRecommendations,
} from "@/lib/actions/news.actions";
import {
  getPriceTargets,
  getInsiderTransactions,
} from "@/lib/actions/stock-actions";
import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import NewsFeed from "@/components/NewsFeed";
import AnalystConsensus from "@/components/AnalystConsensus";
import PriceTargets from "@/components/PriceTargets";
import InsiderTransactions from "@/components/InsiderTransactions";
import { redirect } from "next/navigation";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";

interface StockDetailsPageProps {
  params: Promise<{ symbol: string }>;
}

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const userId = session.user.id;

  // FETCH: Parallel execution for Phase 2, 3, and 4
  const [watchedSymbols, newsResult, analystData, targetData, insiderData] =
    await Promise.all([
      getWatchlistSymbolsById(userId),
      getSingleStockNews(upperSymbol),
      getAnalystRecommendations(upperSymbol),
      getPriceTargets(upperSymbol),
      getInsiderTransactions(upperSymbol),
    ]);

  const isInWatchlist = watchedSymbols.includes(upperSymbol);

  return (
    <div className="flex flex-col min-h-screen bg-[#0F1115] text-white p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* --- HEADER --- */}
        <header className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-[#1A1D23] p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Subtle background glow for the terminal header */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl -z-10" />

          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
              {upperSymbol}
              <span className="text-blue-500 text-sm font-bold tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                TERMINAL
              </span>
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
              Signalist Pro Intelligence • Live Market Data
            </p>
          </div>

          <div className="flex items-center gap-3">
            <WatchlistButton
              symbol={upperSymbol}
              company={upperSymbol}
              isInWatchlist={isInWatchlist}
              userId={userId}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* --- LEFT COLUMN: DATA & FEED --- */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#1A1D23]">
              <TradingViewWidget
                scriptUrl={`${scriptUrl}symbol-info.js`}
                config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
                height={160}
              />
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#1A1D23]">
              <TradingViewWidget
                scriptUrl={`${scriptUrl}advanced-chart.js`}
                config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
                height={550}
              />
            </div>

            <div className="bg-[#1A1D23] rounded-2xl border border-white/5 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Live {upperSymbol} News
                </h3>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Last 7 Days
                </span>
              </div>
              <NewsFeed articles={newsResult.articles} />
            </div>
          </div>

          {/* --- RIGHT COLUMN: ANALYSIS & INSTITUTIONAL --- */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <AnalystConsensus data={analystData} />
            <PriceTargets data={targetData} />

            <InsiderTransactions transactions={insiderData} />

            <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#1A1D23]">
              <TradingViewWidget
                scriptUrl={`${scriptUrl}technical-analysis.js`}
                config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
                height={400}
              />
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#1A1D23]">
              <TradingViewWidget
                scriptUrl={`${scriptUrl}company-profile.js`}
                config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
                height={440}
              />
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#1A1D23]">
              <TradingViewWidget
                scriptUrl={`${scriptUrl}financials.js`}
                config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
                height={464}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
