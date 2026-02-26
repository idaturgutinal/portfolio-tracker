import { prisma } from "@/lib/prisma";

export interface DividendTransaction {
  id: string;
  date: string; // ISO string
  amount: number; // quantity × pricePerUnit
  quantity: number;
  pricePerUnit: number;
  fees: number;
  notes: string | null;
  assetSymbol: string;
  assetName: string;
  portfolioName: string;
}

export interface DividendByAsset {
  symbol: string;
  name: string;
  total: number;
  count: number;
  pct: number;
}

export interface DividendMonthly {
  month: string; // YYYY-MM
  total: number;
}

export interface DividendData {
  /** All dividend transactions, sorted by date desc */
  transactions: DividendTransaction[];
  /** Total dividends received */
  totalDividends: number;
  /** Number of dividend payments */
  totalCount: number;
  /** Average monthly dividend */
  monthlyAverage: number;
  /** Dividends received in the last 12 months */
  last12Months: number;
  /** Breakdown by asset */
  byAsset: DividendByAsset[];
  /** Monthly totals for chart */
  monthly: DividendMonthly[];
}

export async function getDividendData(userId: string): Promise<DividendData> {
  const rawTransactions = await prisma.transaction.findMany({
    where: {
      type: "DIVIDEND",
      asset: { portfolio: { userId } },
    },
    include: {
      asset: {
        include: { portfolio: { select: { name: true } } },
      },
    },
    orderBy: { date: "desc" },
  });

  const transactions: DividendTransaction[] = rawTransactions.map((t) => ({
    id: t.id,
    date: t.date.toISOString(),
    amount: t.quantity * t.pricePerUnit,
    quantity: t.quantity,
    pricePerUnit: t.pricePerUnit,
    fees: t.fees,
    notes: t.notes,
    assetSymbol: t.asset.symbol,
    assetName: t.asset.name,
    portfolioName: t.asset.portfolio.name,
  }));

  const totalDividends = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCount = transactions.length;

  // Monthly breakdown
  const monthMap = new Map<string, number>();
  for (const t of transactions) {
    const month = t.date.slice(0, 7); // YYYY-MM
    monthMap.set(month, (monthMap.get(month) ?? 0) + t.amount);
  }
  const monthly: DividendMonthly[] = [...monthMap.entries()]
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Monthly average (based on span of months with dividends)
  const monthCount = monthly.length || 1;
  const monthlyAverage = totalDividends / monthCount;

  // Last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
  const last12Months = transactions
    .filter((t) => new Date(t.date) >= twelveMonthsAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  // By asset
  const assetMap = new Map<string, { name: string; total: number; count: number }>();
  for (const t of transactions) {
    const existing = assetMap.get(t.assetSymbol);
    if (existing) {
      existing.total += t.amount;
      existing.count += 1;
    } else {
      assetMap.set(t.assetSymbol, { name: t.assetName, total: t.amount, count: 1 });
    }
  }
  const byAsset: DividendByAsset[] = [...assetMap.entries()]
    .map(([symbol, data]) => ({
      symbol,
      name: data.name,
      total: data.total,
      count: data.count,
      pct: totalDividends > 0 ? data.total / totalDividends : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    transactions,
    totalDividends,
    totalCount,
    monthlyAverage,
    last12Months,
    byAsset,
    monthly,
  };
}
