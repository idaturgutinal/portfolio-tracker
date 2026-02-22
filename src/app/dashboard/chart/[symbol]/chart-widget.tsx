"use client";

import dynamic from "next/dynamic";

const TradingViewChart = dynamic(
  () =>
    import("@/components/assets/tradingview-chart").then(
      (m) => m.TradingViewChart
    ),
  { ssr: false }
);

export function ChartWidget({ symbol }: { symbol: string }) {
  return <TradingViewChart symbol={symbol} allowSymbolChange={false} />;
}
