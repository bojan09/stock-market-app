import { describe, it, expect } from "vitest";
import { findTickers, getRelatedTickers } from "./news-helpers";

describe("findTickers", () => {
  it("extracts all-caps ticker-shaped words from text", () => {
    expect(findTickers("AAPL and MSFT both rose today")).toEqual([
      "AAPL",
      "MSFT",
    ]);
  });

  it("filters out common false-positive acronyms", () => {
    const result = findTickers("The FED and CEO discussed AI and USD policy");
    expect(result).toEqual([]);
  });

  it("dedupes repeated mentions", () => {
    expect(findTickers("AAPL rose. Later, AAPL rose again.")).toEqual([
      "AAPL",
    ]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(findTickers("the market moved sideways")).toEqual([]);
  });
});

describe("getRelatedTickers", () => {
  it("prefers the related field over regex-extracted tickers", () => {
    const article = { headline: "Some headline", related: "AAPL,MSFT" };
    const result = getRelatedTickers(article, []);
    expect(result.map((t) => t.symbol)).toEqual(
      expect.arrayContaining(["AAPL", "MSFT"]),
    );
  });

  it("marks tickers the user actually watches as isWatched", () => {
    const article = { headline: "AAPL and GOOG move", related: "" };
    const result = getRelatedTickers(article, ["AAPL"]);

    const aapl = result.find((t) => t.symbol === "AAPL");
    const goog = result.find((t) => t.symbol === "GOOG");

    expect(aapl?.isWatched).toBe(true);
    expect(goog?.isWatched).toBe(false);
  });

  it("sorts watched tickers first", () => {
    const article = { headline: "GOOG and AAPL both moved", related: "" };
    const result = getRelatedTickers(article, ["AAPL"]);

    expect(result[0].symbol).toBe("AAPL");
    expect(result[0].isWatched).toBe(true);
  });

  it("caps the result at 4 tickers", () => {
    const article = {
      headline: "AAAA BBBB CCCC DDDD EEEE all moved",
      related: "",
    };
    const result = getRelatedTickers(article, []);
    expect(result.length).toBeLessThanOrEqual(4);
  });
});
