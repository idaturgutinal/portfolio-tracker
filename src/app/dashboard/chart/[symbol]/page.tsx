import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toTradingViewSymbol } from "@/lib/tradingview-symbol";
import { getAssetBySymbol } from "@/services/portfolio.service";
import { getAlertsBySymbol } from "@/services/alert.service";
import { getQuote, toMarketSymbol } from "@/services/marketData";
import { HoldingsSummaryCard } from "@/components/assets/holdings-summary-card";
import { AssetAlertPanel } from "@/components/assets/asset-alert-panel";
import { ChartWidget } from "./chart-widget";
import type { PriceAlertRow } from "@/types";

export const metadata = { title: "Chart — FolioVault" };

export default async function ChartPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { symbol: rawSymbol } = await params;
  const { type } = await searchParams;
  const assetType = type || "STOCK";
  const symbol = decodeURIComponent(rawSymbol);
  const tvSymbol = toTradingViewSymbol(symbol, assetType);

  // Look up whether the user holds this symbol and fetch alerts
  const [asset, dbAlerts] = await Promise.all([
    getAssetBySymbol(symbol, session.user.id),
    getAlertsBySymbol(session.user.id, symbol),
  ]);

  // If the user holds this asset, fetch a live price for holdings display
  let holdingsProps: {
    id: string;
    symbol: string;
    name: string;
    assetType: string;
    portfolioName: string;
    quantity: number;
    averageBuyPrice: number;
    currentPrice: number | null;
    marketValue: number;
    pnl: number;
    pnlPct: number;
  } | null = null;

  if (asset) {
    const marketSymbol = toMarketSymbol(asset.symbol, asset.assetType);
    const quoteResult = await getQuote(marketSymbol);
    const currentPrice = quoteResult.data?.price ?? null;
    const effectivePrice = currentPrice ?? asset.averageBuyPrice;
    const marketValue = asset.quantity * effectivePrice;
    const costBasis = asset.quantity * asset.averageBuyPrice;
    const pnl = marketValue - costBasis;
    const pnlPct = costBasis > 0 ? pnl / costBasis : 0;

    holdingsProps = {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      assetType: asset.assetType,
      portfolioName: asset.portfolio.name,
      quantity: asset.quantity,
      averageBuyPrice: asset.averageBuyPrice,
      currentPrice,
      marketValue,
      pnl,
      pnlPct,
    };
  }

  const alerts: PriceAlertRow[] = dbAlerts.map((a) => ({
    id: a.id,
    assetId: a.assetId,
    symbol: a.symbol,
    assetName: asset?.name ?? symbol,
    condition: a.condition as "ABOVE" | "BELOW",
    targetPrice: a.targetPrice,
    active: a.active,
    triggeredAt: a.triggeredAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  }));

  const showPanels = holdingsProps || alerts.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{symbol}</h1>
        <span className="text-sm text-muted-foreground">{assetType}</span>
      </div>

      <ChartWidget symbol={tvSymbol} />

      {showPanels && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {holdingsProps && (
            <HoldingsSummaryCard
              symbol={holdingsProps.symbol}
              name={holdingsProps.name}
              assetType={holdingsProps.assetType}
              portfolioName={holdingsProps.portfolioName}
              quantity={holdingsProps.quantity}
              averageBuyPrice={holdingsProps.averageBuyPrice}
              currentPrice={holdingsProps.currentPrice}
              marketValue={holdingsProps.marketValue}
              pnl={holdingsProps.pnl}
              pnlPct={holdingsProps.pnlPct}
            />
          )}
          {alerts.length > 0 && holdingsProps && (
            <AssetAlertPanel
              assetId={holdingsProps.id}
              symbol={holdingsProps.symbol}
              initialAlerts={alerts}
            />
          )}
        </div>
      )}
    </div>
  );
}
