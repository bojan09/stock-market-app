import { getSentimentDashboardData } from "@/lib/actions/sentiment.actions";
import { TrendingUp, TrendingDown, Zap, BarChart3 } from "lucide-react";

export default async function SentimentPage() {
  const data = await getSentimentDashboardData();

  if (!data)
    return <div className="p-10 text-white">Analyzing market signals...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      <header>
        <h1 className="text-4xl font-black text-white italic tracking-tighter">
          SENTIMENT HUB
        </h1>
        <p className="text-gray-500">
          AI analysis of {data.totalAnalyzed} real-time market signals
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Market Mood Gauge */}
        <div className="bg-[#16191F] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500" />
          <h2 className="text-gray-400 font-bold mb-6 flex items-center gap-2 uppercase text-xs">
            <Zap size={14} className="text-yellow-500" /> Market Mood
          </h2>
          <div className="text-6xl font-black text-white mb-2">
            {Math.round(data.marketSentiment)}%
          </div>
          <div className="text-emerald-400 font-bold text-sm uppercase tracking-widest">
            Bullish Bias
          </div>
          <p className="text-gray-500 text-[10px] mt-4 text-center">
            Calculated from news volume & headline polarity
          </p>
        </div>

        {/* 2. Most Mentioned Stocks (Power List) */}
        <div className="lg:col-span-2 bg-[#16191F] border border-white/5 rounded-3xl p-8">
          <h2 className="text-gray-400 font-bold mb-6 flex items-center gap-2 uppercase text-xs">
            <BarChart3 size={14} className="text-blue-500" /> Trending Assets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.leaderboard.map((item) => (
              <div
                key={item.symbol}
                className="bg-[#0F1115] p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center font-black text-blue-400">
                    {item.symbol[0]}
                  </div>
                  <div>
                    <div className="text-white font-bold">${item.symbol}</div>
                    <div className="text-[10px] text-gray-500">
                      {item.mentionCount} recent mentions
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={
                      item.score >= 0 ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {item.score >= 0 ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                  </div>
                  {item.topTarget && (
                    <div className="text-[9px] font-black text-blue-500 mt-1">
                      {item.topTarget} TGT
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Social Buzz Placeholder */}
      <div className="bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/20 rounded-3xl p-10 text-center">
        <h3 className="text-white font-bold text-xl mb-2">
          Ready for deeper signals?
        </h3>
        <p className="text-gray-400 max-w-md mx-auto text-sm mb-6">
          We are currently calibrating the 2026 Social Buzz feed for
          high-frequency trading alerts.
        </p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-full text-sm transition-all shadow-xl shadow-blue-600/20">
          Enable Alerts
        </button>
      </div>
    </div>
  );
}
