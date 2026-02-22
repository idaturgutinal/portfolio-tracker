"use client";

import { memo, useEffect, useRef } from "react";

interface Props {
  symbol: string;
}

function TradingViewChartInner({ symbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function getTheme() {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    }

    function createWidget() {
      if (!container) return;
      container.innerHTML = "";

      const script = document.createElement("script");
      script.src =
        "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        width: "100%",
        height: "100%",
        symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: getTheme(),
        style: "1",
        locale: "en",
        allow_symbol_change: true,
        calendar: false,
        studies: ["STD;MACD", "STD;RSI"],
        hide_volume: false,
        support_host: "https://www.tradingview.com",
      });

      const widgetDiv = document.createElement("div");
      widgetDiv.className = "tradingview-widget-container__widget";
      widgetDiv.style.height = "100%";
      widgetDiv.style.width = "100%";

      container.appendChild(widgetDiv);
      container.appendChild(script);
    }

    createWidget();

    // Re-create widget when theme changes
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.type === "attributes" &&
          m.attributeName === "class"
        ) {
          createWidget();
          break;
        }
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      if (container) container.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div
      className="tradingview-widget-container rounded-lg border overflow-hidden"
      ref={containerRef}
      style={{ height: "70vh", minHeight: "500px" }}
    />
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
