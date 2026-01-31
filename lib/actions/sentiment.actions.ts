"use server";

import { getNews } from "./finnhub.actions";

export async function getSentimentDashboardData() {
  try {
    const articles = await getNews(); // This gets our 48 optimized articles

    const tickerMap: Record<
      string,
      { bullish: number; bearish: number; total: number; targets: string[] }
    > = {};
    let marketBullish = 0;
    let marketBearish = 0;

    articles.forEach((article: any) => {
      // 1. Identify Sentiment
      const h = article.headline.toLowerCase();
      const isBull = [
        "up",
        "rise",
        "gain",
        "bull",
        "surge",
        "higher",
        "profit",
        "buy",
      ].some((w) => h.includes(w));
      const isBear = [
        "down",
        "fall",
        "loss",
        "bear",
        "drop",
        "lower",
        "debt",
        "crash",
        "sell",
      ].some((w) => h.includes(w));

      if (isBull) marketBullish++;
      if (isBear) marketBearish++;

      // 2. Map to Tickers
      const tickers = article.headline.match(/\b[A-Z]{2,5}\b/g) || [];
      const cleanTickers = [...new Set(tickers)].filter(
        (t) =>
          ![
            "NEWS",
            "USA",
            "FED",
            "CEO",
            "AI",
            "USD",
            "ETF",
            "SEC",
            "POST",
          ].includes(t as string),
      );

      cleanTickers.forEach((ticker: any) => {
        if (!tickerMap[ticker]) {
          tickerMap[ticker] = { bullish: 0, bearish: 0, total: 0, targets: [] };
        }
        tickerMap[ticker].total++;
        if (isBull) tickerMap[ticker].bullish++;
        if (isBear) tickerMap[ticker].bearish++;

        // Extract price targets if they exist
        const target = article.headline.match(/\$\d+(?:,\d+)*(?:\.\d+)?/);
        if (target) tickerMap[ticker].targets.push(target[0]);
      });
    });

    // 3. Format Leaderboard
    const leaderboard = Object.entries(tickerMap)
      .map(([symbol, stats]) => ({
        symbol,
        score: ((stats.bullish - stats.bearish) / stats.total) * 100,
        mentionCount: stats.total,
        topTarget: stats.targets[0] || null,
      }))
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, 10);

    return {
      marketSentiment: (marketBullish / (marketBullish + marketBearish)) * 100,
      leaderboard,
      totalAnalyzed: articles.length,
    };
  } catch (error) {
    console.error("Sentiment Dashboard Error:", error);
    return null;
  }
}
