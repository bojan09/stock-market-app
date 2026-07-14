"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink, Newspaper, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import BookmarkButton from "@/components/shared/BookmarkButton";
import ShareButton from "@/components/shared/ShareButton";
import { getRelatedTickers } from "@/lib/news-helpers";
import { markArticleRead } from "@/lib/actions/readNews.actions";

const getSentiment = (headline: string) => {
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

const findPriceTarget = (text: string) => {
  const match = text.match(/\$\d+(?:,\d+)*(?:\.\d+)?/);
  return match ? match[0] : null;
};

interface NewsCardProps {
  article: any;
  userId: string;
  isBookmarked: boolean;
  onUnbookmark?: () => void;
  watchedSymbols?: string[];
  aiTakeaway?: string;
  isRead?: boolean;
}

export default function NewsCard({
  article,
  userId,
  isBookmarked,
  onUnbookmark,
  watchedSymbols = [],
  aiTakeaway,
  isRead = false,
}: NewsCardProps) {
  const sentiment = getSentiment(article.headline);
  const priceTarget =
    findPriceTarget(article.headline) || findPriceTarget(article.summary || "");
  const tickers = getRelatedTickers(article, watchedSymbols);
  const articleId = String(article.id || article.articleId);

  const handleReadClick = () => {
    if (!isRead) markArticleRead(userId, articleId).catch(() => {});
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
      className={`group flex flex-col bg-gray-800 border rounded-2xl overflow-hidden transition-all duration-300 relative ${
        isRead
          ? "border-white/5 opacity-60 hover:opacity-100"
          : "border-indigo-500/20 hover:border-indigo-500/40"
      }`}
    >
      <div className="relative h-44 w-full bg-gray-900 flex items-center justify-center overflow-hidden">
        {priceTarget && (
          <div className="absolute top-3 left-3 z-30 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1 shadow-xl">
            <Target size={10} /> {priceTarget} TARGET
          </div>
        )}

        {article.image ? (
          <Image
            src={article.image}
            alt="news"
            fill
            className="object-cover opacity-50 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
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
            <Newspaper size={40} className="opacity-20" />
          </div>
        )}

        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <BookmarkButton
            userId={userId}
            article={article}
            isInitialSaved={isBookmarked}
            onUnbookmark={onUnbookmark}
          />
          <ShareButton url={article.url} />
        </div>
      </div>

      <div className="px-5 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
          {!isRead && (
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
          )}
          <span className="text-indigo-400">{article.source}</span>
          <span>•</span>
          <span>{article.category || "General"}</span>
        </div>
        {tickers.length > 0 && (
          <div className="flex gap-1">
            {tickers.map(({ symbol, isWatched }) => (
              <Link
                key={symbol}
                href={`/stocks/${symbol.toLowerCase()}`}
                className={
                  isWatched
                    ? "bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] font-black hover:bg-indigo-500 transition-colors"
                    : "bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[9px] font-black text-indigo-300 hover:border-indigo-500/40 transition-colors"
                }
              >
                ${symbol}
              </Link>
            ))}
          </div>
        )}
      </div>

      <a
        href={article.url}
        target="_blank"
        onClick={handleReadClick}
        className="px-5 pb-5 pt-3 flex flex-col flex-1"
      >
        <h2 className="text-base font-bold line-clamp-2 group-hover:text-indigo-400 transition-colors">
          {article.headline}
        </h2>
        <p className="text-xs text-gray-500 mt-3 line-clamp-2 leading-relaxed">
          {article.summary}
        </p>
        {aiTakeaway && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-indigo-500/5 border border-indigo-500/20 px-3 py-2">
            <Sparkles size={12} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-indigo-200 leading-relaxed">
              {aiTakeaway}
            </p>
          </div>
        )}
        <div className="flex-1" />
        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">
          <span className="flex items-center gap-1">
            <Clock size={10} />{" "}
            {new Date(article.datetime * 1000).toLocaleDateString()}
          </span>
          <ExternalLink size={12} />
        </div>
      </a>
    </motion.div>
  );
}
