import React from "react";
import { BarChart3, Info } from "lucide-react";

interface AnalystData {
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  period: string;
}

export default function AnalystConsensus({
  data,
}: {
  data: AnalystData | null;
}) {
  if (!data) return null;

  const total =
    data.strongBuy + data.buy + data.hold + data.sell + data.strongSell;
  const getWidth = (val: number) => (total > 0 ? (val / total) * 100 : 0);

  // Determine Consensus Label and Color
  const buySide = data.strongBuy + data.buy;
  const sellSide = data.sell + data.strongSell;
  const consensus =
    buySide > sellSide ? "BUY" : buySide === sellSide ? "HOLD" : "SELL";
  const consensusColor =
    consensus === "BUY"
      ? "text-green-400"
      : consensus === "SELL"
        ? "text-red-400"
        : "text-yellow-400";

  return (
    <div className="relative group bg-[#1A1D23] rounded-2xl border border-white/5 p-6 space-y-6 shadow-2xl transition-all hover:border-white/10">
      {/* Decorative Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
            Market Sentiment
          </h3>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-black tracking-tighter ${consensusColor}`}
            >
              {consensus}
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">
              Consensus
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] text-blue-400/80 font-black bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-full backdrop-blur-md">
            {data.period}
          </span>
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
              Live Feed
            </span>
          </div>
        </div>
      </div>

      {/* Distribution Bar with Glass segments */}
      <div className="relative space-y-2">
        <div className="h-2 w-full flex rounded-full overflow-hidden bg-white/5 gap-[2px]">
          <div
            style={{ width: `${getWidth(data.strongBuy)}%` }}
            className="bg-green-600 transition-all duration-500 hover:brightness-125"
          />
          <div
            style={{ width: `${getWidth(data.buy)}%` }}
            className="bg-green-400 transition-all duration-500 hover:brightness-125"
          />
          <div
            style={{ width: `${getWidth(data.hold)}%` }}
            className="bg-yellow-500 transition-all duration-500 hover:brightness-125"
          />
          <div
            style={{ width: `${getWidth(data.sell)}%` }}
            className="bg-red-400 transition-all duration-500 hover:brightness-125"
          />
          <div
            style={{ width: `${getWidth(data.strongSell)}%` }}
            className="bg-red-600 transition-all duration-500 hover:brightness-125"
          />
        </div>
        <div className="flex justify-between px-1">
          <span className="text-[9px] font-bold text-gray-600 uppercase">
            Bearish
          </span>
          <span className="text-[9px] font-bold text-gray-600 uppercase">
            Bullish
          </span>
        </div>
      </div>

      {/* Grid Stats with Modern Borders */}
      <div className="grid grid-cols-3 gap-3">
        <Stat
          label="Buy"
          value={buySide}
          color="bg-green-500"
          glow="shadow-[0_0_8px_rgba(34,197,94,0.3)]"
        />
        <Stat
          label="Hold"
          value={data.hold}
          color="bg-yellow-500"
          glow="shadow-[0_0_8px_rgba(234,179,8,0.2)]"
        />
        <Stat
          label="Sell"
          value={sellSide}
          color="bg-red-500"
          glow="shadow-[0_0_8px_rgba(239,68,68,0.3)]"
        />
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-white/5 flex items-center gap-2">
        <Info className="w-3 h-3 text-gray-600" />
        <p className="text-[9px] text-gray-600 font-medium">
          Based on aggregate analyst surveys from the last 30 days.
        </p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  glow,
}: {
  label: string;
  value: number;
  color: string;
  glow: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center transition-all hover:bg-white/[0.04] hover:border-white/10 group/stat">
      <div className="flex items-center gap-1.5 mb-1">
        <div
          className={`w-1.5 h-1.5 rounded-full ${color} ${glow} group-hover/stat:scale-125 transition-transform`}
        />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <span className="text-lg font-black text-white tabular-nums tracking-tight">
        {value}
      </span>
    </div>
  );
}
