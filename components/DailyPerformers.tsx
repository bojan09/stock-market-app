"use client";

import React, { memo } from "react";
import TradingViewWidget from "./TradingViewWidget";

interface DailyPerformersProps {
  symbols: { s: string; d: string }[];
}

const DailyPerformers = ({ symbols }: DailyPerformersProps) => {
  if (!symbols || symbols.length === 0) return null;

  const config = {
    symbols: symbols.map((item) => ({
      proName: item.s,
      title: item.d,
    })),
    colorTheme: "dark",
    isTransparent: true,
    displayMode: "adaptive", // Adaptive mode fits better in tight header spaces
    locale: "en",
    showSymbolLogo: true,
  };

  return (
    /* The container now uses flex and overflow-hidden to fit the red-lined area precisely */
    <div className="w-full h-full flex flex-col justify-center">
      <div className="bg-gray-900/40 border border-white/5 rounded-xl md:rounded-2xl p-2 md:p-4 backdrop-blur-md overflow-hidden">
        <div className="flex flex-col gap-1 md:gap-2">
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold px-1">
            Watchlist Performance
          </p>
          {/* Compact height to prevent vertical bloat in the header */}
          <div className="h-[40px] md:h-[50px] w-full">
            <TradingViewWidget
              scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
              config={config}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(DailyPerformers);
