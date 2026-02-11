/**
 * Fetches the most recent insider transactions for a given symbol.
 */
export async function getInsiderTransactions(symbol: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const upperSymbol = symbol.toUpperCase();
    const url = `https://finnhub.io/api/v1/stock/insider-transactions?symbol=${upperSymbol}&token=${apiKey}`;

    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.json();

    if (!data || !data.data || !Array.isArray(data.data)) return [];

    return data.data.slice(0, 10).map((tx: any) => ({
      name: tx.name || "Unknown Insider",
      share: tx.share || 0,
      change: tx.change || 0,
      price: tx.transactionPrice || 0,
      date: tx.transactionDate || "N/A",
      filingDate: tx.filingDate || "N/A",
      isBuy: tx.change > 0,
    }));
  } catch (error) {
    console.error("Insider Transaction Error:", error);
    return [];
  }
}

/**
 * Fetches analyst price targets and current price.
 */
export async function getPriceTargets(symbol: string) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    const upperSymbol = symbol.toUpperCase();

    const [targetRes, quoteRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/stock/price-target?symbol=${upperSymbol}&token=${apiKey}`,
        { next: { revalidate: 86400 } },
      ),
      fetch(
        `https://finnhub.io/api/v1/quote?symbol=${upperSymbol}&token=${apiKey}`,
        { next: { revalidate: 3600 } },
      ),
    ]);

    const targetData = await targetRes.json();
    const quoteData = await quoteRes.json();

    // Check if targetData actually has the expected fields
    if (
      !targetData ||
      !targetData.targetMedian ||
      targetData.targetMedian === 0
    ) {
      return { noData: true };
    }

    const currentPrice = quoteData.c || 0;
    const targetMedian = targetData.targetMedian;

    // Calculate upside safely
    const upsideValue =
      currentPrice > 0
        ? ((targetMedian - currentPrice) / currentPrice) * 100
        : 0;

    return {
      high: targetData.targetHigh,
      low: targetData.targetLow,
      median: targetData.targetMedian,
      current: currentPrice,
      upside: upsideValue.toFixed(2),
    };
  } catch (error) {
    console.error("Price Target Error:", error);
    return { noData: true };
  }
}
