"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { unstable_cache } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

async function fetchAiSummary(articles: any[]) {
  if (!articles || articles.length === 0) return null;

  const headlines = articles
    .slice(0, 10)
    .map((a) => a.headline)
    .join("\n");

  const prompt = `
    Analyze these market headlines:
    ${headlines}
    Return ONLY JSON: {"summary": "one sentence summary", "score": number 0-100}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.warn("AI Quota hit or API error. Falling back to null.");
    return null;
  }
}

export async function getAiMarketSummary(articles: any[]) {
  if (!articles.length) return null;

  const cacheKey = articles[0].id || "market-news";

  try {
    return await unstable_cache(
      async () => fetchAiSummary(articles),
      [`market-summary-${cacheKey}`],
      { revalidate: 3600 },
    )();
  } catch (e) {
    return null; // Ensure we never crash the page
  }
}

async function fetchNewsTakeaway(
  headline: string,
  summary: string,
  symbol: string,
): Promise<string | null> {
  const prompt = `
    Headline: ${headline}
    Summary: ${summary || "(no summary)"}

    In one short plain-English sentence (under 20 words), explain why this
    news matters specifically for an investor tracking ${symbol}. Do not
    give financial advice or predictions -- just explain the relevance.
    Return ONLY the sentence, no quotes, no markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.warn("News takeaway generation failed:", error);
    return null;
  }
}

export async function getNewsTakeaway(
  articleId: string,
  headline: string,
  summary: string,
  symbol: string,
): Promise<string | null> {
  try {
    return await unstable_cache(
      async () => fetchNewsTakeaway(headline, summary, symbol),
      [`news-takeaway-${articleId}-${symbol}`],
      { revalidate: 86400 },
    )();
  } catch (e) {
    return null;
  }
}
