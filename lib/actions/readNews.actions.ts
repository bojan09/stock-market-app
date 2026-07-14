"use server";

import { connectToDatabase } from "@/database/mongoose";
import { ReadNews } from "@/database/models/readNews.model";
import { requireUser } from "@/lib/actions/session-guard";
import { getWatchlistNews } from "@/lib/actions/news.actions";

export async function markArticleRead(userId: string, articleId: string) {
  const verifiedUserId = await requireUser(userId);
  if (!verifiedUserId || !articleId) return { success: false };

  try {
    await connectToDatabase();
    await ReadNews.updateOne(
      { userId: verifiedUserId, articleId },
      { $setOnInsert: { userId: verifiedUserId, articleId, readAt: new Date() } },
      { upsert: true },
    );
    return { success: true };
  } catch (error) {
    console.error("Mark article read error:", error);
    return { success: false };
  }
}

export async function getReadArticleIds(userId: string): Promise<string[]> {
  const verifiedUserId = await requireUser(userId);
  if (!verifiedUserId) return [];

  try {
    await connectToDatabase();
    const read = await ReadNews.find({ userId: verifiedUserId })
      .select("articleId")
      .lean();
    return read.map((r: any) => r.articleId);
  } catch (error) {
    console.error("Fetch read article ids error:", error);
    return [];
  }
}

/**
 * Cheap-ish unread count for the nav badge: reuses the already-cached
 * watchlist news fetch (revalidated every few minutes at the Finnhub
 * layer) rather than issuing a fresh network call per page load.
 */
export async function getUnreadNewsCount(userId: string): Promise<number> {
  const verifiedUserId = await requireUser(userId);
  if (!verifiedUserId) return 0;

  try {
    const [newsData, readIds] = await Promise.all([
      getWatchlistNews(verifiedUserId),
      getReadArticleIds(verifiedUserId),
    ]);

    if (!newsData.success) return 0;

    const readSet = new Set(readIds);
    return newsData.articles.filter(
      (a: any) => !readSet.has(String(a.id || a.articleId)),
    ).length;
  } catch (error) {
    console.error("Unread news count error:", error);
    return 0;
  }
}
