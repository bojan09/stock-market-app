"use server";

import { connectToDatabase } from "@/database/mongoose";
import { PushSubscription } from "@/database/models/pushSubscription.model";
import { requireUser } from "@/lib/actions/session-guard";

export async function saveSubscription(
  userId: string,
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
) {
  const verifiedUserId = await requireUser(userId);
  if (!verifiedUserId) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    await PushSubscription.updateOne(
      { userId: verifiedUserId, endpoint: subscription.endpoint },
      {
        $setOnInsert: {
          userId: verifiedUserId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    return { success: true };
  } catch (error) {
    console.error("Save push subscription error:", error);
    return { success: false, error: "Failed to save subscription" };
  }
}

export async function removeSubscription(userId: string, endpoint: string) {
  const verifiedUserId = await requireUser(userId);
  if (!verifiedUserId) return { success: false, error: "Unauthorized" };

  try {
    await connectToDatabase();
    await PushSubscription.deleteOne({ userId: verifiedUserId, endpoint });
    return { success: true };
  } catch (error) {
    console.error("Remove push subscription error:", error);
    return { success: false, error: "Failed to remove subscription" };
  }
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const verifiedUserId = await requireUser(userId);
  if (!verifiedUserId) return false;

  try {
    await connectToDatabase();
    const count = await PushSubscription.countDocuments({
      userId: verifiedUserId,
    });
    return count > 0;
  } catch (error) {
    console.error("Check push subscription error:", error);
    return false;
  }
}

/**
 * Trusted, server-only lookup for the alert-check cron -- not exposed
 * to any client component, so it does not need the requireUser guard.
 */
export async function getSubscriptionsByUserId(userId: string) {
  try {
    await connectToDatabase();
    const subs = await PushSubscription.find({ userId }).lean();
    return subs.map((s: any) => ({
      endpoint: s.endpoint,
      keys: { p256dh: s.p256dh, auth: s.auth },
    }));
  } catch (error) {
    console.error("Fetch push subscriptions error:", error);
    return [];
  }
}
