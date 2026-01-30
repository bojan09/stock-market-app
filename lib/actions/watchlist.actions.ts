"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { revalidatePath } from "next/cache";

export async function getWatchlistSymbolsByEmail(
  email: string,
): Promise<string[]> {
  if (!email) return [];
  try {
    await connectToDatabase();
    // Your model uses 'userId' for the email string
    const items = await Watchlist.find({ userId: email })
      .select("symbol")
      .lean();
    return items.map((i) => String(i.symbol).toUpperCase());
  } catch (err) {
    console.error("Fetch symbols error:", err);
    return [];
  }
}

export async function toggleWatchlist(
  email: string,
  symbol: string,
  company: string,
) {
  if (!email) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    const targetSymbol = symbol.toUpperCase();

    const existing = await Watchlist.findOne({
      userId: email,
      symbol: targetSymbol,
    });

    if (existing) {
      await Watchlist.deleteOne({ _id: existing._id });
    } else {
      await Watchlist.create({
        userId: email,
        symbol: targetSymbol,
        company: company || targetSymbol,
        addedAt: new Date(),
      });
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Toggle DB Error:", error.message);
    return { success: false };
  }
}

export async function getPaginatedWatchlist(
  email: string,
  page: number = 1,
  limit: number = 5,
) {
  if (!email) return { symbols: [], total: 0 };
  try {
    await connectToDatabase();
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Watchlist.find({ userId: email })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Watchlist.countDocuments({ userId: email }),
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
