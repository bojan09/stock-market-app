"use server";

export interface EconomicEvent {
  event: string;
  country: string;
  unit: string;
  actual: number | null;
  prev: number | null;
  forecast: number | null;
  time: string;
  impact: "low" | "medium" | "high";
  isRateLimited?: boolean;
}

// --- ADD THIS FUNCTION ---
export async function getMockEconomicCalendar(): Promise<EconomicEvent[]> {
  return [
    {
      event: "Non-Farm Payrolls",
      country: "USA",
      unit: "K",
      actual: 225,
      forecast: 180,
      prev: 150,
      time: new Date().toISOString(),
      impact: "high",
    },
    {
      event: "CPI MoM",
      country: "USA",
      unit: "%",
      actual: 0.3,
      forecast: 0.4,
      prev: 0.2,
      time: new Date().toISOString(),
      impact: "high",
    },
    {
      event: "Interest Rate Decision",
      country: "EU",
      unit: "%",
      actual: 4.25,
      forecast: 4.25,
      prev: 4.0,
      time: new Date().toISOString(),
      impact: "high",
    },
    {
      event: "GDP Growth Rate",
      country: "UK",
      unit: "%",
      actual: 0.1,
      forecast: 0.2,
      prev: 0.3,
      time: new Date().toISOString(),
      impact: "high",
    },
    {
      event: "Unemployment Rate",
      country: "CAN",
      unit: "%",
      actual: 5.4,
      forecast: 5.6,
      prev: 5.5,
      time: new Date().toISOString(),
      impact: "medium",
    },
  ];
}

const ALPHA_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

export async function getEconomicCalendar(): Promise<EconomicEvent[]> {
  if (!ALPHA_KEY) return [];
  // ... (rest of your existing Alpha Vantage logic)
  const url = `https://www.alphavantage.co/query?function=ECONOMIC_CALENDAR&apikey=${ALPHA_KEY}`;
  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    const data = await response.text();
    if (
      data.includes("standard API call frequency") ||
      data.includes("Rate Limit")
    ) {
      return [{ isRateLimited: true } as any];
    }
    const rows = data.split("\n");
    const events: EconomicEvent[] = rows
      .slice(1)
      .map((row) => {
        const cols = row.split(",");
        if (cols.length < 5) return null;
        return {
          time: cols[0],
          event: cols[1],
          country: cols[2],
          unit: "",
          actual: cols[3] && cols[3] !== "None" ? parseFloat(cols[3]) : null,
          forecast: cols[4] && cols[4] !== "None" ? parseFloat(cols[4]) : null,
          prev: null,
          impact: "high",
        } as EconomicEvent;
      })
      .filter((e): e is EconomicEvent => e !== null);
    return events.slice(0, 8); // Showing more for scroll testing
  } catch (error) {
    return [];
  }
}
