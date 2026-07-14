"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Position } from "@/database/models/position.model";
import { requireUser } from "@/lib/actions/session-guard";
import { getStockQuote } from "@/lib/actions/finnhub.actions";
import { revalidatePath } from "next/cache";

export async function addPosition(
  userId: string,
  data: {
    symbol: string;
    company: string;
    shares: number;
    costBasis: number;
    purchaseDate?: string;
  },
) {
  const verifiedUserId = await requireUser(userId);
  if (!verifiedUserId) return { success: false, error: "Unauthorized" };

  if (!data.shares || data.shares <= 0)
    return { success: false, error: "Shares must be greater than 0" };
  if (data.costBasis == null || data.costBasis < 0)
    return { success: false, error: "Enter a valid cost basis" };

  try {
    await connectToDatabase();
    await Position.create({
      userId: verifiedUserId,
      symbol: data.symbol.toUpperCase().trim(),
      company: data.company,
      shares: data.shares,
      costBasis: data.costBasis,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : new Date(),
    });

    revalidatePath("/portfolio");
    return { success: true };
  } catch (error) {
    console.error("Add position error:", error);
    return { success: false, error: "Failed to add position" };
  }
}

export async function deletePosition(userId: string, positionId: string) {
  const verifiedUserId = await requireUser(userId);
  if (!verifiedUserId) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    await Position.deleteOne({ _id: positionId, userId: verifiedUserId });

    revalidatePath("/portfolio");
    return { success: true };
  } catch (error) {
    console.error("Delete position error:", error);
    return { success: false, error: "Failed to delete position" };
  }
}

export async function getPortfolioPositions(userId: string) {
  const verifiedUserId = await requireUser(userId);
  if (!verifiedUserId) return [];

  try {
    await connectToDatabase();
    const positions = await Position.find({ userId: verifiedUserId })
      .sort({ createdAt: -1 })
      .lean();

    const withQuotes = await Promise.all(
      positions.map(async (p: any) => {
        const quote = await getStockQuote(p.symbol);
        const currentPrice = quote?.current || 0;
        const marketValue = currentPrice * p.shares;
        const costTotal = p.costBasis * p.shares;
        const gainLoss = marketValue - costTotal;
        const gainLossPercent = costTotal > 0 ? (gainLoss / costTotal) * 100 : 0;

        return {
          id: String(p._id),
          symbol: p.symbol,
          company: p.company,
          shares: p.shares,
          costBasis: p.costBasis,
          purchaseDate: p.purchaseDate,
          currentPrice,
          marketValue,
          costTotal,
          gainLoss,
          gainLossPercent,
        };
      }),
    );

    return withQuotes;
  } catch (error) {
    console.error("Get portfolio positions error:", error);
    return [];
  }
}
