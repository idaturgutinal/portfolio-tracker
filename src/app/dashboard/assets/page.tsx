import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAssetsByUser, getPortfolios } from "@/services/portfolio.service";
import { getBatchQuotes, getMultiFXRates, toMarketSymbol } from "@/services/marketData";
import { AssetsTable } from "@/components/assets/assets-table";
import type { EnrichedAsset, PortfolioOption } from "@/types";
import { PageHeader } from "@/components/page-header";
import { Wallet } from "lucide-react";

export const metadata = { title: "Assets — FolioVault" };

export default async function AssetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currency = session.user.defaultCurrency ?? "USD";

  const [dbAssets, portfolios] = await Promise.all([
    getAssetsByUser(session.user.id),
    getPortfolios(session.user.id),
  ]);

  const symbols = dbAssets.map((a) => toMarketSymbol(a.symbol, a.assetType));
  const uniqueCurrencies = [...new Set(dbAssets.map((a) => a.currency))];
  const [quotes, fxRates] = await Promise.all([
    getBatchQuotes(symbols),
    getMultiFXRates(uniqueCurrencies, currency),
  ]);

  const enrichedAssets: EnrichedAsset[] = dbAssets.map((a) => {
    const sym = toMarketSymbol(a.symbol, a.assetType);
    const quote = quotes.get(sym);
    const assetFx = fxRates.get(a.currency) ?? 1;
    const currentPrice = quote ? quote.price : null;
    const effectivePrice = currentPrice ?? a.averageBuyPrice;
    const marketValue = a.quantity * effectivePrice * assetFx;
    const costBasis = a.quantity * a.averageBuyPrice * assetFx;
    return {
      id: a.id,
      ids: [a.id],
      symbol: a.symbol,
      name: a.name,
      assetType: a.assetType,
      quantity: a.quantity,
      averageBuyPrice: a.averageBuyPrice,
      currency: a.currency,
      notes: a.notes,
      portfolioId: a.portfolioId,
      portfolioName: a.portfolio.name,
      currentPrice,
      marketValue,
      pnl: marketValue - costBasis,
      pnlPct: costBasis > 0 ? (marketValue - costBasis) / costBasis : 0,
    };
  });

  // Consolidate duplicate symbol+portfolio combinations using weighted average
  const groupMap = new Map<string, EnrichedAsset[]>();
  for (const a of enrichedAssets) {
    const key = `${a.portfolioId}::${a.symbol}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(a);
  }

  const consolidatedAssets: EnrichedAsset[] = Array.from(groupMap.values()).map((group) => {
    if (group.length === 1) return group[0];

    const totalQty = group.reduce((s, a) => s + a.quantity, 0);
    const weightedAvgBuy =
      group.reduce((s, a) => s + a.averageBuyPrice * a.quantity, 0) / totalQty;
    const currentPrice = group[0].currentPrice; // same quote for all in group
    const assetFx = fxRates.get(group[0].currency) ?? 1;
    const effectivePrice = currentPrice ?? weightedAvgBuy;
    const marketValue = totalQty * effectivePrice * assetFx;
    const costBasis = totalQty * weightedAvgBuy * assetFx;

    return {
      ...group[0],
      ids: group.map((a) => a.id),
      quantity: totalQty,
      averageBuyPrice: weightedAvgBuy,
      currentPrice,
      marketValue,
      pnl: marketValue - costBasis,
      pnlPct: costBasis > 0 ? (marketValue - costBasis) / costBasis : 0,
    };
  });

  const portfolioOptions: PortfolioOption[] = portfolios.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <main className="container py-8 space-y-6">
      <PageHeader
        icon={Wallet}
        title="Assets"
        description="Manage all holdings across your portfolios."
      />
      <AssetsTable initialAssets={consolidatedAssets} portfolios={portfolioOptions} currency={currency} />
    </main>
  );
}
