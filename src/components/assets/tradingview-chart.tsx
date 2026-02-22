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
      const rect = container.getBoundingClientRect();
      const h = Math.max(Math.round(rect.height), 600);

      script.innerHTML = JSON.stringify({
        width: Math.round(rect.width),
        height: h,
        symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: getTheme(),
        style: "1",
        locale: "en",
        allow_symbol_change: true,
        calendar: false,
        studies: [],
        hide_volume: true,
        support_host: "https://www.tradingview.com",
      });

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

    // Re-create on window resize (debounced)
    let resizeTimer: ReturnType<typeof setTimeout>;
    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(createWidget, 300);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      if (container) container.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div
      className="tradingview-widget-container rounded-lg border overflow-hidden"
      ref={containerRef}
      style={{ height: "80vh", minHeight: "600px" }}
    />
  );
}

export const TradingViewChart = memo(TradingViewChartInner);
