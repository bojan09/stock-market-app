"use server";

import { connectToDatabase } from "@/database/mongoose";
import { AlertModel } from "@/database/models/alert.model";
import { revalidatePath } from "next/cache";

export async function createAlert(
  userId: string,
  data: {
    symbol: string;
    company: string;
    alertName: string;
    alertType: "upper" | "lower";
    threshold: number;
  },
) {
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    await AlertModel.create({
      userId,
      symbol: data.symbol.toUpperCase().trim(),
      company: data.company,
      alertName: data.alertName,
      alertType: data.alertType,
      threshold: data.threshold,
      active: true,
    });

    revalidatePath("/watchlist");
    return { success: true };
  } catch (error) {
    console.error("Create alert error:", error);
    return { success: false, error: "Failed to create alert" };
  }
}

export async function deleteAlert(userId: string, alertId: string) {
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    await AlertModel.deleteOne({ _id: alertId, userId });

    revalidatePath("/watchlist");
    return { success: true };
  } catch (error) {
    console.error("Delete alert error:", error);
    return { success: false, error: "Failed to delete alert" };
  }
}

export async function getAlertsByUserId(userId: string): Promise<Alert[]> {
  if (!userId) return [];

  try {
    await connectToDatabase();
    const alerts = await AlertModel.find({ userId }).sort({ createdAt: -1 }).lean();

    return alerts.map((a) => ({
      id: String(a._id),
      symbol: a.symbol,
      company: a.company,
      alertName: a.alertName,
      currentPrice: 0,
      alertType: a.alertType,
      threshold: a.threshold,
    }));
  } catch (error) {
    console.error("Fetch alerts error:", error);
    return [];
  }
}

export async function getAlertsBySymbol(
  userId: string,
  symbol: string,
): Promise<Alert[]> {
  if (!userId) return [];

  try {
    await connectToDatabase();
    const alerts = await AlertModel.find({
      userId,
      symbol: symbol.toUpperCase().trim(),
    })
      .sort({ createdAt: -1 })
      .lean();

    return alerts.map((a) => ({
      id: String(a._id),
      symbol: a.symbol,
      company: a.company,
      alertName: a.alertName,
      currentPrice: 0,
      alertType: a.alertType,
      threshold: a.threshold,
    }));
  } catch (error) {
    console.error("Fetch alerts by symbol error:", error);
    return [];
  }
}

/**
 * Fetches every active alert, grouped by symbol. Used by the price-check cron.
 */
export async function getActiveAlertsGroupedBySymbol(): Promise<
  Record<string, Array<{ id: string; userId: string; alertType: "upper" | "lower"; threshold: number; alertName: string; company: string; symbol: string }>>
> {
  await connectToDatabase();
  const alerts = await AlertModel.find({ active: true }).lean();

  const grouped: Record<string, any[]> = {};
  for (const a of alerts) {
    if (!grouped[a.symbol]) grouped[a.symbol] = [];
    grouped[a.symbol].push({
      id: String(a._id),
      userId: a.userId,
      alertType: a.alertType,
      threshold: a.threshold,
      alertName: a.alertName,
      company: a.company,
      symbol: a.symbol,
    });
  }
  return grouped;
}

export async function markAlertTriggered(alertId: string) {
  await connectToDatabase();
  await AlertModel.updateOne(
    { _id: alertId },
    { active: false, lastTriggeredAt: new Date() },
  );
}
