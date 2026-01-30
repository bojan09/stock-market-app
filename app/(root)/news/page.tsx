/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlistNews } from "@/lib/actions/news.actions";
import { Newspaper, ExternalLink, Clock } from "lucide-react";
import Image from "next/image";

// Custom Bull and Bear SVGs
const BullIcon = () => (
  <svg
    width="60"
    height="60"
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
    width="60"
    height="60"
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
  const bullKeywords = [
    "up",
    "rise",
    "gain",
    "growth",
    "buy",
    "bull",
    "positive",
    "beat",
    "higher",
    "surge",
    "profit",
    "bullish",
  ];
  const bearKeywords = [
    "down",
    "fall",
    "loss",
    "drop",
    "sell",
    "bear",
    "negative",
    "miss",
    "lower",
    "plunge",
    "crash",
    "bearish",
  ];
  const h = headline.toLowerCase();
  const isBull = bullKeywords.some((word) => h.includes(word));
  const isBear = bearKeywords.some((word) => h.includes(word));
  if (isBull && !isBear) return "bullish";
  if (isBear && !isBull) return "bearish";
  return "neutral";
};

export default async function NewsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const { articles, isGeneral, success } = await getWatchlistNews(
    session.user.id,
  );

  if (!success)
    return (
      <div className="text-center p-20 text-gray-400">Failed to load news.</div>
    );

  return (
    <div className="min-h-screen bg-[#0F1115] text-white p-4 md:p-8 pb-24">
      <header className="max-w-[1600px] mx-auto mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Newspaper className="text-blue-500" />
          {isGeneral ? "Market News" : "Watchlist News"}
        </h1>
        <p className="text-gray-400 text-sm mt-2 font-medium tracking-tight">
          {isGeneral
            ? "Global market updates"
            : "Updates for your tracked assets"}
        </p>
      </header>

      {/* Grid updated to 4 columns on large screens */}
      <main className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {articles.map((article: any) => {
          const sentiment = getSentiment(article.headline);

          return (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col bg-[#16191F] border border-white/5 rounded-xl overflow-hidden hover:border-blue-500/40 hover:bg-[#1C2028] transition-all duration-300"
            >
              <div className="relative h-44 w-full bg-[#0F1115] overflow-hidden flex items-center justify-center">
                {article.image ? (
                  <Image
                    src={article.image}
                    alt={article.headline}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div
                    className={`flex flex-col items-center gap-2 transition-transform duration-500 group-hover:scale-110 ${
                      sentiment === "bullish"
                        ? "text-emerald-500"
                        : sentiment === "bearish"
                          ? "text-rose-500"
                          : "text-gray-700"
                    }`}
                  >
                    {sentiment === "bullish" ? (
                      <BullIcon />
                    ) : sentiment === "bearish" ? (
                      <BearIcon />
                    ) : (
                      <Newspaper size={40} className="opacity-20" />
                    )}
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                      {sentiment === "neutral" ? "Neutral Info" : sentiment}
                    </span>
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <span className="bg-[#0F1115]/80 backdrop-blur-md border border-white/10 text-[9px] font-bold px-2 py-1 rounded text-blue-400 uppercase tracking-wider">
                    {article.related || "Market"}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase mb-2">
                  <span className="text-blue-500/80">{article.source}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} />{" "}
                    {new Date(article.datetime * 1000).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-base font-bold leading-snug line-clamp-2 group-hover:text-blue-400 transition-colors duration-300">
                  {article.headline}
                </h2>

                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed flex-1">
                  {article.summary}
                </p>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-500 group-hover:text-blue-400 transition-colors">
                  <span className="uppercase tracking-widest">
                    Read Article
                  </span>
                  <ExternalLink size={12} />
                </div>
              </div>
            </a>
          );
        })}
      </main>
    </div>
  );
}
