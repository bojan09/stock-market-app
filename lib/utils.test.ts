import { describe, it, expect } from "vitest";
import {
  cn,
  formatTimeAgo,
  formatMarketCapValue,
  formatChangePercent,
  formatPrice,
  getTradingViewSymbol,
} from "./utils";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});

describe("formatTimeAgo", () => {
  it("formats minutes ago", () => {
    const tenMinutesAgo = Math.floor(Date.now() / 1000) - 10 * 60;
    expect(formatTimeAgo(tenMinutesAgo)).toBe("10 minutes ago");
  });

  it("formats hours ago", () => {
    const threeHoursAgo = Math.floor(Date.now() / 1000) - 3 * 60 * 60;
    expect(formatTimeAgo(threeHoursAgo)).toBe("3 hours ago");
  });

  it("formats days ago", () => {
    const twoDaysAgo = Math.floor(Date.now() / 1000) - 50 * 60 * 60;
    expect(formatTimeAgo(twoDaysAgo)).toBe("2 days ago");
  });
});

describe("formatMarketCapValue", () => {
  it("formats trillions", () => {
    expect(formatMarketCapValue(3.1e12)).toBe("$3.10T");
  });

  it("formats billions", () => {
    expect(formatMarketCapValue(900e9)).toBe("$900.00B");
  });

  it("formats millions", () => {
    expect(formatMarketCapValue(25e6)).toBe("$25.00M");
  });

  it("formats sub-million values as plain USD", () => {
    expect(formatMarketCapValue(999999.99)).toBe("$999999.99");
  });

  it("returns N/A for invalid input", () => {
    expect(formatMarketCapValue(0)).toBe("N/A");
    expect(formatMarketCapValue(-5)).toBe("N/A");
    expect(formatMarketCapValue(NaN)).toBe("N/A");
  });
});

describe("formatChangePercent", () => {
  it("adds a plus sign for positive change", () => {
    expect(formatChangePercent(1.234)).toBe("+1.23%");
  });

  it("keeps the minus sign for negative change", () => {
    expect(formatChangePercent(-2.5)).toBe("-2.50%");
  });

  it("returns empty string for zero or undefined", () => {
    expect(formatChangePercent(0)).toBe("");
    expect(formatChangePercent(undefined)).toBe("");
  });
});

describe("formatPrice", () => {
  it("formats a number as USD currency", () => {
    expect(formatPrice(1234.5)).toBe("$1,234.50");
  });
});

describe("getTradingViewSymbol", () => {
  it("passes through symbols that already have an exchange prefix", () => {
    expect(getTradingViewSymbol("NYSE:V")).toBe("NYSE:V");
  });

  it("maps known NYSE tickers to the NYSE exchange", () => {
    expect(getTradingViewSymbol("orcl")).toBe("NYSE:ORCL");
    expect(getTradingViewSymbol("V")).toBe("NYSE:V");
  });

  it("maps SPY to AMEX", () => {
    expect(getTradingViewSymbol("spy")).toBe("AMEX:SPY");
  });

  it("defaults unknown tickers to NASDAQ", () => {
    expect(getTradingViewSymbol("aapl")).toBe("NASDAQ:AAPL");
  });
});
