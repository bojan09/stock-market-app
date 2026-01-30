"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { revalidatePath } from "next/cache";

/**
 * Fetches symbols using the unique User ID.
 * Standardizes symbols to uppercase for UI consistency.
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
 * Toggles a stock in the watchlist.
 * Uses userId for database integrity as seen in your logs.
 */
export async function toggleWatchlist(
  userId: string,
  symbol: string,
  company: string,
) {
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    const targetSymbol = symbol.toUpperCase();

    const existing = await Watchlist.findOne({
      userId: userId,
      symbol: targetSymbol,
    });

    if (existing) {
      await Watchlist.deleteOne({ _id: existing._id });
    } else {
      await Watchlist.create({
        userId: userId,
        symbol: targetSymbol,
        company: company || targetSymbol,
        addedAt: new Date(),
      });
    }

    // Refresh layouts and the specific watchlist view
    revalidatePath("/", "layout");
    revalidatePath("/watchlist");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Toggle DB Error:", message);
    return { success: false };
  }
}

/**
 * Paginated fetch for the main Watchlist page.
 */
export async function getPaginatedWatchlist(
  userId: string,
  page: number = 1,
  limit: number = 5,
) {
  if (!userId) return { symbols: [], total: 0 };
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Watchlist.find({ userId: userId })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Watchlist.countDocuments({ userId: userId }),
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
