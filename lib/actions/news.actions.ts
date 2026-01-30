"use server";

import { getWatchlistSymbolsById } from "./watchlist.actions";
import { getNews } from "./finnhub.actions";

/**
 * Fetches news specifically for the stocks in a user's watchlist.
 * Falls back to general market news if the watchlist is empty.
 */
export async function getWatchlistNews(userId: string) {
  try {
    // 1. Get the list of symbols from the user's watchlist
    const symbols = await getWatchlistSymbolsById(userId);

    // 2. Fetch news using existing Finnhub logic
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
      error: "Failed to load news articles.",
    };
  }
}
