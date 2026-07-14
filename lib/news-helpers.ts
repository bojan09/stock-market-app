export const findTickers = (text: string): string[] => {
  const matches = text.match(/\b[A-Z]{2,5}\b/g);
  return matches
    ? Array.from(new Set(matches)).filter(
        (t) =>
          !["NEWS", "USA", "FED", "CEO", "AI", "USD", "ETF", "SEC"].includes(t),
      )
    : [];
};

export const getRelatedTickers = (
  article: { related?: string; headline: string; summary?: string },
  watchedSymbols: string[],
) => {
  const fromField = String(article.related || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const fromText = findTickers(`${article.headline} ${article.summary || ""}`);

  const combined = Array.from(new Set([...fromField, ...fromText]));

  return combined
    .map((symbol) => ({ symbol, isWatched: watchedSymbols.includes(symbol) }))
    .sort((a, b) => Number(b.isWatched) - Number(a.isWatched))
    .slice(0, 4);
};
