/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";
import { POPULAR_STOCK_SYMBOLS } from "@/lib/constants";
import { cache } from "react";

// --- START: Added Interfaces to fix Screenshot 4 Errors ---
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
// --- END: Added Interfaces ---

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
    const range = getDateRange(5);
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) {
      throw new Error("FINNHUB API key is not configured");
    }
    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const maxArticles = 6;

    if (cleanSymbols.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

      await Promise.all(
        cleanSymbols.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
            const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
            perSymbolArticles[sym] = (articles || []).filter(validateArticle);
          } catch (e) {
            console.error("Error fetching company news for", sym, e);
            perSymbolArticles[sym] = [];
          }
        }),
      );

      const collected: MarketNewsArticle[] = [];
      for (let round = 0; round < maxArticles; round++) {
        for (let i = 0; i < cleanSymbols.length; i++) {
          const sym = cleanSymbols[i];
          const list = perSymbolArticles[sym] || [];
          if (list.length === 0) continue;
          const article = list.shift();
          if (!article || !validateArticle(article)) continue;
          collected.push(formatArticle(article, true, sym, round));
          if (collected.length >= maxArticles) break;
        }
        if (collected.length >= maxArticles) break;
      }

      if (collected.length > 0) {
        collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
        return collected.slice(0, maxArticles);
      }
    }

    const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
    const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

    const seen = new Set<string>();
    const unique: RawNewsArticle[] = [];
    for (const art of general || []) {
      if (!validateArticle(art)) continue;
      const key = `${art.id}-${art.url}-${art.headline}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(art);
      if (unique.length >= 20) break;
    }

    const formatted = unique
      .slice(0, maxArticles)
      .map((a, idx) => formatArticle(a, false, undefined, idx));
    return formatted;
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
          "Error in stock search:",
          new Error("FINNHUB API key is not configured"),
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
              // FIXED: Changed fetchJSON<any> to fetchJSON<FinnhubProfile>
              const profile = await fetchJSON<FinnhubProfile>(url, 3600);
              return { sym, profile };
            } catch (e) {
              console.error("Error fetching profile2 for", sym, e);
              return { sym, profile: null };
            }
          }),
        );

        results = profiles
          .map(({ sym, profile }) => {
            if (!profile) return undefined;
            const symbol = sym.toUpperCase();
            const name = profile.name || profile.ticker || symbol;

            const r: FinnhubSearchResult = {
              symbol,
              description: name,
              displaySymbol: symbol,
              type: "Common Stock",
            };
            // Internal hack to pass exchange through mapping
            (r as any).__exchange = profile.exchange;
            return r;
          })
          .filter((x): x is FinnhubSearchResult => Boolean(x));
      } else {
        const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
        const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
        results = Array.isArray(data?.result) ? data.result : [];
      }

      const mapped: StockWithWatchlistStatus[] = results
        .map((r) => {
          const upper = (r.symbol || "").toUpperCase();
          const name = r.description || upper;
          const exchange =
            (r as any).__exchange || (r.displaySymbol as string) || "US";
          const item: StockWithWatchlistStatus = {
            symbol: upper,
            name,
            exchange,
            type: r.type || "Stock",
            isInWatchlist: false,
          };
          return item;
        })
        .slice(0, 15);

      return mapped;
    } catch (err) {
      console.error("Error in stock search:", err);
      return [];
    }
  },
);

export async function getStockQuote(symbol: string) {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
    );
    // FIXED: Typed response as FinnhubQuote to fix L176 and L235 any errors
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
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

export async function getRandomMarketSuggestions(
  watchedSymbols: string[],
): Promise<StockWithWatchlistStatus[]> {
  try {
    const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
    if (!token) throw new Error("FINNHUB API key is not configured");

    const url = `${FINNHUB_BASE_URL}/stock/symbol?exchange=US&token=${token}`;
    // FIXED: Changed fetchJSON<any[]> to fetchJSON<FinnhubStockSymbol[]>
    const allStocks = await fetchJSON<FinnhubStockSymbol[]>(url, 86400);

    const uppercaseWatched = watchedSymbols.map((s) => s.toUpperCase());

    const available = allStocks.filter(
      (s) =>
        s.type === "Common Stock" &&
        !uppercaseWatched.includes(s.symbol.toUpperCase()),
    );

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10).map((s) => ({
      symbol: s.symbol,
      name: s.description || s.displaySymbol,
      exchange: "US",
      type: s.type,
      isInWatchlist: false,
    }));

    return selected;
  } catch (err) {
    console.error("getRandomMarketSuggestions error:", err);
    return [];
  }
}
