import { prisma } from "@/lib/prisma";
import type { CreatePortfolioInput, CreateAssetInput, PortfolioSummary } from "@/types";

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

  // Prices would be fetched from a market-data service in a real app.
  // For now, cost basis is used as a stand-in for current value.
  const totalCost = portfolio.assets.reduce(
    (sum, a) => sum + a.quantity * a.averageBuyPrice,
    0
  );

  return {
    id: portfolio.id,
    name: portfolio.name,
    totalValue: totalCost,
    totalCost,
    totalGainLoss: 0,
    totalGainLossPct: 0,
    assetCount: portfolio.assets.length,
  };
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
        assetType: assetType as import("@prisma/client").AssetType,
      }),
    },
  });
}

export async function deleteAsset(id: string) {
  return prisma.asset.delete({ where: { id } });
}

export async function createAsset(input: CreateAssetInput) {
  return prisma.asset.create({
    data: {
      portfolioId: input.portfolioId,
      symbol: input.symbol,
      name: input.name,
      assetType: input.assetType as import("@prisma/client").AssetType,
      quantity: input.quantity,
      averageBuyPrice: input.averageBuyPrice,
      currency: input.currency,
      notes: input.notes,
    },
  });
}
