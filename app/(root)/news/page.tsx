import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlistNews } from "@/lib/actions/news.actions";
import { getAiMarketSummary } from "@/lib/actions/ai.actions";
import {
  getSavedNewsIds,
  getSavedArticles,
} from "@/lib/actions/savedNews.actions";
import {
  Newspaper,
  Bookmark,
  Tag,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import SearchInput from "@/components/shared/SearchInput";
import SortDropdown from "@/components/shared/SortDropdown";
import BackToTop from "@/components/shared/BackToTop";
import InfiniteNewsList from "@/components/shared/InfiniteNewsList";

// Sentiment logic duplicated here briefly for Server-Side Widget calculations
const getSentimentServer = (headline: string) => {
  const h = headline.toLowerCase();
  if (
    ["up", "rise", "gain", "bull", "surge", "higher", "profit"].some((w) =>
      h.includes(w),
    )
  )
    return "bullish";
  if (
    ["down", "fall", "loss", "bear", "drop", "lower", "debt", "crash"].some(
      (w) => h.includes(w),
    )
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

  const [newsData, savedIds] = await Promise.all([
    getWatchlistNews(userId),
    getSavedNewsIds(userId),
  ]);
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

  const tickerRegex = /\b[A-Z]{2,5}\b/g;
  const tickerMap: Record<string, number> = {};
  articles.forEach((a: any) => {
    const matches = a.headline.match(tickerRegex);
    if (matches)
      matches.forEach((t: string) => {
        if (!["NEWS", "USA", "FED", "CEO", "AI", "USD"].includes(t))
          tickerMap[t] = (tickerMap[t] || 0) + 1;
      });
  });
  const trendingTickers = Object.entries(tickerMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  const categories = Array.from(
    new Set(articles.map((a: any) => a.category).filter(Boolean)),
  );
  const aiInsight = await getAiMarketSummary(liveArticles);

  const total = articles.length;
  const bullishCount = articles.filter(
    (a) => getSentimentServer(a.headline) === "bullish",
  ).length;
  const bearishCount = articles.filter(
    (a) => getSentimentServer(a.headline) === "bearish",
  ).length;

  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-4 md:p-8 pb-24 relative">
      <div className="max-w-[1600px] mx-auto">
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
            {aiInsight?.score !== undefined && (
              <div className="bg-[#16191F] border border-white/5 p-4 rounded-2xl min-w-[280px]">
                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                  <span className="text-rose-500">Bearish</span>
                  <span className="text-emerald-500">Bullish</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${aiInsight.score > 50 ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${aiInsight.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <Tag size={14} className="text-gray-500 shrink-0" />
            {["All Topics", ...categories].map((cat) => (
              <Link
                key={cat}
                href={{
                  pathname: "/news",
                  query: {
                    ...(filter && { filter }),
                    ...(searchQuery && { q: searchQuery }),
                    ...(sortBy && { sortBy }),
                    ...(cat !== "All Topics" && { category: cat }),
                  },
                }}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap transition-all ${(cat === "All Topics" && !selectedCategory) || selectedCategory === cat ? "bg-white text-black" : "border-white/10 text-gray-400 hover:border-white/30"}`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            {articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-center">
                <Search size={40} className="text-gray-700 mb-4" />
                <p className="text-gray-500 font-medium text-sm">
                  No articles found.
                </p>
              </div>
            ) : (
              <InfiniteNewsList
                initialArticles={articles}
                userId={userId}
                savedIds={savedIds}
              />
            )}
          </div>

          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-[#16191F] border border-white/5 rounded-2xl p-6 sticky top-8">
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
                    style={{ width: `${(bullishCount / total) * 100}%` }}
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
                    style={{ width: `${(bearishCount / total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="text-blue-400" size={18} />
                  <h3 className="font-bold text-sm tracking-tight">
                    Trending Assets
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTickers.map(([ticker, count]) => (
                    <Link
                      key={ticker}
                      href={`/news?q=${ticker}`}
                      className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${count > 3 ? "bg-blue-500/10 border-blue-500/30 animate-pulse" : "bg-white/5 border-white/5"}`}
                    >
                      <span className="text-[11px] font-black text-blue-400">
                        ${ticker}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">
                        {count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}
