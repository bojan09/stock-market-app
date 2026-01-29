"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { revalidatePath } from "next/cache";

/**
 * HELPER: Gets the internal User ID from an email
 */
async function getUserIdByEmail(email: string) {
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection not found");

  const user = await db.collection("user").findOne<{ _id: any }>({ email });

  if (!user) return null;
  return String(user._id);
}

/**
 * Toggles a stock symbol in the user's watchlist
 */
export async function toggleWatchlist(
  email: string,
  symbol: string,
  companyName?: string,
) {
  if (!email || !symbol) return { success: false, error: "Missing data" };

  try {
    await connectToDatabase();
    const userId = await getUserIdByEmail(email);
    if (!userId) throw new Error("User not found");

    const targetSymbol = symbol.toUpperCase();
    const existing = await Watchlist.findOne({ userId, symbol: targetSymbol });

    if (existing) {
      await Watchlist.deleteOne({ _id: existing._id });
    } else {
      await Watchlist.create({
        userId,
        symbol: targetSymbol,
        company: companyName || targetSymbol,
        addedAt: new Date(),
      });
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/watchlist");
    revalidatePath(`/stocks/${targetSymbol}`);

    return { success: true };
  } catch (err) {
    console.error("toggleWatchlist error:", err);
    return { success: false, error: "Database operation failed" };
  }
}

/**
 * FIXED: Explicitly exported so SearchCommand can access it
 */
export async function getWatchlistSymbolsByEmail(
  email: string,
): Promise<string[]> {
  if (!email) return [];

  try {
    await connectToDatabase();
    const userId = await getUserIdByEmail(email);
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();

    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error("getWatchlistSymbolsByEmail error:", err);
    return [];
  }
}
