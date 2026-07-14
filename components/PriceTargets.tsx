import React from "react";
import { Target, TrendingUp, TrendingDown, Info } from "lucide-react";

interface PriceTargetProps {
  data: {
    high?: number;
    low?: number;
    median?: number;
    current?: number;
    upside?: string;
    noData?: boolean;
  } | null;
}

export default function PriceTargets({ data }: PriceTargetProps) {
  // 1. Check if data exists or if the noData flag is set
  // 2. ALSO check if the core numbers exist before trying to render
  if (
    !data ||
    data.noData ||
    data.median === undefined ||
    data.current === undefined
  ) {
    return (
      <div className="bg-[#0F1420] rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center min-h-[160px] text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <Info className="w-5 h-5 text-gray-500" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Price Targets
          </p>
          <p className="text-[10px] text-gray-500 font-medium px-4">
            Analyst target data is currently unavailable for this symbol.
          </p>
        </div>
      </div>
    );
  }

  const isPositive = parseFloat(data.upside || "0") > 0;
  const high = data.high || 0;
  const low = data.low || 0;
  const median = data.median || 0;
  const current = data.current || 0;

  const range = high - low;
  const currentPos = range !== 0 ? ((current - low) / range) * 100 : 50;
  const markerPos = Math.min(Math.max(currentPos, 0), 100);

  return (
    <div className="bg-[#0F1420] rounded-2xl border border-white/5 p-6 space-y-6 shadow-xl">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          Price Targets
        </h3>
        <div
          className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-rose-500/10 text-rose-400"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {data.upside}% {isPositive ? "UPSIDE" : "DOWNSIDE"}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
              Median Target
            </p>
            <p className="text-2xl font-black">${median.toFixed(2)}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
              Current Price
            </p>
            <p className="text-lg font-bold text-indigo-400">
              ${current.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="relative pt-6 pb-2">
          <div className="h-1.5 w-full bg-white/10 rounded-full relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-white/30 rounded-full z-10"
              style={{
                left: `${range !== 0 ? ((median - low) / range) * 100 : 50}%`,
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group z-20"
              style={{ left: `${markerPos}%` }}
            >
              <div className="w-3.5 h-3.5 bg-indigo-500 rounded-full border-2 border-[#0F1420] shadow-[0_0_12px_rgba(99, 102, 241,0.6)]" />
              <span className="absolute -top-6 text-[9px] font-black text-white bg-indigo-600 px-1.5 py-0.5 rounded shadow-lg">
                NOW
              </span>
            </div>
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <span>Low: ${low.toFixed(2)}</span>
            <span>High: ${high.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
