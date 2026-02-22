import { prisma } from "@/lib/prisma";
import { getBatchQuotes, getFXRate, toMarketSymbol } from "@/services/marketData";

export interface AssetMetric {
  id: string;
  symbol: string;
  name: string;
  assetType: string;
  quantity: number;
  averageBuyPrice: number;
  /** Live market price, null if unavailable */
  currentPrice: number | null;
  /** quantity × currentPrice (falls back to averageBuyPrice if no live price) */
  value: number;
  /** value − costBasis */
  gainLoss: number;
  /** Fractional: 0.05 = +5% */
  gainLossPct: number;
}

export interface DashboardData {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  /** Fractional: 0.05 = +5% */
  totalGainLossPct: number;
  allocationByType: Array<{ type: string; value: number; pct: number }>;
  allocationByAsset: Array<{ symbol: string; name: string; value: number; pct: number }>;
  performance: {
    daily: Array<{ date: string; value: number }>;
    weekly: Array<{ date: string; value: number }>;
    monthly: Array<{ date: string; value: number }>;
  };
  topGainers: AssetMetric[];
  topLosers: AssetMetric[];
  /** All asset metrics, unsorted */
  allAssets: AssetMetric[];
  /** true if any asset price is sourced from stale/missing market data */
  pricesStale: boolean;
}

export async function getDashboardData(
  userId: string,
  currency = "USD"
): Promise<DashboardData> {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    include: {
      assets: {
        include: { transactions: { orderBy: { date: "asc" } } },
      },
    },
  });

  const allAssets = portfolios.flatMap((p) => p.assets);

  // ── Collect all transactions before grouping (needed for performance) ────
  const allTransactions = allAssets
    .flatMap((a) =>
      a.transactions.map((t) => ({
        date: t.date,
        type: t.type as string,
        quantity: t.quantity,
        pricePerUnit: t.pricePerUnit,
      }))
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // ── Group by symbol across all portfolios ───────────────────────────────
  // Dashboard / analytics views show one row per ticker. Multiple lots of the
  // same symbol (even across different portfolios) are merged via weighted avg.
  const groupMap = new Map<string, (typeof allAssets)[number][]>();
  for (const a of allAssets) {
    const key = a.symbol.toUpperCase();
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(a);
  }

  // ── Fetch live prices for unique Yahoo symbols + FX rate ─────────────────
  const uniqueSymbols = [
    ...new Set(
      [...groupMap.values()].map((g) => toMarketSymbol(g[0].symbol, g[0].assetType))
    ),
  ];
  const [quotes, fxRate] = await Promise.all([
    getBatchQuotes(uniqueSymbols),
    getFXRate(currency),
  ]);

  let pricesStale = false;

  // ── Build per-group metrics (weighted-average lots within same portfolio) ─
  const assetMetrics: AssetMetric[] = [...groupMap.values()].map((group) => {
    const totalQty = group.reduce((s, a) => s + a.quantity, 0);
    const weightedAvgBuy =
      group.reduce((s, a) => s + a.averageBuyPrice * a.quantity, 0) / totalQty;

    const yahooSym = toMarketSymbol(group[0].symbol, group[0].assetType);
    const quote = quotes.get(yahooSym);

    if (!quote) pricesStale = true;

    const currentPrice = quote ? quote.price * fxRate : null;
    const effectivePrice = currentPrice ?? weightedAvgBuy * fxRate;
    const value = totalQty * effectivePrice;
    const costBasis = totalQty * weightedAvgBuy * fxRate;
    const gainLoss = value - costBasis;
    const gainLossPct = costBasis > 0 ? gainLoss / costBasis : 0;

    return {
      id: group[0].id,
      symbol: group[0].symbol,
      name: group[0].name,
      assetType: group[0].assetType,
      quantity: totalQty,
      averageBuyPrice: weightedAvgBuy,
      currentPrice,
      value,
      gainLoss,
      gainLossPct,
    };
  });

  // ── Totals ───────────────────────────────────────────────────────────────
  const totalValue = assetMetrics.reduce((s, a) => s + a.value, 0);
  const totalCost = assetMetrics.reduce(
    (s, a) => s + a.quantity * a.averageBuyPrice * fxRate,
    0
  );
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPct = totalCost > 0 ? totalGainLoss / totalCost : 0;

  // ── Allocation ───────────────────────────────────────────────────────────
  const typeMap = new Map<string, number>();
  for (const a of assetMetrics) {
    typeMap.set(a.assetType, (typeMap.get(a.assetType) ?? 0) + a.value);
  }
  const allocationByType = [...typeMap.entries()].map(([type, value]) => ({
    type,
    value,
    pct: totalValue > 0 ? value / totalValue : 0,
  }));

  const allocationByAsset = assetMetrics.map((a) => ({
    symbol: a.symbol,
    name: a.name,
    value: a.value,
    pct: totalValue > 0 ? a.value / totalValue : 0,
  }));

  // ── Performance history from transactions ────────────────────────────────
  const performance = buildPerformance(allTransactions);

  // ── Top movers (sorted by gainLossPct) ───────────────────────────────────
  const sorted = [...assetMetrics].sort((a, b) => b.gainLossPct - a.gainLossPct);
  const topGainers = sorted.filter((a) => a.gainLossPct > 0).slice(0, 5);
  const topLosers = sorted.filter((a) => a.gainLossPct < 0).reverse().slice(0, 5);

  return {
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPct,
    allocationByType,
    allocationByAsset,
    performance,
    topGainers,
    topLosers,
    allAssets: assetMetrics,
    pricesStale,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type TxSlice = {
  date: Date;
  type: string;
  quantity: number;
  pricePerUnit: number;
};

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function buildPerformance(transactions: TxSlice[]) {
  if (transactions.length === 0) {
    return { daily: [], weekly: [], monthly: [] };
  }

  const dayMap = new Map<string, number>();
  let running = 0;
  for (const tx of transactions) {
    const key = toDateStr(tx.date);
    if (tx.type === "BUY") running += tx.quantity * tx.pricePerUnit;
    else if (tx.type === "SELL") running -= tx.quantity * tx.pricePerUnit;
    dayMap.set(key, running);
  }

  const first = new Date(transactions[0].date);
  first.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allDays: Array<{ date: string; value: number }> = [];
  let lastVal = 0;
  const cursor = new Date(first);
  while (cursor <= today) {
    const key = toDateStr(cursor);
    if (dayMap.has(key)) lastVal = dayMap.get(key)!;
    allDays.push({ date: key, value: lastVal });
    cursor.setDate(cursor.getDate() + 1);
  }

  const daily = allDays.slice(-90);

  const weekly: typeof allDays = [];
  for (let i = allDays.length - 1; i >= 0 && weekly.length < 52; i -= 7) {
    weekly.unshift(allDays[i]);
  }

  const seenMonths = new Set<string>();
  const monthly: typeof allDays = [];
  for (let i = allDays.length - 1; i >= 0; i--) {
    const month = allDays[i].date.slice(0, 7);
    if (!seenMonths.has(month)) {
      seenMonths.add(month);
      monthly.unshift(allDays[i]);
    }
  }

  return { daily, weekly, monthly };
}
