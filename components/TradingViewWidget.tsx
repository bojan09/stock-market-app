"use client";

import React, { memo } from "react";
import useTradingViewWidget from "@/hooks/useTradingViewWidget";
import { cn } from "@/lib/utils";

interface TradingViewWidgetProps {
  title?: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  height?: number;
  className?: string;
}

const TradingViewWidget = ({
  title,
  scriptUrl,
  config,
  height = 600,
  className,
}: TradingViewWidgetProps) => {
  // Ensure the widget itself uses your theme color if the config allows
  const themedConfig = {
    ...config,
    backgroundColor: "#16191F",
    gridColor: "rgba(255, 255, 255, 0.05)",
  };

  const containerRef = useTradingViewWidget(scriptUrl, themedConfig, height);

  return (
    <div className="w-full">
      {title && (
        <h3 className="font-bold text-xl tracking-tight text-white mb-5">
          {title}
        </h3>
      )}

      <div
        className={cn(
          "tradingview-widget-container rounded-2xl overflow-hidden border border-white/5 bg-[#16191F]",
          "custom-sidebar-scrollbar", // Applying your custom scrollbar look
          className,
        )}
        ref={containerRef}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{ height, width: "100%" }}
        />
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
