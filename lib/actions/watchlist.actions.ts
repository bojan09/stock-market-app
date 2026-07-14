"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { revalidatePath } from "next/cache";

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

/**
 * Fetches live price data from Finnhub.
 * Includes fallback logic for tickers that frequently return null (SPY, HIMS).
 */
export async function getWatchlistLiveQuotes(symbols: string[]) {
  if (!symbols.length || !FINNHUB_KEY) return [];

  try {
    const data = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
            { next: { revalidate: 60 } },
          );
          const result = await res.json();

          if (!result.c || result.c === 0) {
            return {
              symbol,
              price: 0,
              change: 0,
              changePercent: 0,
              error: true,
            };
          }

          return {
            symbol,
            price: result.c,
            change: result.d,
            changePercent: result.dp,
            isFallback: false,
          };
        } catch (err) {
          return { symbol, price: 0, change: 0, changePercent: 0, error: true };
        }
      }),
    );
    return data;
  } catch (error) {
    console.error("Live quote fetch error:", error);
    return [];
  }
}

/**
 * Toggles a stock in the watchlist with STRICT duplicate prevention.
 */
export async function toggleWatchlist(
  userId: string,
  symbol: string,
  company: string,
) {
  if (!userId) return { success: false, error: "Unauthorized" };
  try {
    await connectToDatabase();
    const targetSymbol = symbol.toUpperCase().trim();

    // 1. Check if ANY version of this ticker exists for this user
    const existing = await Watchlist.findOne({
      userId: userId,
      symbol: targetSymbol,
    });

    if (existing) {
      // 2. If it exists, remove ALL instances (clean toggle off)
      await Watchlist.deleteMany({ userId: userId, symbol: targetSymbol });
    } else {
      // 3. Toggle on: create one clean entry
      await Watchlist.create({
        userId: userId,
        symbol: targetSymbol,
        company: company || targetSymbol,
        addedAt: new Date(),
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/watchlist");
    return { success: true };
  } catch (error: unknown) {
    console.error("Toggle DB Error:", error);
    return { success: false };
  }
}

/**
 * Fetches symbols using the unique User ID.
 */
export async function getWatchlistSymbolsById(
  userId: string,
): Promise<string[]> {
  if (!userId) return [];
  try {
    await connectToDatabase();
    const items = await Watchlist.find({ userId }).select("symbol").lean();
    return items.map((i) => String(i.symbol).toUpperCase());
  } catch (err) {
    console.error("Fetch symbols error:", err);
    return [];
  }
}

/**
 * Paginated fetch for the main Watchlist page.
 */
export async function getPaginatedWatchlist(
  userId: string,
  page: number = 1,
  limit: number = 5,
  options?: { sortBy?: "recent" | "oldest" | "symbol"; search?: string },
) {
  if (!userId) return { symbols: [], total: 0 };
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { userId };
    if (options?.search) {
      query.symbol = { $regex: options.search.toUpperCase(), $options: "i" };
    }

    const sort: Record<string, 1 | -1> =
      options?.sortBy === "oldest"
        ? { addedAt: 1 }
        : options?.sortBy === "symbol"
          ? { symbol: 1 }
          : { addedAt: -1 };

    const [items, total] = await Promise.all([
      Watchlist.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Watchlist.countDocuments(query),
    ]);

    return {
      symbols: items.map((i) => String(i.symbol).toUpperCase()),
      total,
    };
  } catch (err) {
    console.error("Pagination error:", err);
    return { symbols: [], total: 0 };
  }
}
