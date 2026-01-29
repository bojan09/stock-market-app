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

  // Type cast to avoid the "any" linting error
  const user = await db.collection("user").findOne<{ _id: any }>({ email });

  if (!user) return null;
  // Your schema uses String for userId, so we convert the MongoDB _id to string
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

    // 1. Try to find existing entry
    const existing = await Watchlist.findOne({ userId, symbol: targetSymbol });

    if (existing) {
      // Remove it
      await Watchlist.deleteOne({ _id: existing._id });
    } else {
      // 2. Create with REQUIRED company field matching your schema
      await Watchlist.create({
        userId,
        symbol: targetSymbol,
        company: companyName || targetSymbol, // Fallback to symbol if name is missing
        addedAt: new Date(),
      });
    }

    // Refresh the necessary paths to update the UI
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
 * NEW: Fetches all watched symbols for a specific user to sync stars in search
 * This fixes the "Module has no exported member" error
 */
export async function getWatchlistSymbolsByEmail(
  email: string,
): Promise<string[]> {
  if (!email) return [];

  try {
    await connectToDatabase();
    const userId = await getUserIdByEmail(email);
    if (!userId) return [];

    // Find all symbols for this user and return just the symbol strings
    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();

    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error("getWatchlistSymbolsByEmail error:", err);
    return [];
  }
}
