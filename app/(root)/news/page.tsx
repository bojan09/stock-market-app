import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlistNews } from "@/lib/actions/news.actions";
import { getAiMarketSummary } from "@/lib/actions/ai.actions";
import { getSentimentDashboardData } from "@/lib/actions/sentiment.actions";
import { getEconomicCalendar } from "@/lib/actions/market.actions";
import {
  getSavedNewsIds,
  getSavedArticles,
} from "@/lib/actions/savedNews.actions";
import {
  Newspaper,
  Bookmark,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  ChevronRight,
  PieChart,
  Activity,
  CalendarDays,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import SearchInput from "@/components/shared/SearchInput";
import SortDropdown from "@/components/shared/SortDropdown";
import BackToTop from "@/components/shared/BackToTop";
import InfiniteNewsList from "@/components/shared/InfiniteNewsList";

const getSentimentServer = (headline: string) => {
  const h = headline.toLowerCase();
  if (
    ["up", "rise", "gain", "bull", "surge", "higher", "profit", "buy"].some(
      (w) => h.includes(w),
    )
  )
    return "bullish";
  if (
    [
      "down",
      "fall",
      "loss",
      "bear",
      "drop",
      "lower",
      "debt",
      "crash",
      "sell",
    ].some((w) => h.includes(w))
  )
    return "bearish";
  return "neutral";
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
    category?: string;
    q?: string;
    sortBy?: string;
  }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const {
    filter,
    category: selectedCategory,
    q: searchQuery,
    sortBy,
  } = await searchParams;
  const isSavedFilter = filter === "saved";

  const [newsData, savedIds, sentimentHubData, ecoCalendar] = await Promise.all(
    [
      getWatchlistNews(userId),
      getSavedNewsIds(userId),
      getSentimentDashboardData(),
      getEconomicCalendar(),
    ],
  );

  const { articles: liveArticles, isGeneral, success } = newsData;
  if (!success)
    return (
      <div className="p-20 text-center text-gray-400 font-medium">
        Failed to load news.
      </div>
    );

  let articles = isSavedFilter ? await getSavedArticles(userId) : liveArticles;

  if (selectedCategory)
    articles = articles.filter((a: any) => a.category === selectedCategory);
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    articles = articles.filter(
      (a: any) =>
        a.headline.toLowerCase().includes(query) ||
        a.summary?.toLowerCase().includes(query),
    );
  }

  articles = [...articles].sort((a: any, b: any) =>
    sortBy === "oldest" ? a.datetime - b.datetime : b.datetime - a.datetime,
  );

  const total = articles.length;
  const bullishCount = articles.filter(
    (a) => getSentimentServer(a.headline) === "bullish",
  ).length;
  const bearishCount = articles.filter(
    (a) => getSentimentServer(a.headline) === "bearish",
  ).length;

  const sourceMap: Record<string, number> = {};
  articles.forEach((a: any) => {
    sourceMap[a.source] = (sourceMap[a.source] || 0) + 1;
  });
  const topSources = Object.entries(sourceMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-4 md:p-8 pb-24 relative">
      <div className="max-w-[1600px] mx-auto">
        {!isSavedFilter && sentimentHubData && (
          <Link href="/sentiment" className="group block mb-10">
            <div className="bg-[#16191F] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-2">
                    Market Sentiment Hub <ChevronRight size={14} />
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">
                      {Math.round(sentimentHubData.marketSentiment)}%
                    </span>
                    <span className="text-emerald-500 font-bold text-xs">
                      BULLISH BIAS
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 overflow-hidden">
                {sentimentHubData.leaderboard.slice(0, 3).map((item: any) => (
                  <div
                    key={item.symbol}
                    className="bg-[#0F1115] px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3"
                  >
                    <span className="text-[10px] font-black text-blue-400">
                      ${item.symbol}
                    </span>
                    <span
                      className={
                        item.score >= 0 ? "text-emerald-500" : "text-rose-500"
                      }
                    >
                      {item.score >= 0 ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        )}

        <header className="mb-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Newspaper className="text-blue-500" />{" "}
                {isGeneral ? "Global Market Pulse" : "Watchlist Intelligence"}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1 bg-[#16191F] p-1 rounded-xl border border-white/5">
                  <Link
                    href="/news"
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isSavedFilter ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    All News
                  </Link>
                  <Link
                    href="/news?filter=saved"
                    className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${isSavedFilter ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    <Bookmark
                      size={14}
                      fill={isSavedFilter ? "white" : "none"}
                    />{" "}
                    Saved
                  </Link>
                </div>
                <Suspense
                  fallback={
                    <div className="h-10 w-64 bg-gray-800/50 rounded-xl animate-pulse" />
                  }
                >
                  <SearchInput defaultValue={searchQuery} />
                </Suspense>
                <Suspense
                  fallback={
                    <div className="h-10 w-32 bg-gray-800/50 rounded-xl animate-pulse" />
                  }
                >
                  <SortDropdown defaultValue={sortBy || "newest"} />
                </Suspense>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            {articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-center">
                <Search size={40} className="text-gray-700 mb-4" />
                <p className="text-gray-500 font-medium text-sm">
                  {isSavedFilter
                    ? "No saved articles found."
                    : "No articles found."}
                </p>
              </div>
            ) : (
              <InfiniteNewsList
                key={isSavedFilter ? "saved" : "all"}
                initialArticles={articles}
                userId={userId}
                savedIds={savedIds}
              />
            )}
          </div>

          <aside className="lg:col-span-3">
            {/* Scrollable Sticky Container */}
            <div
              className="bg-[#16191F] border border-white/5 rounded-2xl p-6 sticky top-8 
               max-h-[calc(100vh-4rem)] overflow-y-auto 
               space-y-8 custom-sidebar-scrollbar"
            >
              {/* 1. Market Sentiment Widget */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="text-blue-500" size={20} />
                  <h3 className="font-bold text-sm tracking-tight">
                    Market Sentiment
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold text-emerald-500 uppercase">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} /> Bullish
                    </div>
                    <span>{bullishCount}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${(bullishCount / (total || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-rose-500 uppercase">
                    <div className="flex items-center gap-2">
                      <TrendingDown size={14} /> Bearish
                    </div>
                    <span>{bearishCount}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500"
                      style={{
                        width: `${(bearishCount / (total || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* 2. AI Signal Strength */}
              <section className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="text-yellow-500" size={18} />
                  <h3 className="font-bold text-sm tracking-tight">
                    Signal Strength
                  </h3>
                </div>
                <div className="space-y-2">
                  {sentimentHubData?.leaderboard
                    .slice(0, 5)
                    .map((item: any) => (
                      <div
                        key={item.symbol}
                        className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5"
                      >
                        <span className="text-xs font-black text-white">
                          ${item.symbol}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.score >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                        >
                          {item.score >= 0 ? "+" : ""}
                          {Math.round(item.score)}%
                        </span>
                      </div>
                    ))}
                </div>
              </section>

              {/* 3. Economic Calendar (Macro Events) */}
              <section className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="text-emerald-500" size={18} />
                    <h3 className="font-bold text-sm tracking-tight">
                      Macro Events
                    </h3>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                    High
                  </span>
                </div>
                <div className="space-y-4">
                  {ecoCalendar.length > 0 ? (
                    ecoCalendar.map((event, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                          <span>
                            {new Date(event.time).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <div className="flex items-center gap-1">
                            <Globe size={10} /> {event.country}
                          </div>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-200 leading-snug line-clamp-2">
                          {event.event}
                        </p>
                        {event.forecast && (
                          <p className="text-[10px] text-gray-500">
                            Est:{" "}
                            <span className="text-gray-300">
                              {event.forecast}
                            </span>
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-gray-600 italic">
                      No major events this week.
                    </p>
                  )}
                </div>
              </section>

              {/* 4. Top Sources Breakdown */}
              <section className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <PieChart className="text-blue-400" size={18} />
                  <h3 className="font-bold text-sm tracking-tight">
                    Intel Sources
                  </h3>
                </div>
                <div className="space-y-3">
                  {topSources.map(([source, count]) => (
                    <div
                      key={source}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[11px] text-gray-400 font-medium">
                        {source}
                      </span>
                      <span className="text-[11px] text-white font-bold">
                        {Math.round((count / articles.length) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}
