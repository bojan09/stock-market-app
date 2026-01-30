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

  //    * Helper to resolve exchange prefixes.
  const getTradingViewSymbol = (symbol: string) => {
    const s = symbol.toUpperCase();
    if (s.includes(":")) return s;

    // Known NYSE stocks that fail with NASDAQ: prefix
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

    // Default to NASDAQ for most tech/growth stocks
    return `NASDAQ:${s}`;
  };

  // 3. Format symbols for the TradingView Widgets
  const formattedWatchlist = dbWatchlist.map((item) => ({
    s: getTradingViewSymbol(item.symbol),
    d: item.company || item.symbol,
  }));

  // 4. Generate Dynamic Configurations
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
    <div className="flex min-h-screen home-wrapper">
      <section className="grid w-full gap-8 home-section">
        {/* Upper Section: Market Overview & Heatmap */}
        <div className="md:col-span-1 xl:col-span-1">
          <TradingViewWidget
            title="Market Overview"
            scriptUrl={`${scriptUrl}market-overview.js`}
            config={dynamicOverviewConfig}
            className="custom-chart"
            height={600}
          />
        </div>

        <div className="md:col-span-1 xl:col-span-2">
          <TradingViewWidget
            title="Stock Heatmap"
            scriptUrl={`${scriptUrl}stock-heatmap.js`}
            config={HEATMAP_WIDGET_CONFIG}
            height={600}
          />
        </div>
      </section>

      <section className="grid w-full gap-8 mt-8 home-section">
        {/* Lower Section: News Timeline & Market Quotes */}
        <div className="h-full md:col-span-1 xl:col-span-1">
          <TradingViewWidget
            title="Top Stories"
            scriptUrl={`${scriptUrl}timeline.js`}
            config={TOP_STORIES_WIDGET_CONFIG}
            height={600}
          />
        </div>

        <div className="h-full md:col-span-1 xl:col-span-2">
          <TradingViewWidget
            title="Market Quotes"
            scriptUrl={`${scriptUrl}market-quotes.js`}
            config={dynamicMarketDataConfig}
            height={600}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;
