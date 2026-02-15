"use server";

import { getWatchlistSymbolsById } from "./watchlist.actions";
import { getNews } from "./finnhub.actions";

/**
 * Fetches news specifically for a single stock ticker.
 * Optimized with safety checks for missing summaries and IDs.
 */
export async function getSingleStockNews(symbol: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    // Define date range (Last 7 days)
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    // Finnhub specific company news endpoint
    const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol.toUpperCase()}&from=${formatDate(from)}&to=${formatDate(to)}&token=${apiKey}`;

    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      throw new Error(`Finnhub API responded with status: ${response.status}`);
    }

    const articles = await response.json();

    if (!Array.isArray(articles)) {
      return { success: false, articles: [] };
    }

    // Map to our consistent Signalist format
    const formattedArticles = articles.slice(0, 10).map((article: any) => {
      // Safety: Fallback for summary to prevent crashes during sentiment analysis
      const summaryText = article.summary || "";
      const headlineText = article.headline || "";

      const combinedText = (headlineText + " " + summaryText).toLowerCase();

      // Basic Sentiment Heuristics
      let sentiment: "bullish" | "bearish" | "neutral" = "neutral";
      if (
        combinedText.includes("bull") ||
        combinedText.includes("higher") ||
        combinedText.includes("growth")
      ) {
        sentiment = "bullish";
      } else if (
        combinedText.includes("bear") ||
        combinedText.includes("lower") ||
        combinedText.includes("drop")
      ) {
        sentiment = "bearish";
      }

      return {
        id: article.id?.toString() || Math.random().toString(), // Ensure unique string ID
        title: headlineText,
        url: article.url,
        source: article.source || "Market News",
        summary: summaryText || "No summary available for this report.",
        time: new Date(article.datetime * 1000).toLocaleDateString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        sentiment: sentiment,
      };
    });

    return {
      success: true,
      articles: formattedArticles,
    };
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return {
      success: false,
      articles: [],
      error: "Failed to fetch live news.",
    };
  }
}

//  * Fetches news for the user's entire watchlist.
export async function getWatchlistNews(userId: string) {
  try {
    const symbols = await getWatchlistSymbolsById(userId);
    const articles = await getNews(symbols);

    return {
      success: true,
      articles: articles || [],
      isGeneral: !symbols || symbols.length === 0,
    };
  } catch (error) {
    console.error("Error in getWatchlistNews action:", error);
    return {
      success: false,
      articles: [],
      error: "Failed to load watchlist news.",
    };
  }
}

export async function getAnalystRecommendations(symbol: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol.toUpperCase()}&token=${apiKey}`;

    const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24 hours
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    // Return the most recent month's data
    return data[0];
  } catch (error) {
    console.error("Error fetching analyst data:", error);
    return null;
  }
}

export async function getEarningsSurprises(symbol: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!apiKey) throw new Error("Missing Finnhub API Key");

    const res = await fetch(
      `https://finnhub.io/api/v1/stock/earnings?symbol=${symbol.toUpperCase()}&token=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      },
    );

    if (!res.ok) throw new Error("Failed to fetch earnings surprises");

    const data = await res.json();

    // Finnhub returns an array of: { actual, estimate, period, quarter, surprise, symbol, year }
    return data;
  } catch (error) {
    console.error("Earnings Surprise Action Error:", error);
    return [];
  }
}
