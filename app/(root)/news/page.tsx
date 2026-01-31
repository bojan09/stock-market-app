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
  Sparkles,
  Clock,
  ExternalLink,
  Bookmark,
  Tag,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import BookmarkButton from "@/components/shared/BookmarkButton";
import SearchInput from "@/components/shared/SearchInput";

const BullIcon = () => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="opacity-40"
  >
    <path d="M12 2L9 7H15L12 2Z" fill="currentColor" />
    <path
      d="M12 22V10M12 10L16 14M12 10L8 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M18 6C18 6 19 4 21 4M6 6C6 6 5 4 3 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const BearIcon = () => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="opacity-40"
  >
    <path d="M12 22L15 17H9L12 22Z" fill="currentColor" />
    <path
      d="M12 2V14M12 14L8 10M12 14L16 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="7" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="17" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const getSentiment = (headline: string) => {
  const h = headline.toLowerCase();
  if (["up", "rise", "gain", "bull"].some((w) => h.includes(w)))
    return "bullish";
  if (["down", "fall", "loss", "bear"].some((w) => h.includes(w)))
    return "bearish";
  return "neutral";
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; category?: string; q?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const userId = session.user.id;
  const {
    filter,
    category: selectedCategory,
    q: searchQuery,
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

  // 1. Determine base article set
  let articles = isSavedFilter ? await getSavedArticles(userId) : liveArticles;

  // 2. Extract unique categories from the base set
  const categories = Array.from(
    new Set(articles.map((a: any) => a.category).filter(Boolean)),
  );

  // 3. Apply Filters (Category & Search)
  if (selectedCategory) {
    articles = articles.filter((a: any) => a.category === selectedCategory);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    articles = articles.filter(
      (a: any) =>
        a.headline.toLowerCase().includes(query) ||
        a.summary?.toLowerCase().includes(query),
    );
  }

  const aiInsight = await getAiMarketSummary(liveArticles);

  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-4 md:p-8 pb-24">
      <div className="max-w-400 mx-auto">
        <header className="mb-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Newspaper className="text-blue-500" />{" "}
                {isGeneral ? "Global Market Pulse" : "Watchlist Intelligence"}
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                {/* FILTER TABS */}
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
                    />
                    Saved
                  </Link>
                </div>

                {/* SEARCH INPUT */}
                <SearchInput defaultValue={searchQuery} />
              </div>
            </div>

            {aiInsight?.score !== undefined && (
              <div className="bg-[#16191F] border border-white/5 p-4 rounded-2xl min-w-70">
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

          {/* TOPIC SCROLLBAR */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500 shrink-0">
              <Tag size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Topics
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              <Link
                href={{
                  pathname: "/news",
                  query: {
                    ...(filter && { filter }),
                    ...(searchQuery && { q: searchQuery }),
                  },
                }}
                className={`px-4 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap transition-all ${!selectedCategory ? "bg-white text-black" : "border-white/10 text-gray-400 hover:border-white/30"}`}
              >
                All Topics
              </Link>
              {categories.map((cat: any) => (
                <Link
                  key={cat}
                  href={{
                    pathname: "/news",
                    query: {
                      ...(filter && { filter }),
                      ...(searchQuery && { q: searchQuery }),
                      category: cat,
                    },
                  }}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold border whitespace-nowrap capitalize transition-all ${selectedCategory === cat ? "bg-white text-black" : "border-white/10 text-gray-400 hover:border-white/30"}`}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {!isSavedFilter && !searchQuery && aiInsight?.summary && (
            <div className="p-5 bg-linear-to-br from-blue-600/10 via-[#16191F] to-purple-600/10 border border-blue-500/20 rounded-2xl">
              <div className="flex items-center gap-4">
                <Sparkles size={20} className="text-blue-400" />
                <p className="text-gray-200 font-medium italic">
                  "{aiInsight.summary}"
                </p>
              </div>
            </div>
          )}
        </header>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-center">
            <Search size={40} className="text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium text-sm">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "No articles found."}
            </p>
            <Link
              href="/news"
              className="mt-4 text-blue-500 text-xs font-bold hover:underline"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {articles.map((article: any) => {
              const sentiment = getSentiment(article.headline);
              const isBookmarked = savedIds.includes(
                String(article.id || article.articleId),
              );

              return (
                <div
                  key={article.id || article.articleId}
                  className="group flex flex-col bg-[#16191F] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 relative"
                >
                  <div className="relative h-44 w-full bg-[#0F1115] flex items-center justify-center overflow-hidden">
                    {article.image ? (
                      <Image
                        src={article.image}
                        alt="news"
                        fill
                        className="object-cover opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div
                        className={
                          sentiment === "bullish"
                            ? "text-emerald-500"
                            : sentiment === "bearish"
                              ? "text-rose-500"
                              : "text-gray-700"
                        }
                      >
                        {sentiment === "bullish" ? (
                          <BullIcon />
                        ) : sentiment === "bearish" ? (
                          <BearIcon />
                        ) : (
                          <Newspaper size={40} className="opacity-20" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 z-20">
                      <BookmarkButton
                        userId={userId}
                        article={article}
                        isInitialSaved={isBookmarked}
                      />
                    </div>
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    className="p-5 flex flex-col flex-1"
                  >
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase mb-3">
                      <span className="text-blue-400">{article.source}</span>
                      <span>•</span>
                      <span className="capitalize">
                        {article.category || "General"}
                      </span>
                    </div>
                    <h2 className="text-base font-bold line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {article.headline}
                    </h2>
                    <p className="text-xs text-gray-500 mt-3 line-clamp-3 flex-1 leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />{" "}
                        {new Date(article.datetime * 1000).toLocaleDateString()}
                      </span>
                      <ExternalLink size={12} />
                    </div>
                  </a>
                </div>
              );
            })}
          </main>
        )}
      </div>
    </div>
  );
}
