import { prisma } from "@/lib/prisma";
import type { CreatePortfolioInput, CreateAssetInput, PortfolioSummary } from "@/types";
import { getBatchQuotes, toMarketSymbol } from "@/services/marketData";

export async function getPortfolios(userId: string) {
  return prisma.portfolio.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { assets: true } } },
  });
}

export async function getPortfolioById(id: string) {
  return prisma.portfolio.findUnique({
    where: { id },
    include: {
      assets: { include: { transactions: true } },
    },
  });
}

export async function createPortfolio(input: CreatePortfolioInput) {
  return prisma.portfolio.create({
    data: { name: input.name, userId: input.userId },
  });
}

export async function deletePortfolio(id: string) {
  return prisma.portfolio.delete({ where: { id } });
}

export async function getPortfolioSummary(
  id: string
): Promise<PortfolioSummary | null> {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    include: { assets: true },
  });

  if (!portfolio) return null;

  const totalCost = portfolio.assets.reduce(
    (sum, a) => sum + a.quantity * a.averageBuyPrice,
    0
  );

  // Fetch live prices for all assets
  const marketSymbols = portfolio.assets.map((a) =>
    toMarketSymbol(a.symbol, a.assetType)
  );
  const quotes = await getBatchQuotes(marketSymbols);

  const totalValue = portfolio.assets.reduce((sum, a) => {
    const mSym = toMarketSymbol(a.symbol, a.assetType);
    const quote = quotes.get(mSym);
    const price = quote?.price ?? a.averageBuyPrice;
    return sum + a.quantity * price;
  }, 0);

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPct = totalCost > 0 ? totalGainLoss / totalCost : 0;

  return {
    id: portfolio.id,
    name: portfolio.name,
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPct,
    assetCount: portfolio.assets.length,
  };
}

export async function getAssetById(id: string, userId: string) {
  return prisma.asset.findFirst({
    where: { id, portfolio: { userId } },
    include: { portfolio: { select: { id: true, name: true } } },
  });
}

export async function getAssetsByUser(userId: string) {
  return prisma.asset.findMany({
    where: { portfolio: { userId } },
    include: { portfolio: { select: { id: true, name: true } } },
    orderBy: [{ portfolio: { name: "asc" } }, { symbol: "asc" }],
  });
}

export interface UpdateAssetInput {
  symbol?: string;
  name?: string;
  assetType?: string;
  quantity?: number;
  averageBuyPrice?: number;
  currency?: string;
  notes?: string | null;
}

export async function updateAsset(id: string, data: UpdateAssetInput) {
  const { assetType, ...rest } = data;
  return prisma.asset.update({
    where: { id },
    data: {
      ...rest,
      ...(assetType && {
        assetType,
      }),
    },
  });
}

export async function deleteAsset(id: string) {
  return prisma.asset.delete({ where: { id } });
}

export async function getAssetBySymbol(symbol: string, userId: string) {
  return prisma.asset.findFirst({
    where: { symbol, portfolio: { userId } },
    include: { portfolio: { select: { id: true, name: true } } },
  });
}

export async function createAsset(input: CreateAssetInput) {
  return prisma.asset.create({
    data: {
      portfolioId: input.portfolioId,
      symbol: input.symbol,
      name: input.name,
      assetType: input.assetType,
      quantity: input.quantity,
      averageBuyPrice: input.averageBuyPrice,
      currency: input.currency,
      notes: input.notes,
    },
  });
}
