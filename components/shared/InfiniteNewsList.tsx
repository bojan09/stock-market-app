"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useSearchParams } from "next/navigation";
import NewsCard from "@/components/shared/NewsCard";

export default function InfiniteNewsList({
  initialArticles,
  userId,
  savedIds,
  watchedSymbols = [],
  aiTakeaways = {},
}: {
  initialArticles: any[];
  userId: string;
  savedIds: string[];
  watchedSymbols?: string[];
  aiTakeaways?: Record<string, string>;
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
            const isBookmarked = savedIds.includes(articleId);

            return (
              <NewsCard
                key={`${articleId}-${index}`}
                article={article}
                userId={userId}
                isBookmarked={isBookmarked}
                onUnbookmark={() => handleUnbookmarkLocal(articleId)}
                watchedSymbols={watchedSymbols}
                aiTakeaway={aiTakeaways[articleId]}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div ref={ref} className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin" />
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
            className="fixed bottom-8 right-8 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-500 transition-colors border border-white/10"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
