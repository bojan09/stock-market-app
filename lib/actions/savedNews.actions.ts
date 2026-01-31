"use server";

import { connectToDatabase } from "@/database/mongoose";
import { SavedNews } from "@/database/models/savedNews.model";
import { revalidatePath } from "next/cache";

export async function toggleSaveNews(userId: string, article: any) {
  try {
    await connectToDatabase();

    const existing = await SavedNews.findOne({
      userId,
      articleId: String(article.id),
    });

    if (existing) {
      await SavedNews.deleteOne({ _id: existing._id });
      revalidatePath("/news");
      return { saved: false };
    } else {
      await SavedNews.create({
        userId,
        articleId: String(article.id),
        headline: article.headline,
        summary: article.summary,
        url: article.url,
        image: article.image,
        source: article.source,
        datetime: article.datetime,
        category: article.category,
      });
      revalidatePath("/news");
      return { saved: true };
    }
  } catch (error) {
    console.error("Error toggling saved news:", error);
    return { error: "Failed to update bookmark" };
  }
}

export async function getSavedNewsIds(userId: string) {
  try {
    await connectToDatabase();
    const saved = await SavedNews.find({ userId }).select("articleId").lean();
    return saved.map((s) => s.articleId);
  } catch (error) {
    return [];
  }
}

export async function getSavedArticles(userId: string) {
  try {
    await connectToDatabase();
    const saved = await SavedNews.find({ userId }).sort({ savedAt: -1 }).lean();
    // Map articleId to id so the UI remains consistent
    return saved.map((s: any) => ({
      ...s,
      id: s.articleId,
      _id: s._id.toString(),
    }));
  } catch (error) {
    return [];
  }
}
