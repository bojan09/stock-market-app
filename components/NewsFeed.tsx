import { ExternalLink, Clock, Newspaper, ChevronRight } from "lucide-react";

interface Article {
  id: number | string;
  title: string;
  url: string;
  source: string;
  summary: string;
  time: string;
  sentiment?: "bullish" | "bearish" | "neutral";
}

interface NewsFeedProps {
  articles: Article[];
}

export default function NewsFeed({ articles = [] }: NewsFeedProps) {
  // Graceful empty state
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 border-2 border-dashed border-white/5 rounded-2xl bg-gray-800/50">
        <Newspaper className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm italic">
          No recent headlines found for this asset.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {articles.map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-3 p-4 rounded-xl bg-gray-800 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] transition-all duration-200"
        >
          {/* Header: Source & Time */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                {article.source}
              </span>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                <Clock className="w-3 h-3" />
                {article.time}
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-indigo-400 transition-colors" />
          </div>

          {/* Body: Title & Summary */}
          <div className="space-y-2">
            <h4 className="text-[15px] font-bold text-gray-100 group-hover:text-white leading-snug group-hover:underline decoration-indigo-500/30 underline-offset-4">
              {article.title}
            </h4>
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed font-medium">
              {article.summary}
            </p>
          </div>

          {/* Footer: Sentiment & Read More */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex gap-2">
              {article.sentiment && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded ${
                    article.sentiment === "bullish"
                      ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                      : article.sentiment === "bearish"
                        ? "text-rose-400 bg-rose-400/10 border border-rose-400/20"
                        : "text-gray-400 bg-gray-400/10 border border-gray-400/20"
                  }`}
                >
                  {article.sentiment}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Full Report <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </a>
      ))}

      <button className="w-full py-3 mt-2 text-xs font-bold text-gray-500 hover:text-white border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors uppercase tracking-widest">
        View All Market News
      </button>
    </div>
  );
}
