"use client";
import { useEffect, useState } from "react";
import { getStockQuote } from "@/lib/actions/finnhub.actions";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function WatchlistCard({ symbol }: { symbol: string }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getStockQuote(symbol).then(setData);
  }, [symbol]);

  if (!data)
    return <div className="h-24 bg-[#1A1D23] animate-pulse rounded-2xl" />;

  const isPositive = data.dp >= 0;

  return (
    <div className="bg-[#1A1D23] p-5 rounded-2xl flex justify-between items-center border border-gray-800/50 hover:bg-[#1E2229] transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#262A31] rounded-xl flex items-center justify-center font-bold text-gray-300">
          {symbol[0]}
        </div>
        <div>
          <h4 className="font-bold text-white text-lg">{symbol}</h4>
          <p className="text-gray-500 text-xs">Market Price</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-white text-xl">${data.c?.toFixed(2)}</p>
        <div
          className={`flex items-center gap-1 justify-end font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(data.dp).toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}
