import TradingViewWidget from "@/components/TradingViewWidget";
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
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] px-4 md:px-10 py-8 home-wrapper max-w-[2100px] mx-auto text-gray-100">
      {/* Header Area */}
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Market Dashboard
        </h1>
        <p className="text-gray-400 text-sm md:text-base mt-1">
          Real-time market insights and your personal watchlist.
        </p>
      </div>

      {/* Section 1: Overview and Heatmap */}
      <section className="grid w-full gap-8 home-section">
        <div className="col-span-1 space-y-4">
          {/* UI FIX: Responsive Title Scaling */}
          <h2 className="text-lg md:text-xl font-semibold px-1">
            Market Overview
          </h2>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}market-overview.js`}
            config={dynamicOverviewConfig}
            height={500}
            className="rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
          />
        </div>

        <div className="col-span-1 xl:col-span-2 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold px-1">
            Global Heatmap
          </h2>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}stock-heatmap.js`}
            config={HEATMAP_WIDGET_CONFIG}
            height={500}
            className="rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
          />
        </div>
      </section>

      {/* Section 2: News and Quotes */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10">
        <div className="col-span-1 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold px-1">Top Stories</h2>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}timeline.js`}
            config={TOP_STORIES_WIDGET_CONFIG}
            height={550}
            className="rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
          />
        </div>

        <div className="col-span-1 xl:col-span-2 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold px-1">
            Market Quotes
          </h2>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}market-quotes.js`}
            config={dynamicMarketDataConfig}
            height={550}
            className="rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
