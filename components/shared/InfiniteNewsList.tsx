"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Clock, ExternalLink, Newspaper, Target, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import BookmarkButton from "@/components/shared/BookmarkButton";
import ShareButton from "@/components/shared/ShareButton";
import { useSearchParams } from "next/navigation";

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

const findTickers = (text: string) => {
  const matches = text.match(/\b[A-Z]{2,5}\b/g);
  return matches
    ? Array.from(new Set(matches)).filter(
        (t) =>
          !["NEWS", "USA", "FED", "CEO", "AI", "USD", "ETF", "SEC"].includes(t),
      )
    : [];
};

export default function InfiniteNewsList({
  initialArticles,
  userId,
  savedIds,
}: {
  initialArticles: any[];
  userId: string;
  savedIds: string[];
}) {
  const searchParams = useSearchParams();
  const isSavedView = searchParams.get("filter") === "saved";

  // State Management
  const [displayArticles, setDisplayArticles] = useState(
    initialArticles.slice(0, 12),
  );
  const [hasMore, setHasMore] = useState(initialArticles.length > 12);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Intersection Observer for Infinite Scroll
  // triggerOnce: false allows it to keep firing as we add more items
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "400px", // Pre-fetch next batch before user reaches the bottom
  });

  // Handle Scroll for "Back to Top" visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 1000);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync state when filter or initialArticles change (e.g., on page refresh or search)
  useEffect(() => {
    setDisplayArticles(initialArticles.slice(0, 12));
    setHasMore(initialArticles.length > 12);
  }, [initialArticles]);

  // Infinite scroll logic - Optimized for larger 48-article batches
  useEffect(() => {
    if (inView && hasMore) {
      const currentLength = displayArticles.length;
      // Fetch in chunks of 12 for a smoother transition
      const nextBatch = initialArticles.slice(
        currentLength,
        currentLength + 12,
      );

      if (nextBatch.length > 0) {
        setDisplayArticles((prev) => [...prev, ...nextBatch]);
        if (currentLength + nextBatch.length >= initialArticles.length) {
          setHasMore(false);
        }
      }
    }
  }, [inView, hasMore, initialArticles, displayArticles.length]);

  const handleUnbookmarkLocal = (articleId: string) => {
    if (isSavedView) {
      setDisplayArticles((prev) =>
        prev.filter((a) => String(a.id || a.articleId) !== articleId),
      );
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-10 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {displayArticles.map((article: any, index: number) => {
            // Using combination of ID and index to guarantee unique keys even if API duplicates
            const articleId = String(article.id || article.articleId);
            const sentiment = getSentiment(article.headline);
            const priceTarget =
              findPriceTarget(article.headline) ||
              findPriceTarget(article.summary || "");
            const tickers = findTickers(article.headline);
            const isBookmarked = savedIds.includes(articleId);

            return (
              <motion.div
                key={`${articleId}-${index}`}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                className="group flex flex-col bg-[#16191F] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 relative"
              >
                <div className="relative h-44 w-full bg-[#0F1115] flex items-center justify-center overflow-hidden">
                  {priceTarget && (
                    <div className="absolute top-3 left-3 z-30 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1 shadow-xl">
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
                      onUnbookmark={() => handleUnbookmarkLocal(articleId)}
                    />
                    <ShareButton url={article.url} />
                  </div>
                </div>

                <a
                  href={article.url}
                  target="_blank"
                  className="p-5 flex flex-col flex-1"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                      <span className="text-blue-400">{article.source}</span>
                      <span>•</span>
                      <span>{article.category || "General"}</span>
                    </div>
                    <div className="flex gap-1">
                      {tickers.map((t) => (
                        <span
                          key={t}
                          className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[9px] font-black text-blue-300"
                        >
                          ${t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <h2 className="text-base font-bold line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {article.headline}
                  </h2>
                  <p className="text-xs text-gray-500 mt-3 line-clamp-2 flex-1 leading-relaxed">
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div ref={ref} className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-t-transparent border-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-3 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-500 transition-colors border border-white/10"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
