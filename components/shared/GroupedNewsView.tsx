"use client";

import Link from "next/link";
import NewsCard from "@/components/shared/NewsCard";
import { getRelatedTickers } from "@/lib/news-helpers";

export default function GroupedNewsView({
  articles,
  userId,
  savedIds,
  watchedSymbols = [],
  aiTakeaways = {},
}: {
  articles: any[];
  userId: string;
  savedIds: string[];
  watchedSymbols?: string[];
  aiTakeaways?: Record<string, string>;
}) {
  const groups: Record<string, any[]> = {};

  articles.forEach((article) => {
    const matched = getRelatedTickers(article, watchedSymbols).find(
      (t) => t.isWatched,
    );
    const key = matched?.symbol || "Market";
    if (!groups[key]) groups[key] = [];
    groups[key].push(article);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === "Market") return 1;
    if (b === "Market") return -1;
    return groups[b].length - groups[a].length;
  });

  if (sortedKeys.length === 0) return null;

  return (
    <div className="space-y-12">
      {sortedKeys.map((key) => (
        <section key={key}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {key === "Market" ? (
                <h2 className="text-lg font-bold text-white">
                  General Market
                </h2>
              ) : (
                <>
                  <span className="bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                    ${key}
                  </span>
                  <Link
                    href={`/stocks/${key.toLowerCase()}`}
                    className="text-sm font-bold text-white hover:text-indigo-400 transition-colors"
                  >
                    View stock page →
                  </Link>
                </>
              )}
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {groups[key].length} article{groups[key].length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {groups[key].map((article, index) => {
              const articleId = String(article.id || article.articleId);
              const isBookmarked = savedIds.includes(articleId);

              return (
                <NewsCard
                  key={`${articleId}-${index}`}
                  article={article}
                  userId={userId}
                  isBookmarked={isBookmarked}
                  watchedSymbols={watchedSymbols}
                  aiTakeaway={aiTakeaways[articleId]}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
