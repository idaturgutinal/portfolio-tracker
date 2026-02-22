"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toTradingViewSymbol } from "@/lib/tradingview-symbol";

const TradingViewChart = dynamic(
  () =>
    import("@/components/assets/tradingview-chart").then(
      (m) => m.TradingViewChart
    ),
  { ssr: false }
);

export default function ChartPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { symbol } = use(params);
  const { type } = use(searchParams);
  const assetType = type || "STOCK";
  const decoded = decodeURIComponent(symbol);
  const tvSymbol = toTradingViewSymbol(decoded, assetType);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{decoded}</h1>
        <span className="text-sm text-muted-foreground">{assetType}</span>
      </div>
      <TradingViewChart symbol={tvSymbol} />
    </div>
  );
}
