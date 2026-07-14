"use server";

import { connectToDatabase } from "@/database/mongoose";
import { PriceHistory } from "@/database/models/priceHistory.model";
import { Watchlist } from "@/database/models/watchlist.model";
import { getStockQuote } from "@/lib/actions/finnhub.actions";

const MAX_SNAPSHOTS_PER_SYMBOL = 100;

/**
 * Records one price snapshot for every distinct symbol currently on
 * anyone's watchlist. Finnhub's free tier doesn't allow access to the
 * historical candle endpoint, so this is how we build up a real (if
 * initially sparse) price history over time using only the /quote
 * endpoint we already have access to.
 */
export async function recordPriceSnapshots() {
  await connectToDatabase();

  const symbols: string[] = await Watchlist.distinct("symbol");
  if (symbols.length === 0) return { recorded: 0 };

  let recorded = 0;

  for (const symbol of symbols) {
    try {
      const quote = await getStockQuote(symbol);
      if (!quote || !quote.current) continue;

      await PriceHistory.create({ symbol, price: quote.current });
      recorded++;

      // Keep the collection bounded: prune anything beyond the most
      // recent MAX_SNAPSHOTS_PER_SYMBOL rows for this symbol.
      const excess = await PriceHistory.find({ symbol })
        .sort({ timestamp: -1 })
        .skip(MAX_SNAPSHOTS_PER_SYMBOL)
        .select("_id")
        .lean();

      if (excess.length > 0) {
        await PriceHistory.deleteMany({
          _id: { $in: excess.map((e: any) => e._id) },
        });
      }
    } catch (error) {
      console.error("Failed to record price snapshot for", symbol, error);
    }
  }

  return { recorded };
}

export async function getPriceHistory(
  symbol: string,
  limit = 20,
): Promise<{ price: number; timestamp: Date }[]> {
  try {
    await connectToDatabase();
    const history = await PriceHistory.find({ symbol: symbol.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select("price timestamp")
      .lean();

    return history.reverse().map((h: any) => ({
      price: h.price,
      timestamp: h.timestamp,
    }));
  } catch (error) {
    console.error("Fetch price history error:", error);
    return [];
  }
}
