import TradingViewWidget from "@/components/TradingViewWidget";
import DailyPerformers from "@/components/DailyPerformers";
import {
  HEATMAP_WIDGET_CONFIG,
  MARKET_DATA_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
} from "@/lib/constants";
import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";

const Home = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  await connectToDatabase();

  const dbWatchlist = session?.user?.id
    ? await Watchlist.find({ userId: session.user.id })
    : [];

  const getTradingViewSymbol = (symbol: string) => {
    const s = symbol.toUpperCase();
    if (s.includes(":")) return s;

    const nyseStocks = [
      "ORCL",
      "CRM",
      "V",
      "MA",
      "BRK.B",
      "KO",
      "DIS",
      "JPM",
      "NKE",
      "BA",
      "GS",
      "WMT",
      "IBM",
      "AXP",
    ];

    if (nyseStocks.includes(s)) return `NYSE:${s}`;
    if (s === "SPY") return "AMEX:SPY";

    return `NASDAQ:${s}`;
  };

  const formattedWatchlist = dbWatchlist.map((item) => ({
    s: getTradingViewSymbol(item.symbol),
    d: item.company || item.symbol,
  }));

  const dynamicOverviewConfig =
    MARKET_OVERVIEW_WIDGET_CONFIG(formattedWatchlist);

  const dynamicMarketDataConfig = {
    ...MARKET_DATA_WIDGET_CONFIG,
    symbolsGroups: [
      ...(formattedWatchlist.length > 0
        ? [
            {
              name: "My Watchlist",
              symbols: formattedWatchlist.map((item) => ({
                name: item.s,
                displayName: item.d,
              })),
            },
          ]
        : []),
      ...MARKET_DATA_WIDGET_CONFIG.symbolsGroups,
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] px-4 md:px-10 pt-4 pb-8 md:pt-6 md:pb-12 home-wrapper max-w-[1600px] mx-auto text-gray-100">
      {/* Header Area: Titles and Watchlist Performance */}
      <header className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center mb-10 border-b border-white/5 pb-10">
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            Market Dashboard
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-2 max-w-md">
            Real-time market insights and your personal watchlist.
          </p>
        </div>

        <div className="w-full h-full flex items-center">
          <DailyPerformers symbols={formattedWatchlist} />
        </div>
      </header>

      {/* Grid Section 1 */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10 mb-10">
        <div className="col-span-1 space-y-4">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold px-1">
            Overview
          </h2>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}market-overview.js`}
            config={dynamicOverviewConfig}
            height={500}
            className="rounded-2xl border border-white/5 shadow-2xl overflow-hidden"
          />
        </div>

        <div className="col-span-1 xl:col-span-2 space-y-4">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold px-1">
            Global Heatmap
          </h2>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}stock-heatmap.js`}
            config={HEATMAP_WIDGET_CONFIG}
            height={500}
            className="rounded-2xl border border-white/5 shadow-2xl overflow-hidden"
          />
        </div>
      </section>

      {/* Grid Section 2 */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10">
        <div className="col-span-1 space-y-4">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold px-1">
            Top Stories
          </h2>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}timeline.js`}
            config={TOP_STORIES_WIDGET_CONFIG}
            height={550}
            className="rounded-2xl border border-white/5 shadow-2xl overflow-hidden"
          />
        </div>

        <div className="col-span-1 xl:col-span-2 space-y-4">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold px-1">
            Market Quotes
          </h2>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}market-quotes.js`}
            config={dynamicMarketDataConfig}
            height={550}
            className="rounded-2xl border border-white/5 shadow-2xl overflow-hidden"
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
