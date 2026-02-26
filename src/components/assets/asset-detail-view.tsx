"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoldingsSummaryCard } from "./holdings-summary-card";
import { AssetAlertPanel } from "./asset-alert-panel";
import type { PriceAlertRow } from "@/types";
import { ASSET_TYPE_LABELS, ASSET_TYPE_BADGE } from "@/lib/constants";

const TradingViewChart = dynamic(
  () =>
    import("./tradingview-chart").then((mod) => ({
      default: mod.TradingViewChart,
    })),
  { ssr: false }
);

interface AssetDetail {
  id: string;
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number | null;
  marketValue: number;
  pnl: number;
  pnlPct: number;
  portfolioName: string;
}

interface Props {
  asset: AssetDetail;
  tvSymbol: string;
  alerts: PriceAlertRow[];
}

export function AssetDetailView({ asset, tvSymbol, alerts }: Props) {
  return (
    <main className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/assets">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Assets
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {asset.symbol}
          </h1>
          <span className="text-muted-foreground text-lg">&mdash;</span>
          <span className="text-lg text-muted-foreground">{asset.name}</span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ASSET_TYPE_BADGE[asset.assetType] ?? "bg-muted text-muted-foreground"}`}
          >
            {ASSET_TYPE_LABELS[asset.assetType] ?? asset.assetType}
          </span>
        </div>
      </div>

      {/* TradingView Chart */}
      <TradingViewChart symbol={tvSymbol} allowSymbolChange={false} />

      {/* Bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HoldingsSummaryCard
          symbol={asset.symbol}
          name={asset.name}
          assetType={asset.assetType}
          portfolioName={asset.portfolioName}
          quantity={asset.quantity}
          averageBuyPrice={asset.averageBuyPrice}
          currentPrice={asset.currentPrice}
          marketValue={asset.marketValue}
          pnl={asset.pnl}
          pnlPct={asset.pnlPct}
        />
        <AssetAlertPanel
          assetId={asset.id}
          symbol={asset.symbol}
          initialAlerts={alerts}
        />
      </div>
    </main>
  );
}
