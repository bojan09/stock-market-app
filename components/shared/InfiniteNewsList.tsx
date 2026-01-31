"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Clock, ExternalLink, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import BookmarkButton from "@/components/shared/BookmarkButton";
import ShareButton from "@/components/shared/ShareButton";

// Icons moved inside the client component to avoid serialization errors
const BullIcon = () => (
  <svg
    width="40"
    height="40"
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
  </svg>
);

const BearIcon = () => (
  <svg
    width="40"
    height="40"
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
  </svg>
);

// Sentiment logic moved here
const getSentiment = (headline: string) => {
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

interface Props {
  initialArticles: any[];
  userId: string;
  savedIds: string[];
}

export default function InfiniteNewsList({
  initialArticles,
  userId,
  savedIds,
}: Props) {
  const [displayArticles, setDisplayArticles] = useState(
    initialArticles.slice(0, 12),
  );
  const [hasMore, setHasMore] = useState(initialArticles.length > 12);
  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasMore) {
      const currentLength = displayArticles.length;
      const nextBatch = initialArticles.slice(currentLength, currentLength + 8);
      if (nextBatch.length > 0) {
        setTimeout(() => {
          setDisplayArticles((prev) => [...prev, ...nextBatch]);
          if (currentLength + nextBatch.length >= initialArticles.length)
            setHasMore(false);
        }, 300);
      }
    }
  }, [inView, hasMore, initialArticles, displayArticles.length]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {displayArticles.map((article: any, index: number) => {
            const sentiment = getSentiment(article.headline);
            const isBookmarked = savedIds.includes(
              String(article.id || article.articleId),
            );

            return (
              <motion.div
                key={article.id || article.articleId || index}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="group flex flex-col bg-[#16191F] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 relative"
              >
                <div className="relative h-44 w-full bg-[#0F1115] flex items-center justify-center overflow-hidden">
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
                      {sentiment === "bullish" ? (
                        <BullIcon />
                      ) : sentiment === "bearish" ? (
                        <BearIcon />
                      ) : (
                        <Newspaper size={40} className="opacity-20" />
                      )}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <BookmarkButton
                      userId={userId}
                      article={article}
                      isInitialSaved={isBookmarked}
                    />
                    <ShareButton url={article.url} />
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
    </div>
  );
}
