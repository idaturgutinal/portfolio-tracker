import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAssetById } from "@/services/portfolio.service";
import { getAlertsBySymbol } from "@/services/alert.service";
import { getQuote, toMarketSymbol } from "@/services/marketData";
import { toTradingViewSymbol } from "@/lib/tradingview-symbol";
import { AssetDetailView } from "@/components/assets/asset-detail-view";
import type { PriceAlertRow } from "@/types";

export const metadata = { title: "Asset Detail — FolioVault" };

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const asset = await getAssetById(id, session.user.id);
  if (!asset) notFound();

  const marketSymbol = toMarketSymbol(asset.symbol, asset.assetType);
  const [quoteResult, dbAlerts] = await Promise.all([
    getQuote(marketSymbol),
    getAlertsBySymbol(session.user.id, asset.symbol),
  ]);

  const currentPrice = quoteResult.data?.price ?? null;
  const effectivePrice = currentPrice ?? asset.averageBuyPrice;
  const marketValue = asset.quantity * effectivePrice;
  const costBasis = asset.quantity * asset.averageBuyPrice;
  const pnl = marketValue - costBasis;
  const pnlPct = costBasis > 0 ? pnl / costBasis : 0;

  const tvSymbol = toTradingViewSymbol(asset.symbol, asset.assetType);

  const alerts: PriceAlertRow[] = dbAlerts.map((a) => ({
    id: a.id,
    assetId: a.assetId,
    symbol: a.symbol,
    assetName: asset.name,
    condition: a.condition as "ABOVE" | "BELOW",
    targetPrice: a.targetPrice,
    active: a.active,
    triggeredAt: a.triggeredAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <AssetDetailView
      asset={{
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        assetType: asset.assetType,
        quantity: asset.quantity,
        averageBuyPrice: asset.averageBuyPrice,
        currentPrice,
        marketValue,
        pnl,
        pnlPct,
        portfolioName: asset.portfolio.name,
      }}
      tvSymbol={tvSymbol}
      alerts={alerts}
    />
  );
}
