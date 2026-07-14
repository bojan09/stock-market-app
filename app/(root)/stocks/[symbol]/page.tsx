import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlistSymbolsById } from "@/lib/actions/watchlist.actions";
import {
  getSingleStockNews,
  getAnalystRecommendations,
  getEarningsSurprises,
} from "@/lib/actions/news.actions";
import {
  getPriceTargets,
  getInsiderTransactions,
} from "@/lib/actions/stock-actions";
import { getStockQuote } from "@/lib/actions/finnhub.actions";

import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import WatchlistAlertButton from "@/components/shared/WatchlistAlertButton";
import NewsFeed from "@/components/NewsFeed";
import AnalystConsensus from "@/components/AnalystConsensus";
import PriceTargets from "@/components/PriceTargets";
import InsiderTransactions from "@/components/InsiderTransactions";
import EarningsChart from "@/components/EarningsChart";

import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
} from "@/lib/constants";

export default async function StockDetails({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  const upperSymbol = symbol.toUpperCase();

  const standardEmbed = `https://s3.tradingview.com/external-embedding/embed-widget-`;
  const advancedChart = `https://s3.tradingview.com/tv.js`;

  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const [watchedSymbols, news, analyst, target, insider, earnings, quote] =
    await Promise.all([
      getWatchlistSymbolsById(session.user.id),
      getSingleStockNews(upperSymbol),
      getAnalystRecommendations(upperSymbol),
      getPriceTargets(upperSymbol),
      getInsiderTransactions(upperSymbol),
      getEarningsSurprises(upperSymbol),
      getStockQuote(upperSymbol),
    ]);

  const isInWatchlist = watchedSymbols.includes(upperSymbol);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white p-4 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* --- DYNAMIC TERMINAL HEADER --- */}
        <header className="bg-gray-800 rounded-2xl border border-gray-600/50 shadow-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black uppercase tracking-tighter">
                  {upperSymbol}
                </h1>
                <span className="text-indigo-500 text-sm font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  TERMINAL
                </span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Signalist Intel • Live
              </p>
            </div>

            <div className="flex items-center gap-2">
              <WatchlistAlertButton
                symbol={upperSymbol}
                company={upperSymbol}
                userId={session.user.id}
                currentPrice={quote?.current}
              />
              <WatchlistButton
                symbol={upperSymbol}
                company={upperSymbol}
                isInWatchlist={isInWatchlist}
                userId={session.user.id}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            {/* Symbol Info */}
            <TradingViewWidget
              scriptUrl={`${standardEmbed}symbol-info.js`}
              config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
              height={160}
            />

            {/* MAIN CHART (PERSISTENT DRAWINGS) */}
            <TradingViewWidget
              scriptUrl={advancedChart}
              config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
              height={550}
            />

            {/* Company Profile */}
            <TradingViewWidget
              scriptUrl={`${standardEmbed}symbol-profile.js`}
              config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
              height={440}
            />

            <div className="bg-gray-800 rounded-2xl border border-gray-600/50 p-6 shadow-xl">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Live News
              </h3>
              <NewsFeed articles={news.articles} />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <EarningsChart data={earnings} />
            <AnalystConsensus data={analyst} />
            <PriceTargets data={target} />
            <InsiderTransactions transactions={insider} />

            <TradingViewWidget
              scriptUrl={`${standardEmbed}technical-analysis.js`}
              config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
              height={400}
              autoHeight={true}
            />
            <TradingViewWidget
              scriptUrl={`${standardEmbed}financials.js`}
              config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
              height={800}
              autoHeight={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
