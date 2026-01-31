/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";
import { POPULAR_STOCK_SYMBOLS } from "@/lib/constants";
import { cache } from "react";

interface FinnhubProfile {
  name?: string;
  ticker?: string;
  exchange?: string;
  logo?: string;
  weburl?: string;
  industry?: string;
}

interface FinnhubStockSymbol {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
  currency: string;
}

interface FinnhubQuote {
  c: number; // Current price
  h: number; // High price
  l: number; // Low price
  o: number; // Open price
  pc: number; // Previous close
  d: number; // Change
  dp: number; // Percent change
}

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const NEXT_PUBLIC_FINNHUB_API_KEY =
  process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? "";

async function fetchJSON<T>(
  url: string,
  revalidateSeconds?: number,
): Promise<T> {
  const options: RequestInit & { next?: { revalidate?: number } } =
    revalidateSeconds
      ? { cache: "force-cache", next: { revalidate: revalidateSeconds } }
      : { cache: "no-store" };

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch failed ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export { fetchJSON };

export async function getNews(
  symbols?: string[],
): Promise<MarketNewsArticle[]> {
  try {
    const range = getDateRange(7); // Increased to 7 days for more depth
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      throw new Error("FINNHUB API key is not configured");
    }
    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const maxArticles = 48; // Increased limit
    const collectedRaw: (RawNewsArticle & { symbol?: string })[] = [];

    // 1. Fetch Company Specific News (if symbols exist)
    if (cleanSymbols.length > 0) {
      const limitedSymbols = cleanSymbols.slice(0, 8); // Avoid rate limit
      await Promise.all(
        limitedSymbols.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
            const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
            if (articles) {
              articles.forEach((a) => {
                if (validateArticle(a)) {
                  collectedRaw.push({ ...a, symbol: sym });
                }
              });
            }
          } catch (e) {
            console.error("Error fetching company news for", sym);
          }
        }),
      );
    }

    // 2. Fetch General News
    const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
    const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);
    if (general) {
      general.forEach((a) => {
        if (validateArticle(a)) collectedRaw.push(a);
      });
    }

    // 3. STRICT DEDUPLICATION
    const uniqueMap = new Map<string, MarketNewsArticle>();

    // Sort by date first so we keep the freshest version of a duplicate
    collectedRaw.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));

    collectedRaw.forEach((raw, index) => {
      const id = String(raw.id || raw.url);
      if (!uniqueMap.has(id)) {
        uniqueMap.set(id, formatArticle(raw, !!raw.symbol, raw.symbol, index));
      }
    });

    const finalArticles = Array.from(uniqueMap.values());

    // 4. Subtle Shuffling of the top batch to break up source clusters (e.g. Yahoo)
    const topBatch = finalArticles.slice(0, 12).sort(() => Math.random() - 0.5);
    const result = [...topBatch, ...finalArticles.slice(12)];

    return result.slice(0, maxArticles);
  } catch (err) {
    console.error("getNews error:", err);
    throw new Error("Failed to fetch news");
  }
}

export const searchStocks = cache(
  async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
      const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
      if (!token) {
        console.error(
          "Error in stock search: FINNHUB API key is not configured",
        );
        return [];
      }

      const trimmed = typeof query === "string" ? query.trim() : "";
      let results: FinnhubSearchResult[] = [];

      if (!trimmed) {
        const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
        const profiles = await Promise.all(
          top.map(async (sym) => {
            try {
              const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
              const profile = await fetchJSON<FinnhubProfile>(url, 3600);
              return { sym, profile };
            } catch (e) {
              return { sym, profile: null };
            }
          }),
        );

        results = profiles
          .map(({ sym, profile }) => {
            if (!profile) return undefined;
            const symbol = sym.toUpperCase();
            return {
              symbol,
              description: profile.name || symbol,
              displaySymbol: symbol,
              type: "Common Stock",
              __exchange: profile.exchange,
            } as any;
          })
          .filter((x): x is FinnhubSearchResult => Boolean(x));
      } else {
        const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
        const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
        results = Array.isArray(data?.result) ? data.result : [];
      }

      return results
        .map((r) => ({
          symbol: (r.symbol || "").toUpperCase(),
          name: r.description || r.symbol,
          exchange: (r as any).__exchange || r.displaySymbol || "US",
          type: r.type || "Stock",
          isInWatchlist: false,
        }))
        .slice(0, 15);
    } catch (err) {
      return [];
    }
  },
);

export async function getStockQuote(symbol: string) {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    const response = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol.toUpperCase()}&token=${token}`,
    );
    const data: FinnhubQuote = await response.json();
    return {
      current: data.c,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      change: data.d,
      percentChange: data.dp,
    };
  } catch (error) {
    return null;
  }
}

export async function getRandomMarketSuggestions(
  watchedSymbols: string[],
): Promise<StockWithWatchlistStatus[]> {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    const url = `${FINNHUB_BASE_URL}/stock/symbol?exchange=US&token=${token}`;
    const allStocks = await fetchJSON<FinnhubStockSymbol[]>(url, 86400);

    const uppercaseWatched = watchedSymbols.map((s) => s.toUpperCase());

    const available = allStocks.filter(
      (s) =>
        s.type === "Common Stock" &&
        !uppercaseWatched.includes(s.symbol.toUpperCase()),
    );

    return [...available]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10)
      .map((s) => ({
        symbol: s.symbol,
        name: s.description || s.displaySymbol,
        exchange: "US",
        type: s.type,
        isInWatchlist: false,
      }));
  } catch (err) {
    return [];
  }
}
