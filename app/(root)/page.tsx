import TradingViewWidget from "@/components/TradingViewWidget";
import DailyPerformers from "@/components/DailyPerformers";
import NewsFeed from "@/components/NewsFeed";
import RecentAlertsPanel from "@/components/RecentAlertsPanel";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  HEATMAP_WIDGET_CONFIG,
  MARKET_DATA_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
} from "@/lib/constants";
import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { getAuth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { getNews } from "@/lib/actions/finnhub.actions";
import { formatTimeAgo, getTradingViewSymbol } from "@/lib/utils";

export const dynamic = "force-dynamic";

const Home = async () => {
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

  await connectToDatabase();

  const dbWatchlist = session?.user?.id
    ? await Watchlist.find({ userId: session.user.id })
    : [];

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

  const rawNews = await getNews(dbWatchlist.map((item) => item.symbol));
  const newsArticles = rawNews.slice(0, 5).map((article) => ({
    id: article.id,
    title: article.headline,
    url: article.url,
    source: article.source,
    summary: article.summary,
    time: formatTimeAgo(article.datetime),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 px-4 md:px-10 pt-4 pb-8 md:pt-6 md:pb-12 home-wrapper w-full mx-auto text-gray-100">
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

        <div className="w-full md:w-[55rem] h-full flex items-center md:items-start md:ml-[-12rem]">
          <DailyPerformers symbols={formattedWatchlist} />
        </div>
      </header>

      {/* Grid Section 1: Overview + Heatmap */}
      <section className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10 mb-10">
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

      {/* Grid Section 2: Recent Alerts + Latest News */}
      <section className="w-full grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10 mb-10">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentAlertsPanel userId={session?.user?.id ?? ""} />
          </CardContent>
        </Card>

        <Card className="col-span-1 xl:col-span-2">
          <CardHeader>
            <CardTitle>Latest News</CardTitle>
          </CardHeader>
          <CardContent>
            <NewsFeed articles={newsArticles} />
          </CardContent>
        </Card>
      </section>

      {/* Grid Section 3: Market Quotes */}
      <section className="w-full">
        <div className="space-y-4">
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
