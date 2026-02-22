import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAssetsByUser, getPortfolios } from "@/services/portfolio.service";
import { getBatchQuotes, getFXRate, toMarketSymbol } from "@/services/marketData";
import { AssetsTable } from "@/components/assets/assets-table";
import type { EnrichedAsset, PortfolioOption } from "@/types";

export const metadata = { title: "Assets — Portfolio Tracker" };

export default async function AssetsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const currency = session.user.defaultCurrency ?? "USD";

  const [dbAssets, portfolios] = await Promise.all([
    getAssetsByUser(session.user.id),
    getPortfolios(session.user.id),
  ]);

  const symbols = dbAssets.map((a) => toMarketSymbol(a.symbol, a.assetType));
  const [quotes, fxRate] = await Promise.all([
    getBatchQuotes(symbols),
    getFXRate(currency),
  ]);

  const enrichedAssets: EnrichedAsset[] = dbAssets.map((a) => {
    const sym = toMarketSymbol(a.symbol, a.assetType);
    const quote = quotes.get(sym);
    const currentPrice = quote ? quote.price * fxRate : null;
    const effectivePrice = currentPrice ?? a.averageBuyPrice * fxRate;
    const marketValue = a.quantity * effectivePrice;
    const costBasis = a.quantity * a.averageBuyPrice * fxRate;
    return {
      id: a.id,
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

  const portfolioOptions: PortfolioOption[] = portfolios.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return (
    <main className="container py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
        <p className="text-muted-foreground mt-1">
          Manage all holdings across your portfolios.
        </p>
      </div>
      <AssetsTable initialAssets={enrichedAssets} portfolios={portfolioOptions} currency={currency} />
    </main>
  );
}
