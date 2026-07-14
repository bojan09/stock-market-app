"use client";

import React, { memo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";

interface TradingViewWidgetProps {
  title?: string;
  scriptUrl: string;
  config: Record<string, any>;
  height?: number;
  autoHeight?: boolean;
  className?: string;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewWidget = ({
  title,
  scriptUrl,
  config,
  height = 600,
  className,
}: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = React.useId().replace(/:/g, "");

  useEffect(() => {
    if (!containerRef.current) return;

    const isAdvanced = scriptUrl.includes("tv.js");
    const containerElementId = `tv-widget-${widgetId}`;

    // Clean up previous content to prevent duplicate widgets
    containerRef.current.innerHTML = "";

    if (isAdvanced) {
      const loadAdvancedWidget = () => {
        if (window.TradingView && document.getElementById(containerElementId)) {
          new window.TradingView.widget({
            ...config,
            container_id: containerElementId,
            width: "100%",
            height: height,
            autosize: true,
            save_image: true,
            hide_side_toolbar: false,
            remember_last_used_tool: true,
            enable_publishing: false,
            allow_symbol_change: true,
            theme: "dark",
            // --- PERSISTENCE LOGIC ---
            // user_id tells the widget to store data per user in IndexedDB
            user_id: "signalist_default_user",
            // settings_adapter forces the widget to use the browser's localStorage
            settings_adapter: {
              initialSettings: {},
              setValue: (key: string, value: string) => {
                localStorage.setItem(key, value);
              },
              removeValue: (key: string) => {
                localStorage.removeItem(key);
              },
            },
          });
        }
      };

      if (!document.getElementById("tradingview-advanced-script")) {
        const script = document.createElement("script");
        script.id = "tradingview-advanced-script";
        script.src = scriptUrl;
        script.async = true;
        script.onload = loadAdvancedWidget;
        document.head.appendChild(script);
      } else {
        loadAdvancedWidget();
      }
    } else {
      const widgetContainer = document.createElement("div");
      widgetContainer.className = "tradingview-widget-container__widget";

      const script = document.createElement("script");
      script.src = scriptUrl;
      script.type = "text/javascript";
      script.async = true;

      const sanitizedConfig = {
        ...config,
        width: "100%",
        height: height,
      };

      script.innerHTML = JSON.stringify(sanitizedConfig);

      containerRef.current.appendChild(widgetContainer);
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [scriptUrl, config, height, widgetId]);

  const handleFullScreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  return (
    <div className="w-full group">
      {(title || isFinite(height)) && (
        <div className="flex items-center justify-between mb-4 px-1">
          {title && (
            <h3 className="font-bold text-xl tracking-tight text-white italic uppercase">
              {title}
            </h3>
          )}
          {height > 100 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFullScreen}
                aria-label={title ? `Expand ${title} to fullscreen` : "Expand to fullscreen"}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 transition-all text-gray-400"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <div
        id={`tv-widget-${widgetId}`}
        ref={containerRef}
        className={cn(
          "tradingview-widget-container rounded-2xl overflow-hidden border border-white/5 bg-[#0F1420] shadow-2xl",
          className,
        )}
        style={{ height }}
      />
    </div>
  );
};

export default memo(TradingViewWidget);
